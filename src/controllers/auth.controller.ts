import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../types/user.types';

// Mock user for demonstration purposes
// In a real application, you would fetch this from a database
const MOCK_USER: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    // hash of 'password123'
    password: '$2a$10$wT.fGv/Tq.j./.u.v.j.u.e.r.t.y.u.i.o.p.1.2.3' // This is just a placeholder, we will handle logic below
};

// We prefer to just mock the password check for simplicity in this initial setup if we don't have a DB yet.
// Let's assume the mock user has password 'password123'
// hash for 'password123' is usually something like: $2a$10$X7...

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        // Check if user exists (Mock check)
        if (email !== MOCK_USER.email) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Validate password
        // In a real app we would use bcrypt.compare(password, user.password)
        // For this mock, let's just accept 'password123'
        if (password !== 'password123') {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: MOCK_USER.id, email: MOCK_USER.email },
            process.env.JWT_SECRET || 'your-secret-key', // Fallback for dev
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: MOCK_USER.id,
                email: MOCK_USER.email,
                name: MOCK_USER.name
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
