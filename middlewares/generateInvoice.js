import fs from 'fs';
import path from 'path';
import easyInvoice from 'easyinvoice';
import { Payment } from '../Models/payment.modal.js';
import { User } from '../Models/user.model.js';
import { Order , OrderItem } from '../Models/order.models.js';
import { Address } from '../Models/user.model.js';
import sendInvoiceMail from '../emailValidation/sendMail.two.js';

// Function to generate the invoice PDF
export const generateInvoice = async (paymentId) => {
  try {
   

    const payment = await Payment.findOne({
      where: { id: paymentId },
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
            },
            {
              model: Address,
              as: 'shippingAddress',
              attributes: ['residential_address', 'city', 'state', 'pin_code'],
            },
          ],
        },
      ],
    });

    if (!payment || !payment.order || !payment.order.user) {
      console.error('Payment, order, or user details are missing.');
      throw new Error('Payment or user details missing.');
    }

    const { transactionId, order } = payment;
    const { user, shippingAddress } = order;

    // Prepare data for the email invoice
    const invoiceData = {
      receiver: {
        name: user.name || "please provide name",
        email: user.email || "please provide email",
      },
      sender: {
        company: 'Your E-commerce Platform',
        address: '123 Main Street',
        zip: '12345',
        city: 'City Name',
        country: 'Country',
      },
      client: {
        address: shippingAddress.residential_address,
        zip: shippingAddress.pin_code,
        city: shippingAddress.city,
        country: 'India',
      },
      transactionId,
      total: payment.amount,
      currency: payment.currency,
      date: new Date().toISOString().slice(0, 10),
    };

    console.log('Invoice Data:', invoiceData);

    // Ensure invoiceData is valid before passing it
    if (!invoiceData || !invoiceData.receiver || !invoiceData.receiver.email) {
      console.error('Receiver email is missing in invoice data');
      throw new Error('Receiver email is missing in invoice data');
    }

    // Pass invoiceData to sendInvoiceMail
    await sendInvoiceMail(user.email, 'Your Invoice for the Recent Purchase', invoiceData);

    console.log(`Invoice sent to: ${user.email}`);
  } catch (error) {
    console.error('Error generating or sending invoice:', error.message);
    throw error;
  }
};