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
var AppWebSocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppWebSocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let AppWebSocketGateway = AppWebSocketGateway_1 = class AppWebSocketGateway {
    constructor() {
        this.logger = new common_1.Logger(AppWebSocketGateway_1.name);
        this.connectedClients = 0;
    }
    handleConnection(client) {
        this.connectedClients++;
        this.logger.log(`Client connected: ${client.id} (total: ${this.connectedClients})`);
        client.emit('message', {
            type: 'connection',
            data: { message: 'Connected to LegalDraft AI WebSocket' },
        });
    }
    handleDisconnect(client) {
        this.connectedClients--;
        this.logger.log(`Client disconnected: ${client.id} (total: ${this.connectedClients})`);
    }
    handleMessage(client, payload) {
        this.logger.debug(`Message from ${client.id}: ${JSON.stringify(payload)}`);
    }
    broadcastActivity(activity) {
        this.server?.emit('message', {
            type: 'activity',
            data: activity,
        });
    }
    broadcastDraftLock(event) {
        this.server?.emit('message', {
            type: 'draft_lock',
            data: event,
        });
    }
};
exports.AppWebSocketGateway = AppWebSocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppWebSocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('message'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], AppWebSocketGateway.prototype, "handleMessage", null);
exports.AppWebSocketGateway = AppWebSocketGateway = AppWebSocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        path: '/ws',
    })
], AppWebSocketGateway);
//# sourceMappingURL=websocket.gateway.js.map