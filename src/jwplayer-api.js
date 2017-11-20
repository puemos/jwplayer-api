const queryString = require("querystring");
const axios = require("axios");
const crypto = require("crypto");
const nonce = require("nonce")(8);
const { format } = require("url");

class JwPlatformApi {
    constructor(config = {}) {
        this.config = config;
        if (!this.config.key) {
            throw new Error("Must provide a jwPlatform key in config.key");
        }
        if (!this.config.secret) {
            throw new Error("Must provide a jwPlatform secret in config.secret");
        }

        this.config.protocol = this.config.protocol || "http";
        this.config.baseUrl = this.config.baseUrl || "api.jwplatform.com";
    }

    generateUrl(path, params) {
        return format({
            hostname: this.config.baseUrl,
            protocol: this.config.protocol,
            query: this.getParams(params),
            pathname: path
        });
    }

    getParams(params) {
        const defaultParams = {
            api_format: "json",
            api_key: this.config.key,
            api_nonce: nonce(),
            api_timestamp: Math.floor(Date.now() / 1000)
        };
        params = Object.assign({}, defaultParams, params);
        const allParams = Object.assign({}, params);

        const sortedParams = {};
        Object.keys(allParams)
            .sort()
            .forEach(function(key) {
                sortedParams[key] = allParams[key];
            });

        const input = queryString.stringify(sortedParams);

        params.api_signature = crypto
            .createHash("sha1")
            .update(input + this.config.secret, "utf8")
            .digest("hex");

        return params;
    }

    getUploadUrl(params = {}, baseURL = "v1/videos/create") {
        const url = this.generateUrl(baseURL, params);
        return axios({
            method: "get",
            url,
            params
        }).then(response => {
            const link = response.data.link;

            return {
                uploadUrl: format({
                    protocol: link.protocol,
                    hostname: link.address,
                    pathname: link.path,
                    query: {
                        api_format: "json",
                        key: link.query.key,
                        token: link.query.token
                    }
                }),
                progressUrl: format({
                    protocol: link.protocol,
                    hostname: link.address,
                    pathname: "progress",
                    query: {
                        token: link.query.token,
                        key: link.query.key
                    }
                })
            };
        });
    }

    delete(video_key) {
        const url = this.generateUrl("v1/videos/delete", {
            video_key
        });
        return axios.get(url).then(response => {
            return response.data;
        });
    }

    conversionCreate(video_key, template_key) {
        const url = this.generateUrl("/videos/conversions/create", {
            video_key,
            template_key
        });
        return axios.get(url).then(response => {
            return response.data;
        });
    }

    videosList(params = {}) {
        const url = this.generateUrl("v1/videos/list", params);
        return axios.get(url).then(response => {
            return response.data;
        });
    }
}

module.exports = JwPlatformApi;
