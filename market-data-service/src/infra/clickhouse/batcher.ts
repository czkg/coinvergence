type InsertRow = Record<string, any>;

export class ClickHouseBatcher {
  private buf: InsertRow[] = [];
  private timer?: NodeJS.Timeout;
  private flushing = false;

  constructor(
    private readonly opts: {
      maxRows: number;
      flushIntervalMs: number;
      insert: (rows: InsertRow[]) => Promise<void>;
      name: string;
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
    if (this.flushing) return;
    if (this.buf.length === 0) return;

    this.flushing = true;
    const batch = this.buf;
    this.buf = [];

    try {
      await this.opts.insert(batch);
    } catch (e) {
      this.buf = batch.concat(this.buf);
      console.error(`[CH][${this.opts.name}] insert failed, buffered=${this.buf.length}`, e);
    } finally {
      this.flushing = false;
    }
  }
}
