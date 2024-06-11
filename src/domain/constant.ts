import {DispatchType} from './types';

export class Constant {

  static readonly DISPATCH_BEFORE_HANDLER: DispatchType = 'before';
  static readonly DISPATCH_AFTER_HANDLER = 'after';

  get() {
    return Object.getOwnPropertyNames((prop: any) => prop);
  }
}
