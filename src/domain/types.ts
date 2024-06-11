import EventEmitter from 'node:events';
import { IncomingMessage, OutgoingMessage } from 'node:http';
import * as http2 from 'node:http2';
import { Application } from '../application';
import { RouteOption } from './middleware';
import { HttpResponseLike } from './server/http/response/response';
import { BodyInit } from 'node-fetch';

export type BaseRequest = (http2.Http2ServerRequest |
  IncomingMessage) & { body: object | BodyInit };

export type BaseResponse = Response & http2.Http2ServerResponse & OutgoingMessage & { body: object };

export type httpMethod =
  | ('GET' | 'get')
  | ('POST' | 'post')
  | ('PUT' | 'put')
  | ('PATCH' | 'patch')
  | ('OPTIONS' | 'option')
  | ('HEAD' | 'head');

export type ServerType = 'http' | 'http2' | 'https' | 'static';

export type RouterDispatcherType = 'classic' | 'proxy';

export type Mime = 'json' | 'html' | 'xml' | 'css' | 'javascript' | 'ico' | 'jpeg' | 'jpg';

export type FunctionLike = () => unknown | void;

export interface Handler {
  //(request: HttpRequestLike, response: HttpResponseLike, match?: RegExpMatchArray): void;
  (request: BaseRequest, response: HttpResponseLike, forward?: () => void): any;
}

export interface HttpRoute {
  method: httpMethod | string;
  path: RegExp;
  handler?: Handler | FunctionLike | string;
  middleware?: RouteOption
}

export type IRouter = {
  type: RouterDispatcherType;
  request: BaseRequest;
  response: BaseResponse;
  event: EventEmitter;
  fetch(request: BaseRequest, response?: BaseResponse, dispatch?: () => void): any;
  get(path: string, middleware?: RouteOption, ...middlewares: ChainedMiddleware): any;
  post(path: string, middleware: ChainedMiddleware | RouteOption, handler?: () => object | Handler): void;
  put(path: string, middleware: ChainedMiddleware | RouteOption, handler?: () => object | Handler): void;
  delete(path: string, middleware: ChainedMiddleware | RouteOption, handler: () => object | Handler): void;
  patch(path: string, middleware: ChainedMiddleware | RouteOption, handler: () => object | Handler): void;
  // static(path: string, dir: string, middleware?: (ChainedMiddleware | RouteOption)): void; //TODO
};

export type DispatchType = 'before' | 'after';

export type DispatchFunction = (
  request: BaseRequest | any,
  response: BaseResponse | any,
  dispatch?: () => void,
  error?: Error,
) => void;

export type Route = {
  readonly key?: symbol;
  readonly path: string;
  readonly method: httpMethod;
  params?: Map<symbol, string>;
  dispatch: DispatchFunction;
  scopes?: string[];
};

export interface ServerRouteMode {
  type: 'async' | 'event'
}

export type ChainedMiddleware = (DispatchFunction | FunctionLike | RouteOption)[];

export type IContext = {
  readonly application: Application;
  servers: {
    readonly key: symbol;
    readonly type: string;
  };
  routers: {
    readonly key: symbol;
    readonly type: symbol;
  };
};

export type ServerDefinition = {
  readonly key: ServerType;
  readonly port: number;
  readonly enable?: boolean;
  readonly cores?: number;
  readonly cacheSize?: number;
  readonly security?: {
  
      'content-security-policy'?: string;
      'referrer-policy'?: string;
      'strict-transport-security'?: string;
      'x-xss-protection'?: string;
      'x-content-type-options'?: string;
      'feature-policy'?: string;
    
  };
  readonly options?: {
    [x: string]: any;
  };
};