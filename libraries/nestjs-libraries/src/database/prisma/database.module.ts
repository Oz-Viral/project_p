import { Global, Module } from '@nestjs/common';
import { PrismaRepository, PrismaService } from './prisma.service';
import { OrganizationRepository } from '@kursor/nestjs-libraries/database/prisma/organizations/organization.repository';
import { OrganizationService } from '@kursor/nestjs-libraries/database/prisma/organizations/organization.service';
import { UsersService } from '@kursor/nestjs-libraries/database/prisma/users/users.service';
import { UsersRepository } from '@kursor/nestjs-libraries/database/prisma/users/users.repository';
import { StarsService } from '@kursor/nestjs-libraries/database/prisma/stars/stars.service';
import { StarsRepository } from '@kursor/nestjs-libraries/database/prisma/stars/stars.repository';
import { SubscriptionService } from '@kursor/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { SubscriptionRepository } from '@kursor/nestjs-libraries/database/prisma/subscriptions/subscription.repository';
import { NotificationService } from '@kursor/nestjs-libraries/database/prisma/notifications/notification.service';
import { IntegrationService } from '@kursor/nestjs-libraries/database/prisma/integrations/integration.service';
import { IntegrationRepository } from '@kursor/nestjs-libraries/database/prisma/integrations/integration.repository';
import { PostsService } from '@kursor/nestjs-libraries/database/prisma/posts/posts.service';
import { PostsRepository } from '@kursor/nestjs-libraries/database/prisma/posts/posts.repository';
import { IntegrationManager } from '@kursor/nestjs-libraries/integrations/integration.manager';
import { MediaService } from '@kursor/nestjs-libraries/database/prisma/media/media.service';
import { MediaRepository } from '@kursor/nestjs-libraries/database/prisma/media/media.repository';
import { CommentsRepository } from '@kursor/nestjs-libraries/database/prisma/comments/comments.repository';
import { CommentsService } from '@kursor/nestjs-libraries/database/prisma/comments/comments.service';
import { NotificationsRepository } from '@kursor/nestjs-libraries/database/prisma/notifications/notifications.repository';
import { EmailService } from '@kursor/nestjs-libraries/services/email.service';
import { ItemUserRepository } from '@kursor/nestjs-libraries/database/prisma/marketplace/item.user.repository';
import { ItemUserService } from '@kursor/nestjs-libraries/database/prisma/marketplace/item.user.service';
import { MessagesService } from '@kursor/nestjs-libraries/database/prisma/marketplace/messages.service';
import { MessagesRepository } from '@kursor/nestjs-libraries/database/prisma/marketplace/messages.repository';
import { StripeService } from '@kursor/nestjs-libraries/services/stripe.service';
import { ExtractContentService } from '@kursor/nestjs-libraries/openai/extract.content.service';
import { OpenaiService } from '@kursor/nestjs-libraries/openai/openai.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    PrismaService,
    PrismaRepository,
    UsersService,
    UsersRepository,
    OrganizationService,
    OrganizationRepository,
    StarsService,
    StarsRepository,
    SubscriptionService,
    SubscriptionRepository,
    NotificationService,
    NotificationsRepository,
    IntegrationService,
    IntegrationRepository,
    PostsService,
    PostsRepository,
    StripeService,
    MessagesRepository,
    MediaService,
    MediaRepository,
    CommentsRepository,
    ItemUserRepository,
    ItemUserService,
    MessagesService,
    CommentsService,
    IntegrationManager,
    ExtractContentService,
    OpenaiService,
    EmailService,
  ],
  get exports() {
    return this.providers;
  },
})
export class DatabaseModule {}
