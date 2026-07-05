import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  path: '/ws',
})
export class AppWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppWebSocketGateway.name);
  private connectedClients = 0;

  handleConnection(client: Socket) {
    this.connectedClients++;
    this.logger.log(
      `Client connected: ${client.id} (total: ${this.connectedClients})`,
    );

    // Send welcome message
    client.emit('message', {
      type: 'connection',
      data: { message: 'Connected to LegalDraft AI WebSocket' },
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedClients--;
    this.logger.log(
      `Client disconnected: ${client.id} (total: ${this.connectedClients})`,
    );
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any) {
    this.logger.debug(`Message from ${client.id}: ${JSON.stringify(payload)}`);
  }

  /**
   * Broadcast an activity event to all connected clients.
   */
  broadcastActivity(activity: {
    id: string;
    user: string;
    action: string;
    resource: string;
    time: string;
    type: string;
  }) {
    this.server?.emit('message', {
      type: 'activity',
      data: activity,
    });
  }

  /**
   * Broadcast a draft lock/unlock event.
   */
  broadcastDraftLock(event: {
    draftId: string;
    locked: boolean;
    lockedBy?: string;
  }) {
    this.server?.emit('message', {
      type: 'draft_lock',
      data: event,
    });
  }
}
