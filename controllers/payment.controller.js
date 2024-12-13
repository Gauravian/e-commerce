import { Payment } from "../Models/payment.modal.js";
import { Order , OrderItem } from "../Models/order.models.js";
import { Product } from "../Models/product.model.js";
import { Address } from "../Models/user.model.js";
import { User } from "../Models/user.model.js";
import  sendInvoiceMail  from "../emailValidation/sendMail.two.js";
import { generateInvoice } from "../middlewares/generateInvoice.js";
import path from 'path';
import fs from 'fs';
import { log } from "console";

const generateTransactionId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Random 6-digit number
};

export const createPayment = async (req, res) => {
  const { orderId } = req.body;

  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.userId.id; // Assuming the user ID is stored in req.userId

    // Fetch the order with the associated user and items
    const order = await Order.findOne({
      where: { id: orderId, userId },
      include: [
        {
          model: User,
          as: 'user',
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    if (!order || !order.user) {
      return res.status(404).json({ message: 'Order or user not found' });
    }

    // Generate transaction ID
    const transactionId = generateTransactionId();

    // Create the payment record
    const payment = await Payment.create({
      orderId: order.id,
      transactionId,
      amount: parseFloat(order.amount), // Assuming amount is present in the order
      currency: 'INR',
      status: 'pending',
    });

    res.status(201).json({ message: 'Payment created successfully', payment });

    // Generate the invoice PDF after a short delay (to simulate processing time)
    setTimeout(async () => {
      try {
        // Generate the invoice PDF and store the file path
        const invoicePath = await generateInvoice(payment.id); // Middleware generates and returns the invoice path
        
        if (!invoicePath) {
          console.error('Failed to generate invoice');
          return;
        }

        // Store the invoice URL in the Payment record
        payment.invoiceUrl = invoicePath;
        await payment.save();

        

        // Optionally, send the invoice email without attachment, if needed
        //await sendInvoiceMail(order.user.email, 'Your Invoice', invoiceData);
      } catch (err) {
        console.error('Error generating or saving invoice:', err.message);
      }
    }, 7000); // Wait 7 seconds before generating and saving the invoice

  } catch (error) {
    console.error('Error creating payment:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};










// Fetch orders with payment and user details
export const getOrderWithPaymentAndUser = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Validate required field
    if (!orderId) {
      return res.status(400).json({ message: "orderId is a required field" });
    }

    // Fetch order with associated payment and user details
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: Payment, // Include payment details
          as: "paymentDetails",
        },
        {
          model: User, // Include user details
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!order || !order.user) {
      return res.status(404).json({ message: "Order or associated user not found" });
    }

    res.status(200).json({
      message: "Order, payment, and user data fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Error fetching order, payment, and user data:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Mark payment as completed
export const completePayment = async (req, res) => {
  const { paymentId } = req.params;

  try {
    const payment = await Payment.findOne({
      where: { id: paymentId },
      include: [
        { model: Order, as: 'order' },
        { model: User, as: 'userDetails' },
      ],
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === 'completed') {
      return res.status(400).json({ message: "Payment has already been completed" });
    }

    payment.status = 'completed';
    await payment.save();

    // Wait for 7 seconds before processing the invoice generation and storing it
    setTimeout(async () => {
      try {
        // Generate the invoice and get the invoice path
        const invoicePath = await generateInvoice(payment.id);
        
        if (!invoicePath) {
          return res.status(500).json({ message: "Failed to generate invoice" });
        }

        // Store the invoice URL in the Payment record
        payment.invoiceUrl = invoicePath;
        await payment.save();

        console.log(`Invoice saved at: ${invoicePath}`);

        // Optionally, you can send an email without attaching the invoice PDF
        // await sendInvoiceMail(payment.userDetails.email, "Your Invoice", invoicePath, invoiceData);

      } catch (err) {
        console.error("Error during invoice generation:", err.message);
      }
    }, 7000); // Wait 7 seconds before generating and saving the invoice

    res.status(200).json({ message: "Payment marked as completed", payment });
  } catch (error) {
    console.error("Error completing payment:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const downloadInvoice = async (req, res) => {
  const { paymentId } = req.params;

  try {
    // Fetch the payment details including the invoice URL
    const payment = await Payment.findOne({ where: { id: paymentId } });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check if the payment has a valid invoice URL
    if (!payment.invoiceUrl) {
      return res.status(404).json({ message: "Invoice not available for this payment" });
    }

    const invoicePath = payment.invoiceUrl;

    // Check if the invoice file exists
    if (!fs.existsSync(invoicePath)) {
      return res.status(404).json({ message: "Invoice file not found" });
    }

    // Send the file as a response
    res.download(invoicePath, path.basename(invoicePath), (err) => {
      if (err) {
        console.error('Error during file download:', err.message);
        res.status(500).json({ message: 'Failed to download the invoice' });
      }
    });

  } catch (error) {
    console.error("Error downloading invoice:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};