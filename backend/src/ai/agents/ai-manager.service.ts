import { Injectable, Logger } from '@nestjs/common';
import { AiAgentRegistryService } from './ai-agent-registry.service';
import { AiContextService } from './ai-context.service';
import { GeminiProvider } from '../providers/gemini.provider';
import { AiManagerRequest, AgentExecutionResult, toChatMessages, AgentId } from './agent.types';

@Injectable()
export class AiManagerService {
  private readonly logger = new Logger(AiManagerService.name);
  private provider: GeminiProvider;

  constructor(
    private readonly agentRegistry: AiAgentRegistryService,
    private readonly contextService: AiContextService,
  ) {
    this.provider = new GeminiProvider();
  }

  async execute(request: AiManagerRequest): Promise<AgentExecutionResult & { selectedAgentId: AgentId }> {
    // 1. Build shared context (do not duplicate context building)
    const context = await this.contextService.build(request);

    // 2. Select correct agent (Manual or Automatic mode)
    let agentId: AgentId = 'draft';
    if (request.mode === 'manual' && request.selectedAgent) {
      agentId = request.selectedAgent;
    } else {
      const detectedAgent = this.agentRegistry.detect(request.message);
      agentId = detectedAgent.id;
    }

    const agent = this.agentRegistry.get(agentId);
    if (!agent) {
      throw new Error(`Selected agent '${agentId}' is not registered`);
    }

    this.logger.log(`Executing agent: ${agent.name} (${agent.id}) in mode ${request.mode || 'automatic'}`);

    // 3. Build prompt
    const prompt = await agent.buildPrompt(request, context);

    // 4. Run Gemini model
    const messages = toChatMessages(prompt);
    const response = await this.provider.chat(messages);

    return {
      response,
      citations: prompt.citations,
      metadata: prompt.metadata,
      selectedAgentId: agentId,
    };
  }

  async *executeStream(request: AiManagerRequest): AsyncGenerator<{ token?: string; selectedAgentId: AgentId; done?: boolean; error?: string }> {
    try {
      // 1. Build shared context (do not duplicate context building)
      const context = await this.contextService.build(request);

      // 2. Select correct agent (Manual or Automatic mode)
      let agentId: AgentId = 'draft';
      if (request.mode === 'manual' && request.selectedAgent) {
        agentId = request.selectedAgent;
      } else {
        const detectedAgent = this.agentRegistry.detect(request.message);
        agentId = detectedAgent.id;
      }

      const agent = this.agentRegistry.get(agentId);
      if (!agent) {
        throw new Error(`Selected agent '${agentId}' is not registered`);
      }

      this.logger.log(`Streaming execution of agent: ${agent.name} (${agent.id}) in mode ${request.mode || 'automatic'}`);

      // Yield the selected agent ID initially so the client knows who is active
      yield { selectedAgentId: agentId };

      // 3. Build prompt
      const prompt = await agent.buildPrompt(request, context);

      // 4. Stream chat response
      const messages = toChatMessages(prompt);
      const stream = this.provider.chatStream(messages);
      for await (const token of stream) {
        yield { token, selectedAgentId: agentId };
      }
      yield { done: true, selectedAgentId: agentId };
    } catch (err) {
      this.logger.error(`Error in executeStream: ${(err as Error).stack}`);
      yield { error: (err as Error).message, selectedAgentId: request.selectedAgent || 'draft' };
    }
  }
}
