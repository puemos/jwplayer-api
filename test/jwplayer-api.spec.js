const url = require("url");
const JwplayerApi = require("../src/jwplayer-api");
const TEST_PATH = "TEST_PATH";
const key = "myKey";
const secret = "mySecret";

describe("JwPlatformApi", () => {
    describe("generateUrl", () => {
        it("should throw error if key not supply", () => {
            const createApi = () =>
                new JwplayerApi({
                    secret
                });
            expect(createApi).toThrow()
        });
        it("should throw error if secret not supply", () => {
            const createApi = () =>
                new JwplayerApi({
                    key
                });
            expect(createApi).toThrow()
        });
        it("should include the key", () => {
            const api = new JwplayerApi({
                key,
                secret
            });
            const res = api.generateUrl(TEST_PATH);
            expect(res).toContain(key);
        });
    });
    describe("generateUrl", () => {
        it("should include base path", () => {
            const api = new JwplayerApi({
                key,
                secret
            });
            const res = api.generateUrl(TEST_PATH);
            expect(res).toContain(`http://api.jwplatform.com/${TEST_PATH}?api_format=json`);
        });
        it("should include params", () => {
            const api = new JwplayerApi({
                key,
                secret
            });
            const params = { key: "value" };
            const paramsString = new url.URLSearchParams(params).toString();
            const res = api.generateUrl(TEST_PATH, params);
            expect(res).toContain(paramsString);
        });
    });
});
