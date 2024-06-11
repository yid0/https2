import * as http2 from 'node:http2';
import { ServerStrategyError } from '../../../domain/error/error';
import { IRouter, ServerType } from '../../../domain/types';
import { IServer } from '../server';
import { Http2ServerStrategy } from './http2/http2.strategy';
import { HttpsServerStrategy } from './https/https.strategy';
import { HttpServerStrategy } from '.';

export interface IServerStrategy {
  readonly key: ServerType;
  readonly port: number;
  server: IServer;
  router: IRouter;
  serverOptions: http2.SecureServerOptions;
  apply(port: number, opts: http2.SecureServerOptions): void;
}

export class ServerStrategyFactory {

  static create(type: ServerType, options: { router: IRouter, port: number }): IServerStrategy {

    switch (type) {
      case 'http':
        return new HttpServerStrategy(options.router, options.port);
      case 'https':
        console.log("Strategy",options )
        return new HttpsServerStrategy(options.router, options.port);     
      case 'http2':
        return new Http2ServerStrategy(options.router, options.port);
      default:
        throw new ServerStrategyError(`any ${type} strategy definition was found !`)
    }
  }

}
