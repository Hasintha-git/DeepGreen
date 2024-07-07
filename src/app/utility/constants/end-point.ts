const HOST: string = '127.0.0.1';
// const HOST: string = '104.152.222.98';
const PORT: string = '5000';

export const SECURE = false;

export const getEndpoint = (isHttps: any) => {
  return `${isHttps ? 'https' : 'http'}://${HOST}:${PORT}`;
};
