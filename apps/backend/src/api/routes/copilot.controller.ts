import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNestEndpoint,
} from '@copilotkit/runtime';
import { GetOrgFromRequest } from '@kursor/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { SubscriptionService } from '@kursor/nestjs-libraries/database/prisma/subscriptions/subscription.service';

@Controller('/copilot')
export class CopilotController {
  constructor(private _subscriptionService: SubscriptionService) {}
  @Post('/chat')
  chat(@Req() req: Request, @Res() res: Response) {
    const copilotRuntimeHandler = copilotRuntimeNestEndpoint({
      endpoint: '/copilot/chat',
      runtime: new CopilotRuntime(),
      serviceAdapter: new OpenAIAdapter({
        model:
          // @ts-ignore
          req?.body?.variables?.data?.metadata?.requestType ===
          'TextareaCompletion'
            ? 'gpt-4o-mini'
            : 'gpt-4o',
      }),
    });

    // @ts-ignore
    return copilotRuntimeHandler(req, res);
  }

  @Get('/credits')
  calculateCredits(@GetOrgFromRequest() organization: Organization) {
    return this._subscriptionService.checkCredits(organization);
  }
}
