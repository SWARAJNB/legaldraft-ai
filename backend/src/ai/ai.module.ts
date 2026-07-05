import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiDraftAssistantService } from './ai-draft-assistant.service';
import { AiConversation } from './entities/ai-conversation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiConversation])],
  controllers: [AiController],
  providers: [AiService, AiDraftAssistantService],
  exports: [AiService],
})
export class AiModule {}
