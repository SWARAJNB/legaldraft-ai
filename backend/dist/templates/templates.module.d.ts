import { OnModuleInit } from '@nestjs/common';
import { TemplatesService } from './templates.service';
export declare class TemplatesModule implements OnModuleInit {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    onModuleInit(): Promise<void>;
}
