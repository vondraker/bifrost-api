import { Injectable, NotFoundException } from '@nestjs/common';
import { Item } from '@prisma/client';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemsCacheService } from './items-cache.service';

@Injectable()
export class ItemsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: ItemsCacheService,
    ) {}

    async createItem(data: CreateItemDto): Promise<Item> {
        const created = await this.prisma.item.create({ data });
        await this.cache.invalidateList();
        return created;
    }

    async getItems(): Promise<Item[]> {
        const cachedItems = await this.cache.getItemsList();
        if (cachedItems) {
            return cachedItems;
        }

        const items = await this.prisma.item.findMany();
        await this.cache.setItemsList(items);
        return items;
    }

    async getItem(id: number): Promise<Item> {
        const cachedItem = await this.cache.getItemById(id);
        if (cachedItem) {
            return cachedItem;
        }

        const item = await this.prisma.item.findUnique({ where: { id } });
        if (!item) {
            throw new NotFoundException({ error: 'Item not found' });
        }

        await this.cache.setItemById(id, item);
        return item;
    }

    async updateItem(id: number, data: UpdateItemDto): Promise<Item> {
        const updated = await this.prisma.item.update({
            where: { id },
            data,
        });

        await Promise.all([this.cache.invalidateList(), this.cache.invalidateItem(id)]);
        return updated;
    }

    async deleteItem(id: number): Promise<void> {
        await this.prisma.item.delete({ where: { id } });
        await Promise.all([this.cache.invalidateList(), this.cache.invalidateItem(id)]);
    }
}
