"use strict";
const url = require("url");

const jwplayerUrlGeneretor = require("../dist");
const TEST_PATH = "TEST_PATH";
const key = "myKey";
const secret = "mySecret";

describe("JwPlatformApi", () => {
    describe("generateUrl", () => {
        it("should throw error if key not supply", () => {
            const createApi = () =>
                new jwplayerUrlGeneretor({
                    secret
                });
            expect(createApi).to.throw();
        });
        it("should throw error if secret not supply", () => {
            const createApi = () =>
                new jwplayerUrlGeneretor({
                    key
                });
            expect(createApi).to.throw();
        });
        it("should include the key", () => {
            const api = new jwplayerUrlGeneretor({
                key,
                secret
            });
            const res = api.generateUrl(TEST_PATH);
            expect(res).to.include(key);
        });
    });
    describe("generateUrl", () => {
        it("should include base path", () => {
            const api = new jwplayerUrlGeneretor({
                key,
                secret
            });
            const res = api.generateUrl(TEST_PATH);
            expect(res).to.include(`http://api.jwplatform.com/${TEST_PATH}?api_format=json`);
        });
        it("should include params", () => {
            const api = new jwplayerUrlGeneretor({
                key,
                secret
            });
            const params = { key: "value" };
            const paramsString = new url.URLSearchParams(params).toString();
            const res = api.generateUrl(TEST_PATH, params);
            expect(res).to.include(paramsString);
        });
    });
});
