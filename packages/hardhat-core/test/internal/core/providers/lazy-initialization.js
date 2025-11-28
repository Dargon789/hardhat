"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = __importDefault(require("sinon"));
const lazy_initialization_1 = require("../../../../src/internal/core/providers/lazy-initialization");
const errors_list_1 = require("../../../../src/internal/core/errors-list");
const errors_1 = require("../../../helpers/errors");
const mocks_1 = require("./mocks");
describe("LazyInitializationProviderAdapter", () => {
  let mock;
  let provider;
  let initializationCount;
  let id;
  function createJsonRpcRequest(method, params) {
    return { id: id++, jsonrpc: "2.0", method, params };
  }
  beforeEach(() => {
    initializationCount = 0;
    id = 1;
    mock = new mocks_1.EthereumMockedProvider();
    provider = new lazy_initialization_1.LazyInitializationProviderAdapter(() =>
      __awaiter(void 0, void 0, void 0, function* () {
        initializationCount += 1;
        return mock;
      })
    );
  });
  describe("_wrapped", () => {
    it("should throw if accessed before initialization", () => {
      (0, errors_1.expectHardhatError)(
        () => provider._wrapped,
        errors_list_1.ERRORS.GENERAL.UNINITIALIZED_PROVIDER
      );
    });
    it("should get the initialized provider", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        yield provider.init();
        chai_1.assert.equal(provider._wrapped, mock);
      }));
  });
  describe("init", () => {
    it("should initialize the provider only once by calling the factory function", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        yield provider.init();
        yield provider.init();
        chai_1.assert.equal(initializationCount, 1);
      }));
    it("should initialize the provider only once even if init is called several times at the same time", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([
          provider.init(),
          provider.init(),
          provider.init(),
          provider.init(),
          provider.init(),
        ]);
        chai_1.assert.equal(initializationCount, 1);
      });
    });
    it("should return the initialized provider", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        const initializedProvider = yield provider.init();
        chai_1.assert.equal(initializedProvider, mock);
      }));
  });
  describe("EventEmitter", () => {
    let callTimes;
    function eventHandler() {
      callTimes += 1;
    }
    beforeEach(() => {
      callTimes = 0;
    });
    it("it should work as an emitter before being initialized", () => {
      provider.on("event", eventHandler);
      provider.on("otherevent", eventHandler);
      provider.once("onceevent", eventHandler);
      provider.emit("event"); // 1
      provider.emit("otherevent"); // 2
      provider.emit("onceevent"); // 3
      provider.emit("onceevent"); // 3
      provider.off("otherevent", eventHandler);
      provider.emit("otherevent"); // 3
      chai_1.assert.equal(callTimes, 3);
    });
    it("should move the registered events to the provider after implicit initialization", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        provider.on("event", eventHandler);
        provider.on("otherevent", eventHandler);
        provider.once("onceevent", eventHandler);
        yield provider.request({ method: "a-method" }); // init the inner provider calling the constructor function
        provider.emit("event"); // 1
        provider.emit("otherevent"); // 2
        provider.emit("onceevent"); // 3
        provider.emit("onceevent"); // 3
        chai_1.assert.deepEqual(callTimes, 3);
      }));
    it("should move the registered events to the provider after explicit initialization", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        provider.on("event", eventHandler);
        provider.on("otherevent", eventHandler);
        provider.once("onceevent", eventHandler);
        yield provider.init();
        provider.emit("event"); // 1
        provider.emit("otherevent"); // 2
        provider.emit("onceevent"); // 3
        provider.emit("onceevent"); // 3
        chai_1.assert.deepEqual(callTimes, 3);
      }));
  });
  describe("request", () => {
    it("should call the intialization function when called", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        yield provider.request({ method: "method1", params: [1, 2, 3] });
        chai_1.assert.equal(initializationCount, 1);
      }));
    it("should call the intialization function only once", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        yield provider.request({ method: "method1", params: [1, 2, 3] });
        yield provider.request({ method: "method2", params: [66, 77] });
        yield provider.request({ method: "method3", params: [99, 100] });
        chai_1.assert.equal(initializationCount, 1);
      }));
    it("should call the intialization function only once even if multiple requests are done at the same time", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all([
          provider.request({ method: "method1", params: [1, 2, 3] }),
          provider.request({ method: "method2", params: [66, 77] }),
          provider.request({ method: "method3", params: [99, 100] }),
        ]);
        chai_1.assert.equal(initializationCount, 1);
      }));
    it("should forward the method to the initialized provider", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        const requestSpy = sinon_1.default.spy(mock, "request");
        const requestParams = { method: "a-method" };
        yield provider.request(requestParams); // init the inner provider calling the constructor function
        chai_1.assert.isTrue(requestSpy.calledOnce);
        chai_1.assert.isTrue(requestSpy.calledOnceWith(requestParams));
      }));
  });
  describe("send", () => {
    it("should call the intialization function when called", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        yield provider.send("method1", [1, 2, 3]);
        chai_1.assert.equal(initializationCount, 1);
      }));
    it("should call the intialization function only once", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        yield provider.send("method1", [1, 2, 3]);
        yield provider.send("method2", [66, 77]);
        yield provider.send("method3", [99, 100]);
        chai_1.assert.equal(initializationCount, 1);
      }));
    it("should forward the method to the initialized provider", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        const sendSpy = sinon_1.default.spy(mock, "send");
        const sendParams = [1, 2, 44];
        yield provider.send("method", sendParams); // init the inner provider calling the constructor function
        chai_1.assert.isTrue(sendSpy.calledOnce);
        chai_1.assert.isTrue(sendSpy.calledOnceWith("method", sendParams));
      }));
  });
  describe("sendAsync", () => {
    it("should call the intialization function when called", (done) => {
      provider.sendAsync(createJsonRpcRequest("method1", [1, 2, 3]), () => {
        chai_1.assert.equal(initializationCount, 1);
        done();
      });
    });
    it("should call the intialization function only once", (done) => {
      provider.sendAsync(createJsonRpcRequest("method1", [1, 2, 3]), () => {
        provider.sendAsync(createJsonRpcRequest("method2", [66, 77]), () => {
          provider.sendAsync(createJsonRpcRequest("method3", [99, 100]), () => {
            chai_1.assert.equal(initializationCount, 1);
            done();
          });
        });
      });
    });
    it("should call the intialization function only once even for unresolved calls", (done) => {
      let checkCalls = 0;
      const check = () => {
        chai_1.assert.equal(initializationCount, 1);
        checkCalls++;
        if (checkCalls === 3) {
          done();
        }
      };
      provider.sendAsync(createJsonRpcRequest("method1", [1, 2, 3]), check);
      provider.sendAsync(createJsonRpcRequest("method2", [66, 77]), check);
      provider.sendAsync(createJsonRpcRequest("method3", [99, 100]), check);
    });
    it("should forward the method to the initialized provider", (done) => {
      const sendAsyncSpy = sinon_1.default.spy(mock, "sendAsync");
      const sendAsyncParams = createJsonRpcRequest("methodname", [
        "a",
        "b",
        33,
      ]);
      const asyncCallback = () => {
        chai_1.assert.isTrue(sendAsyncSpy.calledOnce);
        chai_1.assert.isTrue(
          sendAsyncSpy.calledOnceWith(sendAsyncParams, asyncCallback)
        );
        done();
      };
      // init the inner provider calling the constructor function
      provider.sendAsync(sendAsyncParams, asyncCallback);
    });
  });
});
