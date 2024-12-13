import { DataTypes } from "sequelize";
import { sequelize } from "../db/dbconnect.js";
import { Category } from "./category.model.js";


export const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Category,
      key: 'id',
    },
    
  },
},{
  paranoid: true, // Enable soft delete by setting paranoid to true
});


