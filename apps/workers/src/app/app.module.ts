import { Module } from '@nestjs/common';

import { StarsController } from './stars.controller';
import {DatabaseModule} from "@kursor/nestjs-libraries/database/prisma/database.module";
import {BullMqModule} from "@kursor/nestjs-libraries/bull-mq-transport/bull-mq.module";
import {ioRedis} from "@kursor/nestjs-libraries/redis/redis.service";
import {TrendingService} from "@kursor/nestjs-libraries/services/trending.service";
import {PostsController} from "@kursor/workers/app/posts.controller";

@Module({
  imports: [DatabaseModule, BullMqModule.forRoot({
    connection: ioRedis
  })],
  controllers: [StarsController, PostsController],
  providers: [TrendingService],
})
export class AppModule {}
