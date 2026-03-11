import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Google Sheets API helper functions
async function getAccessToken(serviceAccountKey: Record<string, string>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccountKey.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));
  const unsignedToken = `${base64Header}.${base64Payload}`;

  // Import private key and sign
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  const pemContents = serviceAccountKey.private_key
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\n/g, '');

  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const jwt = `${base64Header.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')}.${base64Payload.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')}.${base64Signature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }

  return tokenData.access_token;
}

async function appendToSheet(
  accessToken: string,
  spreadsheetId: string,
  values: string[][]
): Promise<void> {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:G:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to append to sheet: ${error}`);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceAccountKeyStr = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
    const spreadsheetId = Deno.env.get('GOOGLE_SHEETS_SPREADSHEET_ID');

    if (!serviceAccountKeyStr || !spreadsheetId) {
      console.log('Google Sheets configuration missing - skipping sync');
      return new Response(
        JSON.stringify({ success: false, message: 'Google Sheets configuration missing - sync skipped' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the service account key is valid JSON
    let serviceAccountKey;
    try {
      serviceAccountKey = JSON.parse(serviceAccountKeyStr);
    } catch (parseError) {
      console.error('Invalid GOOGLE_SERVICE_ACCOUNT_KEY format - must be valid JSON');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid service account key format. Please update GOOGLE_SERVICE_ACCOUNT_KEY with the full JSON from Google Cloud Console.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields in service account key
    if (!serviceAccountKey.client_email || !serviceAccountKey.private_key) {
      console.error('Service account key missing required fields (client_email or private_key)');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Service account key missing required fields. Please ensure the JSON contains client_email and private_key.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { credential, action } = await req.json();

    if (action === 'add') {
      // Get access token
      const accessToken = await getAccessToken(serviceAccountKey);

      // Append credential to Google Sheet
      const row = [
        credential.id,
        credential.website_name,
        credential.website_url || '',
        credential.username,
        credential.password,
        credential.created_at,
        credential.updated_at,
      ];

      await appendToSheet(accessToken, spreadsheetId, [row]);

      return new Response(
        JSON.stringify({ success: true, message: 'Credential synced to Google Sheets' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Return 200 with error info so it doesn't break the app flow
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
