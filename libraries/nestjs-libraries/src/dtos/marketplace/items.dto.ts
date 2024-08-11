import { IsArray, IsIn, IsNumber, Min } from 'class-validator';
import { allTagsOptions } from '@kursor/nestjs-libraries/database/prisma/marketplace/tags.list';

export class ItemsDto {
  @IsArray()
  @IsIn(allTagsOptions.map(p => p.key), {each: true})
  items: string[];

  @IsNumber()
  @Min(1)
  page: number;
}
