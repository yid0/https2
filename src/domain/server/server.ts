import * as https from 'https';
import { BaseRequest, BaseResponse, IRouter } from '../../domain/types';
import { ResponseAdapter } from './http/response/response-adapter';

export interface IServer {
  type: symbol;
  router: IRouter;
  start(port: number, options: any): void;
  send(): any;
}

export class Server extends https.Server implements IServer {

  type = Symbol(Server.name);
  router!: IRouter;



  dispatch(request: BaseRequest, response: BaseResponse) {
    return process.env.MODE === 'event' ? this.router.event.emit('fetch', request, response) : this.router.fetch(request, response);
  }

  start(port: number): void {
    throw new Error('Method not implemented.');
  }

  send() {
    //return new ResponseFlyweight<BaseResponse>().getResponse(response, { body });
    this.router.event.on('response', async (response, options) => {
      //console.log("Process in http server instance ...");
      response.body = options.body;
      //return new ResponseFlyweight<BaseResponse>().getResponse(response, { body });

      return await Promise.resolve(new ResponseAdapter(response).adapt(options.extension));
    });
  }
}
