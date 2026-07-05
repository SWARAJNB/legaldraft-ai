"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiDraftAssistantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ai_conversation_entity_1 = require("./entities/ai-conversation.entity");
const ai_service_1 = require("./ai.service");
const QUESTION_TREES = {
    'bail_application': [
        { key: 'accused_name', label: "What is the accused's full name, parentage, and age?", placeholder: 'e.g., Rajan Kumar, S/o Suresh Kumar, Aged 34 years', required: true },
        { key: 'accused_address', label: "What is the accused's address?", placeholder: 'e.g., 42, Marine Drive, Mumbai - 400 002', required: true },
        { key: 'fir_details', label: 'What is the FIR number, date, and police station?', placeholder: 'e.g., FIR No. 234/2024, dt. 15.05.2024, Andheri PS', required: true },
        { key: 'sections', label: 'Under which sections of IPC/BNS is the accused charged?', placeholder: 'e.g., Sections 420, 406, and 34 IPC', required: true },
        { key: 'arrest_date', label: 'When was the accused arrested? Is the accused in judicial custody?', placeholder: 'e.g., Arrested on 15.05.2024, currently in judicial custody', required: true },
        { key: 'grounds', label: 'What are the main grounds for bail? (brief facts/arguments)', placeholder: 'e.g., False allegations, no prior criminal record, deep roots in community', required: true },
        { key: 'surety', label: 'Any surety details? (personal bond amount, surety offered)', placeholder: 'e.g., Ready to furnish personal bond of Rs. 50,000 with surety', required: false },
        { key: 'court', label: 'Which court is this being filed in?', placeholder: 'e.g., Court of Sessions Judge, Mumbai', required: true },
    ],
    'divorce_petition': [
        { key: 'petitioner', label: "What is the petitioner's full name, age, and address?", placeholder: 'e.g., Meena Verma, Aged 30, R/o Connaught Place, New Delhi', required: true },
        { key: 'respondent', label: "What is the respondent's full name, age, and address?", placeholder: 'e.g., Suresh Verma, Aged 35, R/o Green Park, New Delhi', required: true },
        { key: 'marriage_details', label: 'Marriage date, place, and ceremony type?', placeholder: 'e.g., Married on 10.01.2018 at Delhi, Hindu rites and ceremonies', required: true },
        { key: 'grounds', label: 'Grounds for divorce (cruelty, desertion, etc.)?', placeholder: 'e.g., Mental cruelty, physical harassment, dowry demands', required: true },
        { key: 'children', label: 'Are there any children? Provide names and ages.', placeholder: 'e.g., One son, Arjun, aged 4 years', required: false },
        { key: 'maintenance', label: 'Any maintenance/alimony claim?', placeholder: 'e.g., Seeking interim maintenance of Rs. 25,000/month', required: false },
        { key: 'relief', label: 'Specific relief sought?', placeholder: 'e.g., Decree of divorce under HMA Section 13(1)(ia)', required: true },
        { key: 'court', label: 'Which Family Court?', placeholder: 'e.g., Family Court, Patiala House, New Delhi', required: true },
        { key: 'property', label: 'Any property/asset dispute?', placeholder: 'e.g., Seeking division of jointly owned flat', required: false },
        { key: 'streedhan', label: 'Any Streedhan/dowry articles to be claimed?', placeholder: 'e.g., Gold jewelry, household articles', required: false },
    ],
    'civil_suit': [
        { key: 'plaintiff', label: 'Plaintiff name and address?', placeholder: 'e.g., Tech Innovations Ltd., registered office at Andheri, Mumbai', required: true },
        { key: 'defendant', label: 'Defendant name and address?', placeholder: 'e.g., XYZ Pvt. Ltd., registered office at Pune', required: true },
        { key: 'cause_of_action', label: 'What is the cause of action?', placeholder: 'e.g., Breach of contract dated 01.01.2024, non-payment of Rs. 50,00,000', required: true },
        { key: 'facts', label: 'Key facts of the case (chronological)?', placeholder: 'Describe the sequence of events...', required: true },
        { key: 'relief', label: 'Relief/decree sought?', placeholder: 'e.g., Recovery of Rs. 50,00,000 with interest at 18% p.a.', required: true },
        { key: 'valuation', label: 'Suit valuation and court fee?', placeholder: 'e.g., Suit valued at Rs. 50,00,000, court fee of Rs. 1,00,000', required: true },
        { key: 'jurisdiction', label: 'Jurisdictional court?', placeholder: 'e.g., City Civil Court, Mumbai', required: true },
        { key: 'limitation', label: 'Is the suit within limitation period?', placeholder: 'e.g., Cause of action arose on 01.06.2024, within 3 years', required: false },
    ],
    'sale_agreement': [
        { key: 'seller', label: 'Seller name and address?', placeholder: 'e.g., Mr. Sharma, R/o Bandra, Mumbai', required: true },
        { key: 'buyer', label: 'Buyer name and address?', placeholder: 'e.g., Ms. Patel, R/o Juhu, Mumbai', required: true },
        { key: 'property_description', label: 'Full property description (type, area, location)?', placeholder: 'e.g., 2BHK Flat, 950 sq.ft., 3rd Floor, Green Towers, Andheri West', required: true },
        { key: 'sale_price', label: 'Total sale consideration?', placeholder: 'e.g., Rs. 1,50,00,000 (One Crore Fifty Lakhs)', required: true },
        { key: 'advance', label: 'Advance/earnest money paid?', placeholder: 'e.g., Rs. 10,00,000 paid on 01.06.2024', required: true },
        { key: 'completion_date', label: 'Expected completion date?', placeholder: 'e.g., Within 90 days from the date of this agreement', required: true },
        { key: 'encumbrance', label: 'Is the property free from encumbrances?', placeholder: 'e.g., Property is free from all mortgages, liens, and charges', required: true },
        { key: 'penalty', label: 'Penalty clause for default?', placeholder: 'e.g., Forfeiture of advance if buyer defaults', required: false },
        { key: 'conditions', label: 'Any special conditions?', placeholder: 'e.g., Subject to obtaining NOC from society', required: false },
        { key: 'jurisdiction', label: 'Jurisdiction for disputes?', placeholder: 'e.g., Courts of Mumbai', required: true },
    ],
    'legal_notice': [
        { key: 'sender', label: 'Who is sending the notice (name, address)?', placeholder: 'e.g., Mr. Anil Gupta, R/o Defence Colony, New Delhi', required: true },
        { key: 'recipient', label: 'Who is receiving the notice (name, address)?', placeholder: 'e.g., Manager, ABC Insurance Co., Head Office, Mumbai', required: true },
        { key: 'subject', label: 'Subject of the notice?', placeholder: 'e.g., Claim repudiation under Policy No. XYZ/2024', required: true },
        { key: 'grievance', label: 'What is the grievance (key facts)?', placeholder: 'Describe the issue, timeline, and any prior communications...', required: true },
        { key: 'demand', label: 'What is being demanded?', placeholder: 'e.g., Payment of Rs. 5,00,000 as per insurance policy terms', required: true },
        { key: 'deadline', label: 'Response deadline?', placeholder: 'e.g., 15 days from receipt of this notice', required: true },
    ],
};
let AiDraftAssistantService = class AiDraftAssistantService {
    constructor(conversationsRepo, aiService) {
        this.conversationsRepo = conversationsRepo;
        this.aiService = aiService;
    }
    getAvailableDraftTypes() {
        return Object.keys(QUESTION_TREES).map((key) => ({
            id: key,
            name: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            questionCount: QUESTION_TREES[key].length,
            requiredCount: QUESTION_TREES[key].filter((q) => q.required).length,
        }));
    }
    async processGuidedDraft(userId, tenantId, params) {
        let conversation;
        if (params.session_id) {
            const found = await this.conversationsRepo.findOne({
                where: { id: params.session_id, userId },
            });
            if (!found) {
                throw new common_1.NotFoundException('Session not found');
            }
            conversation = found;
        }
        else if (params.draft_type) {
            const draftType = params.draft_type.toLowerCase().replace(/\s+/g, '_');
            if (!QUESTION_TREES[draftType]) {
                throw new common_1.NotFoundException(`Draft type '${params.draft_type}' is not supported for guided drafting. Available: ${Object.keys(QUESTION_TREES).join(', ')}`);
            }
            conversation = this.conversationsRepo.create({
                userId,
                tenantId,
                sessionType: 'guided-draft',
                draftType,
                currentStep: 0,
                collectedAnswers: {},
                messages: [],
                isComplete: false,
            });
            await this.conversationsRepo.save(conversation);
        }
        else {
            throw new common_1.NotFoundException('Provide either session_id or draft_type');
        }
        const questions = QUESTION_TREES[conversation.draftType];
        if (!questions) {
            throw new common_1.NotFoundException('Invalid draft type in session');
        }
        if (params.answer && conversation.currentStep < questions.length) {
            const currentQ = questions[conversation.currentStep];
            conversation.collectedAnswers[currentQ.key] = params.answer;
            conversation.currentStep += 1;
            await this.conversationsRepo.save(conversation);
        }
        const progress = Math.round((conversation.currentStep / questions.length) * 100);
        if (conversation.currentStep >= questions.length) {
            const draftTypeName = conversation.draftType
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());
            const answersText = Object.entries(conversation.collectedAnswers)
                .map(([key, val]) => `**${key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}**: ${val}`)
                .join('\n');
            const { draft } = await this.aiService.generateDraft({
                draft_type: draftTypeName,
                client_info: conversation.collectedAnswers['accused_name'] ||
                    conversation.collectedAnswers['petitioner'] ||
                    conversation.collectedAnswers['plaintiff'] ||
                    conversation.collectedAnswers['sender'] ||
                    conversation.collectedAnswers['seller'] || '',
                case_details: answersText,
                court: conversation.collectedAnswers['court'] ||
                    conversation.collectedAnswers['jurisdiction'] || '',
                relief: conversation.collectedAnswers['relief'] ||
                    conversation.collectedAnswers['demand'] || '',
            });
            conversation.isComplete = true;
            await this.conversationsRepo.save(conversation);
            return {
                session_id: conversation.id,
                status: 'complete',
                draft,
                progress: 100,
            };
        }
        const nextQuestion = questions[conversation.currentStep];
        return {
            session_id: conversation.id,
            status: 'in_progress',
            current_question: {
                ...nextQuestion,
                step: conversation.currentStep + 1,
                total: questions.length,
            },
            progress,
        };
    }
};
exports.AiDraftAssistantService = AiDraftAssistantService;
exports.AiDraftAssistantService = AiDraftAssistantService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ai_conversation_entity_1.AiConversation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ai_service_1.AiService])
], AiDraftAssistantService);
//# sourceMappingURL=ai-draft-assistant.service.js.map