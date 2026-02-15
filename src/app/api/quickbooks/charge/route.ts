import { NextResponse } from 'next/server';
import { tokenizeCard, tokenizeBankAccount, chargeCard, chargeECheckWithToken, createCustomer, createInvoice, recordPayment } from '@/lib/quickbooks';
import { db } from '@/lib/db';
import { transactions, customers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, amount, description, paymentMethod, card, bankAccount } = body;

    console.log('=== CHARGE REQUEST START ===');
    console.log('Payment method:', paymentMethod, 'Amount:', amount, 'Customer:', name, email);

    if (!amount || amount < 0.01) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // 1. Find or create local customer
    let [customer] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    if (!customer) {
      [customer] = await db.insert(customers).values({ name, email, phone }).returning();
    }
    console.log('Local customer ID:', customer.id);

    // 2. Tokenize + Charge
    let chargeResult;
    try {
      if (paymentMethod === 'card' && card) {
        console.log('Tokenizing card...');
        const tokenResult = await tokenizeCard(card);
        console.log('Token result:', JSON.stringify(tokenResult));
        if (!tokenResult?.value) throw new Error('Card tokenization failed');

        console.log('Charging card...');
        chargeResult = await chargeCard(tokenResult.value, amount, 'USD', description);

      } else if (paymentMethod === 'ach' && bankAccount) {
        // Ensure phone is included for QB requirement
        if (!bankAccount.phone) {
          bankAccount.phone = phone || '0000000000';
        }
        console.log('Tokenizing bank account...');
        const tokenResult = await tokenizeBankAccount(bankAccount);
        console.log('Token result:', JSON.stringify(tokenResult));
        if (!tokenResult?.value) throw new Error('Bank tokenization failed');

        console.log('Creating eCheck...');
        chargeResult = await chargeECheckWithToken(tokenResult.value, amount, description);

      } else {
        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
      }

      console.log('=== QB CHARGE RESULT ===');
      console.log(JSON.stringify(chargeResult, null, 2));

    } catch (chargeError) {
      const errMsg = chargeError instanceof Error ? chargeError.message : String(chargeError);
      console.error('CHARGE FAILED:', errMsg);

      // Record failed transaction
      await db.insert(transactions).values({
        customerId: customer.id, amount: amount.toFixed(2),
        paymentMethod, status: 'failed', description,
        metadata: { error: errMsg },
      });

      // Return user-friendly error
      let userMessage = 'Payment failed. Please try again.';
      if (errMsg.includes('wallet does not contain card')) {
        userMessage = 'Bank account payment failed. Please check your account details.';
      } else if (errMsg.includes('token')) {
        userMessage = 'Could not verify payment method. Please re-enter your details.';
      }
      return NextResponse.json({ error: userMessage }, { status: 400 });
    }

    // 3. Determine status — handle ALL possible QB statuses
    const qbStatus = (chargeResult?.status || '').toUpperCase();
    console.log('QB status:', qbStatus);

    let localStatus: string;
    let userMessage: string;

    if (['CAPTURED', 'SETTLED', 'SUCCEEDED'].includes(qbStatus)) {
      localStatus = 'completed';
      userMessage = 'Payment successful!';
    } else if (qbStatus === 'AUTHORIZED') {
      localStatus = 'completed'; // Auth with capture=true means it will settle
      userMessage = 'Payment authorized and will be processed.';
    } else if (qbStatus === 'PENDING') {
      // Normal for eChecks — takes 3-5 business days
      localStatus = 'processing';
      userMessage = 'Payment is being processed. ACH transfers take 3-5 business days.';
    } else if (qbStatus === 'DECLINED') {
      localStatus = 'failed';
      userMessage = 'Payment was declined. Please check your payment details or try a different payment method.';
    } else if (qbStatus === 'CANCELLED' || qbStatus === 'VOIDED') {
      localStatus = 'failed';
      userMessage = 'Payment was cancelled.';
    } else {
      localStatus = 'pending';
      userMessage = 'Payment status is uncertain. Please check your account.';
    }

    // 4. Save transaction with correct status
    const [txn] = await db.insert(transactions).values({
      customerId: customer.id,
      qbChargeId: chargeResult?.id,
      amount: amount.toFixed(2),
      paymentMethod,
      status: localStatus,
      description,
      metadata: chargeResult,
    }).returning();
    console.log('Transaction recorded:', txn.id, 'status:', localStatus);

    // 5. If payment failed/declined, return error to user
    if (localStatus === 'failed') {
      return NextResponse.json({
        error: userMessage,
        transactionId: txn.id
      }, { status: 400 });
    }

    // 6. Sync to QB Accounting (only if payment succeeded or processing)
    let qbCustomerId = customer.qbCustomerId;
    if (!qbCustomerId) {
      try {
        const qbCust = await createCustomer({ name, email, phone });
        console.log('QB customer result:', JSON.stringify(qbCust));
        qbCustomerId = qbCust?.Customer?.Id;
        if (qbCustomerId) {
          await db.update(customers).set({ qbCustomerId }).where(eq(customers.id, customer.id));
        }
      } catch (e) {
        console.error('QB customer error:', e instanceof Error ? e.message : e);
      }
    }

    if (qbCustomerId && localStatus === 'completed') {
      try {
        const inv = await createInvoice(qbCustomerId, [{ description: description || 'Payment', amount }]);
        console.log('QB invoice created:', JSON.stringify(inv));
        if (inv?.Invoice?.Id) {
          const payment = await recordPayment(inv.Invoice.Id, amount, qbCustomerId);
          console.log('QB payment recorded:', JSON.stringify(payment));
          await db.update(transactions).set({ qbInvoiceId: inv.Invoice.Id }).where(eq(transactions.id, txn.id));
        }
      } catch (e) {
        console.error('QB invoice/payment error:', e instanceof Error ? e.message : e);
      }
    }

    console.log('=== CHARGE REQUEST COMPLETE ===');
    return NextResponse.json({ success: true, transactionId: txn.id, status: localStatus, message: userMessage });

  } catch (err) {
    console.error('=== UNHANDLED ERROR ===', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Payment failed' }, { status: 500 });
  }
}
