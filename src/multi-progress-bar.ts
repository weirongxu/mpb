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

    const renderer = options.render ||
      ((draw: Draw, bar: MultiProgressBar) => draw`${bar.title}`);
    this.toBarString = compile(this, renderer, {
      width: this.headerWidth,
      widthPercentage: this.headerWidthPercentage
    });

    this.output =
      options.output || ProgressBarOutputStream.create({ multiProgressBar: this });
  }

  start() {
    this.render();
    return this;
  }

  createBar(options: Partial<ProgressBarOptions>) {
    const bar = ProgressBar.create({
      ...options,
      multiProgressBar: this
    });
    return bar;
  }

  startBar(options: Partial<ProgressBarOptions>) {
    return this.createBar(options).start();
  }

  render() {
    this.output.output();
  }
}
