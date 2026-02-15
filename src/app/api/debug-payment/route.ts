import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  // Only allow logged-in admin
  const session = cookies().get('session');
  if (!session?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Import QB functions dynamically to get fresh config
    const { getQBConfig, getAccessToken } = await import('@/lib/quickbooks');

    const config = await getQBConfig();
    const auth = await getAccessToken();

    const results: Record<string, unknown> = {
      config: {
        environment: config.environment,
        clientIdSet: !!config.clientId,
        clientIdLength: config.clientId?.length,
        secretSet: !!config.clientSecret,
        redirectUri: config.redirectUri,
      },
      auth: auth ? {
        hasToken: true,
        tokenLength: auth.token?.length,
        realmId: auth.realmId,
        tokenPrefix: auth.token?.substring(0, 20) + '...',
      } : { hasToken: false },
    };

    // Test Payments and Accounting APIs if we have auth
    if (auth) {
      const paymentsUrl = config.environment === 'production'
        ? 'https://api.intuit.com/quickbooks/v4/payments'
        : 'https://sandbox.api.intuit.com/quickbooks/v4/payments';

      // Test Payments API connectivity
      try {
        const testResponse = await fetch(`${paymentsUrl}/charges/TESTNONEXISTENT`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Accept': 'application/json',
            'Request-Id': crypto.randomUUID(),
          },
        });
        const testBody = await testResponse.text();
        results.paymentsApiTest = {
          status: testResponse.status,
          statusText: testResponse.statusText,
          body: testBody.substring(0, 500),
        };
      } catch (e) {
        results.paymentsApiTest = {
          error: e instanceof Error ? e.message : String(e),
        };
      }

      // Test Accounting API connectivity
      const accountingUrl = config.environment === 'production'
        ? 'https://quickbooks.api.intuit.com'
        : 'https://sandbox-quickbooks.api.intuit.com';

      try {
        const acctResponse = await fetch(`${accountingUrl}/v3/company/${auth.realmId}/companyinfo/${auth.realmId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Accept': 'application/json',
          },
        });
        const acctBody = await acctResponse.text();
        results.accountingApiTest = {
          status: acctResponse.status,
          statusText: acctResponse.statusText,
          body: acctBody.substring(0, 500),
        };
      } catch (e) {
        results.accountingApiTest = {
          error: e instanceof Error ? e.message : String(e),
        };
      }
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
