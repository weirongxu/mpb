import React, { useState } from 'react';
import { render } from 'ink';
import SelectInput from 'ink-select-input';
import { themes } from '../../';
import { useMultiProgressBar } from '../../lib/react-hooks';

function Select(props: { onAdd: () => any; onExit: () => any }) {
  return <SelectInput
    items={[
      {
        label: 'Add',
        value: 'add'
      },
      {
        label: 'Exit',
        value: 'exit'
      }
    ]}
    onSelect={item => (item.value === 'add' ? props.onAdd() : props.onExit())}
  ></SelectInput>;
}

function App() {
  const [Bars, multiBar] = useMultiProgressBar({
    title: 'multi progress'
  });
  const [id, setId] = useState(1);

  return (
    <>
      <Select
        onExit={() => app.unmount()}
        onAdd={() => {
          if (! multiBar) return;
          const bar = multiBar.startBar({
            title: ['✗✗', '进度', '🎉🎉🎉🎉', '😅️😅︎😄😄'][id%4] + ' ' + id,
            clean: true,
            total: 100,
            width: process.stdout.columns!,
            render: [themes.basic, themes.rect, themes.inverse][id % 3],
          });
          setId(id + 1);
          const timer = setInterval(() => {
            bar.tick(1);
          }, 30);
          bar.events.on('complete-post', () => {
            clearInterval(timer);
          });
        }}
      ></Select>
      <Bars />
    </>
  );
}

const app = render(<App />);
