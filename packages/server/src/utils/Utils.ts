export const delay = (time: number = 2000) =>
  new Promise((resolve) => setTimeout(resolve, time));
