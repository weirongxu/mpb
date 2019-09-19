import { draw, compile, DrawRender } from '../src/draw';
import { ProgressBar, ProgressBarOptions } from '../src/progress-bar';
import { ansiPadEnd } from '../src/utils';
import chalk from 'chalk';
import { ProgressBarOutputNoop } from '../src/output';

const compileBar = (
  bar: ProgressBar,
  drawRender: DrawRender<ProgressBar>,
  width: number
) =>
  compile(bar, drawRender, {
    width
  })();

const createBar = (options: Partial<ProgressBarOptions>) =>
  ProgressBar.create({
    ...options,
    output: ProgressBarOutputNoop.create(),
  });

test('compile base', () => {
  expect(
    compileBar(
      createBar({ title: 'name' }),
      (draw, bar) => draw`${bar.title} ${bar.title}`,
      0
    )
  ).toEqual('name name');

  const bar = createBar({ title: 'name' });
  bar.title = 'token name';
  expect(
    compileBar(bar, (draw, bar) => draw`${bar.title} ${bar.title}`, 0)
  ).toEqual('token name token name');

  expect(
    compileBar(
      createBar({
        title: 'test',
        current: 10,
        total: 100
      }),
      (draw, bar) =>
        draw`${bar.title} ${bar.current} ${bar.total} ${bar.percentage}`,
      20
    )
  ).toEqual('test 10 100 10      ');
});

test('compile extend', () => {
  expect(
    compileBar(
      createBar({ title: 'name' }),
      (draw, bar) => draw`${bar.title} [${draw.repeat({ content: draw`-` })}]`,
      10
    )
  ).toEqual('name [---]');

  const bar = createBar({ title: 'name' });
  const block = (s: string) =>
    draw.extend((_bar, width) => ansiPadEnd('custom' + s, width));
  expect(
    compileBar(bar, (draw, bar) => draw`${bar.title} [${block('=')}]`, 18)
  ).toEqual('name [custom=    ]');
});

test('compile charBar', () => {
  let render: DrawRender<ProgressBar> = (draw, bar) =>
    draw`[${draw.charBar()}] ${bar.title}`;
  expect(compileBar(createBar({ title: 'name' }), render, 10)).toEqual(
    '[   ] name'
  );
  expect(
    compileBar(createBar({ title: 'name', current: 50 }), render, 10)
  ).toEqual('[>  ] name');
  expect(
    compileBar(createBar({ title: 'name', current: 67 }), render, 10)
  ).toEqual('[=> ] name');
  expect(
    compileBar(createBar({ title: 'name', current: 100 }), render, 10)
  ).toEqual('[===] name');
  
  render = (draw, bar) => draw`[${draw.charBar()}] ${bar.title}`;
  expect(compileBar(createBar({ title: 'name' }), render, 11)).toEqual(
    '[    ] name'
  );
  expect(
    compileBar(createBar({ title: 'name', current: 25 }), render, 11)
  ).toEqual('[>   ] name');
  expect(
    compileBar(createBar({ title: 'name', current: 50 }), render, 11)
  ).toEqual('[=>  ] name');
  expect(
    compileBar(createBar({ title: 'name', current: 75 }), render, 11)
  ).toEqual('[==> ] name');
  expect(
    compileBar(createBar({ title: 'name', current: 100 }), render, 11)
  ).toEqual('[====] name');
  
  render = (draw, bar) =>
    draw`${bar.title} [${draw.charBar({
      complete: '=',
      completeTop: 'o>',
      incomplete: ' '
    })}]`;
  expect(
    compileBar(createBar({ title: 'name', current: 0 }), render, 11)
  ).toEqual('name [    ]');
  expect(
    compileBar(createBar({ title: 'name', current: 40 }), render, 11)
  ).toEqual('name [>   ]');
  expect(
    compileBar(createBar({ title: 'name', current: 70 }), render, 11)
  ).toEqual('name [o>  ]');
  expect(
    compileBar(createBar({ title: 'name', current: 100 }), render, 11)
  ).toEqual('name [====]');

  render = (draw, bar) =>
    draw`${bar.title} [${draw.charBar({
      complete: '：',
      completeTop: '》',
      incomplete: ' '
    })}]`;
  expect(
    compileBar(createBar({ title: 'name', current: 0 }), render, 15)
  ).toEqual('name [        ]');
  expect(
    compileBar(createBar({ title: 'name', current: 40 }), render, 15)
  ).toEqual('name [》      ]');
  expect(
    compileBar(createBar({ title: 'name', current: 70 }), render, 15)
  ).toEqual('name [：》    ]');
  expect(
    compileBar(createBar({ title: 'name', current: 100 }), render, 15)
  ).toEqual('name [：：：：]');

  render = (draw, bar) =>
    draw`${bar.title} [${draw.charBar({
      complete: '：',
      completeTop: '》',
      incomplete: ' ',
      content: draw.align({align: 'center', content: '%'})
    })}]`;
  expect(
    compileBar(createBar({ title: 'name', current: 0 }), render, 15)
  ).toEqual('name [   %    ]');
  expect(
    compileBar(createBar({ title: 'name', current: 40 }), render, 15)
  ).toEqual('name [》 %    ]');
  expect(
    compileBar(createBar({ title: 'name', current: 70 }), render, 15)
  ).toEqual('name [： %    ]');
  expect(
    compileBar(createBar({ title: 'name', current: 100 }), render, 15)
  ).toEqual('name [： %：：]');
});

test('compile colorBar', () => {
  const render: DrawRender<ProgressBar> = (draw, bar) =>
    draw`[${draw.colorBar({
      content: draw`${bar.title}${draw.extend()}`
    })}]`;
  const bar = createBar({
    title: 'color',
    output: ProgressBarOutputNoop.create()
  });
  expect(compileBar(bar, render, 10)).toEqual('[color   ]');
  bar.update(20);
  expect(compileBar(bar, render, 10)).toEqual(`[${chalk.inverse('c')}olor   ]`);
  bar.update(50);
  expect(compileBar(bar, render, 10)).toEqual(`[${chalk.inverse('colo')}r   ]`);
  bar.update(80);
  expect(compileBar(bar, render, 10)).toEqual(`[${chalk.inverse('color ')}  ]`);
  bar.update(100);
  expect(compileBar(bar, render, 10)).toEqual(`[${chalk.inverse('color   ')}]`);
});
