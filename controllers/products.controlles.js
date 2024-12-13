import { Category } from '../Models/category.model.js'
import { Product } from '../Models/product.model.js'
import { CartItem } from '../Models/cart.modal.js';
import { Cart } from '../Models/cart.modal.js';
import { Order , OrderItem } from '../Models/Order.models.js';
import { Review } from '../Models/review.modal.js';




export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    

    // Check if the category name is provided
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Handle the image upload if present
    const image = req.file ? req.file.path : null;

    // Create the category with the provided name and image
    const category = await Category.create({
      name: name,
      image: image,
    });

    // Return success response
    res.status(201).json({
      message: 'Category added successfully',
      category,
    });
  } catch (error) {
    // Log the error and send response
    console.error('Error adding category:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getCategory = async(req,res) => {
  try {
  const products = await Category.findAll({
    attributes: ['id', 'name'], // Select specific fields for products
  });

  res.status(200).json({
    message: 'category fetched successfully',
    products,
  })}catch (error) {
    // Log the error and send response
    console.error('Error adding category:', error.message);
    res.status(500).json({ error: error.message });
  }

}


export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params; // Get the category ID from the request parameters
    const { name } = req.body; // Get the name from the request body (if provided)
    
    // Get the uploaded image (if any)
    const image = req.file ? req.file.path : null;

    // Find the category by its ID
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // If the name is provided, update the name
    if (name) {
      category.name = name.trim(); // Trim extra spaces from name
    }

    // If the image is provided, update the image
    if (image) {
      category.image = image;
    }

    // Save the updated category to the database
    await category.save();

    // Return success response
    res.status(200).json({
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    console.error('Error updating category:', error.message);
    res.status(500).json({ error: error.message });
  }
};





export const addProduct = async (req, res) => {
  try {
    const { name, description, price, category_name } = req.body; // Using category_name instead of category_id
    const image = req.file ? req.file.path : null;

    // Ensure category_name exists in the database
    const category = await Category.findOne({
      where: { name: category_name },  // Find the category by name
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Create the product with the provided details
    const product = await Product.create({
      name,
      description,
      price,
      image,
      category_id: category.id, // Use category_id from the found category
    });
    
    const productWithCategory = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: {
        id: category.id,
        name: category.name,
      },
      
    };

    res.status(201).json({ message: 'Product added successfully', product: productWithCategory });
  } catch (error) {
    console.error('Error adding product:', error.message);
    res.status(500).json({ error: error.message });
  }
};



export const getAll = async (req, res) => {
  try {
    // Fetch categories with their associated products
    const categories = await Category.findAll({
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'description', 'price', 'image'], // Select specific fields
        },
      ],
    });

    // Handle case when no categories are found
    if (!categories.length) {
      return res.status(200).json({
        message: 'No categories or products available.',
        categories: [],
      });
    }

    res.status(200).json({
      message: 'Categories with Products fetched successfully',
      categories,
    });
  } catch (error) {
    console.error('Error fetching categories with products:', error.message);
    res.status(500).json({ error: error.message });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product by its ID
    const product = await Product.findByPk(id, { paranoid: false });
    
    

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Handle product references in CartItem (shopping cart)
    const cartItems = await CartItem.findAll({
      where: { productId: id },
    });

    if (cartItems.length > 0) {
      // Optionally delete associated CartItems
      await CartItem.destroy({
        where: { productId: id },
      });
      console.log(`Deleted ${cartItems.length} cart item(s) for product id: ${id}`);
    }

    // Handle product references in OrderItem (orders)
    const orderItems = await OrderItem.findAll({
      where: { productId: id },
    });

    if (orderItems.length > 0) {
      // You can choose to either delete or update the order items to set productId to null, depending on your use case
      await OrderItem.destroy({
        where: { productId: id },
      });
      console.log(`Deleted ${orderItems.length} order item(s) for product id: ${id}`);
    }

    // Handle product references in Review (reviews)
    const reviews = await Review.findAll({
      where: { productId: id },
    });

    if (reviews.length > 0) {
      // Optionally delete associated reviews
      await Review.destroy({
        where: { productId: id },
      });
      console.log(`Deleted ${reviews.length} review(s) for product id: ${id}`);
    }

    // Finally, delete the product (soft delete if paranoid is enabled)
    await product.destroy(); // This will use soft delete due to 'paranoid: true' in the Product model

    res.status(200).json({ message: 'Product and associated data deleted successfully',product });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ error: error.message });
  }
};



export const getOnlyProduct = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category', // Use the alias defined in associations
          attributes: ['id', 'name'], // Select specific fields from the category
        },
      ],
      attributes: ['id', 'name', 'description', 'price', 'image'], // Select specific fields for products
    });

    res.status(200).json({
      message: 'Products fetched successfully',
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category_name } = req.body;
    const image = req.file ? req.file.path : null;

    // Find the product by its ID
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if at least one field is being updated
    if (!name && !description && !price && !category_name && !image) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    let category = null;

    // Update the product with provided fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;

    // Only update the image if it is provided in the request
    if (image !== null) product.image = image;

    if (category_name !== undefined) {
      // Find the category by name
      category = await Category.findOne({
        where: { name: category_name },
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      product.category_id = category.id; // Update product with the found category_id
    } else {
      // Fetch the current category for the response if category_name is not updated
      category = await Category.findByPk(product.category_id);
    }

    // Save the updated product
    await product.save();

    // Construct productWithCategory for the response
    const productWithCategory = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: {
        id: category.id,
        name: category.name,
      },
    };

    res.status(200).json({
      message: 'Product updated successfully',
      product: productWithCategory,
    });
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ error: error.message });
  }
};






