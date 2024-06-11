import { Application } from './application';
import { StatusController } from './domain/controller';
import { BaseResponse } from './main';
import { BaseRequest } from './main';
export * from './domain/types';

const preHandle = async (req: BaseRequest, res: BaseResponse, next?: () => void) => {
  req.headers.cookie = "https2:preHandle";
  next;
}

const postHandle = async (req: BaseRequest, res: BaseResponse, next?: () => void) => {
  req.headers.cookie = "https2:postHandle";
  res.statusCode = 202;
  next;
}

export const start = (config?: any) => {

  try {

    const app = new Application().build().run();

    app.router.get('/version', {
      before: [preHandle],
      after: [postHandle],
      handler: StatusController.prototype.getStatus
    });

  } catch (err: any) {
    console.error(`server error : ${err.message}`);
  }
}

start();