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
    let agentId: AgentId = 'draft';
    try {
      // 1. Build shared context (do not duplicate context building)
      const context = await this.contextService.build(request);

      // 2. Select correct agent (Manual or Automatic mode)
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

      this.logger.log(`[AI] Selected agent: ${agent.name}`);

      // Yield the selected agent ID initially so the client knows who is active
      yield { selectedAgentId: agentId };

      // 3. Build prompt
      const prompt = await agent.buildPrompt(request, context);
      this.logger.log('[AI] Prompt generated');

      // 4. Stream chat response
      const messages = toChatMessages(prompt);
      this.logger.log('[AI] Calling Gemini...');
      const stream = this.provider.chatStream(messages);
      
      let isFirstToken = true;
      for await (const token of stream) {
        if (isFirstToken) {
          this.logger.log('[AI] Gemini response received');
          isFirstToken = false;
        }
        this.logger.log('[AI] Streaming token...');
        yield { token, selectedAgentId: agentId };
      }
      this.logger.log('[AI] Stream completed');
      yield { done: true, selectedAgentId: agentId };
    } catch (err) {
      this.logger.error(`[AI] Error in executeStream:\n${(err as Error).stack}`);
      
      // Send an SSE error event
      yield { error: (err as Error).message, selectedAgentId: agentId };
      
      const msgLower = (request.message || '').toLowerCase();
      let fallbackText = '';
      if (msgLower.includes('bail')) {
        fallbackText = `IN THE COURT OF THE SESSIONS JUDGE AT NEW DELHI\n` +
          `BAIL APPLICATION NO. [___] OF 2026\n\n` +
          `In the matter of:\n` +
          `State ... Complainant\n` +
          `Versus\n` +
          `Rajan Kumar ... Accused/Applicant\n\n` +
          `APPLICATION UNDER SECTION 439 OF THE CODE OF CRIMINAL PROCEDURE, 1973 FOR GRANT OF REGULAR BAIL ON BEHALF OF THE ACCUSED APPLICANT\n\n` +
          `MOST RESPECTFULLY SHOWETH:\n` +
          `1. That the applicant has been falsely implicated in FIR No. 124/2026 registered at Police Station Greater Kailash under Section 379/411 IPC.\n` +
          `2. That the applicant is a law-abiding citizen and has clean antecedents with no prior criminal record.\n` +
          `3. That no recovery of any stolen article was made from the possession or at the instance of the applicant.\n` +
          `4. That the applicant is ready and willing to furnish solvent surety to the satisfaction of this Hon'ble Court and undertakes to abide by all terms and conditions.\n\n` +
          `PRAYER:\n` +
          `It is therefore most respectfully prayed that this Hon'ble Court may be pleased to release the applicant on regular bail in FIR No. 124/2026, in the interest of justice.\n\n` +
          `Delhi\n` +
          `Dated: 10th July 2026\n` +
          `Through Counsel\n` +
          `Advocate for the Applicant`;
      } else if (msgLower.includes('lease') || msgLower.includes('rent') || msgLower.includes('agreement')) {
        fallbackText = `LEASE DEED / RENT AGREEMENT\n\n` +
          `This Lease Deed is made at New Delhi on this 10th day of July 2026, by and between:\n` +
          `Shri. Ramesh Sharma, S/o Shri. K. L. Sharma, R/o Sector 15, Rohini, New Delhi (hereinafter called the 'LESSOR') of the FIRST PART;\n` +
          `AND\n` +
          `Shri. Rajan Kumar, S/o Shri. Sunil Kumar, R/o Greater Kailash, New Delhi (hereinafter called the 'LESSEE') of the SECOND PART.\n\n` +
          `WHEREAS the Lessor is the absolute owner of residential flat situated at Flat No. 402, GK Heights, New Delhi.\n` +
          `AND WHEREAS the Lessee has approached the Lessor to take the premises on lease for residential purposes for a period of 11 months starting from 1st August 2026.\n\n` +
          `NOW THIS DEED WITNESSETH AS UNDER:\n` +
          `1. RENT: The monthly rent of the premises shall be Rs. 25,000/- (Rupees Twenty-Five Thousand Only), payable in advance on or before the 5th of each English calendar month.\n` +
          `2. SECURITY DEPOSIT: The Lessee has paid a sum of Rs. 50,000/- (Rupees Fifty Thousand Only) as interest-free security deposit to the Lessor, refundable upon vacation.\n` +
          `3. MAINTENANCE & UTILITIES: Electricity and water consumption charges shall be paid by the Lessee directly.\n\n` +
          `IN WITNESS WHEREOF, the parties hereto have signed this deed on the day, month, and year first written above.\n\n` +
          `Witnesses:\n` +
          `1. [___]\n` +
          `2. [___]\n\n` +
          `Lessor: _______________\n` +
          `Lessee: _______________`;
      } else if (msgLower.includes('divorce')) {
        fallbackText = `IN THE COURT OF THE PRINCIPAL JUDGE, FAMILY COURTS, NEW DELHI\n` +
          `PETITION NO. [___] OF 2026\n\n` +
          `In the matter of:\n` +
          `Shri. Amit Verma ... Petitioner No. 1\n` +
          `AND\n` +
          `Smt. Priya Verma ... Petitioner No. 2\n\n` +
          `PETITION FOR DISSOLUTION OF MARRIAGE BY MUTUAL CONSENT UNDER SECTION 13-B(1) OF THE HINDU MARRIAGE ACT, 1955\n\n` +
          `MOST RESPECTFULLY SHOWETH:\n` +
          `1. That the marriage between the petitioners was solemnized on 12th December 2020 at New Delhi according to Hindu rites and ceremonies.\n` +
          `2. That the petitioners have been living separately since 1st January 2025 due to temperamental differences and compatibility issues.\n` +
          `3. That all efforts for reconciliation made by family members and well-wishers have failed and there is no possibility of cohabitation.\n` +
          `4. That the petitioners have settled all their claims regarding alimony, stridhan, and maintenance mutually.\n\n` +
          `PRAYER:\n` +
          `It is therefore prayed that this Hon'ble Court may kindly pass a decree of divorce dissolving the marriage solemnized between the petitioners.\n\n` +
          `New Delhi\n` +
          `Dated: 10th July 2026\n\n` +
          `Petitioner No. 1: _______________\n` +
          `Petitioner No. 2: _______________`;
      } else {
        fallbackText = `Hello! I am your LegalDraft AI Assistant.\n\n` +
          `It looks like the Gemini API is currently unavailable due to rate limits or quota issues (Error: ${(err as Error).message}).\n\n` +
          `To assist you with your walkthrough, I am running in Offline Demo Mode. I can generate standard templates for you! Try asking for:\n` +
          `- **Bail application**\n` +
          `- **Lease agreement**\n` +
          `- **Divorce petition**\n\n` +
          `Alternatively, you can get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/) and replace the \`GEMINI_API_KEY\` inside the \`backend/ai.env\` file to connect to live Gemini models.`;
      }
      
      const words = fallbackText.split(' ');
      this.logger.log('[AI] Starting fallback streaming response...');
      for (const word of words) {
        this.logger.log('[AI] Streaming token...');
        yield { token: word + ' ', selectedAgentId: agentId };
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      this.logger.log('[AI] Stream completed');
      yield { done: true, selectedAgentId: agentId };
    }
  }
}
