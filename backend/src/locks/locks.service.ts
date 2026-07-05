import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { DraftLock } from './entities/draft-lock.entity';

const LOCK_DURATION_MINUTES = 30;

@Injectable()
export class LocksService {
  constructor(
    @InjectRepository(DraftLock)
    private locksRepo: Repository<DraftLock>,
  ) {}

  async acquireLock(draftId: string, userId: string, userName: string) {
    // Clean up expired locks first
    await this.locksRepo.delete({ expiresAt: LessThan(new Date()) });

    // Check for existing lock
    const existing = await this.locksRepo.findOne({ where: { draftId } });
    if (existing) {
      if (existing.userId === userId) {
        // Refresh lock
        existing.expiresAt = new Date(Date.now() + LOCK_DURATION_MINUTES * 60000);
        return this.locksRepo.save(existing);
      }
      throw new ConflictException({
        message: 'Draft is currently being edited by another user',
        lockedBy: existing.userName,
        lockedAt: existing.acquiredAt,
        expiresAt: existing.expiresAt,
      });
    }

    const lock = this.locksRepo.create({
      draftId,
      userId,
      userName,
      expiresAt: new Date(Date.now() + LOCK_DURATION_MINUTES * 60000),
    });
    return this.locksRepo.save(lock);
  }

  async releaseLock(draftId: string, userId: string) {
    const lock = await this.locksRepo.findOne({ where: { draftId, userId } });
    if (!lock) {
      throw new NotFoundException('No active lock found for this draft');
    }
    await this.locksRepo.remove(lock);
    return { message: 'Lock released' };
  }

  async getLockStatus(draftId: string) {
    await this.locksRepo.delete({ expiresAt: LessThan(new Date()) });
    const lock = await this.locksRepo.findOne({ where: { draftId } });
    return { locked: !!lock, lock: lock || null };
  }
}
