import { IConfig } from '../../config/application-config';
import { ServerStrategyError } from '../error/error';
import { IServer } from './server';
import { IServerStrategy } from './strategy/strategy';

export interface IServeManager {
  startServer(config?: IConfig): void;
  getInstance(): ServerManager;
  getServers(): IServer[];
}

export class ServerManager implements IServeManager {
  private static instance: ServerManager;
  protected serverStrategies: Map<symbol, IServerStrategy>;

  private constructor() {
    this.serverStrategies = new Map();
  }

  getServers(): IServer[] {
    const servers: IServer[] = [];
    this.serverStrategies.forEach(strategy => {
      servers.push(strategy.server);
    });
    return servers;
  }

  static getInstance(): ServerManager {
    if (!ServerManager.instance) {
      ServerManager.instance = new ServerManager();
    }
    return ServerManager.instance;
  }

  getInstance(): ServerManager {
    return ServerManager.instance;
  }

  addStrategy(serverStrategy: IServerStrategy): Map<symbol, IServerStrategy> {
    const key = serverStrategy.key + ':' + serverStrategy.port;
    if (!this.serverStrategies.has(Symbol(key))) {
      this.serverStrategies.set(Symbol(key), serverStrategy);
    } else
      throw new ServerStrategyError(`${serverStrategy.key} strategy was already exists !`)
    return this.serverStrategies;
  }

  startServer(config?: IConfig): void {
    // TODO : use config intead 
    if (this.serverStrategies.size > 0) {
      this.serverStrategies.forEach(strategy => {
        if (strategy.key) strategy.apply(strategy.port, strategy.serverOptions);
        else
          throw new Error(
            'Cannot apply the needed strategy, please check the server configuration !',
          );
      });
    } else {
      throw new Error('No server strategy defined.');
    }
  }
}
