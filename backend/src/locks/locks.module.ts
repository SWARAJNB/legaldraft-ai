import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocksService } from './locks.service';
import { DraftLock } from './entities/draft-lock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DraftLock])],
  providers: [LocksService],
  exports: [LocksService],
})
export class LocksModule {}
