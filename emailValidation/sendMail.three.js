import { createTransport } from 'nodemailer';

// Function to send invoice email
export const sendInvoiceEmail = async (email, subject, data) => {
    const Transport = createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.Gmail,
        pass: process.env.password,
      },
    });
  
    // If payment method is not provided, default to 'cash on delivery'
    const paymentMethod = data.payment || 'Cash on Delivery';
  
    // HTML structure for the email
    const html = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Invoice</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f4f6f9;
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        .invoice-container {
            width: 100%;
            max-width: 650px;
            margin: 0 auto;
            background-color: white;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .invoice-header {
            background-color: #3b82f6;
            color: white;
            padding: 1.5rem;
            text-align: center;
        }
        .invoice-details {
            padding: 1.5rem;
        }
        .product-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            border-bottom: 1px solid #e5e7eb;
            padding: 1rem 0;
            text-align: center;
        }
        .product-image {
            width: 200px;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        @media (min-width: 640px) {
            .product-card {
                flex-direction: row;
                text-align: left;
            }
            .product-image {
                width: 100px;
                height: 100px;
                margin-right: 1rem;
                margin-bottom: 0;
            }
            .address-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }
        }
        .responsive-table {
            width: 100%;
            border-collapse: collapse;
        }
        .responsive-table th, 
        .responsive-table td {
            border: 1px solid #e5e7eb;
            padding: 0.5rem;
            text-align: left;
        }
        @media (max-width: 640px) {
            .responsive-table thead {
                display: none;
            }
            .responsive-table tr {
                display: block;
                margin-bottom: 1rem;
                border: 1px solid #e5e7eb;
            }
            .responsive-table td {
                display: block;
                text-align: right;
                border-bottom: 1px solid #ddd;
            }
            .responsive-table td:before {
                content: attr(data-label);
                float: left;
                font-weight: bold;
            }
        }
    </style>
</head>
<body class="bg-gray-100">
    <div class="invoice-container">
        <div class="invoice-header">
            <h1 class="text-2xl font-bold">Order Invoice</h1>
            <p class="mt-2">Thank you for your purchase, <span id="userName">${data.userName}</span>!</p>
        </div>

        <div class="invoice-details">
            <div class="address-grid mb-6">
                <div>
                    <h3 class="text-lg font-semibold mb-2">Order Information</h3>
                    <table class="responsive-table">
                        <thead>
                            <tr>
                                <th>Detail</th>
                                <th>Information</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td data-label="Order ID">Order ID</td>
                                <td data-label="Order ID Value">${data.orderId}</td>
                            </tr>
                            <tr>
                                <td data-label="Total Amount">Total Amount</td>
                                <td data-label="Total Amount Value">₹${data.totalAmount}</td>
                            </tr>
                            <tr>
                                <td data-label="Payment Method">Payment Method</td>
                                <td data-label="Payment Method Value">${paymentMethod}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div>
                    <h3 class="text-lg font-semibold mb-2">Shipping Address</h3>
                    <table class="responsive-table">
                        <thead>
                            <tr>
                                <th>Detail</th>
                                <th>Information</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td data-label="Address">Residential Address</td>
                                <td data-label="Address Value">${data.shippingAddress.residential_address}</td>
                            </tr>
                            <tr>
                                <td data-label="City">City</td>
                                <td data-label="City Value">${data.shippingAddress.city}</td>
                            </tr>
                            <tr>
                                <td data-label="State">State</td>
                                <td data-label="State Value">${data.shippingAddress.state}</td>
                            </tr>
                            <tr>
                                <td data-label="Pin Code">Pin Code</td>
                                <td data-label="Pin Code Value">${data.shippingAddress.pin_code}</td>
                            </tr>
                            <tr>
                                <td data-label="Mobile">Mobile Number</td>
                                <td data-label="Mobile Value">${data.shippingAddress.mobile_no}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h3 class="text-lg font-semibold mb-4">Ordered Items</h3>
                ${data.orderItems.map(
                    (item) => `
                    <div class="product-card">
                        <img src="http://192.168.1.30:5004/api/uploads/${item.productImage}" alt="${item.productName}" class="product-image">
                        <div>
                            <h4 class="font-semibold text-lg">${item.productName}</h4>
                            <p class="text-gray-600">${item.categoryName}</p>
                            <p>Quantity: ${item.quantity} × ₹${item.pricePerItem}</p>
                            <p class="font-medium text-blue-600">Total: ₹${item.totalAmount}</p>
                        </div>
                    </div>
                    `
                ).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
  
    // Send email with HTML content
    await Transport.sendMail({
      from: process.env.Gmail,
      to: email,
      subject,
      html,
    });
  };