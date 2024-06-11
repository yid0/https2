export class RouterError extends Error {
  constructor(message: string) {
    super();
    this.name = RouterError.name;
    this.message += ' ' + message;
  }
}

export class ClusterError extends Error {
  constructor(message: string) {
    super();
    this.name = ClusterError.name;
    this.message += ' ' + message;
  }
}

export class ServerStrategyError extends Error {
  constructor(message: string) {
    super();
    this.name = ServerStrategyError.name;
    this.message += ' ' + message;
  }
}

export class ApplicationError extends Error {
  constructor(message: string) {
    super();
    this.name = ApplicationError.name;
    this.message += ' ' + message;
  }
}


