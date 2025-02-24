import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { winstonConfig } from './common/logger/config';
import { WinstonModule } from 'nest-winston';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: WinstonModule.createLogger(winstonConfig),
        bufferLogs: true,
    });
    app.set('trust proxy', true);
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
