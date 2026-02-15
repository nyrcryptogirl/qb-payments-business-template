import { NextResponse } from 'next/server';
import { tokenizeCard, tokenizeBankAccount, chargeCard, createCustomer, createInvoice, recordPayment } from '@/lib/quickbooks';
import { db } from '@/lib/db';
import { transactions, customers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, amount, description, paymentMethod, card, bankAccount } = body;

    console.log('=== CHARGE REQUEST START ===');
    console.log('Payment method:', paymentMethod);
    console.log('Amount:', amount);
    console.log('Customer:', name, email);

    if (!amount || amount < 0.01) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // 1. Find or create local customer
    let [customer] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    if (!customer) {
      [customer] = await db.insert(customers).values({ name, email, phone }).returning();
    }
    console.log('Local customer ID:', customer.id);

    // 2. Tokenize payment method
    let tokenResult;
    try {
      if (paymentMethod === 'card' && card) {
        console.log('Tokenizing card...');
        tokenResult = await tokenizeCard(card);
        console.log('Token result:', JSON.stringify(tokenResult));
      } else if (paymentMethod === 'ach' && bankAccount) {
        console.log('Tokenizing bank account...');
        tokenResult = await tokenizeBankAccount(bankAccount);
        console.log('Token result:', JSON.stringify(tokenResult));
      } else {
        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
      }
    } catch (tokenError) {
      console.error('TOKENIZATION FAILED:', tokenError instanceof Error ? tokenError.message : tokenError);
      return NextResponse.json({ error: 'Payment method could not be verified. Please check your details.' }, { status: 400 });
    }

    if (!tokenResult?.value) {
      console.error('Token result missing value:', JSON.stringify(tokenResult));
      return NextResponse.json({ error: 'Payment tokenization failed' }, { status: 400 });
    }

    // 3. Charge the card/bank via QB Payments API
    let chargeResult;
    try {
      console.log('Charging with token:', tokenResult.value.substring(0, 10) + '...');
      chargeResult = await chargeCard(tokenResult.value, amount, 'USD', description);
      console.log('=== QB CHARGE RESULT ===');
      console.log(JSON.stringify(chargeResult, null, 2));
    } catch (chargeError) {
      console.error('CHARGE FAILED:', chargeError instanceof Error ? chargeError.message : chargeError);

      // Record the failed transaction
      await db.insert(transactions).values({
        customerId: customer.id,
        amount: amount.toFixed(2),
        paymentMethod,
        status: 'failed',
        description,
        metadata: { error: chargeError instanceof Error ? chargeError.message : String(chargeError) },
      });

      return NextResponse.json({ error: 'Payment charge failed. Please try again.' }, { status: 400 });
    }

    // 4. Determine status from QB response
    const qbStatus = (chargeResult?.status || '').toUpperCase();
    const isSuccess = ['CAPTURED', 'APPROVED', 'SETTLED'].includes(qbStatus);
    console.log('QB status:', qbStatus, 'isSuccess:', isSuccess);

    // 5. Record transaction in local DB
    const [txn] = await db.insert(transactions).values({
      customerId: customer.id,
      qbChargeId: chargeResult?.id,
      amount: amount.toFixed(2),
      paymentMethod,
      status: isSuccess ? 'completed' : 'pending',
      description,
      metadata: chargeResult,
    }).returning();
    console.log('Transaction recorded:', txn.id, 'status:', txn.status);

    // 6. Sync to QB Accounting (customer + invoice) - don't fail if this part errors
    let qbCustomerId = customer.qbCustomerId;
    if (!qbCustomerId) {
      try {
        const qbCust = await createCustomer({ name, email, phone });
        console.log('QB customer created:', JSON.stringify(qbCust));
        qbCustomerId = qbCust?.Customer?.Id;
        if (qbCustomerId) {
          await db.update(customers).set({ qbCustomerId }).where(eq(customers.id, customer.id));
        }
      } catch (e) {
        console.error('QB customer creation error:', e instanceof Error ? e.message : e);
      }
    }

    if (qbCustomerId && isSuccess) {
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
    return NextResponse.json({ success: true, transactionId: txn.id, status: txn.status });
  } catch (err) {
    console.error('=== CHARGE UNHANDLED ERROR ===', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Payment failed' }, { status: 500 });
  }
}
