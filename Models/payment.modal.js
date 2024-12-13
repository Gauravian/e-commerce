import { DataTypes } from "sequelize";
import { sequelize } from "../db/dbconnect.js";
import { Order } from "../Models/Order.models.js"; // Assuming order model is in the order.model.js file
import { User } from "../Models/user.model.js";  // Assuming user model is in the user.model.js file

// Define Payment Model
export const Payment = sequelize.define("Payment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Order,  
      key: "id",
    },
  },
  
  
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "INR", 
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "pending", 
  },
  invoiceUrl: {
    type: DataTypes.STRING, // This will store the path to the generated invoice PDF
    allowNull: true,
  },
});



// Payment.belongsTo(Order, { foreignKey: "orderId", as: "orderDetails" });  
// Payment.belongsTo(User, { foreignKey: "userId", as: "userDetails" });     


