import { Module } from '@nestjs/common';
import { SandboxService } from './sandbox.service';
import { SandboxController } from './sandbox.controller';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '../common/cache/cache.module';

@Module({
    imports: [HttpModule, CacheModule],
    providers: [SandboxService],
    controllers: [SandboxController],
})
export class SandboxModule {}
