declare module "node:fs" {
  export function readFileSync(path: string, encoding: string): string;
}

declare module "node:path" {
  export function resolve(...parts: string[]): string;
}

declare module "node:crypto" {
  export function createHash(algo: string): {
    update(value: string): { digest(encoding: "hex"): string };
  };
  export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean;
}

declare module "node:http" {
  export interface IncomingMessage { url?: string }
  export interface ServerResponse {
    statusCode: number;
    setHeader(key: string, value: string): void;
    end(value?: string): void;
  }
  export function createServer(
    cb: (req: IncomingMessage, res: ServerResponse) => void
  ): { listen(port: number, host: string, cb: () => void): void };
}

declare const process: {
  argv: string[];
  env: Record<string, string | undefined>;
  exitCode?: number;
  exit(code?: number): never;
};

declare const Buffer: {
  from(value: string, encoding: "hex"): Uint8Array;
};
