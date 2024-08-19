import {BaseRequest, BaseResponse} from '../types';

export class StatusController {
  async getStatus(request: BaseRequest, response: BaseResponse) {
    let body = {};
    //console.log(request.body);

    if(request.body) {
      body = request.body
    }
    return new Response(
      JSON.stringify({
        body,
        status: 'Ultrafast https2 server is up 🚀',
        version: process.env.VERSION,
        path: request.url,
        httpVersion: request.httpVersion,
        statusCode: response.statusCode,
        details: {
          ...request.socket.address(),
          protocol: request.headers[':scheme'],
          cookie: request.headers.cookie,
        },
      }),
    ).json();
  }
}
