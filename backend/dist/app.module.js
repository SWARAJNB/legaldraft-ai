"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const configuration_1 = require("./config/configuration");
const logger_middleware_1 = require("./middleware/logger.middleware");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const files_module_1 = require("./files/files.module");
const ai_module_1 = require("./ai/ai.module");
const drafts_module_1 = require("./drafts/drafts.module");
const templates_module_1 = require("./templates/templates.module");
const versions_module_1 = require("./drafts/versions/versions.module");
const audit_module_1 = require("./audit/audit.module");
const locks_module_1 = require("./drafts/locks/locks.module");
const export_module_1 = require("./drafts/export/export.module");
const document_processing_module_1 = require("./files/document-processing/document-processing.module");
const rag_module_1 = require("./rag/rag.module");
const websocket_module_1 = require("./websocket/websocket.module");
const health_controller_1 = require("./health.controller");
const data_source_1 = require("./database/data-source");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(logger_middleware_1.LoggerMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', 'ai.env'],
                load: [configuration_1.default],
            }),
            typeorm_1.TypeOrmModule.forRoot({
                ...data_source_1.dataSourceOptions,
                autoLoadEntities: true,
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            files_module_1.FilesModule,
            ai_module_1.AiModule,
            drafts_module_1.DraftsModule,
            templates_module_1.TemplatesModule,
            versions_module_1.VersionsModule,
            audit_module_1.AuditModule,
            locks_module_1.LocksModule,
            export_module_1.ExportModule,
            document_processing_module_1.DocumentProcessingModule,
            rag_module_1.RagModule,
            websocket_module_1.WebsocketModule,
        ],
        controllers: [health_controller_1.HealthController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map