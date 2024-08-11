import { DevToSettingsDto } from '@kursor/nestjs-libraries/dtos/posts/providers-settings/dev.to.settings.dto';
import { MediumSettingsDto } from '@kursor/nestjs-libraries/dtos/posts/providers-settings/medium.settings.dto';
import { HashnodeSettingsDto } from '@kursor/nestjs-libraries/dtos/posts/providers-settings/hashnode.settings.dto';
import { RedditSettingsDto } from '@kursor/nestjs-libraries/dtos/posts/providers-settings/reddit.dto';
import { PinterestSettingsDto } from '@kursor/nestjs-libraries/dtos/posts/providers-settings/pinterest.dto';
import { YoutubeSettingsDto } from '@kursor/nestjs-libraries/dtos/posts/providers-settings/youtube.settings.dto';
import { TikTokDto } from '@kursor/nestjs-libraries/dtos/posts/providers-settings/tiktok.dto';

export type AllProvidersSettings =
  | DevToSettingsDto
  | MediumSettingsDto
  | HashnodeSettingsDto
  | RedditSettingsDto
  | YoutubeSettingsDto
  | PinterestSettingsDto
  | TikTokDto;
