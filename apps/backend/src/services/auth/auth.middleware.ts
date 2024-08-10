import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@gitroom/helpers/auth/auth.service';
import { Organization, User } from '@prisma/client';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
import { removeSubdomain } from '@gitroom/helpers/subdomain/subdomain.management';
import { HttpForbiddenException } from '@gitroom/nestjs-libraries/services/exception.filter';

export const removeAuth = (res: Response) => {
  res.cookie('auth', '', {
    domain: '.' + new URL(removeSubdomain(process.env.FRONTEND_URL!)).hostname,
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    expires: new Date(0),
    maxAge: -1,
  });

  res.header('logout', 'true');
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private _organizationService: OrganizationService,
    private _userService: UsersService
  ) {}
  async use(req: Request & {user?: User, org?: Organization}, res: Response, next: NextFunction) {
    const auth = req.headers.auth || req.cookies.auth;
    if (!auth) {
      throw new HttpForbiddenException();
    }
    try {
      let user = AuthService.verifyJWT(auth) as User | null;
      const orgHeader = req.cookies.showorg || req.headers.showorg;

      if (!user) {
        throw new HttpForbiddenException();
      }

      if (!user.activated) {
        throw new HttpForbiddenException();
      }

      if (user?.isSuperAdmin && req.cookies.impersonate) {
        const loadImpersonate = await this._organizationService.getUserOrg(
          req.cookies.impersonate
        );

        if (loadImpersonate) {
          user = loadImpersonate.user;
          user.isSuperAdmin = true;
          delete user.password;

          req.user = user;

          // @ts-ignore
          loadImpersonate.organization.users =
            loadImpersonate.organization.users.filter(
              (f) => f.userId === user.id
            );

          req.org = loadImpersonate.organization;
          next();
          return;
        }
      }

      delete user.password;
      const organization = (
        await this._organizationService.getOrgsByUserId(user.id)
      ).filter((f) => !f.users[0].disabled);
      const setOrg =
        organization.find((org) => org.id === orgHeader) || organization[0];

      if (!organization) {
        throw new HttpForbiddenException();
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // ts-expect-error
      req.user = user;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // ts-expect-error
      req.org = setOrg;
    } catch (err) {
      throw new HttpForbiddenException();
    }
    next();
  }
}
