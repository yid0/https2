/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter from 'events';
import {RouterError} from '../error/error';
import {RouteOption} from '../middleware';
import {ResponseFlyweight} from '../server/http/response/flyweigth';
import {ResponseAdapter} from '../server/http/response/response-adapter';
import {
  BaseRequest,
  BaseResponse,
  ChainedMiddleware,
  DispatchFunction,
  Handler,
  HttpRoute,
  IRouter,
  MimeType,
  RouterDispatcherType,
} from '../types';

export abstract class RouterFactory {
  static createRouter(type: RouterDispatcherType): IRouter {
    return new RouterDispatcher(type);
  }
}

export class RouterDispatcher implements IRouter {
  regex!: RegExp;
  type!: RouterDispatcherType;
  request!: BaseRequest;
  response!: ResponseAdapter;
  event: EventEmitter;
  private bodyType!: MimeType;

  constructor(
    type: RouterDispatcherType,
    public routes: HttpRoute[]  = []
  ) {
    this.type = type;
    this.event = new EventEmitter();
    this.event.on('fetch', async (request: BaseRequest, response: BaseResponse) => {
      return this.fetch(request, response);
    });
  }

  onInit(path: string): RegExp {
    this.regex = RegExp(
      `^${
        path
          .replace(/\/+(\/|$)/g, '$1') // strip double & trailing splash
          .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))') // greedy params
          .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))') // named params and image format
          .replace(/\./g, '\\.') // dot in path
          .replace(/(\/?)\*/g, '($1.*)?') // wildcard
      }/*$`,
    );
    return this.regex;
  }

  async fetch(
    request: Request | any,
    response: BaseResponse,
    dispatch?: () => void,
    ...args: any
  ) {
    try {
      
      this.request = request;

      await this.route(this.request,response);

      //console.log( 'RS', response )
      if (process.env.MODE !== 'event') {
        return new ResponseFlyweight<ResponseAdapter>()
          .getResponse(response)
          .reply(response.body, this.bodyType);
      } else {
        return this.event.emit('response', response, {
          body:  response.body,
          extension: this.bodyType,
        });
      }   
    } catch (err: any) {
      throw new RouterError(`fetch binding ${err.name}: ${err.stack}`);
    }
  }

  async route(request: any, response: BaseResponse, forward?: () => void): Promise<ResponseAdapter | unknown> {
    let body;
    for ( let expectedRoute of this.routes) {
      if (
        expectedRoute.path.test(request.url) &&
        (expectedRoute.handler || expectedRoute.middleware?.handler)
      ) {

        if (expectedRoute.method === 'ANY' || expectedRoute.method === request.method) {
          if (expectedRoute.middleware?.before?.length) {
            await Promise.resolve(
              expectedRoute.middleware?.before?.map(async middleware => {
                await middleware(request, response);
              }),
            );
          }

          body = await Promise.resolve(
            (expectedRoute.handler as DispatchFunction)(request, response),
          ) as unknown as any;

           response.body = body;   

          if (expectedRoute.middleware?.after?.length) {
            await Promise.resolve(
              expectedRoute.middleware?.after?.map(async middleware => {
                await middleware(request, response);
              }),
            );
          }
          return this.reply(body);
      } 
    }
   }

  }

  private reply(body: any): Promise<unknown> {
    const bodyType = typeof body;
    switch (bodyType) {
      case 'object':
        this.bodyType = 'json';
        return body;
      default:
        this.bodyType = 'html';
        return body;
    }
  }

  add(route: HttpRoute) : HttpRoute{

    this.routes.push( {
      ...route,
      path  : this.onInit("GET:"+ route.path),
    });
    return route;
  }

  any(path: string, handler: Handler) :void {
    this.routes.push({method: 'ANY', path: this.onInit(path), handler});
  }

  delete(path: string, middleware: ChainedMiddleware, handler: Handler) :void {
    this.routes.push({method: 'DELETE', path: this.onInit(path), handler});
  }

  get(path: string, middleware: RouteOption) :void{
    this.routes.push( {
      method: 'GET',
      path: this.onInit(path),
      handler: middleware.handler,
      middleware,
    });
  }
  
  head(path: string, middleware: RouteOption) :void {
    this.routes.push( {
      method: 'HEAD',
      path: this.onInit(path),
      handler: middleware.handler,
      middleware,
    }); 
  }

  options(path: string, middleware: RouteOption) :void{
    this.routes.push( {
      method: 'OPTION',
      path: this.onInit(path),
      handler: middleware.handler,
      middleware,
    });
  }

  patch(path: string, middleware: RouteOption) :void{
    this.routes.push( {
      method: 'PATCH',
      path: this.onInit(path),
      handler: middleware.handler,
      middleware,
    });  
  }
  post(path: string, middleware: RouteOption) :void{
    this.routes.push( {
      method: 'POST',
      path: this.onInit(path),
      handler: middleware.handler,
      middleware,
    });
  }
  put(path: string, middleware: RouteOption) :void{
    this.routes.push( {
      method: 'PUT',
      path: this.onInit(path),
      handler: middleware.handler,
      middleware,
    });  
  }
}
