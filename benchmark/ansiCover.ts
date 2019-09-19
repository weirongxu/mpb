import { ansiCover } from '../src';
import { testBenchmark } from './common';

testBenchmark('ansiCover', () => {
  ansiCover('========', '%', 'left');
  ansiCover('========', '%', 'right');
  ansiCover('========', '%', 'center');
  ansiCover('========', ' % ', 'left');
  ansiCover('========', ' % ', 'right');
  ansiCover('========', ' % ', 'center');
  ansiCover('========', '   %   ', 'left');
  ansiCover('========', '   %   ', 'right');
  ansiCover('========', '   %   ', 'center');

  ansiCover('========', ' 🎉 ', 'left');
  ansiCover('========', ' 🎉 ', 'right');
  ansiCover('========', ' 🎉 ', 'center');
  ansiCover('========', '  🎉  ', 'left');
  ansiCover('========', '  🎉  ', 'right');
  ansiCover('========', '  🎉  ', 'center');
});
