import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '../files/entities/file.entity';
import { FileIntelligenceEntity } from '../files/entities/file-intelligence.entity';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity, FileIntelligenceEntity])],
  controllers: [RagController],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}
