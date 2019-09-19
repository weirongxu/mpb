import Benchmark from 'benchmark';

export function testBenchmark(name: string, test: () => void) {
  const bench = new Benchmark(name, test);

  bench.run();

  console.log(name);
  console.log('The number of times a test was executed:', bench.count);
  console.log('The number of executions per second:', bench.hz);
  console.log('The margin of error:', bench.stats.moe);
  console.log('The sample variance:', bench.stats.variance);
}
