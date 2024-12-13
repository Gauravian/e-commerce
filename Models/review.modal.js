import { DataTypes } from "sequelize";
import { sequelize } from "../db/dbconnect.js";
import { User } from "../Models/user.model.js";
import { Product } from "../Models/product.model.js";

// Define Review Model
export const Review = sequelize.define('Review', {
  productId: {
    type: DataTypes.INTEGER,
    references: {
      model: Product,
      key: 'id',
    },
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});

// Associations



// Associations with custom alias
// Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });  // Alias 'reviews'
// Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
// User.hasMany(Review, { foreignKey: 'userId' });
// Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });


