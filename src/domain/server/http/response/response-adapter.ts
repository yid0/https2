import * as http2 from 'http2';
import {BaseRequest, BaseResponse, MimeType} from '../../../types';

interface IResponse {
  body: object;
}

class HttpResponse extends Response implements IResponse {
  response: BaseResponse & ResponseInit;
  body: object | any;

  constructor(response: BaseResponse) {
    super();
    this.response = response;
    this.body = response.body;
  }

  writeHead(statusCode: number, headers: http2.OutgoingHttpHeaders): void {
    this.response.writeHead(statusCode, headers);
  }

  end(body: any, encoding?: BufferEncoding, cb?: () => void) {
    this.response.end(body);
  }

  getBody() {
    return this.body;
  }

  getBodyString() {
    return typeof this.body === 'string' ? this.getBody() : JSON.stringify(this.body);
  }
}

export class ResponseAdapter extends HttpResponse {
  constructor(response: BaseResponse) {
    super(response);
  }

  reply(body: unknown, mime?: MimeType) {

    return this.sendDefaultResponse(this.getBodyString(), mime || 'text/html');  }



  sendDefaultResponse(bodyString: string, mime: string): BaseResponse {
    switch (mime) {
      case 'html':
          this.response.writeHead(
            this.response.statusCode || 500,
            this.setHtmlHeaders(bodyString),
         
        );
        return this.response.end(bodyString);
      case 'json':
       
          this.response.writeHead(
            this.response.statusCode || 500,
            this.setJsonHeaders(bodyString),         
        );
        return  this.response.end(bodyString);
      case 'css':
        this.response.writeHead(
          this.response.statusCode || 500,
          this.setCssHeaders(bodyString),
        );
        return this.response.end(bodyString);
      default:
        return this.send404('<h3> Page not Found ! </h3>');
    }
  }

  send404(stringBody?: any, options?: any) {
    this.response.writeHead(404, this.setHtmlHeaders(stringBody));
    return this.response.end(stringBody);
  }

  send500(body?: any, options?: any) {
    const final = JSON.stringify(body);
    this.response.writeHead(500, this.setJsonHeaders(JSON.stringify(final)));
    return this.response.end(final);
  }

  private setHtmlHeaders(stringBody: string) {
    return {
      'Content-Length': Buffer.byteLength(stringBody ?? ''),
      'Content-Type': 'text/html',
      'accept-encoding': 'gzip',
    };
  }

  private setCssHeaders(stringBody: string) {
    return {
      'Content-Length': Buffer.byteLength(Buffer.from(stringBody)),
      'Content-Type': 'text/css',
    };
  }
  private setCsvHeaders(res: BaseResponse): void {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment;filename=oceanpals.csv');
  }

  private setJsonHeaders(stringBody: string) {
    return {
      'Content-Length': Buffer.byteLength(Buffer.from(stringBody ?? '')),
      'accept-encoding': 'gzip',
      'Content-Type': 'application/json',
      'content-security-policy': 'self',
      'x-xss-protection': '1; mode=block',
      'X-Content-Type-Options': 'nosniff',
      'feature-policy': '*',
      'Referrer-Policy': 'same-origin',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': '*',
      'access-control-allow-headers': '*',
      age: '0',
      'cache-control': 'no-cache',
      httpOnly: 'true',
      'x-https2-version': '1.0.0-beta',
    };
  }
}
