/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'node:stream';
import { BaseResponse } from '../../../types';
import { ResponseAdapter } from './response-adapter';

export class ResponseFlyweight<T> {
  event: EventEmitter = new EventEmitter();

  constructor() {
    if (process.env.MODE === 'event') {
      this.emitOnce();
    }
  }

  emitOnce() {
    this.event.once('response', async (originalResponse: BaseResponse, options: any = {}) => {
      return this.getResponse(originalResponse, options);
    });
  }

  getResponse(originalResponse: BaseResponse, options?: any) {
    return new Proxy(new ResponseAdapter(originalResponse), {
      get: (target, prop: string) => {
        if (prop === 'body') {
          (target as any)[prop] = originalResponse.body ?? options.body; // body for proxy response
        }
        return (target as any)[prop];
      }
    });
  }

}
