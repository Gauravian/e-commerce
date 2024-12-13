import express from "express";
import {  addCategory, addProduct ,deleteProduct,getAll, getCategory, getOnlyProduct, updateCategory, updateProduct } from "../controllers/products.controlles.js";
import upload from "../middlewares/image.upload.js";
import { addAddress, getAllUsers, getUserById, loginUser, registerUser , verifyOtp, verifyRegistrationOtp } from "../controllers/user.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";
import { createOrder, deleteOrder, getAllUserOrders, getOrderDetails } from "../controllers/Ordes.controlles.js";
import { addToCart, getCartItems, getUserOrdersWithCartItems, removeCartItem, updateCartItem } from "../controllers/cart.controllers.js";
import { createReview, getProductWithReviews, getUserReviews } from "../controllers/review.controller.js";
import { completePayment, createPayment,   downloadInvoice,   getOrderWithPaymentAndUser } from "../controllers/payment.controller.js";
import { loginAdmin } from "../controllers/admin.controller.js";

// import { upload } from "../controllers/products.controlles";


const router = express.Router();

 // Products routes 

 router.post('/categories', upload.single('image'),addCategory);
 router.get("/getcategory",getCategory)
 router.post('/updateCategories/:id',upload.single('image'), updateCategory)
 router.post('/products', upload.single('image'), addProduct);
 router.get('/getallProduct', getAll)
 router.delete('/deleteproduct/:id',deleteProduct)
 router.get('/onlyproduct',getOnlyProduct)
 router.put('/updateProduct/:id',upload.single('image'),updateProduct)
 

 // Admin routes 


 router.post('/loginAdmin',loginAdmin)

 // user routes 

 router.post('/registration',registerUser)
 router.post('/registrationVerify', verifyRegistrationOtp)
 router.post('/login',loginUser)
 router.post('/otpVerify',verifyOtp)
 router.post('/address',verifyToken,addAddress)
 router.get('/getallUser',getAllUsers)
 router.get('/getOneUser/:id',getUserById)


// order routes

 router.post('/createOrder',verifyToken,createOrder)
 router.get('/getAllOrder/:orderId',verifyToken,getOrderDetails)
 router.get('/getOrder',verifyToken,getAllUserOrders);
 router.delete('/deleteOrder/:orderId',verifyToken,deleteOrder)

// cart routes

 router.post('/addCart',verifyToken,addToCart);
 router.get('/getAllCart',verifyToken, getCartItems);
 router.delete('/deleteCart/:cartItemId',verifyToken, removeCartItem);
 router.get('/get',verifyToken,getUserOrdersWithCartItems)
 router.put('/updateCart',verifyToken,updateCartItem)

// review routes 

 router.post('/review',verifyToken,createReview);
 router.get('/products/:productId/reviews',getProductWithReviews);
 router.get('/user/:userId/reviews',getUserReviews)


// router.delete('/api/getAllCart/items/:cartItemId', removeCartItem);

// payment routes

router.post('/payment',verifyToken,createPayment)
router.get('/getPayment/:orderId',verifyToken,getOrderWithPaymentAndUser)
router.put('/payment/:paymentId/complete', verifyToken, completePayment);
router.get('/payment/:paymentId/download-invoice',downloadInvoice)

// router.post('/generate-invoice', generateAndSendInvoice); 




export default router;