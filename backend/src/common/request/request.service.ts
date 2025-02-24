import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { UserSession } from '../types/session';
import { RequestIntervalException } from '../exception/errors';

const LIMIT = 500;

@Injectable()
export class RequestService {
    constructor(private readonly cacheService: CacheService) {}
    validRequestInterval(sessionId: string) {
        const sessionDatas = this.cacheService.get(sessionId) as UserSession;
        const prevReqTime = sessionDatas.lastRequest.getTime();
        const currentReqTime = new Date();
        const interval = currentReqTime.getTime() - prevReqTime;
        if (interval < LIMIT) {
            throw new RequestIntervalException();
        }
        this.cacheService.set(sessionId, {
            ...sessionDatas,
            lastRequest: currentReqTime,
        });
        return true;
    }
}
