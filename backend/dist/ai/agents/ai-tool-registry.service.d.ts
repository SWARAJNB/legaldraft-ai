import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RagService } from '../../rag/rag.service';
import { Template } from '../../templates/entities/template.entity';
import { Draft } from '../../drafts/entities/draft.entity';
import { RegisteredTool, SharedAiContext } from './agent.types';
export declare class AiToolRegistryService implements OnModuleInit {
    private readonly ragService;
    private readonly templatesRepo;
    private readonly draftsRepo;
    private readonly tools;
    constructor(ragService: RagService, templatesRepo: Repository<Template>, draftsRepo: Repository<Draft>);
    onModuleInit(): void;
    register(tool: RegisteredTool): void;
    get(id: string): RegisteredTool | undefined;
    list(): {
        id: string;
        description: string;
    }[];
    run(id: string, input: any, context: SharedAiContext): Promise<any>;
}
