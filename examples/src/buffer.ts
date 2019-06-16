import { MultiProgressBar, ProgressBarOutputBuffer } from '../../';
import { startBar } from './_common';

const output = ProgressBarOutputBuffer.create(50);

output.events.on('output-post', () => {
  console.error(output.buffer);
  console.error('-'.repeat(30));
});

const m = MultiProgressBar.create({
  output,
});

startBar(m.createBar({
  title: 'buf1',
  clean: true,
}), 10);

startBar(m.createBar({
  title: 'buf2',
}), 5);
