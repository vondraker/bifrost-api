import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    Param,
    ParseIntPipe,
    Post,
    Put,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) {}

    @Post()
    async createItem(@Body() body: CreateItemDto) {
        try {
            return await this.itemsService.createItem(body);
        } catch {
            throw new InternalServerErrorException({ error: 'Failed to create item' });
        }
    }

    @Get()
    async getItems() {
        try {
            return await this.itemsService.getItems();
        } catch {
            throw new InternalServerErrorException({ error: 'Failed to fetch items' });
        }
    }

    @Get(':id')
    async getItem(@Param('id', ParseIntPipe) id: number) {
        try {
            return await this.itemsService.getItem(id);
        } catch (error) {
            if (error instanceof Error && error.name === 'NotFoundException') {
                throw error;
            }
            throw new InternalServerErrorException({ error: 'Failed to fetch item' });
        }
    }

    @Put(':id')
    async updateItem(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateItemDto) {
        try {
            return await this.itemsService.updateItem(id, body);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new InternalServerErrorException({ error: 'Failed to update item' });
            }
            throw new InternalServerErrorException({ error: 'Failed to update item' });
        }
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteItem(@Param('id', ParseIntPipe) id: number): Promise<void> {
        try {
            await this.itemsService.deleteItem(id);
        } catch {
            throw new InternalServerErrorException({ error: 'Failed to delete item' });
        }
    }
}
