import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactFormRequest = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email to admin
    const emailResponse = await resend.emails.send({
      from: "SecureNest Contact <onboarding@resend.dev>",
      to: ["polargod404@gmail.com"],
      replyTo: email,
      subject: `[SecureNest Contact] ${subject || 'New Message'} from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f1729; color: #e2e8f0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a2744 0%, #0f1729 100%); border-radius: 16px; padding: 32px; border: 1px solid rgba(20, 184, 166, 0.2); }
            .header { text-align: center; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid rgba(20, 184, 166, 0.2); }
            .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #14b8a6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .field { margin-bottom: 20px; }
            .label { font-size: 12px; text-transform: uppercase; color: #14b8a6; margin-bottom: 8px; letter-spacing: 0.5px; }
            .value { font-size: 16px; color: #e2e8f0; background: rgba(20, 184, 166, 0.05); padding: 12px 16px; border-radius: 8px; border-left: 3px solid #14b8a6; }
            .message-content { white-space: pre-wrap; line-height: 1.6; }
            .footer { margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(20, 184, 166, 0.2); text-align: center; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🛡️ SecureNest</div>
              <p style="color: #94a3b8; margin-top: 8px;">New Contact Form Submission</p>
            </div>
            
            <div class="field">
              <div class="label">From</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${email}" style="color: #14b8a6; text-decoration: none;">${email}</a></div>
            </div>
            
            <div class="field">
              <div class="label">Subject</div>
              <div class="value">${subject || 'No subject provided'}</div>
            </div>
            
            <div class="field">
              <div class="label">Message</div>
              <div class="value message-content">${message.replace(/\n/g, '<br>')}</div>
            </div>
            
            <div class="footer">
              <p>This message was sent via the SecureNest contact form.</p>
              <p>Reply directly to this email to respond to ${name}.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Contact email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-contact-email function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
