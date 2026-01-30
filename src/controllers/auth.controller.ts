import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../types/user.types';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { credential } = req.body;

        if (!credential) {
            res.status(400).json({ message: 'Google credential is required' });
            return;
        }

        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            res.status(401).json({ message: 'Invalid Google token' });
            return;
        }

        const { sub: googleId, email, name, picture } = payload;

        // In a real app, verify if user exists in DB, if not create them.
        const user: User = {
            id: googleId,
            email: email,
            name: name || 'User',
            picture: picture
        };

        // Generate Application JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, name: user.name, picture: user.picture },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set Cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // false for localhost
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 3600000 // 1 hour
        });

        res.json({
            message: 'Login successful',
            user
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ message: 'Invalid authentication' });
    }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.cookies.token;

        if (!token) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const user: User = {
            id: decoded.userId,
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture
        }

        res.json({
            user
        });

    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
