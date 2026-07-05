import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersionsController } from './versions.controller';
import { VersionsService } from './versions.service';
import { DraftVersion } from './entities/draft-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DraftVersion])],
  controllers: [VersionsController],
  providers: [VersionsService],
  exports: [VersionsService],
})
export class VersionsModule {}
