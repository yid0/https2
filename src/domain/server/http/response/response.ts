/* eslint-disable @typescript-eslint/no-explicit-any */
// Define lightweight pseudo Response class and replace global.Response with it.

import type {OutgoingHttpHeaders} from 'node:http';
import {ReadableStream} from 'node:stream/web';
import {buildOutgoingHttpHeaders} from '../../../../utils';

const responseCache = Symbol('responseCache');
export const cacheKey = Symbol('cache');

export const GlobalResponse = global.Response;
export class HttpResponseLike {
  body?: any | null;
  init?: ResponseInit;

  private get cache(): typeof GlobalResponse {
    delete (this as any)[cacheKey];
    return ((this as any)[responseCache] ||= new GlobalResponse(this.body, this.init));
  }

  constructor(body?: any | null, init?: ResponseInit) {
    this.body = body;
    this.setAttributes();

    if (init instanceof HttpResponseLike) {
      const cachedGlobalResponse = (init as any)[responseCache];
      if (cachedGlobalResponse) {
        this.init = cachedGlobalResponse;
        // instantiate GlobalResponse cache and this object always returns value from global.Response
        this.cache;
        return;
      } else {
        this.init = init.init;
      }
    } else {
      this.init = init;
    }

    if (typeof body === 'string' || body instanceof ReadableStream) {
      let headers = (init?.headers || {'content-type': 'text/plain;charset=UTF-8'}) as
        | Record<string, string>
        | Headers
        | OutgoingHttpHeaders;
      if (headers instanceof Headers) {
        headers = buildOutgoingHttpHeaders(headers);
      }

      (this as any)[cacheKey] = [init?.status || 200, body, headers];
    }
  }

  setAttributes() {
    [
      'body',
      'bodyUsed',
      'headers',
      'ok',
      'redirected',
      'status',
      'statusText',
      'trailers',
      'type',
      'url',
    ].forEach(k => {
      Object.defineProperty(Response.prototype, k, {
        get() {
          console.log(k);
          return this.cache[k];
        },
      });
    });

    ['arrayBuffer', 'blob', 'clone', 'formData', 'json', 'text'].forEach(k => {
      Object.defineProperty(HttpResponseLike.prototype, k, {
        value: function () {
          return this.cache[k]();
        },
      });
    });
    Object.setPrototypeOf(HttpResponseLike, GlobalResponse);
    Object.setPrototypeOf(HttpResponseLike.prototype, GlobalResponse.prototype);
    Object.defineProperty(global, 'HttpResponseLike', {
      value: HttpResponseLike,
    });
  }
}
