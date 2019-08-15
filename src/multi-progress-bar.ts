import { IProgressBar } from './interface-progres-bar';
import { ProgressBarOutput, ProgressBarOutputStream } from './output';
import { ProgressBar, ProgressBarOptions } from './progress-bar';
import { compile, Draw, DrawRender } from './draw';

export interface MultiProgressBarOptions {
  /**
   * progress title
   */
  title: string;

  headerWidth: number;
  /**
   * width percentage of terminal (0..100)
   * @default 100
   */
  headerWidthPercentage: number;

  render: DrawRender<MultiProgressBar>;

  output: ProgressBarOutput;
}

/**
 * MultiProgressBar
 *
 * @example
 * ```javascript
 * const multi = MultiProgressBar.create({
 *   title: 'download',
 * });
 * const bar1 = multi.createBar({
 *   title: 'progress',
 *   total: 100,
 *   clean: true,
 * });
 * bar1.start();
 * const bar2 = multi.startBar({
 *   title: 'progress',
 *   total: 100,
 *   clean: true,
 * });
 * bar1.update(10);
 * bar1.tick(10);
 * bar2.update(10);
 * bar2.tick(10);
 * bar2.forceCompleted();
 * ```
 */
export class MultiProgressBar implements IProgressBar {
  title: string;

  headerWidth?: number;
  headerWidthPercentage?: number;

  toBarString: () => string;

  output: ProgressBarOutput;

  static create(options: Partial<MultiProgressBarOptions> = {}) {
    return new MultiProgressBar(options);
  }

  static start(options: Partial<MultiProgressBarOptions> = {}) {
    return new MultiProgressBar(options).start();
  }

  private constructor(options: Partial<MultiProgressBarOptions> = {}) {
    this.title = options.title || 'progress';

    this.headerWidth = options.headerWidth;
    this.headerWidthPercentage = options.headerWidthPercentage;

    const renderer =
      options.render ||
      ((draw: Draw, bar: MultiProgressBar) => draw`${bar.title}`);
    this.toBarString = compile(this, renderer, {
      width: this.headerWidth,
      widthPercentage: this.headerWidthPercentage
    });

    this.output =
      options.output ||
      ProgressBarOutputStream.create({ multiProgressBar: this });
  }

  /**
   * Start render a multiline progress bar
   */
  start() {
    this.render();
    return this;
  }

  /**
   * Create a single progress bar
   */
  createBar(options: Partial<ProgressBarOptions>) {
    const bar = ProgressBar.create({
      ...options,
      multiProgressBar: this
    });
    return bar;
  }

  /**
   * Create a single progress bar and start render
   */
  startBar(options: Partial<ProgressBarOptions>) {
    return this.createBar(options).start();
  }

  render() {
    this.output.output();
  }
}
