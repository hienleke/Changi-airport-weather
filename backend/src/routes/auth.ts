import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import  pool  from '../config/database';
import { redisClient } from '../config/redis';
import { authenticateToken, validateToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
      [email, hashedPassword]
    );
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    // Store token in Redis
    await redisClient.set(`token:${user.id}`, token, {EX:  3600}); // 1 hour
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 hour
      sameSite: 'strict'
    });
    
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/validate', authenticateToken, async (req: any, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    const isValid = await validateToken(token, req.user.userId);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.json({ valid: true });
  } catch (error) {
    res.status(500).json({ error: 'Validation failed' });
  }
});

router.post('/logout', authenticateToken, async (req: any, res) => {
  try {
    await redisClient.del(`token:${req.user.userId}`);
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router; 