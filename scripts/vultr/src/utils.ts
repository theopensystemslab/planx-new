export const sleep = (durationMs: number) => new Promise(
    res => setTimeout(res, durationMs))

export const getDurationSeconds = (
    startTimeMs: number,
    endTimeMs: number,
): number => {
    return (endTimeMs - startTimeMs) / 1000
}