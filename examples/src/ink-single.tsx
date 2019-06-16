import React, { useEffect } from 'react';
import { render, Text, Color } from 'ink';
import { useProgressBar } from '../../lib/react-hooks';

function App() {
  const title = 'ink single';

  const [Bar, bar] = useProgressBar({
    title: 'progress',
    width: process.stdout.columns! - title.length - 1,
    total: 100,
  });

  useEffect(() => {
    if (! bar) return;

    bar.events.on('complete-post', () => {
      app.unmount();
    });

    const timer = setInterval(() => {
      bar.tick(1);
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, [bar]);

  return <Text><Color blue>{title}</Color> <Bar/></Text>;
}

const app = render(<App />);
