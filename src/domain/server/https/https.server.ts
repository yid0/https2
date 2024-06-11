import * as https from 'https';
import { Socket } from 'net';
import { IRouter } from '../../types';
import { IServer, Server } from '../server';

export class HttpsServer extends Server implements IServer {
  private server: https.Server;

  constructor(router: IRouter, serverOptions: https.ServerOptions) {
    super();
    this.server = https.createServer(serverOptions);
    this.router = router;
  }

  start(port: number) {
    this.server.listen(port, process.env.HOST || '0.0.0.0', () => {
      console.log(`Https server running on ${port}`);
      this.onRequest();
      this.send();
    });
  }

  onRequest() {
    this.server.on('request', async (request: any, response: any) => {
      this.dispatch(request, response);
    });
  }

  onConnection() {
    this.server.on('connection', (socket: Socket) => {
      console.log(`connected socket : ${socket}`);
    });
  }

  static getBuilder(
    router: IRouter,
    serverOptions: https.ServerOptions,
  ): HTTPServerBuilder {
    return new HTTPServerBuilder(router, serverOptions);
  }
}

export class HTTPServerBuilder {
  private serverOptions: https.ServerOptions;
  private router!: IRouter;

  constructor(router: IRouter, serverOptions: https.ServerOptions) {
    this.serverOptions = serverOptions;
    this.router = router;
  }

  build(): HttpsServer {
    return new HttpsServer(this.router, this.serverOptions);
  }
}
