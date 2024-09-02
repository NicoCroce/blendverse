export const delay = (time: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, time));
