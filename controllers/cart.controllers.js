import { Cart, CartItem } from '../Models/cart.modal.js'; // Ensure correct path
import { Product } from '../Models/product.model.js'; // Ensure correct path
import { User } from '../Models/user.model.js';
import { Order } from '../Models/order.models.js';
import { Review } from '../Models/review.modal.js';

// Add item to cart
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.userId; // Extracted from JWT middleware
  // const userId = 1; // Extracted from JWT middleware

  try {
    // Find the product
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate total price
    const totalPrice = product.price * quantity;

    // Find or create a cart for the user
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    // Check if the product is already in the cart
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      // Update the quantity and totalPrice if item already exists in the cart
      cartItem.quantity += quantity;
      cartItem.totalPrice = cartItem.quantity * product.price;
      await cartItem.save();
    } else {
      // Create new CartItem
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
        totalPrice,
        
      });
    }

    res.status(201).json({ message: 'Item added to cart', cartItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Cart Items
export const getCartItems = async (req, res) => {
  const userId = req.userId; // Extract userId from JWT middleware
// const userId = 1;
  try {
    // Fetch the cart for the user and include CartItems and Product details
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: 'cartItems', // Alias defined in associations
          include: [
            {
              model: Product,
              as: 'product', // Alias defined in associations
              attributes: ['id', 'name', 'price', 'image'], // Product fields to include
            },
          ],
        },
      ],
    });

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      return res.status(404).json({ message: 'Cart is empty or not found' });
    }

    res.status(200).json({ message: 'Cart items fetched successfully', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const getUserOrdersWithCartItems = async (req, res) => {
  const userId = req.userId; // Get userId from JWT
  // const userId = 16; // Get userId from JWT

  try {
    const user = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: Order,
          as: 'orders',
          include: [
            {
              model: Cart,
              as: 'cart',
              include: [
                {
                  model: CartItem,
                  as: 'cartItems',
                  include: [
                    {
                      model: Product,
                      as: 'product',
                      attributes: ['id', 'name', 'price', 'image'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User orders fetched successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove Cart Item
export const removeCartItem = async (req, res) => {
  const { cartItemId } = req.params;

  try {
    // Find the cart item to delete
    const cartItem = await CartItem.findByPk(cartItemId);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Delete the cart item
    await cartItem.destroy();

    res.status(200).json({ message: 'Cart item removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  const { productId, newQuantity } = req.body;
  const userId = req.userId; // Extracted from JWT middleware
// const userId = 23;
  try {
    // Check if the quantity is valid
    if (newQuantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than zero' });
    }

    // Find the product
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the user's cart
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find the cart item to update
    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Update the quantity and total price
    cartItem.quantity = newQuantity;
    cartItem.totalPrice = product.price * newQuantity;
    await cartItem.save();

    res.status(200).json({ message: 'Cart item updated', cartItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

