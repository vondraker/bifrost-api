import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { ItemsModule } from './items/items.module';
import { MinecraftModule } from './minecraft/minecraft.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        PrismaModule,
        RedisModule,
        AuthModule,
        ItemsModule,
        MinecraftModule,
    ],
})
export class AppModule {}
