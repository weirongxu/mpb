import { ProgressBar } from './progress-bar';
import { Draw } from './draw';

const detail = (bar: ProgressBar) =>
  [
    `${bar.percentage}%`,
    `USED: ${bar.elapsedHuman}`,
    `ETA: ${bar.etaHuman}`
  ].join(' | ');

export const themes = {
  /**
   * basic [=========>          ] 50% | USED 1m10s | ETA 1m20s
   */
  basic: (draw: Draw, bar: ProgressBar) =>
    draw`${bar.title} [${draw.charBar({
      completeTop: '>',
      complete: '=',
      incomplete: ' '
    })}] ${detail(bar)}`,
  /**
   * rect [▇▇▇▇▇▇▇▇▇▇——————————] 50% | USED 1m10s | ETA 1m20s
   */
  rect: (draw: Draw, bar: ProgressBar) =>
    draw`${bar.title} [${draw.charBar({
      complete: '▇',
      incomplete: '—'
    })}] ${detail(bar)}`,
  /**
   * Use inverse background as progress bar
   */
  inverse: (draw: Draw, bar: ProgressBar) =>
    draw.colorBar({
      content: draw`[${bar.title}${draw.repeat()}${detail(bar)}]`
    })
};
