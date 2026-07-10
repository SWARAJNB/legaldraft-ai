import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { AiModule } from './ai/ai.module';
import { DraftsModule } from './drafts/drafts.module';
import { TemplatesModule } from './templates/templates.module';
import { VersionsModule } from './drafts/versions/versions.module';
import { AuditModule } from './audit/audit.module';
import { LocksModule } from './drafts/locks/locks.module';
import { ExportModule } from './drafts/export/export.module';
import { DocumentProcessingModule } from './files/document-processing/document-processing.module';
import { RagModule } from './rag/rag.module';
import { WebsocketModule } from './websocket/websocket.module';
import { HealthController } from './health.controller';
import { dataSourceOptions } from './database/data-source';


@Module({
  imports: [
    // Environment config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'ai.env'],
      load: [configuration],
    }),


    // Database
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
