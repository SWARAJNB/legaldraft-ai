import { Repository } from 'typeorm';
import { DraftLock } from './entities/draft-lock.entity';
export declare class LocksService {
    private locksRepo;
    constructor(locksRepo: Repository<DraftLock>);
    acquireLock(draftId: string, userId: string, userName: string): Promise<DraftLock>;
    releaseLock(draftId: string, userId: string): Promise<{
        message: string;
    }>;
    getLockStatus(draftId: string): Promise<{
        locked: boolean;
        lock: DraftLock | null;
    }>;
}
