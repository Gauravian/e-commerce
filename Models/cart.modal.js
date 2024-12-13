import { DataTypes } from "sequelize";
import { sequelize } from "../db/dbconnect.js";
import { User } from "../Models/user.model.js";
import { Product } from "./product.model.js";

// Cart Model
export const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: true,
  }
}, {
  tableName: 'carts',
  timestamps: true,
});

// CartItem Model
export const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cartId: {
    type: DataTypes.INTEGER,
    references: {
      model: Cart,
      key: 'id',
    },
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    references: {
      model: Product,
      key: 'id',
    },
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'cart_items',
  timestamps: true,
});

// Associations
// Cart.belongsTo(User, { foreignKey: 'userId' });
// Cart.hasMany(CartItem, { foreignKey: 'cartId' });

// CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
// CartItem.belongsTo(Product, { foreignKey: 'productId' });
