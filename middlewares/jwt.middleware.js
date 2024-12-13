import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  // Extract token from headers (replace hardcoded token for testing)
  const token = req.headers['token']
  console.log("token",token);
  
  // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjMsImlhdCI6MTczMzk5NjY4OCwiZXhwIjoxNzM0MDgzMDg4fQ.iASeJiBc4B8YAUK-aam8Azv62aAk-7B39cB25OP5mn0"
  
  

   
  if (!token) {
      return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  try {
      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_TOKEN);
      console.log(decoded);
      
       // Debugging: Check the structure of the decoded payload

      // Extract user ID from decoded payload
      req.userId = decoded.id; 

      next(); // Proceed to the next middleware or controller
  } catch (error) {
      console.error('Invalid token:', error.message);
      res.status(403).json({ message: 'Invalid token' });
  }
};
  
  