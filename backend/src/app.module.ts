import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { AiModule } from './ai/ai.module';
import { DraftsModule } from './drafts/drafts.module';
import { TemplatesModule } from './templates/templates.module';
import { VersionsModule } from './versions/versions.module';
import { AuditModule } from './audit/audit.module';
import { LocksModule } from './locks/locks.module';
import { ExportModule } from './export/export.module';
import { DocumentProcessingModule } from './document-processing/document-processing.module';
import { RagModule } from './rag/rag.module';
import { WebsocketModule } from './websocket/websocket.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Environment config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'ai.env'],
    }),

    // Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://legaldraft:legaldraft_password@localhost:5432/legaldraft_ai',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // auto-sync in dev
      logging: process.env.NODE_ENV !== 'production' ? ['error'] : false,
      ssl: (process.env.DATABASE_URL || '').includes('neon.tech')
        ? { rejectUnauthorized: false }
        : undefined,
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    FilesModule,
    AiModule,
    DraftsModule,
    TemplatesModule,
    VersionsModule,
    AuditModule,
    LocksModule,
    ExportModule,
    DocumentProcessingModule,
    RagModule,
    WebsocketModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
