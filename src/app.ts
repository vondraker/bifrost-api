import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import authRoutes from './routes/auth.routes';
import itemRoutes from './routes/item.routes';
import minecraftRoutes from './routes/minecraft.routes';

const app = express();
const nestInternalUrl = process.env.NEST_INTERNAL_URL || 'http://localhost:3001';
const useNestAuth = process.env.MIGRATE_AUTH_TO_NEST === 'true';
const useNestItems = process.env.MIGRATE_ITEMS_TO_NEST === 'true';
const useNestMinecraft = process.env.MIGRATE_MINECRAFT_TO_NEST === 'true';

const shouldSendBody = (method: string): boolean => !['GET', 'HEAD'].includes(method.toUpperCase());

const proxyToNest = async (req: Request, res: Response): Promise<void> => {
    try {
        const targetUrl = new URL(req.originalUrl, nestInternalUrl);
        const headers = new Headers();

        for (const [key, value] of Object.entries(req.headers)) {
            if (!value) {
                continue;
            }

            const lowerKey = key.toLowerCase();
            if (lowerKey === 'host' || lowerKey === 'content-length') {
                continue;
            }

            if (Array.isArray(value)) {
                headers.set(key, value.join(','));
                continue;
            }

            headers.set(key, value);
        }

        let body: string | undefined;
        if (shouldSendBody(req.method) && req.body && Object.keys(req.body).length > 0) {
            body = JSON.stringify(req.body);
            if (!headers.has('content-type')) {
                headers.set('content-type', 'application/json');
            }
        }

        const proxiedResponse = await fetch(targetUrl, {
            method: req.method,
            headers,
            body,
            redirect: 'manual',
        });

        res.status(proxiedResponse.status);

        proxiedResponse.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            if (lowerKey === 'content-length' || lowerKey === 'transfer-encoding') {
                return;
            }
            res.setHeader(key, value);
        });

        const getSetCookie = (proxiedResponse.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
        if (getSetCookie) {
            const cookies = getSetCookie.call(proxiedResponse.headers);
            if (cookies.length > 0) {
                res.setHeader('set-cookie', cookies);
            }
        }

        const responseText = await proxiedResponse.text();
        if (!responseText) {
            res.send();
            return;
        }

        const contentType = proxiedResponse.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            res.json(JSON.parse(responseText));
            return;
        }

        res.send(responseText);
    } catch (error) {
        console.error('Nest proxy error:', error);
        res.status(502).json({ error: 'NestJS upstream unavailable' });
    }
};

const makeDomainRouter = (useNest: boolean, legacyHandler: (req: Request, res: Response, next: NextFunction) => unknown) => {
    if (!useNest) {
        return legacyHandler;
    }

    return (req: Request, res: Response) => {
        void proxyToNest(req, res);
    };
};

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true // Allow cookies to be sent
}));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/auth', makeDomainRouter(useNestAuth, authRoutes));
app.use('/api/items', makeDomainRouter(useNestItems, itemRoutes));
app.use('/api/minecraft', makeDomainRouter(useNestMinecraft, minecraftRoutes));

app.get('/', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

export default app;
