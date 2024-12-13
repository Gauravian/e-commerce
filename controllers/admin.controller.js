import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../Models/user.model.js';




export const registerAdmin = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'admin', // Set the role as 'admin'
      });
  
      res.status(201).json({ message: 'Admin registered successfully', admin });
    } catch (error) {
      res.status(500).json({ error: error.message });
      console.log(error);
    }
  };
  

  export const loginAdmin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if the user exists and is an admin
      const admin = await User.findOne({ where: { email, role: 'admin' } });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      // Check if password matches
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Generate JWT token for the admin
      const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_TOKEN, {
        expiresIn: '24h',
      });
  
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Error during admin login:', error.message);
      res.status(500).json({ error: error.message });
    }
  };
  