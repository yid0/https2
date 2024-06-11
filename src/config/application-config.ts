import fs from 'fs';
import { join } from 'path';
import { ServerDefinition, ServerType } from '../domain/types';

export type IConfig = {
  readonly [x in ServerType]: ServerDefinition;
};

export function setGlobalConfigApp(config?: Partial<ServerDefinition>) {

  const options = {
    key: fs.readFileSync(join(__dirname, '..', '/certs/localhost-privkey.pem'), 'utf8').replace(/\\n/g, '\n').toString(),
    cert: fs.readFileSync(join(__dirname, '..', '/certs/localhost-cert.pem'), 'utf8').replace(/\\n/g, '\n').toString(),
  };

  console.log(options)
  return {
    http: {
      key: 'http',
      port: Number(process.env.HTTP_PORT) || 3000,
      enable: true,
      cores: Number(process.env.CORES) || 1,
      security: {
        'content-security-policy': "default-src 'self'",
      },
    },
    https: {
      key: 'https',
      enable: true,
      port: Number(process.env.HTTPS_PORT) || 8443,
      cores: Number(process.env.CORES) || 1,
      options
    },
    http2: {
      key: 'http2',
      enable: true,
      port: Number(process.env.HTTP2_PORT) || 9443,
      cores: Number(process.env.CORES) || 1,
      options
    },
    static: {
      key: 'static',
      port: 8081,
      enable: false,
      cores: 0,
      cacheSize: Number(process.env.CACHE) || 100,
    }
  } as IConfig;
}

