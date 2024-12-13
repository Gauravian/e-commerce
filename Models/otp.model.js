import { DataTypes } from "sequelize";
import { sequelize } from "../db/dbconnect.js";

export const Otp = sequelize.define('OtpModel', {
    id:{
      type:DataTypes.INTEGER,
      autoIncrement:true,
      primaryKey:true

    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      }
    
  },{timestamps:false});