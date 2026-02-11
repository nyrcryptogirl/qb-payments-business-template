import { db } from '@/lib/db';
import { qbTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const QB_CLIENT_ID = process.env.QB_CLIENT_ID!;
const QB_CLIENT_SECRET = process.env.QB_CLIENT_SECRET!;
const QB_REDIRECT_URI = process.env.QB_REDIRECT_URI!;
const QB_ENVIRONMENT = process.env.QB_ENVIRONMENT || 'sandbox'; // sandbox | production

const QB_AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
const QB_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

const QB_BASE_URL = QB_ENVIRONMENT === 'production'
  ? 'https://quickbooks.api.intuit.com'
  : 'https://sandbox-quickbooks.api.intuit.com';

const QB_PAYMENTS_URL = QB_ENVIRONMENT === 'production'
  ? 'https://api.intuit.com/quickbooks/v4/payments'
  : 'https://sandbox.api.intuit.com/quickbooks/v4/payments';

// Generate OAuth authorization URL
export function getAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: QB_CLIENT_ID,
    scope: 'com.intuit.quickbooks.accounting com.intuit.quickbooks.payment',
    redirect_uri: QB_REDIRECT_URI,
    response_type: 'code',
    state,
  });
  return `${QB_AUTH_URL}?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string) {
  const basicAuth = Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(QB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: QB_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

// Store tokens in database
export async function storeTokens(realmId: string, tokenData: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  x_refresh_token_expires_in: number;
}) {
  const now = new Date();
  const accessExpires = new Date(now.getTime() + tokenData.expires_in * 1000);
  const refreshExpires = new Date(now.getTime() + tokenData.x_refresh_token_expires_in * 1000);

  const existing = await db.select().from(qbTokens).where(eq(qbTokens.realmId, realmId)).limit(1);

  if (existing.length > 0) {
    await db.update(qbTokens).set({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      accessTokenExpiresAt: accessExpires,
      refreshTokenExpiresAt: refreshExpires,
      updatedAt: now,
    }).where(eq(qbTokens.realmId, realmId));
  } else {
    await db.insert(qbTokens).values({
      realmId,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      accessTokenExpiresAt: accessExpires,
      refreshTokenExpiresAt: refreshExpires,
    });
  }
}

// Get valid access token (auto-refresh if needed)
export async function getAccessToken(): Promise<{ token: string; realmId: string } | null> {
  const tokens = await db.select().from(qbTokens).limit(1);
  if (tokens.length === 0) return null;

  const tokenRow = tokens[0];
  const now = new Date();

  // If access token is still valid (with 5 min buffer)
  if (tokenRow.accessTokenExpiresAt > new Date(now.getTime() + 5 * 60 * 1000)) {
    return { token: tokenRow.accessToken, realmId: tokenRow.realmId };
  }

  // Refresh the token
  if (tokenRow.refreshTokenExpiresAt < now) {
    // Refresh token expired, need to re-authorize
    return null;
  }

  const basicAuth = Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(QB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenRow.refreshToken,
    }),
  });

  if (!response.ok) return null;

  const newTokens = await response.json();
  await storeTokens(tokenRow.realmId, newTokens);

  return { token: newTokens.access_token, realmId: tokenRow.realmId };
}

// Check if connected to QuickBooks
export async function isConnected(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null;
}

// Generic QB Accounting API call
export async function qbAccountingRequest(
  method: string,
  endpoint: string,
  body?: Record<string, unknown>
) {
  const auth = await getAccessToken();
  if (!auth) throw new Error('Not connected to QuickBooks');

  const url = `${QB_BASE_URL}/v3/company/${auth.realmId}/${endpoint}`;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${auth.token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`QB API error: ${response.status} ${error}`);
  }

  return response.json();
}

// QB Payments API call
export async function qbPaymentsRequest(
  method: string,
  endpoint: string,
  body?: Record<string, unknown>,
  requestId?: string
) {
  const auth = await getAccessToken();
  if (!auth) throw new Error('Not connected to QuickBooks');

  const url = `${QB_PAYMENTS_URL}/${endpoint}`;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${auth.token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Request-Id': requestId || crypto.randomUUID(),
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`QB Payments error: ${response.status} ${error}`);
  }

  return response.json();
}

// ==================
// Accounting API Methods
// ==================

export async function createCustomer(data: { name: string; email?: string; phone?: string }) {
  return qbAccountingRequest('POST', 'customer', {
    DisplayName: data.name,
    PrimaryEmailAddr: data.email ? { Address: data.email } : undefined,
    PrimaryPhone: data.phone ? { FreeFormNumber: data.phone } : undefined,
  });
}

export async function getCustomers(maxResults = 100) {
  return qbAccountingRequest('GET', `query?query=SELECT * FROM Customer MAXRESULTS ${maxResults}`);
}

export async function createInvoice(customerId: string, items: { description: string; amount: number }[]) {
  const lineItems = items.map((item, i) => ({
    DetailType: 'SalesItemLineDetail',
    Amount: item.amount,
    Description: item.description,
    LineNum: i + 1,
    SalesItemLineDetail: {
      ItemRef: { value: '1', name: 'Services' },
    },
  }));

  return qbAccountingRequest('POST', 'invoice', {
    CustomerRef: { value: customerId },
    Line: lineItems,
  });
}

export async function recordPayment(invoiceId: string, amount: number) {
  return qbAccountingRequest('POST', 'payment', {
    TotalAmt: amount,
    Line: [{
      Amount: amount,
      LinkedTxn: [{ TxnId: invoiceId, TxnType: 'Invoice' }],
    }],
  });
}

// ==================
// Payments API Methods
// ==================

// Tokenize card
export async function tokenizeCard(card: {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  name: string;
  address?: {
    streetAddress?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
  };
}) {
  return qbPaymentsRequest('POST', 'tokens', {
    card: {
      number: card.number,
      expMonth: card.expMonth,
      expYear: card.expYear,
      cvc: card.cvc,
      name: card.name,
      address: card.address,
    },
  });
}

// Tokenize bank account
export async function tokenizeBankAccount(bank: {
  name: string;
  routingNumber: string;
  accountNumber: string;
  accountType: 'PERSONAL_CHECKING' | 'PERSONAL_SAVINGS' | 'BUSINESS_CHECKING' | 'BUSINESS_SAVINGS';
  phone: string;
}) {
  return qbPaymentsRequest('POST', 'tokens', {
    bankAccount: {
      name: bank.name,
      routingNumber: bank.routingNumber,
      accountNumber: bank.accountNumber,
      accountType: bank.accountType,
      phone: bank.phone,
    },
  });
}

// Charge a card token
export async function chargeCard(tokenOrCardId: string, amount: number, currency = 'USD', description?: string) {
  return qbPaymentsRequest('POST', 'charges', {
    amount: amount.toFixed(2),
    currency,
    token: tokenOrCardId,
    description,
    context: {
      mobile: false,
      isEcommerce: true,
    },
  });
}

// Create eCheck charge
export async function chargeECheck(
  customerId: string,
  bankAccountId: string,
  amount: number,
  description?: string
) {
  return qbPaymentsRequest('POST', `echecks`, {
    paymentMode: 'WEB',
    amount: amount.toFixed(2),
    bankAccountOnFile: bankAccountId,
    description,
  });
}

// Disconnect from QuickBooks
export async function disconnectFromQB() {
  const tokens = await db.select().from(qbTokens).limit(1);
  if (tokens.length > 0) {
    // Revoke the token
    const basicAuth = Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString('base64');
    try {
      await fetch('https://developer.api.intuit.com/v2/oauth2/tokens/revoke', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokens[0].refreshToken }),
      });
    } catch {
      // Ignore revoke errors
    }
    await db.delete(qbTokens).where(eq(qbTokens.realmId, tokens[0].realmId));
  }
}
