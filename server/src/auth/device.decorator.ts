import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { UAParser } from 'ua-parser-js';

const parse = UAParser as (ua: string) => {
  browser: { name?: string };
  os: { name?: string };
  device: { type?: string };
};

export const RealMetadata = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const forwarded = req.headers['x-forwarded-for'];
    const ip: string =
      (Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded?.split(',')[0]
      )?.trim() ??
      req.ip ??
      req.socket.remoteAddress ??
      'unknown';

    const userAgent = req.headers['user-agent'] ?? '';

    // UAParser() as a function — no `new`, no unsafe-call/unsafe-assignment
    const { browser, os, device } = parse(userAgent);
    return {
      ip,
      userAgent,
      device: device.type ?? 'desktop',
      os: os.name,
      browser: browser.name,
    };
  },
);
