import { ansiSlice } from '../src';
import { testBenchmark } from './common';

testBenchmark('ansiCover', () => {
  ansiSlice('一一', 0, 4);
  ansiSlice('一一', 0, 3);
  ansiSlice('一一', 0, 2);
  ansiSlice('一一', 0, 1);
  ansiSlice('一一', 0, 0);

  ansiSlice('🎉🎉', 0, 4);
  ansiSlice('🎉🎉', 0, 3);
  ansiSlice('🎉🎉', 0, 2);
  ansiSlice('🎉🎉', 0, 1);
  ansiSlice('🎉🎉', 0, 0);
});
