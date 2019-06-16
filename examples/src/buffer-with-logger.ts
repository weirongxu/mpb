import { MultiProgressBar, ProgressBarOutputBuffer } from '../../';
import readline from 'readline';
import { startBar } from './_common';

let loggerContents = "";
let lastOutputHeight = 0

function info(content: string) {
  loggerContents += content + '\r\n';
}

const output = ProgressBarOutputBuffer.create(50);

output.events.on('output-post', () => {
  readline.moveCursor(process.stdout, 0, -lastOutputHeight);
  readline.cursorTo(process.stdout, 0);
  readline.clearScreenDown(process.stdout);

  const line = loggerContents + output.buffer;
  lastOutputHeight = (line.match(/\n/g) || []).length
  process.stderr.write(line);
});

const m = MultiProgressBar.create({
  output,
});

info('logger line')
info('logger line2')

startBar(m.createBar({
  title: 'buf1',
}), 10);

startBar(m.createBar({
  title: 'buf2',
}), 10);
