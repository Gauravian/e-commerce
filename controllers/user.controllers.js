import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Cart ,CartItem } from '../Models/cart.modal.js';
import { Product } from '../Models/product.model.js';
import { User } from '../Models/user.model.js';
import { Address } from '../Models/user.model.js';
import { Otp } from '../Models/otp.model.js';
import crypto from 'crypto';
import sendMail from '../emailValidation/sendMail.One.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    

    // Generate OTP for registration
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Set expiry time (5 minutes from now)
    const expiresAt = new Date(new Date().getTime() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in the database
    await Otp.create({
      name,
      email,
      otp,
      expiresAt,
    });

    // Send OTP to user's email
    await sendMail(email, 'Your OTP for Registration', { otp });

    res.status(201).json({ message: 'OTP sent to email for verification', email });
    console.log(sendMail);
    
    
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Endpoint to handle OTP verification and storing the user and cart data
export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { otp, cartData } = req.body; // Receive cart data as well during OTP verification

    // Validate OTP
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    // Fetch OTP from the database
    const otpRecord = await Otp.findOne({ where: { otp } });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP has expired
    const currentTime = new Date();
    if (currentTime > new Date(otpRecord.expiresAt)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Create the user after OTP verification
    const user = await User.create({ 
      name: otpRecord.name,  // Name is fetched from OTP model
      email: otpRecord.email  // Email is fetched from OTP model
    });

    // Generate JWT Token
    const token = jwt.sign({ id: user.id }, process.env.JWT_TOKEN, { expiresIn: '24h' });

    // Now process the cart data
    if (cartData && cartData.length > 0) {
      let cart = await Cart.create({ userId: user.id }); // Create a new cart for the user

      // Process each cart item
      for (const { productId, quantity } of cartData) {
        const product = await Product.findByPk(productId);
        if (product) {
          const totalPrice = product.price * quantity;

          // Add items to the cart
          await CartItem.create({
            cartId: cart.id,
            productId,
            quantity,
            totalPrice
          });
        }
      }
    }

    // Remove OTP after successful registration
    await Otp.destroy({ where: { otp } });

    // Respond with success message and user data
    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });

  } catch (error) {
    console.error('Error verifying OTP:', error.message);
    res.status(500).json({ error: error.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, cartData } = req.body; // Extract email and cartData from request body

    // Check if the user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate JWT token for the logged-in user
    const token = jwt.sign({ id: user.id }, process.env.JWT_TOKEN, { expiresIn: '24h' });

    // Generate OTP for login
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set expiry time (5 minutes from now)
    const expiresAt = new Date(new Date().getTime() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in the database
    await Otp.create({
      email,
      otp,
      expiresAt,
    });

    // Send OTP to user's email
    await sendMail(email, 'Your OTP for Login', { otp });

    // Step 1: Find or create a cart for the user if they have logged in (for storing cart data)
    let cart = await Cart.findOne({ where: { userId: user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: user.id });
    }

    // Step 2: If cartData is provided, process it
    if (cartData && cartData.length > 0) {
      for (const { productId, quantity } of cartData) {
        const product = await Product.findByPk(productId);
        if (!product) {
          return res.status(404).json({ message: `Product with ID ${productId} not found` });
        }

        const totalPrice = product.price * quantity;

        // Step 3: Check if the item already exists in the user's cart
        let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
        if (cartItem) {
          // If the item exists, update its quantity and total price
          cartItem.quantity += quantity;
          cartItem.totalPrice = cartItem.quantity * product.price;
          await cartItem.save();
        } else {
          // If the item doesn't exist, create a new cart item
          await CartItem.create({
            cartId: cart.id,
            productId,
            quantity,
            totalPrice,
          });
        }
      }
    }

    res.status(200).json({
      message: 'OTP sent to email',
      token,
    });
    
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    // Validate OTP
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    // Fetch OTP record from the database
    const otpRecord = await Otp.findOne({ where: { otp } });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP has expired
    const currentTime = new Date();
    if (currentTime > new Date(otpRecord.expiresAt)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Fetch user information along with their addresses
    const user = await User.findOne({
      where: { email: otpRecord.email },
      include: [
        {
          model: Address,
          as: 'addresses',
          attributes: ['id', 'residential_address', 'city', 'state', 'pin_code', 'mobile_no'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch the user's cart data (bulk items)
    const cart = await Cart.findOne({
      where: { userId: user.id },
      include: [
        {
          model: CartItem,
          as: 'cartItems',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'description', 'image'], // Include more attributes as needed
            },
          ],
        },
      ],
    });

    // Prepare cart data with bulk items or an empty array if no cart exists
    const cartData = cart
      ? cart.cartItems.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          totalPrice: item.totalPrice,
          imageUrl: item.product.imageUrl, // Assuming products have images
        }))
      : [];

    // Remove OTP after successful verification
    await Otp.destroy({ where: { otp } });

    // Return the response with user information, address, and cart data
    res.status(200).json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
        addresses: user.addresses,
      },
      cartData, // Include cart data (bulk items) in the response
    });
  } catch (error) {
    console.error('Error verifying OTP:', error.message);
    res.status(500).json({ error: error.message });
  }
};



  

export const addAddress = async (req, res) => {
  try {
    const { residential_address, city, state, pin_code, mobile_no } = req.body;

    // Ensure user ID is retrieved from middleware
    const address = await Address.create({
      residential_address,
      city,
      state,
      pin_code,
      mobile_no,
      // user_id: req.userId, // Retrieved from the verified token
      userId: req.userId, // Retrieved from the verified token
    });

    res.status(201).json({ message: 'Address added successfully', address });
  } catch (error) {
    console.error('Error adding address:', error.message);
    res.status(500).json({ error: error.message });
  }
};


  

export const getAllUsers = async (req, res) => {
  try {
      const users = await User.findAll({
          include: [
              {
                  model: Address,
                  as: 'addresses',
                  attributes: ['residential_address', 'city', 'state', 'pin_code', 'mobile_no'],
              },
          ],
          attributes: ['id', 'name', 'email', 'role'], // Select desired user attributes
      });

      res.status(200).json({ message: 'Users retrieved successfully', users });
  } catch (error) {
      console.error('Error fetching users:', error.message);
      res.status(500).json({ error: error.message });
  }
};

  
export const getUserById = async (req, res) => {
  try {
      const { id } = req.params;

      const user = await User.findOne({
          where: { id },
          include: [
              {
                  model: Address,
                  as: 'addresses',
                  attributes: ['residential_address', 'city', 'state', 'pin_code', 'mobile_no'],
              },
          ],
          attributes: ['id', 'name', 'email', 'role'],
      });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User retrieved successfully', user });
  } catch (error) {
      console.error('Error fetching user:', error.message);
      res.status(500).json({ error: error.message });
  }
};

  