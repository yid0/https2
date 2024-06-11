import { BaseRequest } from '../../../../domain/types';
import { HttpRequestLike } from './request';

export class RequestFlyweight<T> {
  async getRequest(originalRequest: BaseRequest): Promise<T> {
   
    return await Promise.resolve(new Proxy(new HttpRequestLike(originalRequest), {
      get: function (target: any, prop: string) {
        console.log(target['body'])
        return (target as any)[prop];
      },
    })) as any;
  }
}
