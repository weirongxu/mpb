import chalk, { Chalk } from 'chalk';
import { IProgressBar } from './interface-progres-bar';
import { ProgressBar } from './progress-bar';
import {
  ansiCover,
  ansiPadEnd,
  ansiRepeat,
  ansiSlice,
  ansiWidth,
  unsigned,
  AlignPostion,
  ansiPadAlign,
  ansiWidthWithCache
} from './utils';

export type ExtendRender = (bar: IProgressBar, width: number) => string;

export class Extend {
  extendRender: ExtendRender;

  constructor(render: ExtendRender) {
    this.extendRender = render;
  }
}

export type DrawPart = string | number | Extend;

export interface CharBarOptions {
  /**
   * @default '='
   */
  complete: string;
  /**
   * @default '>'
   */
  completeTop: string;
  /**
   * @default ' '
   */
  incomplete: string;
  content: DrawPart | DrawPart[];
}

export interface ColorBarOptions {
  /**
   * @default `inverse`
   */
  completeChalk: Chalk;
  /**
   * @default `null`
   */
  incompleteChalk: Chalk;
  content: DrawPart | DrawPart[];
}

export interface ExtendOptions {
  content: DrawPart | DrawPart[];
}

export interface AlignOptions {
  align: AlignPostion;
  content: string | number;
}

export interface Draw {
  (strings: TemplateStringsArray, ...args: DrawPart[]): DrawPart[];

  extend(render?: ExtendRender): Extend;

  toStr(
    bar: IProgressBar,
    drawable: DrawPart | DrawPart[],
    width: number
  ): string;

  charBar(options?: Partial<CharBarOptions>): Extend;
  colorBar(options?: Partial<ColorBarOptions>): Extend;
  repeat(options?: Partial<ExtendOptions>): Extend;
  align(options?: Partial<AlignOptions>): Extend;
}

export const draw: Draw = (strings, ...args) => {
  const parts: DrawPart[] = [];
  strings.forEach(s => {
    parts.push(s);
    parts.push(args.shift()!);
  });
  return parts;
};

draw.extend = (render?: ExtendRender) => {
  return new Extend(render || ((_bar, width) => ' '.repeat(width)));
};

draw.toStr = (bar, drawable, width) => {
  const drawParts = (Array.isArray(drawable) ? drawable : [drawable])
    .filter(part => part)
    .map(part => (typeof part === 'number' ? part.toString() : part));

  const occupiedWidth = drawParts
    .map(part => (typeof part === 'string' ? ansiWidth(part) : 0))
    .reduce((ret, v) => ret + v, 0);
  const remainWidth = width - occupiedWidth;

  const extendCount = drawParts.filter(part => part instanceof Extend).length;
  const subWidth = Math.floor(remainWidth / extendCount);

  let subRemainder = remainWidth % extendCount;
  return drawParts
    .map(part => {
      if (typeof part === 'string') {
        return part;
      } else {
        if (subRemainder > 0) {
          subRemainder -= 1;
          return part.extendRender(bar, subWidth + 1);
        } else {
          return part.extendRender(bar, subWidth);
        }
      }
    })
    .join('');
};

draw.charBar = (options_ = {}) => {
  const options: Required<CharBarOptions> = Object.assign(
    {
      complete: '=',
      completeTop: '>',
      incomplete: ' ',
      content: []
    },
    options_
  );
  if (options_.complete && !options_.completeTop) {
    options.completeTop = options_.complete;
  }
  return draw.extend((bar, width) => {
    if (width <= 0) return '';
    if (!(bar instanceof ProgressBar)) return '';

    const completedWidth = unsigned((width * bar.percentage) / 100);

    let barComplete = ansiRepeat(options.complete, completedWidth);
    if (!bar.completed && options.completeTop !== options.complete) {
      const topWidth = ansiWidthWithCache(options.completeTop);
      const completeTopStartIndex = Math.max(0, topWidth - completedWidth);
      const completeTop = ansiSlice(
        options.completeTop,
        completeTopStartIndex,
        topWidth
      );
      barComplete =
        ansiSlice(
          barComplete,
          0,
          completedWidth - topWidth + completeTopStartIndex
        ) + completeTop;
    }

    const incompleteWidth = unsigned(width - ansiWidth(barComplete));

    const barChars =
      barComplete + ansiRepeat(options.incomplete, incompleteWidth);
    const content = draw.toStr(bar, options.content, width);
    if (content.length > 0) {
      return ansiCover(barChars, content, 'left');
    } else {
      return barChars;
    }
  });
};

draw.colorBar = (options_ = {}) => {
  const options: Required<ColorBarOptions> = Object.assign(
    {
      completeChalk: chalk.inverse,
      incompleteChalk: chalk,
      content: []
    },
    options_
  );

  return draw.extend((bar, width) => {
    if (width <= 0) return '';
    if (!(bar instanceof ProgressBar)) return '';

    const content = draw.toStr(bar, options.content, width);
    const completedWidth = unsigned(
      (ansiWidth(content) * bar.percentage) / 100
    );

    return (
      options.completeChalk(ansiSlice(content, 0, completedWidth)) +
      options.incompleteChalk(ansiSlice(content, completedWidth))
    );
  });
};

draw.repeat = (options_ = {}) => {
  const options: Required<ExtendOptions> = Object.assign(
    {
      content: ' '
    },
    options_
  );
  return draw.extend((bar, width) => {
    if (width <= 0) return '';

    const content = draw.toStr(bar, options.content, width);
    const finalWidth = Math.floor(width / content.length);
    return ansiPadEnd(ansiRepeat(content, finalWidth), finalWidth);
  });
};

draw.align = (options_ = {}) => {
  const options: Required<AlignOptions> = Object.assign(
    {
      align: 'center',
      content: ''
    },
    options_
  );
  return draw.extend((_bar, width) => {
    if (width <= 0) return '';

    const content = options.content.toString();
    if (content.length === 0) {
      return ' '.repeat(width);
    } else {
      return ansiPadAlign(content, width, options.align);
    }
  });
};

export type DrawRender<P extends IProgressBar> = (
  draw: Draw,
  bar: P
) => DrawPart | DrawPart[];

export function compile<P extends IProgressBar>(
  bar: P,
  drawRender: DrawRender<P>,
  options: {
    width?: number;
    widthPercentage?: number;
  }
) {
  const render = (width: number): string => {
    return draw.toStr(bar, drawRender(draw, bar), width);
  };
  return () => {
    const outputWidth = bar.output.outputWidth;

    let finalWidth: number;
    if (outputWidth !== undefined) {
      if (options.width !== undefined) {
        finalWidth = options.width;
      } else if (options.widthPercentage !== undefined) {
        finalWidth = unsigned((outputWidth * options.widthPercentage) / 100);
      } else {
        finalWidth = outputWidth;
      }
      finalWidth = Math.min(outputWidth, finalWidth);
    } else {
      finalWidth = options.width !== undefined ? options.width : 0;
    }

    return ansiPadEnd(render(finalWidth), finalWidth);
  };
}
