'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = require("bluebird"),
    queryString = require('querystring'),
    axios = require("axios"),
    path = require("path"),
    crypto = require('crypto'),
    nonce = require('nonce')(8),
    urlModule = require('url');

var JwPlatformApi = function () {
  function JwPlatformApi(config) {
    _classCallCheck(this, JwPlatformApi);

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

  _createClass(JwPlatformApi, [{
    key: 'generateUrl',
    value: function generateUrl(path, params) {
      return urlModule.format({
        hostname: this.config.baseUrl,
        protocol: this.config.protocol,
        query: this.getParams(params),
        pathname: path
      });
    }
  }, {
    key: 'getParams',
    value: function getParams(params) {
      var defaultParams = {
        api_format: 'json',
        api_key: this.config.key,
        api_nonce: nonce(),
        api_timestamp: Math.floor(Date.now() / 1000)
      };
      params = Object.assign({}, defaultParams, params);
      var allParams = Object.assign({}, params);

      var sortedParams = {};
      Object.keys(allParams).sort().forEach(function (key) {
        sortedParams[key] = allParams[key];
      });

      var input = queryString.stringify(sortedParams);

      params.api_signature = crypto.createHash('sha1').update(input + this.config.secret, 'utf8').digest('hex');

      return params;
    }
  }, {
    key: 'getUploadUrl',
    value: function getUploadUrl(params) {
      params = params || {};
      var url = this.generateUrl('v1/videos/create', params);
      return new Promise(function (resolve, reject) {
        axios({ method: 'get', url: url, params: params }).then(function (response) {
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
        }).catch(function (error) {
          reject(error);
        });
      });
    }
  }, {
    key: 'delete',
    value: function _delete(video_key) {
      var url = this.generateUrl('v1/videos/delete', { video_key: video_key });
      return new Promise(function (resolve, reject) {
        axios.get(url).then(function (response) {
          return response.data;
        }).then(function (response) {
          resolve(response);
        }).catch(function (error) {
          reject(error);
        });
      });
    }
  }, {
    key: 'conversionCreate',
    value: function conversionCreate(video_key, template_key) {
      var url = this.generateUrl('/videos/conversions/create', { video_key: video_key, template_key: template_key });
      return new Promise(function (resolve, reject) {
        axios.get(url).then(function (response) {
          return response.data;
        }).then(function (response) {
          resolve(response);
        }).catch(function (error) {
          reject(error);
        });
      });
    }
  }, {
    key: 'videosList',
    value: function videosList(params) {
      params = params || {};
      var url = this.generateUrl('v1/videos/list', params);
      return new Promise(function (resolve, reject) {
        axios.get(url).then(function (response) {
          return response.data;
        }).then(function (response) {
          resolve(response);
        }).catch(function (error) {
          reject(error);
        });
      });
    }
  }]);

  return JwPlatformApi;
}();

module.exports = JwPlatformApi;