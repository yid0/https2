import * as http from 'http';
import { Http2ServerRequest } from 'http2';
import { Socket } from 'net';
import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';
import { IRouter } from '../../types';
import { IServer, Server } from '../server';



// Traiter la réponse...

export class HttpServer extends Server implements IServer {
  private server: http.Server;

  constructor(router: IRouter, serverOptions: http.ServerOptions) {
    super();
    this.server = http.createServer(serverOptions);
    this.router = router;
  }

  start(port: number) {
    this.server.listen(port, process.env.HTTP_HOST || '0.0.0.0', () => {
      console.log(`Http server running on ${port}`);
      this.onRequest();
      this.send();
    });
  }

  static BaseRequestIncoming = (
    method: string,
    url: string,
    incoming: http.IncomingMessage | Http2ServerRequest,
  ): Request => {
    const headerRecord: [string, string][] = [];
    const len = incoming.rawHeaders.length;
    for (let i = 0; i < len; i += 2) {
      headerRecord.push([incoming.rawHeaders[i], incoming.rawHeaders[i + 1]]);
    }

    const init = {
      method: method,
      headers: headerRecord,
    } as RequestInit;

    if (!(method === 'GET' || method === 'HEAD')) {
      init.body = JSON.stringify(incoming) || Readable.toWeb(incoming) as ReadableStream<Uint8Array>;
      (init as any).duplex = 'half';
    }

    return new Request(url, init);
  };


  onRequest() {
    this.server.on('request', async (request: any, response: any) => {
      let body = '';
      // TODO: support http POST and body process 
      
      return this.dispatch(request, response);

      request.on('data', (chunk: any) => {
        body += chunk;
      });

      const getProtocol = (req: any) => {
        let proto = req.connection.encrypted ? 'https' : 'http';
        proto = req.headers['x-forwarded-proto'] || proto;
        return proto.split(/\s*,\s*/)[0];
      }

      const urls = new URL(request.url as string, `${getProtocol(request)}://${request.headers.host}${request.url}`);

      request.on('end', async () => {
        if (body !== '')
          request.body = body as any;
        await this.router.fetch(request, response);
      });

      if (process.env.MODE === 'event')
        await Promise.resolve(this.router.event.emit('fetch', request, response));
      else
        await this.router.fetch(request, response);
    });
  }

  onConnection() {
    this.server.on('connection', (socket: Socket) => {
      console.log(`connected socket : ${socket}`);
    });
  }

  static getBuilder(
    router: IRouter,
    serverOptions: http.ServerOptions,
  ): HttpServerBuilder {
    return new HttpServerBuilder(router, serverOptions);
  }
}

export class HttpServerBuilder {
  private serverOptions: http.ServerOptions;
  private router!: IRouter;

  constructor(router: IRouter, serverOptions: http.ServerOptions) {
    this.serverOptions = serverOptions;
    this.router = router;
  }

  build(): HttpServer {
    return new HttpServer(this.router, this.serverOptions);
  }
}
