import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class AppWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private connectedClients;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleMessage(client: Socket, payload: any): void;
    broadcastActivity(activity: {
        id: string;
        user: string;
        action: string;
        resource: string;
        time: string;
        type: string;
    }): void;
    broadcastDraftLock(event: {
        draftId: string;
        locked: boolean;
        lockedBy?: string;
    }): void;
}
