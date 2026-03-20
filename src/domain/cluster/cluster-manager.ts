/* eslint-disable @typescript-eslint/no-explicit-any */
import cluster, { Cluster } from 'node:cluster';
import * as os from 'node:os';
import { IConfig } from '../../config/application-config';
import { ClusterError } from '../error/error';
import { IServeManager } from '../server/server-manager';

export interface ICluster {
  config: IConfig;
  serverManager: IServeManager;
  cluster: Cluster;
  start(): void;
}
export class ClusterManager implements ICluster {
  private numCPUs: number;
  public cluster: Cluster;
  public serverManager: IServeManager;
  public config!: IConfig;

  constructor(serverManager: IServeManager, config: IConfig) {
    this.serverManager = serverManager;
    this.cluster = cluster;
    this.config = config;
    this.numCPUs = this.resolveCpuCount(config);
  }

  start(): void {
    try {
      if (cluster.isPrimary) {
        const workers = this.numCPUs;
        for (let i = 0; i < workers; i++) {
          cluster.fork();
        }

        cluster.on('online', (worker: any, code: any, signal: any) => {
          console.log(`worker ${worker.process.pid} is online`);
        });

        cluster.on('message', (worker, message) => {
          console.log(`Worker ${worker.process.pid} message: ${JSON.stringify(message)}`);
        });

        cluster.on('disconnect', (worker: any, code: string, signal: any) => {
          console.log('child process disconnect with code ' + code);
          console.log(`process.env.NODE_UNIQUE_ID  ${worker.process.pid}`);
        });

        cluster.on('error', (worker: any, code: string, signal: any) => {
          console.log('child process disconnect with code ' + code);
          console.log(`process.env.NODE_UNIQUE_ID  ${worker.process.pid}`);
        });

        cluster.on('exit', (worker, code, signal) => {
          console.log(`Worker ${worker.process.pid} died`);
          if (signal) {
            console.log(`worker was killed by signal: ${signal}`);
          } else if (code !== 0) {
            console.log(`worker exited with error code: ${code}`);
          } else {
            console.log('worker success!');
          }
          if (!worker.exitedAfterDisconnect) {
            cluster.fork();
          }
        });
      } else {
        this.serverManager.startServer(this.config);
      }
    } catch (err: any) {
      throw new ClusterError(err.message);
    }
  }

  private resolveCpuCount(config: IConfig): number {
    const cores = [
      config.http?.cores ?? 0,
      config.https?.cores ?? 0,
      config.http2?.cores ?? 0,
      config.static?.cores ?? 0,
    ]
      .filter((value) => value > 0);

    if (cores.length === 0) {
      return os.availableParallelism();
    }

    return Math.max(...cores);
  }
}
