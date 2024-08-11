import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CheckStars } from '@kursor/cron/tasks/check.stars';
import { DatabaseModule } from '@kursor/nestjs-libraries/database/prisma/database.module';
import { BullMqModule } from '@kursor/nestjs-libraries/bull-mq-transport/bull-mq.module';
import { ioRedis } from '@kursor/nestjs-libraries/redis/redis.service';
import { SyncTrending } from '@kursor/cron/tasks/sync.trending';

@Module({
  imports: [
    DatabaseModule,
    ScheduleModule.forRoot(),
    BullMqModule.forRoot({
      connection: ioRedis,
    }),
  ],
  controllers: [],
  providers: [CheckStars, SyncTrending],
})
export class CronModule {}
