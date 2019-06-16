import { ProgressBar } from '../../';

export const startBar = (bar: ProgressBar, tick: number, interval = 100) => {
  bar.start();
  const timer = setInterval(() => {
    if (!bar.completed) {
      bar.tick(tick);
    } else {
      clearInterval(timer);
    }
  }, interval);
};

const barQueue: ProgressBar[] = [];
let startedQueue = false;

export const startBarQueue = (bar: ProgressBar, tick: number, interval = 100) => {
  barQueue.push(bar);
  if (!startedQueue) {
    startedQueue = true;
    const runBar = () => {
      const bar = barQueue.shift();
      if (! bar) {
        startedQueue = false;
        return;
      };
      bar.start();
      bar.events.on('complete-post', () => {
        runBar();
      });
      const timer = setInterval(() => {
        if (!bar.completed) {
          bar.tick(tick);
        } else {
          clearInterval(timer);
        }
      }, interval);
    };
    runBar();
  }
};
