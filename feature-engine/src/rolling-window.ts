interface TimedValue {
  ts: number;
  value: number;
}

export class RollingWindow {
  private buffer: TimedValue[] = [];
  private head = 0;
  private currentSum = 0;

  constructor(private windowMs: number) {}

  add(ts: number, value: number) {
    // add new value
    this.buffer.push({ ts, value });
    this.currentSum += value;

    // evict old values
    this.evict(ts);
  }

  sum(now: number): number {
    this.evict(now);
    return this.currentSum;
  }

  private evict(now: number) {
    const cutoff = now - this.windowMs;

    while (
      this.head < this.buffer.length &&
      this.buffer[this.head].ts < cutoff
    ) {
      this.currentSum -= this.buffer[this.head].value;
      this.head++;
    }

    // optional: reclaim memory occasionally
    if (this.head > 1024 && this.head * 2 > this.buffer.length) {
      this.buffer = this.buffer.slice(this.head);
      this.head = 0;
    }
  }
}
