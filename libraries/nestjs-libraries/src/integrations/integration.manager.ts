import { Injectable } from '@nestjs/common';
import { XProvider } from '@kursor/nestjs-libraries/integrations/social/x.provider';
import { SocialProvider } from '@kursor/nestjs-libraries/integrations/social/social.integrations.interface';
import { LinkedinProvider } from '@kursor/nestjs-libraries/integrations/social/linkedin.provider';
import { RedditProvider } from '@kursor/nestjs-libraries/integrations/social/reddit.provider';
import { DevToProvider } from '@kursor/nestjs-libraries/integrations/article/dev.to.provider';
import { HashnodeProvider } from '@kursor/nestjs-libraries/integrations/article/hashnode.provider';
import { MediumProvider } from '@kursor/nestjs-libraries/integrations/article/medium.provider';
import { ArticleProvider } from '@kursor/nestjs-libraries/integrations/article/article.integrations.interface';
import { FacebookProvider } from '@kursor/nestjs-libraries/integrations/social/facebook.provider';
import { InstagramProvider } from '@kursor/nestjs-libraries/integrations/social/instagram.provider';
import { YoutubeProvider } from '@kursor/nestjs-libraries/integrations/social/youtube.provider';
import { TiktokProvider } from '@kursor/nestjs-libraries/integrations/social/tiktok.provider';
import { PinterestProvider } from '@kursor/nestjs-libraries/integrations/social/pinterest.provider';
import { DribbbleProvider } from '@kursor/nestjs-libraries/integrations/social/dribbble.provider';
import { LinkedinPageProvider } from '@kursor/nestjs-libraries/integrations/social/linkedin.page.provider';
import { ThreadsProvider } from '@kursor/nestjs-libraries/integrations/social/threads.provider';

const socialIntegrationList = [
  new XProvider(),
  // new LinkedinProvider(),
  // new LinkedinPageProvider(),
  // new RedditProvider(),
  new FacebookProvider(),
  new InstagramProvider(),
  new ThreadsProvider(),
  new YoutubeProvider(),
  new TiktokProvider(),
  // new PinterestProvider(),
  // new DribbbleProvider(),
];

const articleIntegrationList = [
  // new DevToProvider(),
  // new HashnodeProvider(),
  // new MediumProvider(),
] as any[];

@Injectable()
export class IntegrationManager {
  getAllIntegrations() {
    return {
      social: socialIntegrationList.map((p) => ({
        name: p.name,
        identifier: p.identifier,
      })),
      article: articleIntegrationList.map((p) => ({
        name: p.name,
        identifier: p.identifier,
      })),
    };
  }
  getAllowedSocialsIntegrations() {
    return socialIntegrationList.map((p) => p.identifier);
  }
  getSocialIntegration(integration: string): SocialProvider {
    return socialIntegrationList.find((i) => i.identifier === integration)!;
  }
  getAllowedArticlesIntegrations() {
    return articleIntegrationList.map((p) => p.identifier);
  }
  getArticlesIntegration(integration: string): ArticleProvider {
    return articleIntegrationList.find((i) => i.identifier === integration)!;
  }
}
