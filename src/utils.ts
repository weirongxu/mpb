import { EventEmitter } from 'events';
import stringWidth from 'string-width';
import TypedEmitter from 'typed-emitter';

export const unsigned = (num: number) =>
  typeof num !== 'number' ? 0 : num < 0 ? 0 : Math.floor(num);

export const createEvents = <Events extends any>() => {
  const events = new EventEmitter();
  events.setMaxListeners(0);
  return events as TypedEmitter<Events>;
};

export const toChars = (s: string) => [...s.normalize()];

export const ansiWidth = stringWidth;

const charWidthCache: Record<string, number> = {};
export const charWidth = (s: string) => {
  if (!(s in charWidthCache)) {
    charWidthCache[s] = ansiWidth(s);
  }
  return charWidthCache[s];
};

export const ansiSlice = (
  input: string,
  wideBegin: number = 0,
  wideEnd?: number
) => {
  const chars = toChars(input);
  const charsWidth = chars.map(ch => charWidth(ch));
  let realBegin: number = 0;
  let realEnd: number = input.length;
  let index = unsigned(wideBegin / 2);
  let sum = charsWidth.slice(0, index).reduce((ret, w) => ret + w, 0);
  do {
    if (sum <= wideBegin) {
      realBegin = index;
    }
    if (wideEnd !== undefined) {
      if (sum <= wideEnd) {
        realEnd = index;
      } else {
        break;
      }
    }
    if (index < charsWidth.length) {
      // sum += ansiWidth(chars[index]);
      sum += charsWidth[index];
      index += 1;
    } else {
      break;
    }
  } while (true);
  return chars.slice(realBegin, realEnd).join('');
};

export const ansiRepeat = (char: string, wideWidth: number) =>
  wideWidth <= 0 ? '' : char.repeat(unsigned(wideWidth / ansiWidth(char)));

export const ansiPadStart = (
  line: string,
  wideWidth: number,
  ch: string = ' '
) => ansiRepeat(ch, unsigned(wideWidth - ansiWidth(line))) + line;

export const ansiPadEnd = (line: string, wideWidth: number, ch: string = ' ') =>
  line + ansiRepeat(ch, unsigned(wideWidth - ansiWidth(line)));

export const ansiPadBoth = (
  line: string,
  wideWidth: number,
  ch: string = ' '
) => {
  const remainWidth = Math.max(wideWidth - ansiWidth(line), 0);
  const leftWidth = Math.floor(remainWidth / 2);
  return (
    ansiRepeat(ch, leftWidth) + line + ansiRepeat(ch, remainWidth - leftWidth)
  );
};

export type AlignPostion = 'left' | 'center' | 'right';

export const ansiPadAlign = (
  line: string,
  wideWidth: number,
  position: AlignPostion,
  {
    ch = ' '
  }: {
    ch?: string;
  } = {}
) => {
  switch (position) {
    case 'left':
      return ansiPadEnd(line, wideWidth, ch);
    case 'right':
      return ansiPadStart(line, wideWidth, ch);
    case 'center':
    default:
      return ansiPadBoth(line, wideWidth, ch);
  }
};

export const ansiCover = (
  content: string,
  cover: string,
  position: AlignPostion,
  {
    transparentChar = ' '
  }: {
    transparentChar?: string;
  } = {}
): string => {
  return toChars(
    ansiPadAlign(cover, ansiWidth(content), position, {
      ch: transparentChar
    })
  ).reduce(
    ([offset, result], coverCh): [number, string] => {
      const coverChWidth = ansiWidth(coverCh);
      const contentCh = ansiSlice(content, offset, offset + coverChWidth);
      return [
        offset + coverChWidth,
        result +
          (coverCh === transparentChar
            ? contentCh
            : ansiPadStart(coverCh, ansiWidth(contentCh)))
      ];
    },
    [0, ''] as [number, string]
  )[1];
};
