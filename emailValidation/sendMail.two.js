import { createTransport } from 'nodemailer';
import path from 'path';

const sendInvoiceMail = async (email, subject, invoiceData) => {
  console.log('Sending Invoice to:', email);
  console.log('Invoice Data:', invoiceData);

  // Ensure receiver data is present
  if (!invoiceData || !invoiceData.receiver || !invoiceData.receiver.email) {
    console.error("Receiver data is missing or incomplete.");
    throw new Error("Receiver data is missing.");
  }

  // Set up the SMTP transport for sending emails
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Ensure SSL is used
    auth: {
      user: process.env.Gmail, // Use environment variable for your email
      pass: process.env.Password, // Use environment variable for your password
    },
  });

  // Create the HTML body for the email
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        .header {
          background: #f8f9fa;
          padding: 10px;
          text-align: center;
        }
        .content {
          margin: 20px;
        }
        .content p {
          font-size: 16px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Invoice for Your Purchase</h1>
      </div>
      <div class="content">
        <p>Dear ${invoiceData.receiver.name},</p>
        <p>Thank you for your order. Below are the details of your invoice:</p>
        <p><strong>Order ID:</strong> ${invoiceData.number}</p>
        <p><strong>Total Amount:</strong> ${invoiceData.total} ${invoiceData.currency}</p>
        <p><strong>Invoice Date:</strong> ${invoiceData.date}</p>
      </div>
      <div class="footer">
        <p>&copy; Your Business Name</p>
      </div>
    </body>
    </html>
  `;

  // Send the email without the attachment
  await transport.sendMail({
    from: process.env.Gmail,  // Sender email address
    to: email,                // Recipient email address
    subject,                  // Subject of the email
    html,                     // HTML content of the email
  });

  console.log(`Invoice sent to ${email}`);
};

export default sendInvoiceMail;