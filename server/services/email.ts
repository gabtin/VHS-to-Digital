import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
    console.warn('SENDGRID_API_KEY not set - email notifications will not be sent');
}

interface OrderMessageEmailParams {
    to: string;
    orderNumber: string;
    customerName: string;
    message: string;
    isAdminMessage: boolean;
    orderLink: string;
}

/**
 * Send email notification for a new order message
 */
export async function sendOrderMessageEmail({
    to,
    orderNumber,
    customerName,
    message,
    isAdminMessage,
    orderLink,
}: OrderMessageEmailParams): Promise<void> {
    if (!process.env.SENDGRID_API_KEY) {
        console.log('Skipping email send - SENDGRID_API_KEY not configured');
        return;
    }

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@memorieindigitale.it';

    const subject = isAdminMessage
        ? `Nuovo messaggio per il tuo ordine #${orderNumber}`
        : `Nuovo messaggio dal cliente per l'ordine #${orderNumber}`;

    const html = isAdminMessage
        ? getCustomerEmailTemplate(customerName, orderNumber, message, orderLink)
        : getAdminEmailTemplate(customerName, orderNumber, message, orderLink);

    try {
        await sgMail.send({
            to,
            from: fromEmail,
            subject,
            html,
        });
        console.log(`Email sent to ${to} for order #${orderNumber}`);
    } catch (error) {
        console.error('Failed to send email via SendGrid:', error);
        throw error;
    }
}

/**
 * Email template for customer (when admin sends a message)
 */
function getCustomerEmailTemplate(
    customerName: string,
    orderNumber: string,
    message: string,
    orderLink: string
): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuovo Messaggio - memorieindigitale.it</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #F5F5F4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F5F4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #292524 0%, #1C1917 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 300; font-family: 'Cormorant Garamond', serif;">
                memorieindigitale.it
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; color: #292524; font-size: 24px; font-weight: 600;">
                Ciao ${customerName},
              </h2>
              <p style="margin: 0 0 24px 0; color: #78716C; font-size: 16px; line-height: 1.6;">
                Hai ricevuto un nuovo messaggio da <strong>memorieindigitale.it</strong> riguardo al tuo ordine <strong>#${orderNumber}</strong>:
              </p>
              
              <!-- Message Box -->
              <div style="background-color: #FEF3C7; border-left: 4px solid #B45309; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0; color: #292524; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">
${message}
                </p>
              </div>
              
              <p style="margin: 24px 0; color: #78716C; font-size: 16px; line-height: 1.6;">
                Puoi visualizzare e rispondere a questo messaggio nella tua dashboard:
              </p>
              
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td style="background-color: #B45309; border-radius: 8px; text-align: center;">
                    <a href="${orderLink}" style="display: inline-block; padding: 16px 32px; color: #FFFFFF; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Visualizza Ordine
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 32px 0 0 0; color: #A8A29E; font-size: 14px; line-height: 1.6;">
                Cordiali saluti,<br>
                <strong>Il Team di memorieindigitale.it</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F5F5F4; padding: 24px; text-align: center;">
              <p style="margin: 0; color: #78716C; font-size: 12px;">
                © 2024 memorieindigitale.it · Preserviamo la nostalgia con cura
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Email template for admin (when customer sends a message)
 */
function getAdminEmailTemplate(
    customerName: string,
    orderNumber: string,
    message: string,
    orderLink: string
): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuovo Messaggio Cliente - memorieindigitale.it</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #F5F5F4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F5F4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #B45309 0%, #92400E 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 600;">
                🔔 Nuovo Messaggio Cliente
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px 0; color: #78716C; font-size: 16px; line-height: 1.6;">
                Un cliente ha inviato un messaggio riguardo all'ordine <strong>#${orderNumber}</strong>:
              </p>
              
              <!-- Customer Info -->
              <div style="background-color: #F5F5F4; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; color: #57534E; font-size: 14px;">
                  <strong>Cliente:</strong> ${customerName}
                </p>
                <p style="margin: 0; color: #57534E; font-size: 14px;">
                  <strong>Ordine:</strong> #${orderNumber}
                </p>
              </div>
              
              <!-- Message Box -->
              <div style="background-color: #DBEAFE; border-left: 4px solid #3B82F6; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0; color: #292524; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">
${message}
                </p>
              </div>
              
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td style="background-color: #292524; border-radius: 8px; text-align: center;">
                    <a href="${orderLink}" style="display: inline-block; padding: 16px 32px; color: #FFFFFF; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Visualizza e Rispondi
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F5F5F4; padding: 24px; text-align: center;">
              <p style="margin: 0; color: #78716C; font-size: 12px;">
                memorieindigitale.it Admin Dashboard
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
