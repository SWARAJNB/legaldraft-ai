import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { Template } from './entities/template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Template])],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule implements OnModuleInit {
  constructor(private readonly templatesService: TemplatesService) {}

  async onModuleInit() {
    await this.templatesService.seedSystemTemplates();
  }
}
