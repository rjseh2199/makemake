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
