import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from '@kursor/backend/api/routes/auth.controller';
import { AuthService } from '@kursor/backend/services/auth/auth.service';
import { UsersController } from '@kursor/backend/api/routes/users.controller';
import { AuthMiddleware } from '@kursor/backend/services/auth/auth.middleware';
import { StripeController } from '@kursor/backend/api/routes/stripe.controller';
import { StripeService } from '@kursor/nestjs-libraries/services/stripe.service';
import { AnalyticsController } from '@kursor/backend/api/routes/analytics.controller';
import { PoliciesGuard } from '@kursor/backend/services/auth/permissions/permissions.guard';
import { PermissionsService } from '@kursor/backend/services/auth/permissions/permissions.service';
import { IntegrationsController } from '@kursor/backend/api/routes/integrations.controller';
import { IntegrationManager } from '@kursor/nestjs-libraries/integrations/integration.manager';
import { SettingsController } from '@kursor/backend/api/routes/settings.controller';
import { BullMqModule } from '@kursor/nestjs-libraries/bull-mq-transport/bull-mq.module';
import { ioRedis } from '@kursor/nestjs-libraries/redis/redis.service';
import { PostsController } from '@kursor/backend/api/routes/posts.controller';
import { MediaController } from '@kursor/backend/api/routes/media.controller';
import { UploadModule } from '@kursor/nestjs-libraries/upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CommentsController } from '@kursor/backend/api/routes/comments.controller';
import { BillingController } from '@kursor/backend/api/routes/billing.controller';
import { NotificationsController } from '@kursor/backend/api/routes/notifications.controller';
import { MarketplaceController } from '@kursor/backend/api/routes/marketplace.controller';
import { MessagesController } from '@kursor/backend/api/routes/messages.controller';
import { OpenaiService } from '@kursor/nestjs-libraries/openai/openai.service';
import { ExtractContentService } from '@kursor/nestjs-libraries/openai/extract.content.service';
import { CodesService } from '@kursor/nestjs-libraries/services/codes.service';
import { CopilotController } from '@kursor/backend/api/routes/copilot.controller';

const authenticatedController = [
  UsersController,
  AnalyticsController,
  IntegrationsController,
  SettingsController,
  PostsController,
  MediaController,
  CommentsController,
  BillingController,
  NotificationsController,
  MarketplaceController,
  MessagesController,
  CopilotController,
];
@Module({
  imports: [
    UploadModule,
    BullMqModule.forRoot({
      connection: ioRedis,
    }),
    ...(!!process.env.UPLOAD_DIRECTORY &&
    !!process.env.NEXT_PUBLIC_UPLOAD_STATIC_DIRECTORY
      ? [
          ServeStaticModule.forRoot({
            rootPath: process.env.UPLOAD_DIRECTORY,
            serveRoot: '/' + process.env.NEXT_PUBLIC_UPLOAD_STATIC_DIRECTORY,
            serveStaticOptions: {
              index: false,
            },
          }),
        ]
      : []),
  ],
  controllers: [StripeController, AuthController, ...authenticatedController],
  providers: [
    AuthService,
    StripeService,
    OpenaiService,
    ExtractContentService,
    AuthMiddleware,
    PoliciesGuard,
    PermissionsService,
    CodesService,
    IntegrationManager,
  ],
  get exports() {
    return [...this.imports, ...this.providers];
  },
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(...authenticatedController);
  }
}
