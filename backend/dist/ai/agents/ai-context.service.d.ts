import { Repository } from 'typeorm';
import { Draft } from '../../drafts/entities/draft.entity';
import { Template } from '../../templates/entities/template.entity';
import { FileEntity } from '../../files/entities/file.entity';
import { FileIntelligenceEntity } from '../../files/entities/file-intelligence.entity';
import { RagService } from '../../rag/rag.service';
import { AiManagerRequest, SharedAiContext } from './agent.types';
export declare class AiContextService {
    private readonly draftsRepo;
    private readonly templatesRepo;
    private readonly filesRepo;
    private readonly intelligenceRepo;
    private readonly ragService;
    constructor(draftsRepo: Repository<Draft>, templatesRepo: Repository<Template>, filesRepo: Repository<FileEntity>, intelligenceRepo: Repository<FileIntelligenceEntity>, ragService: RagService);
    build(request: AiManagerRequest): Promise<SharedAiContext>;
    format(context: SharedAiContext): string;
    private compact;
}
