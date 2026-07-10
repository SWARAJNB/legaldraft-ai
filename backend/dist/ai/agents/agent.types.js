"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toChatMessages = toChatMessages;
function toChatMessages(prompt) {
    return [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
    ];
}
//# sourceMappingURL=agent.types.js.map