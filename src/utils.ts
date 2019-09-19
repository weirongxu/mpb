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

export const emojiPresentationRegex = /\u{FE0F}|\u{FE0E}/gu;

export const removeEmojiPresentation = (s: string) =>
  s.replace(emojiPresentationRegex, '');

export const toChars = (s: string) => [...s.normalize()];

export const ansiWidth = (s: string) => {
  let width = 0;
  return width + stringWidth(s);
};

const ansiWidthCached: Record<string, number> = {};
export const ansiWidthWithCache = (s: string) => {
  if (!(s in ansiWidthCached)) {
    ansiWidthCached[s] = ansiWidth(s);
  }
  return ansiWidthCached[s];
};

const ansiSliceCore = (
  input: string,
  wideBegin: number = 0,
  wideEnd?: number
): [string[], number, number | undefined] => {
  const chars = toChars(input);
  if (wideEnd === 0) {
    return [chars, 0, 0];
  }
  const charsWidth = chars.map(ch => ansiWidthWithCache(ch));
  let realBegin: number = 0;
  let realEnd: number = input.length;
  let index = unsigned(wideBegin / 2);
  let wideIndex = charsWidth.slice(0, index).reduce((ret, w) => ret + w, 0);
  while (true) {
    if (wideIndex <= wideBegin) {
      realBegin = index;
    }
    if (wideEnd !== undefined) {
      if (wideIndex <= wideEnd) {
        realEnd = index;
      } else {
        break;
      }
    }
    if (index < charsWidth.length) {
      wideIndex += charsWidth[index];
      index += 1;
    } else {
      break;
    }
  }
  return [chars, realBegin, realEnd];
};

export const ansiSlice = (
  input: string,
  wideBegin: number = 0,
  wideEnd?: number
) => {
  const [chars, realBegin, realEnd] = ansiSliceCore(input, wideBegin, wideEnd);
  return chars.slice(realBegin, realEnd).join('');
};

const ansiSliceWithRemain = (
  input: string,
  wideBegin: number = 0,
  wideEnd?: number
): [string, string] => {
  const [chars, realBegin, realEnd] = ansiSliceCore(input, wideBegin, wideEnd);
  return [
    chars.slice(realBegin, realEnd).join(''),
    chars.slice(realEnd).join('')
  ];
};

export const ansiRepeat = (char: string, wideWidth: number) =>
  wideWidth <= 0
    ? ''
    : char.repeat(unsigned(wideWidth / ansiWidthWithCache(char)));

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
  const leftWidth = unsigned(remainWidth / 2);
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

const leftCount = (s: string, ch: string): [number, string] => {
  let count = 0;
  while (true) {
    if (s.startsWith(ch)) {
      count += 1;
      s = s.slice(ch.length);
    } else {
      return [count, s];
    }
  }
};

const rightCount = (s: string, ch: string): [number, string] => {
  let count = 0;
  while (true) {
    if (s.endsWith(ch)) {
      count += 1;
      s = s.slice(0, s.length - ch.length);
    } else {
      return [count, s];
    }
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
  const wideWidth = ansiWidth(content);
  const transparentCharWidth = ansiWidthWithCache(transparentChar);
  let coverLeftTransparentWidth: number, coverRightTransparentWidth: number;
  [coverLeftTransparentWidth, cover] = leftCount(cover, transparentChar);
  [coverRightTransparentWidth, cover] = rightCount(cover, transparentChar);
  const coverWideWidth = ansiWidthWithCache(cover);
  const remainWidth = wideWidth - coverWideWidth;
  const leftWidth =
    position === 'center'
      ? unsigned(remainWidth / 2)
      : position === 'left'
      ? coverLeftTransparentWidth
      : remainWidth - coverRightTransparentWidth;

  let remainContent = content;
  let finalContent = '';
  [finalContent, remainContent] = ansiSliceWithRemain(remainContent, 0, leftWidth);
  finalContent = ansiPadEnd(finalContent, leftWidth, transparentChar);

  const coverChars = toChars(cover);
  for (let i = 0; i < coverChars.length; i++) {
    const coverChar = coverChars[i];
    if (coverChar === transparentChar) {
      let t: string;
      [t, remainContent] = ansiSliceWithRemain(
        remainContent,
        0,
        transparentCharWidth
      );
      finalContent += t;
    } else {
      finalContent += coverChar;
      remainContent = remainContent.slice(ansiWidthWithCache(coverChar));
    }
  }
  return finalContent + remainContent;
};
