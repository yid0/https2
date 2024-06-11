import * as http2 from 'node:http2';
import { BaseRequest, BaseResponse, IRouter } from '../../types';
import { IServer, Server } from '../server';

export class Http2Server extends Server implements IServer {
  private server: http2.Http2SecureServer;

  constructor(router: IRouter, serverOptions: http2.SecureServerOptions) {
    super();

    this.server = http2.createSecureServer({ allowHTTP1: true, ...serverOptions });
    this.router = router;
  }

  start(port: number): void {
    this.server.listen(port, process.env.HOST || '0.0.0.0', () => {
      console.log(`Http2 server running on ${port}`);
      this.onRequest();
      this.send();
      this.onError();
    });
  }

  onRequest() {
    this.server.on('request', async (request: BaseRequest, response: BaseResponse) => {
      this.dispatch(request, response);
    });
  }

  onError() {
    this.server.on('error', (request: BaseRequest, response: BaseResponse) => {
      // TODO :
    });
  }

  static getBuilder(
    router: IRouter,
    serverOptions: http2.SecureServerOptions,
  ): Http2ServerBuilder {
    return new Http2ServerBuilder(router, serverOptions);
  }
}

export class Http2ServerBuilder {
  private serverOptions: http2.SecureServerOptions;
  private router!: IRouter;

  constructor(router: IRouter, serverOptions: http2.SecureServerOptions) {
    this.serverOptions = serverOptions;
    this.router = router;
  }

  build(): Http2Server {
    return new Http2Server(this.router, this.serverOptions);
  }
}
