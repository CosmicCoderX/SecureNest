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

async function getRowId(accessToken: string, spreadsheetId: string, credentialId: string): Promise<number | null> {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:A`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get rows: ${error}`);
  }

  const data = await response.json();
  const rows = data.values || [];

  // Find the row index where the first column matches the credentialId
  // Adding 1 because Sheets are 1-indexed
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === credentialId) {
      return i + 1;
    }
  }

  return null;
}

async function updateRow(
  accessToken: string,
  spreadsheetId: string,
  rowNumber: number,
  values: string[][]
): Promise<void> {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A${rowNumber}:G${rowNumber}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update sheet: ${error}`);
  }
}

async function deleteRow(accessToken: string, spreadsheetId: string, rowNumber: number): Promise<void> {
    // Delete requires getting the sheetId first, which is different from spreadsheetId
    const sheetResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
    
    if (!sheetResponse.ok) {
        throw new Error('Failed to fetch spreadsheet metadata to get sheetId');
    }

    const sheetData = await sheetResponse.json();
    const sheetId = sheetData.sheets?.[0]?.properties?.sheetId;

    if (sheetId === undefined) {
        throw new Error('Could not find sheetId');
    }

    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId: sheetId,
                    dimension: "ROWS",
                    startIndex: rowNumber - 1, // 0-indexed and inclusive
                    endIndex: rowNumber,      // 0-indexed and exclusive
                  }
                }
              }
            ]
          }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete row from sheet: ${error}`);
    }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Received request in sync-google-sheets function');

  try {
    const serviceAccountKeyStr = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
    const spreadsheetId = Deno.env.get('GOOGLE_SHEETS_SPREADSHEET_ID');

    console.log('Environment variables check:', {
      hasServiceAccountKey: !!serviceAccountKeyStr,
      hasSpreadsheetId: !!spreadsheetId
    });

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
    console.log(`Processing action: ${action} for credential ID: ${credential.id}`);

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

    if (action === 'update') {
      const accessToken = await getAccessToken(serviceAccountKey);
      const rowId = await getRowId(accessToken, spreadsheetId, credential.id);

      if (rowId) {
        const row = [
          credential.id,
          credential.website_name,
          credential.website_url || '',
          credential.username,
          credential.password,
          credential.created_at,
          credential.updated_at,
        ];
        await updateRow(accessToken, spreadsheetId, rowId, [row]);
        return new Response(
          JSON.stringify({ success: true, message: 'Credential updated in Google Sheets' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
         return new Response(
          JSON.stringify({ success: false, message: 'Credential not found in Google Sheets to update' }),
           { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         );
      }
    }

    if (action === 'delete') {
      const accessToken = await getAccessToken(serviceAccountKey);
      const rowId = await getRowId(accessToken, spreadsheetId, credential.id);

      if (rowId) {
        await deleteRow(accessToken, spreadsheetId, rowId);
        return new Response(
          JSON.stringify({ success: true, message: 'Credential deleted from Google Sheets' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
         return new Response(
          JSON.stringify({ success: false, message: 'Credential not found in Google Sheets to delete' }),
           { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         );
      }
    }

    console.log('Invalid action provided:', action);
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Fatal Error in Edge Function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Return 200 with error info so it doesn't break the app flow
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
