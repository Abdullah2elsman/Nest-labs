import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * ResponseInterceptor — wraps every SUCCESSFUL response in a standard envelope.
 *
 * ✅ Success shape:
 * {
 *   message       : string   — HTTP status text  (e.g. "OK", "CREATED")
 *   responseCode  : number   — HTTP status code  (e.g. 200, 201)
 *   timeExecution : string   — ISO timestamp of the response
 *   duration      : string   — how long the handler took (e.g. "12ms")
 *   data          : any      — the actual handler return value
 * }
 *
 * ❌ Error responses are handled by GlobalExceptionFilter (not this interceptor),
 *    so errors flow through untouched and get formatted there.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        const httpCtx = context.switchToHttp();
        const response = httpCtx.getResponse();
        const statusCode: number = response.statusCode ?? HttpStatus.OK;
        const duration = `${Date.now() - startTime}ms`;

        return {
          message: HttpStatus[statusCode] ?? 'OK',
          responseCode: statusCode,
          timeExecution: new Date().toISOString(),
          duration,
          data,
        };
      }),
    );
  }
}
