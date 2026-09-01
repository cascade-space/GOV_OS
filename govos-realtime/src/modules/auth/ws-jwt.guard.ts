import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

export interface GovOsJwtPayload {
  sub: string; // userId
  tid: string; // tenantId
  rid: string; // roleId
  wid?: string; // wardId (optional)
  iat: number;
  exp: number;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }

    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = this.extractTokenFromHeader(client);

    if (!token) {
      this.logger.warn(`Connection rejected: Missing token from client ${client.id}`);
      throw new WsException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync<GovOsJwtPayload>(token);
      // Attach user info to socket instance so gateways can access it
      (client as any).user = payload;
      return true;
    } catch (e) {
      this.logger.warn(`Connection rejected: Invalid token from client ${client.id}`);
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    // 1. Try auth object in handshake
    const authHeader = client.handshake?.auth?.token;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    
    // 2. Try headers
    const headerToken = client.handshake?.headers?.authorization;
    if (headerToken && headerToken.startsWith('Bearer ')) {
      return headerToken.split(' ')[1];
    }

    return undefined;
  }
}
