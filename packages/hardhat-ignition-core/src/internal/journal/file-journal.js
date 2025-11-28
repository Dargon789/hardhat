"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileJournal = void 0;
/* eslint-disable no-bitwise */
const fs_1 = __importStar(require("fs"));
const ndjson_1 = require("ndjson");
const deserialize_replacer_1 = require("./utils/deserialize-replacer");
const emitExecutionEvent_1 = require("./utils/emitExecutionEvent");
const serialize_replacer_1 = require("./utils/serialize-replacer");
/**
 * A file-based journal.
 *
 * @beta
 */
class FileJournal {
    constructor(_filePath, _executionEventListener) {
        this._filePath = _filePath;
        this._executionEventListener = _executionEventListener;
    }
    record(message) {
        this._log(message);
        this._appendJsonLine(this._filePath, message);
    }
    read() {
        return __asyncGenerator(this, arguments, function* read_1() {
            var _a, e_1, _b, _c;
            if (!fs_1.default.existsSync(this._filePath)) {
                return yield __await(void 0);
            }
            const stream = fs_1.default.createReadStream(this._filePath).pipe((0, ndjson_1.parse)());
            try {
                for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield __await(stream_1.next()), _a = stream_1_1.done, !_a;) {
                    _c = stream_1_1.value;
                    _d = false;
                    try {
                        const chunk = _c;
                        const json = JSON.stringify(chunk);
                        const deserializedChunk = JSON.parse(json, deserialize_replacer_1.deserializeReplacer.bind(this));
                        yield yield __await(deserializedChunk);
                    }
                    finally {
                        _d = true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = stream_1.return)) yield __await(_b.call(stream_1));
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
    _appendJsonLine(path, value) {
        const flags = fs_1.constants.O_CREAT |
            fs_1.constants.O_WRONLY | // Write only
            fs_1.constants.O_APPEND | // Append
            fs_1.constants.O_DSYNC; // Synchronous I/O waiting for writes of content and metadata
        const fd = (0, fs_1.openSync)(path, flags);
        (0, fs_1.writeFileSync)(fd, `\n${JSON.stringify(value, serialize_replacer_1.serializeReplacer.bind(this))}`, "utf-8");
        (0, fs_1.closeSync)(fd);
    }
    _log(message) {
        if (this._executionEventListener !== undefined) {
            (0, emitExecutionEvent_1.emitExecutionEvent)(message, this._executionEventListener);
        }
    }
}
exports.FileJournal = FileJournal;
