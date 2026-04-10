import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsCacheService } from './items-cache.service';
import { ItemsService } from './items.service';

@Module({
    controllers: [ItemsController],
    providers: [ItemsService, ItemsCacheService],
})
export class ItemsModule {}
