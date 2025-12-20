interface TimedValue {
  ts: number;
  value: number;
}

export class RollingWindow {
  private buffer: TimedValue[] = [];

  constructor(private windowMs: number) {}

  add(ts: number, value: number) {
    this.buffer.push({ ts, value });
    this.evict(ts);
  }

  sum(now: number): number {
    this.evict(now);
    return this.buffer.reduce((acc, v) => acc + v.value, 0);
  }

  private evict(now: number) {
    const cutoff = now - this.windowMs;
    while (this.buffer.length && this.buffer[0].ts < cutoff) {
      this.buffer.shift();
    }
  }
}
