import { ProgressBar, chalk } from '../../';
import { startBar } from './_common';
import gradient from 'gradient-string';

const spinner = {
  index: 0,
  frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
};

const bar = ProgressBar.create({
  title: `进度`,
  render: (draw, bar) =>
    draw`${chalk.blue(bar.title)} ${
      chalk.red(spinner.frames[spinner.index])
    } ${draw.extend(
      (bar, width) =>
        gradient('red', 'green', 'blue')(
          draw.toStr(
            bar,
            draw`[${draw.charBar()}]`,
            width
          )
        )
    )} ${chalk.blue(bar.percentage.toString() + '%')}`
});

const timer = setInterval(
  () => (spinner.index = (spinner.index + 1) % spinner.frames.length),
  50
);
bar.events.on('complete-post', () => clearInterval(timer));

startBar(bar, 5);
