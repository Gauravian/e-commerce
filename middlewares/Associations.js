import { User } from '../Models/user.model.js';
import { Address } from '../Models/user.model.js';
import { Order, OrderItem } from '../Models/order.models.js';
import { Product } from '../Models/product.model.js';
import { Category } from '../Models/category.model.js';
import { Cart, CartItem } from '../Models/cart.modal.js';
import { Review } from '../Models/review.modal.js';
import { Payment } from '../Models/payment.modal.js';

export const defineAssociations = () => {
  // User and Address
  User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
  Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // User and Order
  User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
  Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  

  // Address and Order
  Address.hasMany(Order, { foreignKey: 'shippingAddressId', as: 'orders' });
  Order.belongsTo(Address, { foreignKey: 'shippingAddressId', as: 'shippingAddress' });

  // Category and Product
  Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
  Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

  // Order and OrderItem
  Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
  OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

  // Product and OrderItem
  Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
  OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  // Cart and CartItem
  Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'cartItems' });
  CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });

  Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems' , onDelete: 'CASCADE' });
  CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' }); 

  // Product and Review
  Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
  Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  // User and Review
  User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
  Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Order and Payment
  Order.hasOne(Payment, { foreignKey: 'orderId', as: 'paymentDetails' });
  Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });


};
