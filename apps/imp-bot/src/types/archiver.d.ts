declare module 'archiver' {
  import { Transform } from 'stream';
  export interface ArchiverOptions {
    zlib?: { level?: number };
  }
  export class ZipArchive extends Transform {
    constructor(options?: ArchiverOptions);
    directory(source: string, prefix?: string | false): this;
    finalize(): Promise<void>;
    on(event: 'data', callback: (chunk: Buffer) => void): this;
    on(event: 'end', callback: () => void): this;
    on(event: 'error', callback: (err: Error) => void): this;
    removeAllListeners(event?: string): this;
    pipe<T extends NodeJS.WritableStream>(destination: T): T;
  }
}
