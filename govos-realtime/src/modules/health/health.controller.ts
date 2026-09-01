import { Controller, Get } from '@nestjs/common';
import { RoomsService } from '../gateway/rooms.service';

@Controller('health')
export class HealthController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  check() {
    return {
      status: 'ok',
      service: 'govos-realtime',
      timestamp: new Date().toISOString(),
      metrics: {
        activeWebSocketConnections: this.roomsService.getActiveConnectionsCount(),
      },
    };
  }
}
