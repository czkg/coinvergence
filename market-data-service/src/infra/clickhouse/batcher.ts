type InsertRow = Record<string, any>;


export class ClickHouseBatcher {
  private buf: InsertRow[] = [];
  private timer?: NodeJS.Timeout;
  private flushing = false;

  constructor(
    private readonly opts: {
      name: string;
      maxRows: number;
      flushIntervalMs: number;
      insert: (rows: InsertRow[]) => Promise<void>;
      onFlush?: (rows: number, ms: number) => void;
      onError?: (err: unknown) => void;
    }
  ) {}

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => void this.flush(), this.opts.flushIntervalMs);
    this.timer.unref?.();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  push(row: InsertRow) {
    this.buf.push(row);
    if (this.buf.length >= this.opts.maxRows) {
      void this.flush();
    }
  }

  async flush() {
    if (this.flushing || this.buf.length === 0) return;

    this.flushing = true;
    const batch = this.buf;
    this.buf = [];

    const t0 = Date.now();

    console.log(
      `[ClickHouseBatcher:${this.opts.name}] flushing ${batch.length} rows`
    );

    try {
      await this.opts.insert(batch);

      console.log(
        `[ClickHouseBatcher:${this.opts.name}] insert success (${Date.now() - t0} ms)`
      );

      this.opts.onFlush?.(batch.length, Date.now() - t0);
    } catch (err) {
      console.error(
        `[ClickHouseBatcher:${this.opts.name}] insert FAILED`,
        err
      );

      this.opts.onError?.(err);
    } finally {
      this.flushing = false;
    }
  }

  size() {
    return this.buf.length;
  }
}
