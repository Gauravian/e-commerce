import { Order,OrderItem } from '../Models/order.models.js';
import { Category } from '../Models/category.model.js';
import { sendInvoiceEmail } from '../emailValidation/sendMail.three.js';
import { Cart , CartItem } from '../Models/cart.modal.js';
import { Address } from '../Models/user.model.js'; 
import { Product } from '../Models/product.model.js'; 
import { User } from '../Models/user.model.js'; 

export const createOrder = async (req, res) => {
  const userId = req.userId; // Replace with actual userId from authenticated session
  const { shippingAddressId, orderItems, payment } = req.body;

  // Validate shippingAddressId
  if (!shippingAddressId) {
    return res.status(400).json({ message: 'Shipping Address is required' });
  }

  try {
    // Validate orderItems array
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: "'orderItems' should be a non-empty array" });
    }

    // Validate each order item
    let index = 0;
    for (const item of orderItems) {
      if (!item.productId || typeof item.productId !== "number") {
        return res.status(400).json({
          message: `Invalid or missing productId in order item at index ${index}: ${JSON.stringify(item)}`,
        });
      }
      index++;
    }

    // Validate shipping address
    const address = await Address.findOne({
      where: { id: shippingAddressId, userId },
    });

    if (!address) {
      return res.status(400).json({ message: 'Invalid or unauthorized address' });
    }

    // Fetch user details to get the email
    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare order items and calculate total amount
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of orderItems) {
      const product = await Product.findOne({
        where: { id: item.productId },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name'],
          },
        ],
      });

      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }

      const pricePerItem = product.price;
      const itemTotalAmount = pricePerItem * item.quantity;
      totalAmount += itemTotalAmount;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        pricePerItem,
        totalAmount: itemTotalAmount,
        productName: product.name,
        categoryName: product.category.name,
        productImage: product.image, // Add product image to orderItems data
      });
    }

    // Create the order
    const order = await Order.create({
      userId,
      shippingAddressId,
      amount: totalAmount,
      payment: payment || 'cash on delivery',
    });

    // Associate order items with the created order
    orderItemsData.forEach((item) => {
      item.orderId = order.id;
    });
    await OrderItem.bulkCreate(orderItemsData);

    // Delete products from the cart after order creation
    await CartItem.destroy({
      where: { cartId: (await Cart.findOne({ where: { userId } })).id },
    });

    // Fetch the created order with full details (order items, products, categories)
    const orderDetails = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
              include: [
                {
                  model: Category,
                  as: 'category',
                  attributes: ['id', 'name'],
                },
              ],
            },
          ],
        },
        {
          model: Address,
          as: 'shippingAddress',
        },
      ],
    });

    // Prepare email data
    const email = user.email;
    if (!email) {
      console.error('No recipient email defined!');
      return res.status(500).json({ message: 'Unable to send invoice: Missing recipient email' });
    }

    const emailData = {
      userName: user.name,
      email,
      orderId: order.id,
      totalAmount,
      shippingAddress: address,
      orderItems: orderItemsData,
    };

    // Send invoice email
    setTimeout(async () => {
      try {
        // Send invoice email
        await sendInvoiceEmail(email, 'Order Invoice', emailData);
        console.log('Invoice email sent successfully');
      } catch (emailError) {
        console.error('Error sending email:', emailError.message);
      }
    }, 8000);

    // Return the full order details in the response
    res.status(201).json({ message: 'Order created successfully', order: orderDetails });
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({ error: error.message });
  }
};


  
  
  


  export const getAllUserOrders = async (req, res) => {
    const userId = req.userId; // Example user ID, ideally from JWT token
  
    try {
      const orders = await Order.findAll({
        where: { userId },
        include: [
          {
            model: Address,
            as: 'shippingAddress', // Matches the alias in the association
            attributes: ['id', 'residential_address', 'city', 'state', 'pin_code'], // Fields from Address
          },
          {
            model: OrderItem,
            as: 'orderItems', // Matches the alias in the association
            include: [
              {
                model: Product,
                as: 'product', // Matches the alias in the association
                attributes: ['id', 'name', 'price'], // Fields from Product
              },
            ],
          },
        ],
      });
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No orders found for this user.' });
      }
  
      res.status(200).json({ orders });
    } catch (error) {
      console.error(error); // Log error for debugging
      res.status(500).json({ error: error.message });
    }
  };
  
  
  
  
  // Get Details of a Single Order for a User
  export const getOrderDetails = async (req, res) => {
    const userId = req.userId; // Replace with actual user ID from JWT middleware
    const { orderId } = req.params;
  
    if (!orderId) {
      return res.status(400).json({ msg: "Please provide an order ID" });
    }
  
    try {
      // Fetch order by orderId and userId
      const order = await Order.findOne({
        where: { id: orderId, userId },
        include: [
          {
            model: Address,
            as: 'shippingAddress', 
          },
          {
            model: OrderItem,
            as: 'orderItems', 
            include: [
              {
                model: Product,
                as: 'product', 
                attributes: ['id', 'name', 'price'],
              },
            ],
          },
          {
            model: User,
            as: 'user', 
            attributes: ['id', 'name', 'email'], 
          },
        ],
      });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.status(200).json(order);
    } catch (error) {
      console.error(error); 
      res.status(500).json({ error: error.message });
    }
  };
  
  
  export const deleteOrder = async (req, res) => {
    const userId = 1; // Ideally, this should be from the authenticated user's token
    // const userId =req.userId; // Ideally, this should be from the authenticated user's token
    const { orderId } = req.params;
  
    if (!orderId) {
      return res.status(400).json({ message: "Please provide an order ID" });
    }
  
    try {
      // Fetch the order by orderId and userId
      const order = await Order.findOne({
        where: { id: orderId, userId },
        include: [
          {
            model: OrderItem,
            as: 'orderItems', // Assuming you have the correct alias set in the associations
          },
        ],
      });
  
      // Check if the order exists
      if (!order) {
        return res.status(404).json({ message: 'Order not found or you do not have permission to delete this order' });
      }
  
      // Delete related OrderItems
      await OrderItem.destroy({
        where: { orderId: order.id }, // Delete items related to this order
      });
  
      // Now, delete the order itself
      await order.destroy();
  
      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.error("Error deleting order:", error.message);
      res.status(500).json({ error: error.message });
    }
  };
  
