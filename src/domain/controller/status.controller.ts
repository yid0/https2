import { HttpRequestLike } from '../../domain/server/http/request/request';
import { BaseRequest, BaseResponse } from '../types';

export class StatusController {

  async getStatus(request: BaseRequest, response: BaseResponse) {


    return new Response(JSON.stringify({
      status: 'Ultrafast https2 server is up 🚀',
      version: process.env.VERSION,
      path: request.url,
      httpVersion: request.httpVersion,
      details: {
        ...request.socket.address(), protocol: request.headers[':scheme'],
        cookie: request.headers.cookie
      },
    })).json()
  }
}
