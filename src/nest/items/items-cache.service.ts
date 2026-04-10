import { Injectable, Logger } from '@nestjs/common';
import { Item } from '@prisma/client';
import { RedisService } from '../infrastructure/redis/redis.service';

const CACHE_KEY_ITEMS = 'items';
const CACHE_TTL_SECONDS = 60;

@Injectable()
export class ItemsCacheService {
    private readonly logger = new Logger(ItemsCacheService.name);

    constructor(private readonly redisService: RedisService) {}

    async getItemsList(): Promise<Item[] | null> {
        const cached = await this.redisService.getClient().get(CACHE_KEY_ITEMS);
        if (!cached) {
            this.logger.log('Cache Miss: getItems');
            return null;
        }

        this.logger.log('Cache Hit: getItems');
        return JSON.parse(cached) as Item[];
    }

    async setItemsList(items: Item[]): Promise<void> {
        await this.redisService.getClient().set(CACHE_KEY_ITEMS, JSON.stringify(items), 'EX', CACHE_TTL_SECONDS);
    }

    async getItemById(id: number): Promise<Item | null> {
        const cacheKey = this.itemKey(id);
        const cached = await this.redisService.getClient().get(cacheKey);
        if (!cached) {
            this.logger.log(`Cache Miss: getItem(${id})`);
            return null;
        }

        this.logger.log(`Cache Hit: getItem(${id})`);
        return JSON.parse(cached) as Item;
    }

    async setItemById(id: number, item: Item): Promise<void> {
        await this.redisService.getClient().set(this.itemKey(id), JSON.stringify(item), 'EX', CACHE_TTL_SECONDS);
    }

    async invalidateList(): Promise<void> {
        await this.redisService.getClient().del(CACHE_KEY_ITEMS);
    }

    async invalidateItem(id: number): Promise<void> {
        await this.redisService.getClient().del(this.itemKey(id));
    }

    private itemKey(id: number): string {
        return `item:${id}`;
    }
}
