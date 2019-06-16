import React, { useState, useEffect } from 'react';
import { Text } from 'ink';
import { ProgressBar, ProgressBarOptions } from './progress-bar';
import {
  MultiProgressBarOptions,
  MultiProgressBar
} from './multi-progress-bar';
import { ProgressBarOutputNoop } from './output';

export function useProgressBar(
  options: Partial<ProgressBarOptions> = {}
): [() => JSX.Element, ProgressBar | undefined] {
  const [bar, setBar] = useState<ProgressBar>();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setBar(
      ProgressBar.create(
        Object.assign(
          {
            output: ProgressBarOutputNoop.create()
          },
          options
        )
      )
    );
  }, []);

  useEffect(() => {
    if (bar) {
      const listener = () => setTick(tick + 1);
      bar.output.events.on('output-post', listener);
      return () => {
        bar.output.events.removeListener('output-post', listener);
      };
    }
  }, [bar, tick]);

  return [() => <>{bar ? bar.toBarString() : ''}</>, bar];
}

export function useMultiProgressBar(
  options: Partial<MultiProgressBarOptions> = {}
): [() => JSX.Element, MultiProgressBar | undefined] {
  const [multiBar] = useState<MultiProgressBar>(
    MultiProgressBar.create(
      Object.assign(
        {
          output: ProgressBarOutputNoop.create()
        },
        options
      )
    )
  );
  const [startedbars, setStartedBars] = useState<ProgressBar[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (multiBar) {
      const addBarListener = (bar: ProgressBar) => {
        bar.events.on('start-post', () => {
          setStartedBars([...startedbars, bar]);
        });
      };
      const removeBarListener = () => {
        setStartedBars([...multiBar.output.bars]);
      };
      multiBar.output.events.on('add-bar-post', addBarListener);
      multiBar.output.events.on('remove-bar-post', removeBarListener);

      const outputListener = () => setTick(tick + 1);
      multiBar.output.events.on('output-post', outputListener);

      return () => {
        multiBar.output.events.removeListener('add-bar-post', addBarListener);
        multiBar.output.events.removeListener(
          'remove-bar-post',
          removeBarListener
        );
        multiBar.output.events.removeListener('output-post', outputListener);
      };
    }
  }, [multiBar, tick]);

  return [
    () => (
      <>
        <Text>{multiBar ? multiBar.toBarString() : ''}</Text>
        {startedbars.map((bar, index) => (
          <Text key={index}>{bar.toBarString()}</Text>
        ))}
      </>
    ),
    multiBar
  ];
}
