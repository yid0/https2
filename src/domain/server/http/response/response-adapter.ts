import * as http2 from 'http2';
import { BaseRequest, BaseResponse, Mime } from '../../../types';

interface IResponse {
  body: object;
}

class HttpResponse extends Response implements IResponse {
  response: BaseResponse & ResponseInit;
  body: object | any;

  constructor(response: BaseResponse) {
    super()
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
    //console.log( "getBody", this.body)
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

  adapt(mime?: Mime) {
    return this.sendDefaultResponse(this.getBodyString(), mime || 'text/html');
  }

  apply(mime?: Mime) {
    return this.adapt(mime);
  }

  async sendDefaultResponse(stringBody: string, mime: string) {
    switch (mime) {
      case 'html':
        await Promise.resolve(this.response.writeHead(this.response.statusCode || 500, this.setHtmlHeaders(stringBody)));
        return this.response.end(stringBody);
      case 'json':
        await Promise.resolve(this.response.writeHead(this.response.statusCode || 500, this.setJsonHeaders(stringBody)));
        return await Promise.resolve(this.response.end(stringBody));
      case 'css':
        this.response.writeHead(this.response.statusCode || 500, this.setCssHeaders(stringBody));
        return this.response.end(stringBody);
      default:
        return this.send404('<h3> Page not Found !</h3>');
    }
  }

  static notFound(request: BaseRequest, response: any) {
    response.statusCode = 404;
    return {
      path: request.url,
      status: 404,
      message: 'Resource Not Found !',
    };
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
      'Content-Length': Buffer.byteLength(stringBody),
      'Content-Type': 'text/html',
      'accept-encoding': 'gzip',
    };
  }

  private setCssHeaders(stringBody: string) {
    return {
      'Content-Length': Buffer.byteLength(Buffer.from(stringBody)),
      'Content-Type': 'text/css'
    };
  }
  private setCsvHeaders(res: BaseResponse): void {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment;filename=oceanpals.csv');
  }

  private setJsonHeaders(stringBody: string) {
    return {
      'Content-Length': Buffer.byteLength(Buffer.from(stringBody)),
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
      'age': '0',
      'cache-control': 'no-cache',
      'httpOnly': 'true',
      'x-https2-version': '1.0.0-beta'
    };
  }
}
