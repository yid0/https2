import * as http2 from 'node:http2';
import { IServer } from '../..';
import { IRouter, ServerType } from '../../../types';
import { Http2Server } from '../../http2/http2.server';
import { IServerStrategy } from '../strategy';

export class Http2ServerStrategy
  implements IServerStrategy {
  readonly key: ServerType = 'http2';
  readonly port: number;
  server!: IServer;
  router: IRouter;
  serverOptions!: http2.SecureServerOptions;

  constructor(router: IRouter, port: number) {
    this.port = port;
    this.router = router;
  }


  apply(port: number, serverOptions: http2.ServerOptions): void {
    console.log(`Creating a new ${Http2ServerStrategy.name} : ${this.key}`);
    this.serverOptions = serverOptions;
    const serverBuilder = Http2Server.getBuilder(this.router, this.serverOptions);
    this.server = serverBuilder.build();
    this.server.start(port, serverOptions);
  }


}
