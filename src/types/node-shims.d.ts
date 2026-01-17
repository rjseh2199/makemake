declare const process: {
  env: Record<string, string | undefined>;
  exit: (code?: number) => void;
};

declare namespace NodeJS {
  interface ErrnoException {
    code?: string;
  }
}

declare module "fs" {
  export const promises: {
    readFile(path: string, encoding: string): Promise<string>;
    writeFile(path: string, data: string, encoding: string): Promise<void>;
    mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  };
}

declare module "path" {
  export function join(...parts: string[]): string;
}

declare module "http" {
  export interface IncomingMessage {
    url?: string;
    method?: string;
    statusCode?: number;
    [Symbol.asyncIterator](): AsyncIterableIterator<Uint8Array>;
    on(event: "data", listener: (chunk: Uint8Array) => void): this;
    on(event: "end", listener: () => void): this;
  }

  export interface ServerResponse {
    statusCode?: number;
    writeHead(status: number, headers: Record<string, string>): void;
    end(body?: string): void;
  }

  export interface RequestOptions {
    hostname?: string;
    port?: number;
    path?: string;
    method?: string;
    headers?: Record<string, string>;
  }

  export interface Server {
    listen(port: number, callback?: () => void): void;
    address(): { port: number } | string | null;
    close(): void;
  }

  export function createServer(
    handler: (req: IncomingMessage, res: ServerResponse) => void
  ): Server;

  export function request(
    options: RequestOptions,
    callback: (res: IncomingMessage) => void
  ): {
    on(event: "error", listener: (error: Error) => void): void;
    write(data: string): void;
    end(): void;
  };
}

declare module "url" {
  export class URL {
    constructor(input: string, base?: string);
    pathname: string;
    searchParams: {
      get(name: string): string | null;
    };
  }
}

declare const Buffer: {
  from(data: Uint8Array | string): Uint8Array;
  concat(chunks: Uint8Array[]): Uint8Array;
};

declare class TextDecoder {
  constructor(label?: string);
  decode(input?: Uint8Array): string;
}

declare const require: {
  main?: unknown;
};

declare const module: {
  exports?: unknown;
};

declare const console: {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};


type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

declare function fetch(
  input: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<FetchResponse>;
