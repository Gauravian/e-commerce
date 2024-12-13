import { Review } from "../Models/review.modal.js";
import { Product } from "../Models/product.model.js";
import { User } from "../Models/user.model.js";

export const createReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  // const userId = req.userId;  // Extracted from the token
  const userId = 1;  // Extracted from the token

  // Ensure that userId is a valid number
  if (typeof userId !== 'number' || isNaN(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    // Check if the product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Create the review
    const review = await Review.create({
      userId,       // This should be an integer (user ID)
      productId,    // This should be an integer (product ID)
      rating,
      comment,
    });

    res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.error(error);  // Log for debugging
    res.status(500).json({ error: error.message });
  }
};



export const getProductWithReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findOne({
      where: { id: productId },
      include: [
        {
          model: Review,
          as: 'reviews',  // Ensure alias matches 'reviews'
          include: [
            {
              model: User,
              as: 'user',  // Ensure alias matches 'user'
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const averageRating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;

    res.status(200).json({
      message: 'Product with reviews fetched successfully',
      product: {
        ...product.toJSON(),
        averageRating: isNaN(averageRating) ? 0 : averageRating, // Include the average rating
      },
    });
  } catch (error) {
    console.error(error);  // Log to help debug
    res.status(500).json({ error: error.message });
  }
};

export const getUserReviews = async (req, res) => {
  const { userId } = req.params; // Extract userId from URL params

  try {
    const reviews = await Review.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product', // Alias for the product the review is about
          attributes: ['id', 'name', 'price'], // Include relevant product fields
        },
      ],
    });

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this user' });
    }

    res.status(200).json({
      message: 'User reviews fetched successfully',
      reviews,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  
