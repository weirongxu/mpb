import { MultiProgressBar, ProgressBar } from '../../';
import { startBar } from './_common';

const m = MultiProgressBar.create();

// fast
(function() {
  const allBars: ProgressBar[] = [];
  const finish = () => {
    const nextBar = allBars.shift();
    if (nextBar) {
      startBar(nextBar, 20, 100);
    }
  };
  for (let i = 0; i < 100; ++i) {
    allBars.push(
      m.createBar({
        title: `进度 🎉🎉  ${i + 1}`,
        clean: true,
        onCompleted: finish
      })
    );
  }
  for (let i = 0; i < 5; ++i) {
    startBar(allBars.shift()!, 20, 100);
  }
})();

startBar(
  m.createBar({
    title: '进度1',
    total: 100,
    widthPercentage: 50
  }),
  1
);

// auto remove
startBar(
  m.createBar({
    title: '进度2',
    total: 100,
    clean: true,
    render: (draw, bar) =>
      draw`${bar.title} [${draw.charBar({
        complete: '=',
        completeTop: 'o>',
        incomplete: '-',
      })}] USED: ${bar.elapsedHuman} | ETA: ${bar.etaHuman}`
  }),
  2
);

// dynamic add
setTimeout(() => {
  startBar(
    m.createBar({
      title: '进度3',
      render: (draw, bar) =>
        draw`${bar.title} [${draw.charBar({
          complete: '▇',
          incomplete: '—'
        })}] ${bar.percentage} | USED: ${bar.elapsedHuman} | ETA: ${
          bar.etaHuman
        }`
    }),
    2
  );
}, 200);

// dynamic add
setTimeout(() => {
  startBar(
    m.createBar({
      title: '进度4',
      render: (draw, bar) =>
        draw`${bar.title} [${draw.charBar({
          content: draw`${draw.extend()}百分比${bar.percentage}${draw.extend()}`
        })}] USED: ${bar.elapsedHuman} | ETA: ${bar.etaHuman}`
    }),
    1
  );
}, 1000);

// colorBar add
setTimeout(() => {
  startBar(
    m.createBar({
      title: '进度5',
      render: (draw, bar) =>
        draw.colorBar({
          content: draw`[${bar.title}${draw.extend()}progress${draw.extend()}${
            bar.percentage
          }% | USED: ${bar.elapsedHuman} | ETA: ${bar.etaHuman}]`
        })
    }),
    1
  );
}, 1000);

// slow
startBar(
  m.createBar({
    title: '进度6'
  }),
  50,
  5000
);
