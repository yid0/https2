/* eslint-disable @typescript-eslint/no-explicit-any */
import {EventEmitter} from 'node:stream';
import {BaseResponse} from '../../../types';
import {ResponseAdapter} from './response-adapter';

export class ResponseFlyweight<T> {
  event: EventEmitter = new EventEmitter();

  constructor() {
    if (process.env.MODE === 'event') {
      //this.emitOnce();
    }
  }

  emitOnce() : void {
     this.event.once(
      'response', (originalResponse: BaseResponse, options: any = {}) => {
        return this.getResponse(originalResponse, options);
      },
    );
  }

  getResponse(originalResponse: BaseResponse, options?: any) {
    return new ResponseAdapter(originalResponse)
  }
}
