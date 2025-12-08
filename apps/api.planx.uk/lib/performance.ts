import { performance } from "perf_hooks";

export const logDuration = async <T>(
  label: string,
  fn: () => Promise<T> | T,
): Promise<T> => {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const duration = performance.now() - start;
    console.log(
      JSON.stringify({ metric: label, duration: duration.toFixed(2) + "ms" }),
    );
  }
};
