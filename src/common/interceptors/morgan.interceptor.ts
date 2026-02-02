import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';

@Injectable()
export class SuccessHandleInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const now = Date.now();
    return next.handle().pipe(
      map((res) => {
        if (!res || typeof res !== 'object') {
          return { msg: res.msg||'success', status: 201, data: res.data };
        }

        const { data = {}, msg = 'success', status = 201 } = res;
        console.log({ data });
        return { msg, status, data:res };
      }),
    );
  }
}
