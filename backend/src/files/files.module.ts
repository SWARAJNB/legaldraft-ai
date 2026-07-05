import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';
import { FileVersion } from './entities/file-version.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity, FileVersion]),
    MulterModule.register({
      storage: undefined, // memory storage (buffer)
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
