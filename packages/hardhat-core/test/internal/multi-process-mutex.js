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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const multi_process_mutex_1 = require("../../src/internal/util/multi-process-mutex");
describe("multi-process-mutex", () => {
  const mutexName = "test-mutex";
  it("should execute all the function in a sequential order, not in parallel", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      // Since all the functions cannot be executed in parallel because of the mutex,
      // the total execution time should be bigger than the sum of the execution times of each function.
      const mutex = new multi_process_mutex_1.MultiProcessMutex(mutexName); // Use default max mutex lifespan
      const start = performance.now();
      const ms = [500, 700, 1000];
      yield Promise.all([
        mutex.use(() =>
          __awaiter(void 0, void 0, void 0, function* () {
            yield waitMs(ms[0]);
          })
        ),
        mutex.use(() =>
          __awaiter(void 0, void 0, void 0, function* () {
            yield waitMs(ms[1]);
          })
        ),
        mutex.use(() =>
          __awaiter(void 0, void 0, void 0, function* () {
            yield waitMs(ms[2]);
          })
        ),
      ]);
      const end = performance.now();
      const duration = end - start;
      (0, chai_1.expect)(duration).to.be.greaterThan(ms[0] + ms[1] + ms[2]);
    }));
  it("should overwrite the current mutex locked by another function because the function took to long to finish", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const mutexLifeSpanMs = 500;
      const mutex = new multi_process_mutex_1.MultiProcessMutex(
        mutexName,
        mutexLifeSpanMs
      );
      const res = [];
      yield Promise.all([
        mutex.use(() =>
          __awaiter(void 0, void 0, void 0, function* () {
            yield waitMs(2000);
            res.push(1);
          })
        ),
        new Promise((resolve) =>
          setTimeout(
            () =>
              __awaiter(void 0, void 0, void 0, function* () {
                yield mutex.use(() =>
                  __awaiter(void 0, void 0, void 0, function* () {
                    yield waitMs(200);
                    res.push(2);
                  })
                );
                resolve(true);
              }),
            200
          )
        ),
      ]);
      (0, chai_1.expect)(res).to.deep.equal([2, 1]);
    }));
  it("should get the mutex lock because the first function to own it failed", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const mutexLifeSpanMs = 20000; // The mutex should be released and not hit timeout because the first function failed
      const mutex = new multi_process_mutex_1.MultiProcessMutex(
        mutexName,
        mutexLifeSpanMs
      );
      const start = performance.now();
      const res = [];
      let errThrown = false;
      yield Promise.all([
        mutex
          .use(() =>
            __awaiter(void 0, void 0, void 0, function* () {
              throw new Error("Expected error");
            })
          )
          .catch(() => {
            errThrown = true;
          }),
        new Promise((resolve) =>
          setTimeout(
            () =>
              __awaiter(void 0, void 0, void 0, function* () {
                yield mutex.use(() =>
                  __awaiter(void 0, void 0, void 0, function* () {
                    res.push(2);
                  })
                );
                resolve(true);
              }),
            200
          )
        ),
      ]);
      const end = performance.now();
      const duration = end - start;
      chai_1.assert.isTrue(errThrown);
      (0, chai_1.expect)(res).to.deep.equal([2]);
      // Since the first function that obtained the mutex failed, the function waiting for it will acquire it instantly.
      // Therefore, the mutex timeout will not be reached, and the test should complete in less time than the mutex timeout.
      (0, chai_1.expect)(duration).to.be.lessThan(1000);
    }));
});
function waitMs(timeout) {
  return __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  });
}
