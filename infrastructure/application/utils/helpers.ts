export const getJavaOpts = (containerMemoryMb: number): string => {
  // max heap size for JVM should be no more than half total container memory, and a multiple of 1024M
  const halvedHeapSize = Math.floor(containerMemoryMb / 2);
  const maxHeapSizeGb = Math.floor(halvedHeapSize / 1024) || 1;
  return `-Xmx${maxHeapSizeGb}g`
}
