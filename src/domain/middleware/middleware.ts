import { DispatchFunction, FunctionLike } from '../types';

export interface RouteOption {
  handler: FunctionLike | DispatchFunction;
  before?:   ((req?: any, res?: any, next?: () => void) => any) []//( ...args : DispatchFunction[]) =>    any; // To execute before handler execution
  after?:((req?: any, res?: any, next?: () => void) => any) []
  static?: string | undefined;
}
