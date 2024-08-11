import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { StarsService } from '@kursor/nestjs-libraries/database/prisma/stars/stars.service';
import { BullMqClient } from '@kursor/nestjs-libraries/bull-mq-transport/client/bull-mq.client';

@Injectable()
export class CheckStars {
  constructor(
    private _starsService: StarsService,
    private _workerServiceProducer: BullMqClient
  ) {}
  @Cron('30 0 * * *')
  async checkStars() {
    const allGitHubRepositories =
      await this._starsService.getAllGitHubRepositories();

    for (const repository of allGitHubRepositories) {
      this._workerServiceProducer.emit('check_stars', {
        payload: { login: repository.login },
      });
    }
  }
}
