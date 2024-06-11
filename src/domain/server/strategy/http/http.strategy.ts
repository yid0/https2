import { SecureServerOptions } from 'http2';
import * as http from 'node:http';
import { IServer } from '../..';
import { IRouter, ServerType } from '../../../types';
import { HttpServer } from '../../http/http.server';
import { IServerStrategy } from '../strategy';

export class HttpServerStrategy
  implements IServerStrategy {
  readonly key: ServerType = 'http';
  readonly port: number;
  server!: IServer;
  router: IRouter;
  serverOptions!: SecureServerOptions;

  constructor(router: IRouter, port: number) {
    this.port = port;
    this.router = router;
  }

  apply(port: number, serverOptions: http.ServerOptions): void {
    console.log(`Creating a new ${HttpServerStrategy.name} : ${this.key}`);
    const serverBuilder = HttpServer.getBuilder(this.router, this.serverOptions);
    this.server = serverBuilder.build();
    this.server.start(port, serverOptions);
  }

}
