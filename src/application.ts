/* eslint-disable @typescript-eslint/no-explicit-any */
import * as os from 'node:os';
import { IConfig, setGlobalConfigApp } from './config/application-config';
import { ClusterManager, ICluster } from './domain/cluster/cluster-manager';
import { ApplicationError } from './domain/error/error';
import { RouteOption } from './domain/middleware';
import { RouterFactory } from './domain/router';
import { ServerManager } from './domain/server';
import { ServerStrategyFactory } from './domain/server/strategy';
import { IRouter, ServerDefinition, ServerType } from './domain/types';
interface IApplication {
  before?: Set<RouteOption>;
  after?: Set<RouteOption>;
  router: IRouter;
  run(): IApplication;
}
export class Application implements IApplication {
  private cluster!: ICluster;
  private config!: IConfig;
  private serverManager!: ServerManager;
  private numCPUs!: number;
  static instance: Application;
  router!: IRouter;

  build(config?: Partial<ServerDefinition | any>): Application {
    this.config = setGlobalConfigApp();
    return this;
  }

  private initCluster(): void {
    this.cluster = new ClusterManager(this.serverManager, this.config);
  }

  static getInstance(config?: IConfig): Application {
    return Application.instance;
  }
  getCluster() {
    return this.cluster;
  }

  private initServerManager(options?: IConfig): ServerManager {
    this.serverManager = ServerManager.getInstance();
    return this.serverManager;
  }

  private initRouter(): IRouter {
    this.router = RouterFactory.createRouter('classic');
    return this.router;
  }

  private initServerStrategy() {
    try {

      this.initRouter();

      ((process.env.SERVER_TYPE || 'http') as ServerType).split(',').filter(type => type !== '').forEach((key) => {

        if ((this.config as any)[key].cores && (this.config as any)[key].enable) {

          const strategy = ServerStrategyFactory.create(key as ServerType, {
            router: this.router,
            port: (this.config as any)[key].port
          });
      
          this.numCPUs = (this.config as any)[key].cores ?? os.availableParallelism();
          strategy.serverOptions = this.config[strategy.key].options as any;

          this.initServerManager().addStrategy(strategy);
        } else {
          throw new ApplicationError(`${key} strategy is not defined, please check your configuration !`)
        }
      });
    } catch (error: any) {
      throw new ApplicationError(error.message);
    }

  }

  run() {
    this.initServerManager();
    this.initServerStrategy();
    this.initCluster();
    this.cluster.start();
    return (Application.instance = this);
  }
}
