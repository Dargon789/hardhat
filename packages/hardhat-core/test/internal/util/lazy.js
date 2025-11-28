"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const util_1 = require("util");
const errors_list_1 = require("../../../src/internal/core/errors-list");
const lazy_1 = require("../../../src/internal/util/lazy");
const errors_1 = require("../../helpers/errors");
describe("lazy module", () => {
  describe("lazyObject", () => {
    it("shouldn't call the initializer function eagerly", () => {
      let called = false;
      (0, lazy_1.lazyObject)(() => {
        called = true;
        return {};
      });
      chai_1.assert.isFalse(called);
    });
    it("should throw if the objectConstructor doesn't return an object", () => {
      const num = (0, lazy_1.lazyObject)(() => 123);
      chai_1.assert.throws(() => num.asd);
    });
    it("should call the initializer just once", () => {
      let numberOfCalls = 0;
      const obj = (0, lazy_1.lazyObject)(() => {
        numberOfCalls += 1;
        return {
          a: 1,
          b() {
            return this.a;
          },
        };
      });
      chai_1.assert.equal(numberOfCalls, 0);
      obj.a = 2;
      chai_1.assert.equal(numberOfCalls, 1);
      obj.b();
      chai_1.assert.equal(numberOfCalls, 1);
      delete obj.a;
      chai_1.assert.equal(numberOfCalls, 1);
      obj.asd = 123;
      chai_1.assert.equal(numberOfCalls, 1);
    });
    it("should be equivalent to the object returned by the initializer", () => {
      const expected = {
        a: 123,
        b: "asd",
        c: {
          d: [1, 2, 3],
          e: 1.3,
        },
        f: [3, { g: 1 }],
      };
      const obj = (0, lazy_1.lazyObject)(() => Object.assign({}, expected));
      chai_1.assert.deepEqual(obj, expected);
    });
    it("doesn't support classes", () => {
      const obj = (0, lazy_1.lazyObject)(() => class {});
      (0, errors_1.expectHardhatError)(
        () => (obj.asd = 123),
        errors_list_1.ERRORS.GENERAL.UNSUPPORTED_OPERATION
      );
      (0, errors_1.expectHardhatError)(
        () => obj.asd,
        errors_list_1.ERRORS.GENERAL.UNSUPPORTED_OPERATION
      );
      chai_1.assert.throws(() => new obj(), "obj is not a constructor");
    });
    it("doesn't support functions", () => {
      const obj = (0, lazy_1.lazyObject)(() => () => {});
      (0, errors_1.expectHardhatError)(
        () => (obj.asd = 123),
        errors_list_1.ERRORS.GENERAL.UNSUPPORTED_OPERATION
      );
      (0, errors_1.expectHardhatError)(
        () => obj.asd,
        errors_list_1.ERRORS.GENERAL.UNSUPPORTED_OPERATION
      );
      chai_1.assert.throws(() => obj(), "obj is not a function");
    });
    it("should trap defineProperty correctly", () => {
      const obj = (0, lazy_1.lazyObject)(() => ({}));
      obj.asd = 123;
      chai_1.assert.equal(obj.asd, 123);
    });
    it("should trap deleteProperty correctly", () => {
      const obj = (0, lazy_1.lazyObject)(() => ({ a: 1 }));
      delete obj.a;
      chai_1.assert.isUndefined(obj.a);
    });
    it("should trap get correctly", () => {
      const obj = (0, lazy_1.lazyObject)(() => ({ a: 1 }));
      chai_1.assert.equal(obj.a, 1);
    });
    it("should trap getOwnPropertyDescriptor correctly", () => {
      const obj = (0, lazy_1.lazyObject)(() => ({ a: 1 }));
      chai_1.assert.deepEqual(Object.getOwnPropertyDescriptor(obj, "a"), {
        value: 1,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    });
    it("should trap getPrototypeOf correctly", () => {
      const proto = {};
      const obj = (0, lazy_1.lazyObject)(() => Object.create(proto));
      chai_1.assert.equal(Object.getPrototypeOf(obj), proto);
    });
    it("should trap has correctly", () => {
      const proto = { a: 1 };
      const obj = (0, lazy_1.lazyObject)(() => {
        const v = Object.create(proto);
        v.b = 1;
        return v;
      });
      chai_1.assert.isTrue("a" in obj);
      chai_1.assert.isTrue("b" in obj);
      chai_1.assert.isFalse("c" in obj);
    });
    it("should trap isExtensible correctly", () => {
      const obj = (0, lazy_1.lazyObject)(() => {
        const v = {};
        Object.preventExtensions(v);
        return v;
      });
      chai_1.assert.isFalse(Object.isExtensible(obj));
      const obj2 = (0, lazy_1.lazyObject)(() => ({}));
      chai_1.assert.isTrue(Object.isExtensible(obj2));
    });
    it("should trap ownKeys correctly", () => {
      const proto = { a: 1 };
      const obj = (0, lazy_1.lazyObject)(() => {
        const v = Object.create(proto);
        v.b = 1;
        return v;
      });
      obj.c = 123;
      chai_1.assert.deepEqual(Object.getOwnPropertyNames(obj), ["b", "c"]);
    });
    it("should trap preventExtensions correctly", () => {
      const obj = (0, lazy_1.lazyObject)(() => ({}));
      Object.preventExtensions(obj);
      chai_1.assert.isFalse(Object.isExtensible(obj));
    });
    it("should trap set correctly", () => {
      const obj = (0, lazy_1.lazyObject)(() => ({}));
      obj.asd = 123;
      chai_1.assert.deepEqual(Object.getOwnPropertyNames(obj), ["asd"]);
      chai_1.assert.equal(obj.asd, 123);
    });
    it("should trap setPrototypeOf correctly", () => {
      const proto = Object.create(null);
      const obj = (0, lazy_1.lazyObject)(() => Object.create(proto));
      chai_1.assert.equal(Object.getPrototypeOf(obj), proto);
      chai_1.assert.isUndefined(obj.a);
      const newProto = { a: 123 };
      Object.setPrototypeOf(obj, newProto);
      chai_1.assert.equal(Object.getPrototypeOf(obj), newProto);
      chai_1.assert.equal(obj.a, 123);
    });
    it("should throw if it's used to create an object without prototype", () => {
      const obj = (0, lazy_1.lazyObject)(() => Object.create(null));
      (0, errors_1.expectHardhatError)(
        () => obj.asd,
        errors_list_1.ERRORS.GENERAL.UNSUPPORTED_OPERATION
      );
    });
    it("should inspect up to the appropriate depth", () => {
      const realObj = { b: 3, c: { d: { e: 4 } } };
      const lazyObj = (0, lazy_1.lazyObject)(() => realObj);
      const depth = 1;
      chai_1.assert.equal(
        (0, util_1.inspect)(realObj, { depth }),
        (0, util_1.inspect)(lazyObj, { depth })
      );
    });
    it("should support inspecting circular objects", () => {
      class Foo {
        constructor(baz) {
          this.val = baz;
        }
      }
      const myLazyObj = {};
      myLazyObj.foo = (0, lazy_1.lazyObject)(() => new Foo(myLazyObj));
      // The custom inspect will not pick up on the circularity,
      // but it should at least stop at the default depth (2)
      // instead of recursing infinitely.
      chai_1.assert.equal(
        "{ foo: Foo { val: { foo: [Foo] } } }",
        (0, util_1.inspect)(myLazyObj)
      );
    });
  });
});
describe("lazy import", () => {
  it("should work with a function module", () => {
    const lazyF = (0, lazy_1.lazyFunction)(() => () => ({ a: 1, b: 2 }));
    chai_1.assert.deepEqual(lazyF(), { a: 1, b: 2 });
  });
  it("should work with a class module", () => {
    const lazyC = (0, lazy_1.lazyFunction)(
      () =>
        class {
          constructor() {
            this.a = 1;
            this.b = 2;
          }
        }
    );
    chai_1.assert.deepEqual(new lazyC(), { a: 1, b: 2 });
  });
  it("should inspect up to the appropriate depth", () => {
    class RealClass {
      constructor() {
        this.a = 1;
        this.b = 2;
      }
    }
    RealClass.dummyProperty = { b: 3, c: { d: { e: 4 } } };
    const lazyC = (0, lazy_1.lazyFunction)(() => RealClass);
    const depth = 1;
    chai_1.assert.equal(
      (0, util_1.inspect)(RealClass, { depth }),
      (0, util_1.inspect)(lazyC, { depth })
    );
  });
});
