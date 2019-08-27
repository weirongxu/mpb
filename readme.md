# MultiProgressBar

Flexible progress bar for terminal

[![Build Status](https://travis-ci.com/weirongxu/mpb.svg?branch=master)](https://travis-ci.com/weirongxu/mpb)

## Features
* custom template
* render progress bar to buffer
* use [react-hooks](https://reactjs.org/docs/hooks-intro.html) in [ink](https://github.com/vadimdemedes/ink)

## Examples

Multiple progress bar
```javascript
import { MultiProgressBar } from 'mpb';

const multi = MultiProgressBar.create({
  title: 'progress'
});

const bar = multi.createBar({
  title: 'bar 1'
});

const timer = setInterval(() => {
  bar.tick(1);
}, 100);

bar.events.on('complete-post', () => {
  clearInterval(timer);
});


const bar2 = multi.createBar({
  title: 'bar 2',
  clean: true
});

const timer2 = setInterval(() => {
  bar2.tick(1);
}, 50);

bar2.events.on('complete-post', () => {
  clearInterval(timer2);
});
```

Single progress bar
```javascript
import { ProgressBar } from 'mpb';

const bar = ProgressBar.create({
  title: 'progress'
});

const timer = setInterval(() => {
  bar.tick(1);
}, 100);

bar.events.on('complete-post', () => {
  clearInterval(timer);
});
```

Use the theme
```javascript
import { ProgressBar, themes } from 'mpb';

ProgressBar.create({
  title: 'progress',
  render: themes.inverse,
});
```

[Custom render](./examples/src/custom-render.ts)

[more examples](./examples/src)

## Screenshot
### [Single progress bar](./examples/src/single.ts)
[![Single progress bar](https://asciinema.org/a/EZvZHrH81HOSHkx9PyqRLmmLN.svg)](https://asciinema.org/a/EZvZHrH81HOSHkx9PyqRLmmLN)

### [Multiple progress bar](./examples/src/multi.ts)
[![Multiple progress bar](https://asciinema.org/a/1zVuA9veknBZqJC2pbxfCC7sw.svg)](https://asciinema.org/a/1zVuA9veknBZqJC2pbxfCC7sw)

### [Custom render](./examples/src/custom-token.ts)
[![Custom render](https://asciinema.org/a/ZKsTed0tCoPAgdTQfevhhiSf0.svg)](https://asciinema.org/a/ZKsTed0tCoPAgdTQfevhhiSf0)

### [Progress bar width logger](./examples/src/buffer-with-logger.ts)
[![Progress bar width logger](https://asciinema.org/a/EGFHdeKK4SbTMoK6KvgStuELP.svg)](https://asciinema.org/a/EGFHdeKK4SbTMoK6KvgStuELP)

## Run examples
```sh
yarn build
cd examples
yarn
ts-node src/multi.ts
```

## [API docs](https://weirongxu.github.io/mpb/)
