import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const CurrentOperator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: { sub: number } }>();
    return request.user?.sub as number;
  },
);
