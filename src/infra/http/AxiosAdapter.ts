/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import axios from 'axios';
import { parseCookies } from 'nookies';

import { env } from '@/constant';

import type HttpClient from './HttpClient';

export const URL_API = 'https://territory-manager.com.br/v1';

export default class AxiosAdapter implements HttpClient {
  constructor() {
    axios.interceptors.request.use((config: any) => {
      const { token } = env.storage;
      const { [token]: tokenCookie } = parseCookies();
      const tokenBearer = tokenCookie;
      if (tokenBearer) {
        config.headers['Authorization'] = `Bearer ${tokenBearer}`;
      }
      return config;
    });
  }

  async get(url: string) {
    const httpConfig = { method: 'get' };
    return await this.axiosConfig(url, httpConfig);
  }

  async post(url: string, data: any) {
    const httpConfig = { method: 'post', data };
    return await this.axiosConfig(url, httpConfig);
  }

  async put(url: string, data: any) {
    const httpConfig = { method: 'put', data };
    return await this.axiosConfig(url, httpConfig);
  }

  async patch(url: string, data?: any): Promise<any> {
    const httpConfig = { method: 'patch', data };
    return await this.axiosConfig(url, httpConfig);
  }

  async postFile(url: string, data: any) {
    const httpConfig = { method: 'post', data };
    return await this.axiosConfigFileUpload(url, httpConfig);
  }

  async delete(url: string) {
    const httpConfig = { method: 'delete' };
    return await this.axiosConfig(url, httpConfig);
  }

  private async axiosConfig(url: string, httpConfig: any) {
    try {
      const config = {
        ...httpConfig,
      };

      const response = await axios(`${URL_API}/${url}`, config);
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error: any) {
      return {
        status: error?.response?.status,
        message: error?.response?.data?.error,
      };
    }
  }

  private async axiosConfigFileUpload(url: string, httpConfig: any) {
    try {
      const config = {
        ...httpConfig,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const response = await axios(`${URL_API}/${url}`, config);
      console.log(response);
      return {
        status: response?.status,
        data: response?.data,
      };
    } catch (error: any) {
      return {
        status: error?.response?.status,
        message: error?.response?.data?.error,
      };
    }
  }
}
