import axiosLib from 'axios';

export const axios = axiosLib.create({
  baseURL: process.env.PORTAL_BASE_URL,
});
