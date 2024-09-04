export const delay = (time: number = 10) => {
  const randomDelay = Math.floor(Math.random() * 3) + 1;
  return new Promise((resolve) => setTimeout(resolve, randomDelay * time));
};
