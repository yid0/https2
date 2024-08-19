import * as https from 'https';
import {BaseRequest, BaseResponse, IRouter} from '../../domain/types';
import {ResponseAdapter} from './http/response/response-adapter';

export interface IServer {
  type: symbol;
  router: IRouter;
  start(port: number, options: any): void;
  send(): any;
}

export class Server extends https.Server implements IServer {
  type = Symbol(Server.name);
  router!: IRouter;

  dispatch(request: BaseRequest, response: BaseResponse)  {
     if(process.env.MODE === 'event')
       this.router.event.emit('fetch', request, response);
    else
      return this.router.fetch(request, response);
  }

  start(port: number): void {
    throw new Error('Method not implemented.');
  }

  send() {
    this.router.event.on('response', (response, options) => {   
      return new ResponseAdapter(response).reply(options.extension);
    });
  }
}
