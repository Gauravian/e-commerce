import { Address } from "../Models/user.model.js";
import { Product } from "./product.model.js";
import { DataTypes } from "sequelize";
import { sequelize } from "../db/dbconnect.js";
import { User } from "../Models/user.model.js";

// Define Order Model
export const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Order Confirmed",
  },
  payment: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "cash on delivery",
  },
  shippingAddressId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Addresses', // Use string reference
      key: "id",
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users", // Use string reference
      key: "id",
    },
  },
});

// Define OrderItem Model
export const OrderItem = sequelize.define("OrderItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Orders", // Use string reference
      key: "id",
    },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Products", // Use string reference
      key: "id",
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pricePerItem: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

// Move associations to a separate function to avoid circular dependencies
// export const defineAssociations = () => {
//   Order.belongsTo(Address, { foreignKey: 'shippingAddressId', as: 'shippingAddress' });
//   Address.hasMany(Order, { foreignKey: 'shippingAddressId', as: 'orders' });
// };



