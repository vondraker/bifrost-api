import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: 'http://localhost:5173',
        credentials: true,
    });
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');

    const port = Number(process.env.NEST_PORT || process.env.PORT || 3001);
    await app.listen(port);
    console.log(`Nest server running on http://localhost:${port}`);
}

bootstrap().catch((error) => {
    console.error('Nest bootstrap error:', error);
    process.exit(1);
});
