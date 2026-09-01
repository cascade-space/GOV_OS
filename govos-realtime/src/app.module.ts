import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventsGateway } from './modules/gateway/events.gateway';
import { RoomsService } from './modules/gateway/rooms.service';
import { WsJwtGuard } from './modules/auth/ws-jwt.guard';
import { HealthController } from './modules/health/health.controller';
import { RedisService } from './modules/redis/redis.service';

@Module({
  imports: [
    JwtModule.register({
      // We share the secret with Spring Boot. In prod this comes from env.
      secret: process.env.JWT_SECRET || 'govos_jwt_dev_secret_minimum_32_characters_here_please_change',
    }),
  ],
  controllers: [HealthController],
  providers: [EventsGateway, RoomsService, WsJwtGuard, RedisService],
})
export class AppModule {}
