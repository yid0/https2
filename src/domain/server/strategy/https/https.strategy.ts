import { SecureServerOptions } from 'http2';
import * as https from 'node:https';
import { IServer } from '../..';
import { IRouter, ServerType } from '../../../types';
import { HttpsServer } from '../../https/https.server';
import { IServerStrategy } from '../strategy';

export class HttpsServerStrategy
  implements IServerStrategy {
  readonly key: ServerType = 'https';
  port: number;
  server!: IServer;
  router: IRouter;
  serverOptions!: SecureServerOptions;
  constructor(router: IRouter, port: number) {
    this.port = port;
    this.router = router;
  }


  apply(port: number, serverOptions: https.ServerOptions): void {
    console.log(`Creating a new ${HttpsServerStrategy.name} : ${this.key}`);
    this.serverOptions = serverOptions;
    const serverBuilder = HttpsServer.getBuilder(this.router, this.serverOptions);
    this.server = serverBuilder.build();
    this.server.start(port, serverOptions);
  }
}
