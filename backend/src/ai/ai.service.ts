import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
  ChatMessage,
  ChatOptions,
} from './interfaces/ai-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';

const LEGAL_SYSTEM_PROMPT = `You are an expert Indian Legal Draft AI Assistant specializing in creating professional legal documents under Indian law.

Your core expertise includes:
- **Criminal Law**: Bail applications (Section 439 CrPC), FIR quashing petitions (Section 482 CrPC), criminal complaints, anticipatory bail
- **Civil Law**: Civil suit plaints, injunction applications, consumer complaints, money recovery suits
- **Property Law**: Sale agreements, lease agreements, gift deeds, property partition suits, title disputes
- **Family Law**: Divorce petitions (HMA Section 13/13B), child custody petitions, maintenance applications

Rules:
1. Always produce **complete, court-ready legal documents** with proper formatting, numbering, and legal citations.
2. Reference specific **Indian statutes, sections, and case law** wherever applicable (IPC, CrPC, BNS, CPC, HMA, etc.).
3. Use **formal legal language** appropriate for Indian courts.
4. Include all standard sections: Title, Parties, Facts, Grounds, Arguments, Prayer, Verification.
5. For chat conversations, be helpful, precise, and reference relevant legal provisions.
6. If asked to improve text, maintain legal formality and add appropriate citations.
7. Never provide legal advice — clarify that documents are drafts for review by a licensed advocate.`;

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private provider: GeminiProvider;

  onModuleInit() {
    this.provider = new GeminiProvider();
    this.logger.log('Gemini AI Provider initialized as sole provider.');
  }

  // ── Chat ─────────────────────────────────────────────────────────────

  async chat(
    userMessages: { role: string; content: string }[],
  ): Promise<{ response: string; file?: any }> {
    const messages: ChatMessage[] = [
      { role: 'system', content: LEGAL_SYSTEM_PROMPT },
      ...userMessages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
    ];

    const response = await this.provider.chat(messages);
    return { response };
  }

  async *chatStream(
    userMessages: { role: string; content: string }[],
  ): AsyncIterable<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: LEGAL_SYSTEM_PROMPT },
      ...userMessages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
    ];

    const stream = this.provider.chatStream(messages);
    yield* stream;
  }

  // ── Generate Draft ───────────────────────────────────────────────────

  async generateDraft(params: {
    draft_type: string;
    client_info?: string;
    case_details?: string;
    court?: string;
    relief?: string;
  }): Promise<{ draft: string; file?: any }> {
    const prompt = `Generate a complete, professional, court-ready Indian legal document with the following parameters:

**Draft Type**: ${params.draft_type}
${params.client_info ? `**Client Information**: ${params.client_info}` : ''}
${params.court ? `**Court/Forum**: ${params.court}` : ''}
${params.case_details ? `**Case Facts & Details**: ${params.case_details}` : ''}
${params.relief ? `**Relief/Prayer Sought**: ${params.relief}` : ''}

Requirements:
1. Use proper legal formatting with numbered paragraphs
2. Include all standard sections (Title, Parties, Facts, Grounds, Prayer, Verification)
3. Reference applicable Indian statutes, sections, and case law
4. Use formal legal language suitable for filing in Indian courts
5. If specific details are missing, use reasonable placeholders marked with [___]
6. Include proper signatures block and verification clause

Generate the COMPLETE document now:`;

    const messages: ChatMessage[] = [
      { role: 'system', content: LEGAL_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ];

    const draft = await this.provider.chat(messages, { maxTokens: 8192, temperature: 0.3 });

    return { draft };
  }

  // ── Risk Check ───────────────────────────────────────────────────────

  async riskCheck(
    content: string,
  ): Promise<{ risks: any[]; overallRisk: string }> {
    const prompt = `Analyze the following legal document for potential legal risks, missing information, and areas of concern. Return a JSON object with this structure:
{
  "risks": [
    {
      "id": "unique-id",
      "severity": "critical|warning|info",
      "title": "Short title",
      "description": "Detailed explanation",
      "field": "Which section/area this relates to"
    }
  ],
  "overallRisk": "low|medium|high|critical"
}

Document to analyze:
${content.slice(0, 8000)}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: LEGAL_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ];

    const responseText = await this.provider.chat(messages, {
      responseFormat: 'json',
      temperature: 0.2,
    });

    try {
      return JSON.parse(responseText);
    } catch {
      return {
        risks: [
          {
            id: 'parse-error',
            severity: 'info',
            title: 'Analysis Complete',
            description: responseText,
            field: 'General',
          },
        ],
        overallRisk: 'medium',
      };
    }
  }

  // ── Improve Text ─────────────────────────────────────────────────────

  async improveText(params: {
    text: string;
    action: string;
    context?: string;
  }): Promise<{ improved_text: string }> {
    const actionPrompts: Record<string, string> = {
      rewrite: 'Rewrite the following legal text to be clearer and more professional while preserving the original meaning and legal citations:',
      improve_legal_tone:
        'Improve the legal tone of the following text. Make it more formal, add appropriate legal terminology, and ensure it follows Indian legal drafting conventions:',
      add_legal_arguments:
        'Add strong legal arguments, relevant case law citations, and statutory references to the following text:',
      simplify:
        'Simplify the following legal text while maintaining its legal validity. Make it more readable without losing important legal nuances:',
      expand:
        'Expand the following legal text with additional detail, supporting arguments, relevant precedents, and statutory provisions:',
      fix_grammar:
        'Fix any grammatical errors, punctuation issues, and formatting problems in the following legal text:',
    };

    const actionPrompt =
      actionPrompts[params.action] || actionPrompts.rewrite;
    const prompt = `${actionPrompt}

${params.context ? `Context: ${params.context}\n\n` : ''}Text to improve:
${params.text}

Return ONLY the improved text, nothing else.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: LEGAL_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ];

    const improvedText = await this.provider.chat(messages, { temperature: 0.3 });

    return { improved_text: improvedText };
  }

  // ── Embeddings ───────────────────────────────────────────────────────

  async generateEmbedding(text: string): Promise<number[]> {
    return this.provider.generateEmbedding(text);
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    return this.provider.generateEmbeddings(texts);
  }
}
