import { DataTypes } from "sequelize";
import { sequelize } from "../db/dbconnect.js";

export const Category = sequelize.define('Category', {
    id:{
      type:DataTypes.INTEGER,
      autoIncrement:true,
      primaryKey:true

    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
  });

