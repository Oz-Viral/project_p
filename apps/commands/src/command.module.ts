import { Module } from '@nestjs/common';
import { CommandModule as ExternalCommandModule } from 'nestjs-command';
import { CheckStars } from './tasks/check.stars';
import { DatabaseModule } from '@kursor/nestjs-libraries/database/prisma/database.module';
import { BullMqModule } from '@kursor/nestjs-libraries/bull-mq-transport/bull-mq.module';
import { ioRedis } from '@kursor/nestjs-libraries/redis/redis.service';
import {RefreshTokens} from "./tasks/refresh.tokens";

@Module({
  imports: [
    ExternalCommandModule,
    DatabaseModule,
    BullMqModule.forRoot({
      connection: ioRedis,
    }),
  ],
  controllers: [],
  providers: [CheckStars, RefreshTokens],
  get exports() {
    return [...this.imports, ...this.providers];
  },
})
export class CommandModule {}
