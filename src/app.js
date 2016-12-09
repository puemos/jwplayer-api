'use strict';

const Promise = require("bluebird"),
  queryString = require('querystring'),
  axios = require("axios"),
  path = require("path"),
  crypto = require('crypto'),
  nonce = require('nonce')(8),
  urlModule = require('url');

class JwPlatformApi {

  constructor(config) {
    this.config = config || {};

    if (!this.config.key) {
      throw new Error('Must provide a jwPlatform key in config.key');
    }
    if (!this.config.secret) {
      throw new Error('Must provide a jwPlatform secret in config.secret');
    }

    this.config.protocol = this.config.protocol || 'http';
    this.config.baseUrl = this.config.baseUrl || 'api.jwplatform.com';

  }

  generateUrl(path, params) {
    return urlModule.format({
      hostname: this.config.baseUrl,
      protocol: this.config.protocol,
      query: this.getParams(params),
      pathname: path
    });
  }

  getParams(params) {
    var defaultParams = {
      api_format: 'json',
      api_key: this.config.key,
      api_nonce: nonce(),
      api_timestamp: Math.floor(Date.now() / 1000)
    };
    params = Object.assign({}, defaultParams, params);
    var allParams = Object.assign({}, params);

    var sortedParams = {};
    Object
      .keys(allParams)
      .sort()
      .forEach(function(key) {
        sortedParams[key] = allParams[key];
      });

    var input = queryString.stringify(sortedParams);

    params.api_signature = crypto
      .createHash('sha1')
      .update(input + this.config.secret, 'utf8')
      .digest('hex');

    return params;
  }

  getUploadUrl(params) {
    params = params || {};
    const url = this.generateUrl('v1/videos/create', params);
    return new Promise((resolve, reject) => {
      axios({ method: 'get', url, params }).then((response) => {
        var link = response.data.link;

        var result = {
          uploadUrl: urlModule.format({
            protocol: link.protocol,
            hostname: link.address,
            pathname: link.path,
            query: {
              api_format: 'json',
              key: link.query.key,
              token: link.query.token
            }
          }),
          progressUrl: urlModule.format({
            protocol: link.protocol,
            hostname: link.address,
            pathname: 'progress',
            query: {
              token: link.query.token,
              key: link.query.key
            }
          })
        };
        resolve(result);
      }).catch((error) => {
        reject(error);
      });

    });
  }

  delete(video_key) {
    const url = this.generateUrl('v1/videos/delete', { video_key });
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((response) => {
          return response.data;
        })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  conversionCreate(video_key, template_key) {
    const url = this.generateUrl('/videos/conversions/create', { video_key, template_key });
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((response) => {
          return response.data;
        })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });

  }

  videosList(params) {
    params = params || {};
    const url = this.generateUrl('v1/videos/list', params);
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((response) => {
          return response.data;
        })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

}

module.exports = JwPlatformApi;
