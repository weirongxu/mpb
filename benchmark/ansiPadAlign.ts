import { ansiPadAlign } from '../src';
import {testBenchmark} from './common';

testBenchmark('ansiCover', () => {
  ansiPadAlign('🎉', 6, 'left');
  ansiPadAlign('🎉', 6, 'right');
  ansiPadAlign('🎉', 6, 'center');

  ansiPadAlign('🎉', 4, 'left');
  ansiPadAlign('🎉', 4, 'right');
  ansiPadAlign('🎉', 4, 'center');

  ansiPadAlign('🎉', 3, 'left');
  ansiPadAlign('🎉', 3, 'right');
  ansiPadAlign('🎉', 3, 'center');

  ansiPadAlign('🎉', 2, 'left');
  ansiPadAlign('🎉', 2, 'right');
  ansiPadAlign('🎉', 2, 'center');

  ansiPadAlign('🎉', 1, 'left');
  ansiPadAlign('🎉', 1, 'right');
  ansiPadAlign('🎉', 1, 'center');
});
