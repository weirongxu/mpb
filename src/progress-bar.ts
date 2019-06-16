import { ProgressBarOutput, ProgressBarOutputStream } from './output';
import { MultiProgressBar } from './multi-progress-bar';
import { IProgressBar } from './interface-progres-bar';
import { compile, DrawRender } from './draw';
import { themes } from './themes';
import { createEvents, unsigned } from './utils';

export type ProgressBarHook = (bar: ProgressBar) => any;

export interface ProgressBarEvents {
  'start-pre': ProgressBarHook;
  'start-post': ProgressBarHook;
  'update-pre': ProgressBarHook;
  'update-post': ProgressBarHook;
  'complete-pre': ProgressBarHook;
  'complete-post': ProgressBarHook;
}

export interface ProgressBarOptions {
  /**
   * progress title
   */
  title: string;

  width: number;
  /**
   * width percentage of terminal (0..100)
   * @default 100
   */
  widthPercentage: number;

  /**
   * @default 100
   */
  total: number;
  /**
   * @default 0
   */
  current: number;

  render: DrawRender<ProgressBar>;

  onCompleted: ProgressBarHook;

  output: ProgressBarOutput;

  /**
   * remove bar when it completion
   * @default false
   */
  clean: boolean;

  multiProgressBar: MultiProgressBar;
}

export class ProgressBar implements IProgressBar {
  title: string;

  total: number;
  current: number;

  width?: number;
  widthPercentage?: number;

  clean: boolean;

  toBarString: () => string;

  output: ProgressBarOutput;

  started: boolean = false;
  completed: boolean = false;

  events = createEvents<ProgressBarEvents>();

  private startedAt?: Date;
  private completedAt?: Date;

  static create(options: Partial<ProgressBarOptions> = {}) {
    return new ProgressBar(options);
  }

  static start(options: Partial<ProgressBarOptions> = {}) {
    return this.create(options).start();
  }

  private constructor(options: Partial<ProgressBarOptions> = {}) {
    this.title = options.title || '';

    this.total = options.total || 100;
    this.current = options.current || 0;

    this.width = options.width;
    this.widthPercentage = options.widthPercentage;

    this.clean = !!options.clean;

    if (options.onCompleted) {
      this.events.on('complete-post', options.onCompleted);
    }

    const render = options.render || themes.basic;
    this.toBarString = compile(this, render, {
      width: this.width,
      widthPercentage: this.widthPercentage
    });

    if (options.multiProgressBar) {
      this.output = options.multiProgressBar.output;
    } else if (options.output) {
      this.output = options.output;
    } else {
      this.output = ProgressBarOutputStream.create();
    }

    this.checkCompleted();
  }

  get percentage() {
    return Math.floor((this.current / this.total) * 100);
  }

  get elapsed() {
    if (!this.startedAt) {
      return 0;
    }
    if (this.completedAt) {
      return unsigned(
        (this.completedAt.valueOf() - this.startedAt.valueOf()) / 1000
      );
    } else {
      return unsigned((Date.now() - this.startedAt.valueOf()) / 1000);
    }
  }

  get elapsedHuman() {
    return this.humanTime(this.elapsed);
  }

  get eta() {
    if (this.percentage === 0) {
      return 0;
    } else {
      return Math.floor((this.elapsed / this.percentage) * 100 - this.elapsed);
    }
  }

  get etaHuman() {
    return this.humanTime(this.eta);
  }

  start() {
    if (this.started) return this;

    this.events.emit('start-pre', this);
    this.started = true;
    this.startedAt = new Date();
    this.output.addBar(this);
    this.render();
    this.events.emit('start-post', this);
    return this;
  }

  tick(delta: number) {
    this.update(this.current + delta);
  }

  update(current: number) {
    if (this.completed || typeof current !== 'number') return;
    if (!this.startedAt) this.start();

    this.events.emit('update-pre', this);
    if (current > this.total) {
      current = this.total;
    } else if (current < 0) {
      current = 0;
    }
    this.current = current;
    this.render();
    this.checkCompleted();
    this.events.emit('update-post', this);
  }

  render() {
    this.output.output();
  }

  forceCompleted() {
    if (this.completed) return;

    this.events.emit('complete-pre', this);
    this.completed = true;
    this.completedAt = new Date();
    this.render();
    this.events.emit('complete-post', this);
  }

  private humanTime(totalSeconds: number) {
    if (totalSeconds > 3600) {
      return (
        Math.floor(totalSeconds / 3600) +
        'h' +
        (Math.floor(totalSeconds / 60) % 60) +
        'm'
      );
    } else if (totalSeconds > 60) {
      return (
        Math.floor(totalSeconds / 60) +
        'm' +
        Math.floor(totalSeconds % 60) +
        's'
      );
    } else {
      return totalSeconds + 's';
    }
  }

  private checkCompleted() {
    const completed = this.current >= this.total;

    if (completed) {
      this.forceCompleted();
    }

    return completed;
  }
}
