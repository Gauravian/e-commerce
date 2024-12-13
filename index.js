import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import  { dbConnection }  from './db/dbconnect.js'
import route from './routes/routes.js'
import path from 'path'


import { defineAssociations } from './middlewares/Associations.js'
import { User } from './Models/user.model.js'
import { Address } from './Models/user.model.js'
import { Category } from './Models/category.model.js'
import { Product } from './Models/product.model.js'
import { Order ,OrderItem } from './Models/Order.models.js'

import { Cart } from './Models/cart.modal.js'
import { CartItem } from './Models/cart.modal.js'
import { Review } from './Models/review.modal.js'
import { Payment } from './Models/payment.modal.js'
import { Otp } from './Models/otp.model.js'

// import bodyParser from 'body-parser'






const app = express()

dotenv.config()

app.use(cors())
// app.use(bodyParser.json())
app.use(express.json())
app.use(express.static('dist'))
app.use('/api/uploads', express.static(path.join('uploads')));

// app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 5002

app.get('/', function (req, res) {
  res.send('Hello World, Kasa kay....!!!!')
})

app.use('/api',route)


const db = async () => {
  try {
    // Establish the DB connection
    await dbConnection();

    // Define the associations after models are loaded
    defineAssociations();


    // Sync models after associations are defined
    await Promise.all([
      Otp.sync({ alter: false }),
      User.sync({ alter: false }),
      Address.sync({ alter: false }),
      Category.sync({ alter: false }),
      Product.sync({ alter: false }),
      Order.sync({ alter: false }),
      OrderItem.sync({ alter: false }),
      Cart.sync({ alter: false }),
      CartItem.sync({ alter: false }),
      Review.sync({ alter: false }),
      Payment.sync({ alter: false }),
    ]);

    console.log("All models synced successfully.");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};

db();


app.listen(PORT, (req, res) => {
    console.log(`Server is running on port ${PORT}...!!!`)
   
  })