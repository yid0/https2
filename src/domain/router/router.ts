/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter from 'events';
import { RouterError } from '../error/error';
import { RouteOption } from '../middleware';
import { ResponseFlyweight } from '../server/http/response/flyweigth';
import { ResponseAdapter } from '../server/http/response/response-adapter';
import {
  BaseRequest,
  BaseResponse,
  ChainedMiddleware,
  DispatchFunction,
  Handler,
  HttpRoute,
  IRouter,
  Mime,
  RouterDispatcherType
} from '../types';

export abstract class RouterFactory {
  static createRouter(type: RouterDispatcherType): IRouter {
    return new RouterDispatcher(type);
  }
}

export class RouterDispatcher implements IRouter {
  regex!: RegExp;
  type!: RouterDispatcherType;
  request!: BaseRequest | any;
  response!: BaseResponse;
  event: EventEmitter;
  private bodyType!: Mime;

  constructor(
    type: RouterDispatcherType,
    private defaultHandler: Handler = ResponseAdapter.notFound as any,
    public routes: Map<string, HttpRoute> = new Map(),
  ) {
    this.type = type;
    this.event = new EventEmitter();
    this.event.on('fetch', async (request: BaseRequest, response: BaseResponse) => {
      return await this.fetch(request, response);
    });
  }

  onInit(path: string): RegExp {
    this.regex = RegExp(
      `^${path
        .replace(/\/+(\/|$)/g, '$1') // strip double & trailing splash
        .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))') // greedy params
        .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))') // named params and image format
        .replace(/\./g, '\\.') // dot in path
        .replace(/(\/?)\*/g, '($1.*)?') // wildcard
      }/*$`,
    );
    return this.regex
  }

  async fetch(
    request: Request | any,
    response: BaseResponse,
    dispatch?: () => void,
    ...args: any
  ) {
    try {

      this.request = request;
      const body = await this.route(this.request, response);
      response.body = body;
      this.response = response;

      if (process.env.MODE as any !== 'event') {
        console.log("process.env.MODE ",process.env.MODE )
        return new ResponseFlyweight<BaseResponse>().getResponse(this.response).adapt(this.bodyType);
      } else {
        return this.event.emit('response', this.response as BaseResponse, {
          body,
          extension: this.bodyType
        });
      }
    } catch (err: any) {
      throw new RouterError(`fetch binding ${err.name}: ${JSON.stringify(err)}`);
    }
  }

  async route(
    request: any,
    response: BaseResponse,
    forward?: () => void
  ): Promise<any> {

    for (const [path, expectedRoute] of this.routes) {

      if (expectedRoute.path.test(request.url) && (expectedRoute.handler || expectedRoute.middleware?.handler)) {

        if (expectedRoute.method === 'ANY' || expectedRoute.method === request.method) {

          if (expectedRoute.middleware?.before?.length) {

            await Promise.resolve(expectedRoute.middleware?.before?.map(async middleware => {
              await middleware(request, response);
            }));
          }

          const body = await Promise.resolve((expectedRoute.handler as DispatchFunction)(request, response)) as any;

          if (expectedRoute.middleware?.after?.length) {
            await Promise.resolve(expectedRoute.middleware?.after?.map(async middleware => {
              await middleware(request, response);
            }));
          }

          return await this.doResponse(body);

        }
      }
    }
    return this.defaultHandler(request as any, response as any);
  }

  private doResponse(body: any): Promise<unknown> {
    const bodyType = typeof body;
    switch (bodyType) {
      case 'object':
        this.bodyType = 'json';
        return body;
      case 'string':
        this.bodyType = 'html';
        return body;
      default:
        throw new RouterError(`response type not supported, got : ${this.bodyType}`);
    }
  }

  add(route: HttpRoute) {
    console.log("ADD method")

    //const route = { method, path: this.onInit(path), handler : middleware?.handler, middleware };
    this.routes.set(`${route.method}:${route.path}`, {
      ...route
    });
    return route;
  }

  any(path: string, handler: Handler) {
    this.routes.set(path, { method: 'ANY', path: this.onInit(path), handler });
  }

  delete(path: string, middleware: ChainedMiddleware, handler: Handler) {
    //return this.routes[path] = { method: 'DELETE', path: this.onInit(path), handler };
  }

  get(path: string, middleware: RouteOption) {
    //this.routes.set(path, { method: 'GET', path: this.onInit(path), handler: middleware.handler, middleware });
    this.routes.set('GET:' + path, { method: 'GET', path: this.onInit(path), handler: middleware.handler, middleware });

  }

  head(path: string, middleware: ChainedMiddleware, handler?: Handler) {
    //this.routes[path] = { method: 'HEAD', path: this.onInit(path), handler };
  }
  options(path: string, handler: Handler) {
    //this.routes[path] = { method: 'OPTIONS', path: this.onInit(path), handler };
  }
  patch(path: string, middleware: ChainedMiddleware, handler?: Handler) {
    //this.routes[path] = { method: 'PATCH', path: this.onInit(path), handler };
  }
  post(path: string, middleware: RouteOption) {
    this.routes.set('POST:' + path, { method: 'POST', path: this.onInit(path), handler: middleware.handler, middleware });
  }
  put(path: string, middleware: ChainedMiddleware, handler?: Handler) {
    // this.routes[path] = { method: 'PUT', path: this.onInit(path), handler };
  }
}