import { Injectable } from '@nestjs/common';
import { GovOsJwtPayload } from '../auth/ws-jwt.guard';

/**
 * Tracks which sockets belong to which users/tenants.
 * Useful for finding specific sockets or auditing active connections.
 */
@Injectable()
export class RoomsService {
  // Map<socketId, userId>
  private readonly clientMap = new Map<string, string>();

  trackClient(socketId: string, user: GovOsJwtPayload) {
    this.clientMap.set(socketId, user.sub);
  }

  handleDisconnect(socketId: string) {
    this.clientMap.delete(socketId);
  }

  getActiveConnectionsCount(): number {
    return this.clientMap.size;
  }
}
