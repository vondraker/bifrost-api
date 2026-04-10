import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private readonly client: Redis;

    constructor(private readonly configService: ConfigService) {
        const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        this.client = new Redis(redisUrl);
    }

    async onModuleInit(): Promise<void> {
        this.client.on('connect', () => this.logger.log('Redis connected'));
        this.client.on('error', (err) => this.logger.error(`Redis connection error: ${err.message}`));
    }

    async onModuleDestroy(): Promise<void> {
        this.client.disconnect();
    }

    getClient(): Redis {
        return this.client;
    }
}
