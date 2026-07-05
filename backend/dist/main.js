"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const fastapi_compat_filter_1 = require("./filters/fastapi-compat.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalFilters(new fastapi_compat_filter_1.FastApiCompatFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    app.enableCors({
        origin: '*',
        credentials: true,
        methods: '*',
        allowedHeaders: '*',
        exposedHeaders: ['Content-Disposition'],
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('LegalDraft AI Storage & AI API')
        .setDescription('Enterprise-grade tenant-isolated storage and AI drafting services for LegalDraft AI')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 8000;
    await app.listen(port);
    console.log(`\n  🚀  LegalDraft AI Backend running on http://localhost:${port}`);
    console.log(`  📚  Swagger docs at http://localhost:${port}/api/docs\n`);
}
bootstrap();
//# sourceMappingURL=main.js.map