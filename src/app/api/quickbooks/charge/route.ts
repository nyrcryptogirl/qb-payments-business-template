import { NextResponse } from 'next/server';
import { tokenizeCard, tokenizeBankAccount, chargeCard, createCustomer, createInvoice, recordPayment } from '@/lib/quickbooks';
import { db } from '@/lib/db';
import { transactions, customers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { name, email, phone, amount, description, paymentMethod, card, bankAccount } = await req.json();
    if (!amount || amount < 1) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

    let [customer] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    if (!customer) [customer] = await db.insert(customers).values({ name, email, phone }).returning();

    let qbCustomerId = customer.qbCustomerId;
    if (!qbCustomerId) {
      try {
        const qbCust = await createCustomer({ name, email, phone });
        qbCustomerId = qbCust.Customer?.Id;
        if (qbCustomerId) await db.update(customers).set({ qbCustomerId }).where(eq(customers.id, customer.id));
      } catch (e) { console.error('QB customer err:', e); }
    }

    let chargeResult;
    if (paymentMethod === 'card' && card) {
      const tok = await tokenizeCard(card);
      chargeResult = await chargeCard(tok.value, amount, 'USD', description);
    } else if (paymentMethod === 'ach' && bankAccount) {
      const tok = await tokenizeBankAccount(bankAccount);
      chargeResult = await chargeCard(tok.value, amount, 'USD', description);
    } else {
      return NextResponse.json({ error: 'Unsupported payment method' }, { status: 400 });
    }

    const [txn] = await db.insert(transactions).values({
      customerId: customer.id, qbChargeId: chargeResult?.id, amount: amount.toFixed(2),
      paymentMethod, status: chargeResult?.status === 'CAPTURED' ? 'completed' : 'pending',
      description, metadata: chargeResult,
    }).returning();

    if (qbCustomerId) {
      try {
        const inv = await createInvoice(qbCustomerId, [{ description: description || 'Payment', amount }]);
        if (inv?.Invoice?.Id) {
          await recordPayment(inv.Invoice.Id, amount);
          await db.update(transactions).set({ qbInvoiceId: inv.Invoice.Id }).where(eq(transactions.id, txn.id));
        }
      } catch (e) { console.error('QB invoice err:', e); }
    }

    return NextResponse.json({ success: true, transactionId: txn.id });
  } catch (err) {
    console.error('Charge error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Payment failed' }, { status: 500 });
  }
}
