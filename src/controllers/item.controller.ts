import { Request, Response } from 'express';
import prisma from '../config/database';
import redis from '../config/redis';

const CACHE_KEY_ITEMS = 'items';
const CACHE_TTL = 60; // 60 seconds

export const createItem = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        const newItem = await prisma.item.create({
            data: { name, description },
        });

        // Invalidate list cache
        await redis.del(CACHE_KEY_ITEMS);

        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create item' });
    }
};

export const getItems = async (req: Request, res: Response) => {
    try {
        // Check cache
        const cachedItems = await redis.get(CACHE_KEY_ITEMS);
        if (cachedItems) {
            console.log('Cache Hit: getItems');
            return res.json(JSON.parse(cachedItems));
        }

        console.log('Cache Miss: getItems');
        const items = await prisma.item.findMany();

        // Set cache
        await redis.set(CACHE_KEY_ITEMS, JSON.stringify(items), 'EX', CACHE_TTL);

        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch items' });
    }
};

export const getItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cacheKey = `item:${id}`;

        // Check cache
        const cachedItem = await redis.get(cacheKey);
        if (cachedItem) {
            console.log(`Cache Hit: getItem(${id})`);
            return res.json(JSON.parse(cachedItem));
        }

        console.log(`Cache Miss: getItem(${id})`);
        const item = await prisma.item.findUnique({
            where: { id: Number(id) },
        });

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Set cache
        await redis.set(cacheKey, JSON.stringify(item), 'EX', CACHE_TTL);

        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch item' });
    }
};

export const updateItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const updatedItem = await prisma.item.update({
            where: { id: Number(id) },
            data: { name, description },
        });

        // Invalidate caches
        await redis.del(CACHE_KEY_ITEMS);
        await redis.del(`item:${id}`);

        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update item' });
    }
};

export const deleteItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.item.delete({
            where: { id: Number(id) },
        });

        // Invalidate caches
        await redis.del(CACHE_KEY_ITEMS);
        await redis.del(`item:${id}`);

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete item' });
    }
};
