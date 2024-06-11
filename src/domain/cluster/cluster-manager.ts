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
    this.numCPUs = config.http.cores ?? os.availableParallelism();
  }

  start(): void {
    try {
      if (cluster.isPrimary) {
        for (let i = 0; i < this.numCPUs; i++) {
          cluster.fork();
        }

        cluster.on('online', (worker: any, code: any, signal: any) => {
          console.log(`worker ${worker.process.pid} is online`);
        });

        cluster.on('message', (worker, code, signal) => {
          console.log(`Worker ${worker.process.pid}, ${code} ${signal}`);
          this.serverManager.startServer(this.config);
        });

        cluster.on('disconnect', (worker: any, code: string, signal: any) => {
          console.log('child process disconnect with code ' + code);
          console.log(`process.env.NODE_UNIQUE_ID  ${worker.process.pid}`);
        });

        cluster.on('eror', (worker: any, code: string, signal: any) => {
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
        });
      } else {
        this.serverManager.startServer(this.config);
      }
    } catch (err: any) {
      throw new ClusterError(err.message);
    }
  }
}
