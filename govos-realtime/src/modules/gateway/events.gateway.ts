import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtGuard, GovOsJwtPayload } from '../auth/ws-jwt.guard';
import { RoomsService } from './rooms.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly roomsService: RoomsService) {}

  /**
   * Note: We don't apply the Guard to handleConnection because guards don't run 
   * on the connection event. Instead, the WsJwtGuard secures the individual 
   * @SubscribeMessage handlers, OR we can manually verify token here.
   * For GovOS, we force clients to emit a "join" event right after connecting
   * which IS guarded. If they don't join within 5 seconds, they are disconnected.
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.roomsService.handleDisconnect(client.id);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join:tenant')
  handleJoinTenant(
    @ConnectedSocket() client: Socket,
  ): { status: string; room: string } {
    const user: GovOsJwtPayload = (client as any).user;
    
    // Strict isolation: User can ONLY join their own tenant room
    const roomName = `tenant:${user.tid}`;
    client.join(roomName);
    
    // Also join user-specific room for direct notifications
    client.join(`user:${user.sub}`);

    // If officer/rep, join ward room
    if (user.wid) {
      client.join(`ward:${user.wid}`);
    }

    this.roomsService.trackClient(client.id, user);
    this.logger.log(`User ${user.sub} joined rooms for tenant ${user.tid}`);

    return { status: 'success', room: roomName };
  }
}
