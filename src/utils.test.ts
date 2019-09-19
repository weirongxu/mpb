import {
  ansiPadEnd,
  unsigned,
  ansiRepeat,
  ansiPadBoth,
  ansiPadAlign,
  ansiSlice,
  ansiCover,
  ansiWidth,
  removeEmojiPresentation
} from '../src/utils';

test('unsigned', () => {
  expect(unsigned(-1)).toEqual(0);
  expect(unsigned(0)).toEqual(0);
  expect(unsigned(1)).toEqual(1);
  expect(unsigned(1.8)).toEqual(1);
});

test('ansiWidth', () => {
  expect(ansiWidth(removeEmojiPresentation('😅️'))).toEqual(2);
  expect(ansiWidth(removeEmojiPresentation('😅︎'))).toEqual(2);
  expect(ansiWidth('👪')).toEqual(2);
  expect(ansiWidth('👨‍👩‍👧')).toEqual(2);
});

test('ansiSlice', () => {
  expect(ansiSlice('一一', 0, 4)).toEqual('一一');
  expect(ansiSlice('一一', 0, 3)).toEqual('一');
  expect(ansiSlice('一一', 0, 2)).toEqual('一');
  expect(ansiSlice('一一', 0, 1)).toEqual('');
  expect(ansiSlice('一一', 0, 0)).toEqual('');

  expect(ansiSlice('🎉🎉', 0, 4)).toEqual('🎉🎉');
  expect(ansiSlice('🎉🎉', 0, 3)).toEqual('🎉');
  expect(ansiSlice('🎉🎉', 0, 2)).toEqual('🎉');
  expect(ansiSlice('🎉🎉', 0, 1)).toEqual('');
  expect(ansiSlice('🎉🎉', 0, 0)).toEqual('');
});

test('ansiRepeat', () => {
  expect(ansiRepeat('🎉', 6)).toEqual('🎉🎉🎉');
  expect(ansiRepeat('🎉', 4)).toEqual('🎉🎉');
  expect(ansiRepeat('🎉', 3)).toEqual('🎉');
  expect(ansiRepeat('🎉', 1)).toEqual('');
  expect(ansiRepeat('🎉', 0)).toEqual('');
});

test('ansiPadEnd', () => {
  expect(ansiPadEnd('🎉str', 10)).toEqual('🎉str     ');
});

test('ansiPadBoth', () => {
  expect(ansiPadBoth('🎉', 6)).toEqual('  🎉  ');
  expect(ansiPadBoth('🎉', 4)).toEqual(' 🎉 ');
  expect(ansiPadBoth('🎉', 3)).toEqual('🎉 ');
  expect(ansiPadBoth('🎉', 1)).toEqual('🎉');
  expect(ansiPadBoth('🎉', 0)).toEqual('🎉');
});

test('ansiPadAlign', () => {
  expect(ansiPadAlign('🎉', 6, 'left')).toEqual('🎉    ');
  expect(ansiPadAlign('🎉', 6, 'right')).toEqual('    🎉');
  expect(ansiPadAlign('🎉', 6, 'center')).toEqual('  🎉  ');

  expect(ansiPadAlign('🎉', 4, 'left')).toEqual('🎉  ');
  expect(ansiPadAlign('🎉', 4, 'right')).toEqual('  🎉');
  expect(ansiPadAlign('🎉', 4, 'center')).toEqual(' 🎉 ');

  expect(ansiPadAlign('🎉', 3, 'left')).toEqual('🎉 ');
  expect(ansiPadAlign('🎉', 3, 'right')).toEqual(' 🎉');
  expect(ansiPadAlign('🎉', 3, 'center')).toEqual('🎉 ');

  expect(ansiPadAlign('🎉', 2, 'left')).toEqual('🎉');
  expect(ansiPadAlign('🎉', 2, 'right')).toEqual('🎉');
  expect(ansiPadAlign('🎉', 2, 'center')).toEqual('🎉');

  expect(ansiPadAlign('🎉', 1, 'left')).toEqual('🎉');
  expect(ansiPadAlign('🎉', 1, 'right')).toEqual('🎉');
  expect(ansiPadAlign('🎉', 1, 'center')).toEqual('🎉');
});

test('ansiCover', () => {
  expect(ansiCover('========', '%', 'left')).toEqual('%=======');
  expect(ansiCover('========', '%', 'right')).toEqual('=======%');
  expect(ansiCover('========', '%', 'center')).toEqual('===%====');
  expect(ansiCover('========', ' % ', 'left')).toEqual('=%======');
  expect(ansiCover('========', ' % ', 'right')).toEqual('======%=');
  expect(ansiCover('========', ' % ', 'center')).toEqual('===%====');
  expect(ansiCover('========', '   %   ', 'left')).toEqual('===%====');
  expect(ansiCover('========', '   %   ', 'right')).toEqual('====%===');
  expect(ansiCover('========', '   %   ', 'center')).toEqual('===%====');

  expect(ansiCover('========', ' 🎉 ', 'left')).toEqual('=🎉=====');
  expect(ansiCover('========', ' 🎉 ', 'right')).toEqual('=====🎉=');
  expect(ansiCover('========', ' 🎉 ', 'center')).toEqual('===🎉===');
  expect(ansiCover('========', '  🎉  ', 'left')).toEqual('==🎉====');
  expect(ansiCover('========', '  🎉  ', 'right')).toEqual('====🎉==');
  expect(ansiCover('========', '  🎉  ', 'center')).toEqual('===🎉===');
});
