import cliCursor from 'cli-cursor';
import readline from 'readline';
import { MultiProgressBar } from './multi-progress-bar';
import { ProgressBar } from './progress-bar';
import { createEvents } from './utils';

const defaultStream = () => {
  const stream = process.stderr;
  stream.setMaxListeners(0);
  return stream;
};

export type OutputHook = (output: ProgressBarOutput) => any;

export type ProgressBarOutputEvents = {
  'add-bar-pre': (bar: ProgressBar, output: ProgressBarOutput) => any;
  'add-bar-post': (bar: ProgressBar, output: ProgressBarOutput) => any;
  'remove-bar-pre': (bar: ProgressBar, output: ProgressBarOutput) => any;
  'remove-bar-post': (bar: ProgressBar, output: ProgressBarOutput) => any;
  'output-pre': OutputHook;
  'output-post': OutputHook;
};

export interface ProgressBarOutputOptions {
  multiProgressBar: MultiProgressBar;
  /**
   * refresh times per second
   * @default 10
   */
  refreshRate: number;
}

export abstract class ProgressBarOutput {
  multiProgressBar?: MultiProgressBar;
  bars: ProgressBar[] = [];
  events = createEvents<ProgressBarOutputEvents>();
  refreshRate: number;
  outputWidth?: number;

  protected refreshDiffMilliseconds: number;
  protected lastOutputAt?: Date;
  protected outputTimer: NodeJS.Timeout | null = null;

  protected constructor(options: Partial<ProgressBarOutputOptions> = {}) {
    this.multiProgressBar = options.multiProgressBar;

    this.refreshRate = options.refreshRate || 10;

    this.refreshDiffMilliseconds = Math.floor(1000 / this.refreshRate);
  }

  addBar(bar: ProgressBar) {
    this.events.emit('add-bar-pre', bar, this);
    this.bars.push(bar);
    this.events.emit('add-bar-post', bar, this);
  }

  removeBar(bar: ProgressBar) {
    this.events.emit('remove-bar-pre', bar, this);
    this.bars = this.bars.filter(it => it !== bar);
    this.events.emit('remove-bar-post', bar, this);
  }

  protected abstract realOutput(): void;

  forceOutput() {
    this.lastOutputAt = new Date();
    if (this.outputTimer) {
      clearTimeout(this.outputTimer);
      this.outputTimer = null;
    }
    this.realOutput();
    const removeBars = this.bars.filter(bar => bar.clean && bar.completed);
    removeBars.forEach(bar => this.removeBar(bar));
    if (this.bars.length === 0) {
      this.realOutput();
    }
  }

  output() {
    if (!this.bars.every(bar => bar.completed) && this.lastOutputAt) {
      const passMilliseconds = Date.now() - this.lastOutputAt.valueOf();
      if (passMilliseconds > this.refreshDiffMilliseconds) {
        this.forceOutput();
      } else {
        this.outputTimer = setTimeout(
          this.forceOutput.bind(this),
          this.refreshDiffMilliseconds - passMilliseconds
        );
      }
    } else {
      this.forceOutput();
    }
  }
}

export interface ProgressBarOutputStreamOptions
  extends ProgressBarOutputOptions {
  /**
   * default `progress.stderr`
   */
  stream: NodeJS.WriteStream;
}

export class ProgressBarOutputStream extends ProgressBarOutput {
  stream: NodeJS.WriteStream;

  protected outputHeight: number = 0;

  static create(options: Partial<ProgressBarOutputStreamOptions> = {}) {
    return new this(options);
  }

  protected constructor(options: Partial<ProgressBarOutputStreamOptions> = {}) {
    super(options);

    this.stream = options.stream || defaultStream();

    this.outputWidth = this.getOutputColumns();

    this.stream.on('resize', () => {
      this.outputWidth = this.getOutputColumns();
      this.output();
    });
  }

  private getOutputColumns() {
    return this.stream.columns || 0;
  }

  clearScreenDown() {
    if (!this.stream.isTTY) return;

    readline.clearScreenDown(this.stream);
  }

  realOutput() {
    this.events.emit('output-pre', this);

    if (this.stream.isTTY) {
      if (this.bars.length > 0) {
        cliCursor.hide(this.stream);
      } else {
        cliCursor.show(this.stream);
      }
      readline.moveCursor(this.stream, 0, -this.outputHeight);
      readline.cursorTo(this.stream, 0);
    }

    const newOutputHeight = this.bars.length + (this.multiProgressBar ? 1 : 0);

    if (newOutputHeight < this.outputHeight) {
      this.clearScreenDown();
    }

    if (this.multiProgressBar) {
      this.stream.write(this.multiProgressBar.toBarString() + '\r\n');
    }

    this.outputHeight = newOutputHeight;

    this.bars.forEach(bar => {
      this.stream.write(bar.toBarString() + '\r\n');
    });

    this.events.emit('output-post', this);
  }
}

export class ProgressBarOutputNoop extends ProgressBarOutput {
  static create(options: Partial<ProgressBarOutputOptions> = {}) {
    return new this(options);
  }

  realOutput() {
    this.events.emit('output-pre', this);
    this.events.emit('output-post', this);
  }
}

export class ProgressBarOutputBuffer extends ProgressBarOutput {
  buffer: string = '';

  static create(
    bufferWidth: number,
    options: Partial<ProgressBarOutputOptions> = {}
  ) {
    return new this(bufferWidth, options);
  }

  protected constructor(
    bufferWidth: number,
    options: Partial<ProgressBarOutputOptions> = {}
  ) {
    super(options);

    this.outputWidth = bufferWidth;
  }

  realOutput() {
    this.events.emit('output-pre', this);

    this.buffer = '';

    if (this.multiProgressBar) {
      this.buffer += this.multiProgressBar.toBarString() + '\r\n';
    }

    this.bars.forEach(bar => {
      this.buffer += bar.toBarString() + '\r\n';
    });

    this.events.emit('output-post', this);
  }
}
