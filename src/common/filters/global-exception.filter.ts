import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * GlobalExceptionFilter — catches ALL exceptions (HTTP or otherwise)
 * and returns them in the standard error envelope:
 *
 * {
 *   error        : string
 *   errorCode    : number
 *   timeExecution: string
 *   errorStack   : string | undefined  (dev only)
 * }
 *
 * NOTE: When this filter is active, the ResponseInterceptor's catchError
 * path is bypassed for HTTP exceptions — this filter is the single
 * authoritative place for error formatting.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let errorCode: number;
    let errorMessage: string;
    let errorStack: string | undefined;

    if (exception instanceof HttpException) {
      errorCode = exception.getStatus();
      const res = exception.getResponse();
      errorMessage =
        typeof res === 'string'
          ? res
          : Array.isArray((res as any).message)
            ? (res as any).message.join('; ')
            : ((res as any).message ?? exception.message);
      errorStack =
        process.env.NODE_ENV !== 'production' ? exception.stack : undefined;
    } else if (exception instanceof Error) {
      errorCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = exception.message;
      errorStack =
        process.env.NODE_ENV !== 'production' ? exception.stack : undefined;
    } else {
      errorCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = 'An unexpected error occurred.';
    }

    this.logger.error(
      `[${request.method}] ${request.url} → ${errorCode}: ${errorMessage}`,
    );

    response.status(errorCode).json({
      error: errorMessage,
      errorCode,
      timeExecution: new Date().toISOString(),
      errorStack,
    });
  }
}
