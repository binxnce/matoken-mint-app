import fetch from 'isomorphic-fetch';
import https from 'https';
import http from 'http';
import config from '../config';

// const agent = new https.Agent({
//   rejectUnauthorized: false,
// });

const agent = new http.Agent({
  rejectUnauthorized: false,
});

const defaultOptions = {
  credentials: 'include',
};

if (config.production) {
  defaultOptions.agent = agent;
}

const defaultHeaders = {};

export async function get(url, options) {
  return request(url, undefined, { method: 'GET', ...options });
}

export async function post(url, data, options) {
  return request(url, data, { method: 'POST', ...options });
}

export async function put(url, data, options) {
  return request(url, data, { method: 'PUT', ...options });
}

export async function DELETE(url, data, options) {
  return request(url, data, { method: 'DELETE', ...options });
}

async function request(url, data, options) {
  let body;
  const extraHeaders = {};

  if (data !== undefined && data instanceof FormData) {
    body = data;
  } else if (data !== undefined && !(data instanceof FormData)) {
    body = JSON.stringify(data);
    extraHeaders['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...defaultOptions,
    body,
    ...options,
    headers: {
      ...defaultHeaders,
      ...extraHeaders,
      ...options.headers,
    },
  });

  if ((res.headers.get('Content-Type') || '').includes('application/json')) {
    res.data = await res.json();
  }

  if (!res.ok) {
    throw res;
  }

  return res;
}

export function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  name = encodeURIComponent(name);
  value = encodeURIComponent(value || '');
  document.cookie = `${name}=${value}${expires}; path=/`;
}

export function constructQueryParams(data) {
  if (!data) return '';

  let queryParams = '';
  try {
    queryParams = new URLSearchParams(data).toString();
  } catch (e) {
    //
  }

  return queryParams;
}

export default {
  get,
  post,
  put,
  delete: DELETE,
  defaultOptions,
  defaultHeaders,
  setCookie,
  constructQueryParams,
};
