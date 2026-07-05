import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { FastApiCompatFilter } from './filters/fastapi-compat.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter — returns errors in FastAPI format for frontend compat
  app.useGlobalFilters(new FastApiCompatFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // CORS — match existing FastAPI config
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: '*',
    allowedHeaders: '*',
    exposedHeaders: ['Content-Disposition'],
  });

  // Swagger API docs
  const config = new DocumentBuilder()
    .setTitle('LegalDraft AI Storage & AI API')
    .setDescription(
      'Enterprise-grade tenant-isolated storage and AI drafting services for LegalDraft AI',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`\n  🚀  LegalDraft AI Backend running on http://localhost:${port}`);
  console.log(`  📚  Swagger docs at http://localhost:${port}/api/docs\n`);
}
bootstrap();
