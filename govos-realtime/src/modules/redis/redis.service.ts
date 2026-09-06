import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { EventsGateway } from '../gateway/events.gateway';

/**
 * Connects to Redis and listens for events published by Spring Boot / Python.
 * Broadcasts those events to the connected WebSocket clients.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private subscriberClient: Redis;

  constructor(private readonly gateway: EventsGateway) {}

  onModuleInit() {
    this.subscriberClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || 'govos_redis_dev',
    });

    this.subscriberClient.on('connect', () => {
      this.logger.log('Connected to Redis Subscriber');
    });

    this.subscriberClient.subscribe('govos:events', (err, count) => {
      if (err) {
        this.logger.error('Failed to subscribe to Redis channel', err);
      } else {
        this.logger.log(`Subscribed to ${count} Redis channels`);
      }
    });

    this.subscriberClient.on('message', (channel, message) => {
      if (channel === 'govos:events') {
        this.handleIncomingEvent(message);
      }
    });
  }

  onModuleDestroy() {
    this.subscriberClient.quit();
  }

  private handleIncomingEvent(messageStr: string) {
    try {
      const payload = JSON.parse(messageStr);
      const { type, tenantId, target, data } = payload;
      
      // type: 'complaint:created', 'notification:new', etc.
      // target: { roomType: 'tenant', roomId: 'UUID' }
      
      if (!type || !target || !target.roomType || !target.roomId) {
        this.logger.warn('Malformed event payload received from Redis');
        return;
      }

      const roomName = `${target.roomType}:${target.roomId}`;
      
      // Broadcast to the specific room
      this.gateway.server.to(roomName).emit(type, data);
      this.logger.debug(`Broadcasted event ${type} to room ${roomName}`);

      // If it's a complaint event, sanitize and broadcast to public:dashboard as well
      if (type === 'complaint:created' || type === 'complaint:status_changed') {
        const publicActivity = {
          id: data?.complaintNumber || data?.id || ('CP-' + Date.now()),
          category: data?.category || 'Civic Issue',
          action: type === 'complaint:created' 
            ? (data?.title ? `New issue reported: "${data.title}"` : 'New civic grievance submitted')
            : `Issue status changed to ${data?.status || 'Active'}`,
          ward: data?.locationAddress || 'Ward Area',
          time: 'Just now',
          status: data?.status === 'RESOLVED' ? 'Verified Completed' : (data?.status === 'IN_PROGRESS' ? 'In Progress' : 'Under Review'),
        };
        this.gateway.server.to('public:dashboard').emit('public:activity', publicActivity);
        this.logger.debug(`Broadcasted public activity for ${publicActivity.id} to public:dashboard`);
      }
    } catch (e) {
      this.logger.error('Failed to parse Redis message', e);
    }
  }
}
