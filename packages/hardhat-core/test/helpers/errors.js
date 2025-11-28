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
exports.expectHardhatErrorAsync =
  exports.expectHardhatError =
  exports.expectErrorAsync =
    void 0;
const chai_1 = require("chai");
const errors_1 = require("../../src/internal/core/errors");
function expectErrorAsync(f, errorMessage) {
  return __awaiter(this, void 0, void 0, function* () {
    const noError = new chai_1.AssertionError(
      "Async error expected but not thrown"
    );
    const notExactMatch = new chai_1.AssertionError(
      `Async error should have had message "${errorMessage}" but got "`
    );
    const notRegexpMatch = new chai_1.AssertionError(
      `Async error should have matched regex ${errorMessage} but got "`
    );
    try {
      yield f();
    } catch (err) {
      if (errorMessage === undefined) {
        return;
      }
      if (err instanceof Error) {
        if (typeof errorMessage === "string") {
          if (err.message !== errorMessage) {
            notExactMatch.message += `${err.message}"`;
            throw notExactMatch;
          }
        } else {
          if (errorMessage.exec(err.message) === null) {
            notRegexpMatch.message += `${err.message}"`;
            throw notRegexpMatch;
          }
        }
      }
      return;
    }
    throw noError;
  });
}
exports.expectErrorAsync = expectErrorAsync;
function expectHardhatError(f, errorDescriptor, errorMessage) {
  try {
    f();
  } catch (error) {
    chai_1.assert.instanceOf(error, errors_1.HardhatError);
    chai_1.assert.equal(error.number, errorDescriptor.number);
    chai_1.assert.notInclude(
      error.message,
      "%s",
      "HardhatError has old-style format tag"
    );
    chai_1.assert.notMatch(
      error.message,
      /%[a-zA-Z][a-zA-Z0-9]*%/,
      "HardhatError has a non-replaced variable tag"
    );
    if (typeof errorMessage === "string") {
      chai_1.assert.include(error.message, errorMessage);
    } else if (errorMessage !== undefined) {
      chai_1.assert.match(error.message, errorMessage);
    }
    return;
  }
  throw new chai_1.AssertionError(
    `HardhatError number ${errorDescriptor.number} expected, but no Error was thrown`
  );
}
exports.expectHardhatError = expectHardhatError;
function expectHardhatErrorAsync(f, errorDescriptor, errorMessage) {
  return __awaiter(this, void 0, void 0, function* () {
    // We create the error here to capture the stack trace before the await.
    // This makes things easier, at least as long as we don't have async stack
    // traces. This may change in the near-ish future.
    const error = new chai_1.AssertionError(
      `HardhatError number ${errorDescriptor.number} expected, but no Error was thrown`
    );
    const notExactMatch = new chai_1.AssertionError(
      `HardhatError was correct, but should have include "${errorMessage}" but got "`
    );
    const notRegexpMatch = new chai_1.AssertionError(
      `HardhatError was correct, but should have matched regex ${errorMessage} but got "`
    );
    try {
      yield f();
    } catch (err) {
      if (!(err instanceof errors_1.HardhatError)) {
        chai_1.assert.fail();
      }
      chai_1.assert.equal(err.number, errorDescriptor.number);
      chai_1.assert.notInclude(
        err.message,
        "%s",
        "HardhatError has old-style format tag"
      );
      chai_1.assert.notMatch(
        err.message,
        /%[a-zA-Z][a-zA-Z0-9]*%/,
        "HardhatError has a non-replaced variable tag"
      );
      if (errorMessage !== undefined) {
        if (typeof errorMessage === "string") {
          if (!err.message.includes(errorMessage)) {
            notExactMatch.message += `${err.message}`;
            throw notExactMatch;
          }
        } else {
          if (errorMessage.exec(err.message) === null) {
            notRegexpMatch.message += `${err.message}`;
            throw notRegexpMatch;
          }
        }
      }
      return;
    }
    throw error;
  });
}
exports.expectHardhatErrorAsync = expectHardhatErrorAsync;
