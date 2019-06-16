import { ProgressBar } from '../../';
import { startBarQueue } from './_common';

// fast clean
(function () {
  for (let i = 0; i < 10; ++i) {
    startBarQueue(ProgressBar.create({
      title: `进度_${i+1}`,
      clean: true,
    }), 50);
  }
})();

// fast
(function () {
  for (let i = 0; i < 10; ++i) {
    startBarQueue(ProgressBar.create({
      title: `进度_${i+1}`,
    }), 50);
  }
})();
