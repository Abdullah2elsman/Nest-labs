import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * LoggerMiddleware — applied globally in AppModule.
 *
 * Logs every incoming request with:
 *  - HTTP method & URL
 *  - Response status code
 *  - Duration in ms
 *  - Requester IP
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const startTime = Date.now();

    // Hook into the response 'finish' event so we can log the status code
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const color =
        statusCode >= 500 ? '🔴' : statusCode >= 400 ? '🟡' : '🟢';

      this.logger.log(
        `${color} [${method}] ${originalUrl} — ${statusCode} — ${duration}ms — IP: ${ip}`,
      );
    });

    next();
  }
}
