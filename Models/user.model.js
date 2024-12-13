import { DataTypes } from 'sequelize';
import { sequelize } from '../db/dbconnect.js';
import { Order } from './order.models.js';

 export const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user',
  },
}, {
  timestamps: true,
});
  
  // Address Model
  
  
  export const Address = sequelize.define('Address', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    residential_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pin_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',  // Foreign key reference to the User table
        key: 'id',
      }
    }
  },{ freezeTableName: true });
  
  


  // Associations
  // User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
  // Address.belongsTo(User, { foreignKey: 'userId' });



  