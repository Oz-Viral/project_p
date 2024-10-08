import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {AppAbility, PermissionsService} from "@kursor/backend/services/auth/permissions/permissions.service";
import {AbilityPolicy, CHECK_POLICIES_KEY} from "@kursor/backend/services/auth/permissions/permissions.ability";
import {Organization} from "@prisma/client";
import {SubscriptionException} from "@kursor/backend/services/auth/permissions/subscription.exception";
import {Request} from "express";


@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private _reflector: Reflector,
    private _authorizationService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request & {org: Organization} = context.switchToHttp().getRequest();
    if (request.path.indexOf('/auth') > -1 || request.path.indexOf('/stripe') > -1) {
      return true;
    }

    const policyHandlers =
      this._reflector.get<AbilityPolicy[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    if (!policyHandlers || !policyHandlers.length) {
      return true;
    }

    const { org } = request;

    // @ts-ignore
    const ability = await this._authorizationService.check(org.id, org.createdAt, org.users[0].role, policyHandlers);

    const item = policyHandlers.find((handler) =>
      !this.execPolicyHandler(handler, ability),
    );

    if (item) {
      throw new SubscriptionException({
        section: item[1],
        action: item[0]
      });
    }

    return true;
  }

  private execPolicyHandler(handler: AbilityPolicy, ability: AppAbility) {
    return ability.can(handler[0], handler[1]);
  }
}
