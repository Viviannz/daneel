import type { Context } from 'https://edge.netlify.com';

export default async (request: Request, context: Context) => {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File;
    const padNumber = formData.get('padNumber') as string;
    const practitionerName = formData.get('practitionerName') as string;

    if (!pdfFile) {
      return new Response('No PDF file provided', { status: 400 });
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not set');
      return new Response('Email service not configured', { status: 500 });
    }

    // Convert PDF to base64 for email attachment
    const pdfBuffer = await pdfFile.arrayBuffer();
    const pdfBase64 = btoa(
      new Uint8Array(pdfBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    // Recipient email
    const recipientEmail = 'viviannz@aol.com';

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NHS Prescription Tracker <onboarding@resend.dev>',
        to: [recipientEmail],
        subject: `NHS Prescription Report - Pad #${padNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #003087; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">NHS Dental Prescription Report</h1>
            </div>
            <div style="padding: 20px; background-color: #f5f5f5;">
              <p>Hello ${practitionerName},</p>
              <p>Your NHS prescription report for <strong>Pad #${padNumber}</strong> has been generated.</p>
              <p>The attached PDF includes:</p>
              <ul>
                <li>Complete list of all prescriptions</li>
                <li>Audit summary with medication breakdown</li>
                <li>Daily prescribing statistics</li>
              </ul>
              <p>Please review the attached PDF for full details.</p>
              <p style="margin-top: 30px; color: #666; font-size: 12px;">
                Generated on ${new Date().toLocaleString('en-GB')}
              </p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: pdfFile.name,
            content: pdfBase64,
          },
        ],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      return new Response('Failed to send email', { status: 500 });
    }

    const result = await emailResponse.json();
    return new Response(JSON.stringify({ success: true, emailId: result.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-report function:', error);
    return new Response('Internal server error', { status: 500 });
  }
};

export const config = { path: '/api/send-report' };
