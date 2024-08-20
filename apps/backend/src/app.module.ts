import { Global, Module } from '@nestjs/common';

import { DatabaseModule } from '@kursor/nestjs-libraries/database/prisma/database.module';
import { ApiModule } from '@kursor/backend/api/api.module';
import { APP_GUARD } from '@nestjs/core';
import { PoliciesGuard } from '@kursor/backend/services/auth/permissions/permissions.guard';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    DatabaseModule,
    ApiModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PoliciesGuard,
    },
  ],
  get exports() {
    return [...this.imports];
  },
})
export class AppModule {}
