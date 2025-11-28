"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeModulesLogger = void 0;
class FakeModulesLogger {
  constructor() {
    this.lines = [];
  }
  printLineFn() {
    return (line) => {
      this.lines.push(line);
    };
  }
  replaceLastLineFn() {
    return (line) => {
      this.lines[this.lines.length - 1] = line;
    };
  }
  getOutput() {
    return this.lines.join("\n");
  }
  reset() {
    this.lines = [];
  }
}
exports.FakeModulesLogger = FakeModulesLogger;
