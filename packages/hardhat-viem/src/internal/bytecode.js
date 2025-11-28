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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBytecodeWithLinkedLibraries = exports.linkBytecode = void 0;
const errors_1 = require("./errors");
function linkBytecode(artifact, libraries) {
    return __awaiter(this, void 0, void 0, function* () {
        const { isHex } = yield Promise.resolve().then(() => __importStar(require("viem")));
        let bytecode = artifact.bytecode;
        // TODO: measure performance impact
        for (const { sourceName, libraryName, address } of libraries) {
            const linkReferences = artifact.linkReferences[sourceName][libraryName];
            for (const { start, length } of linkReferences) {
                bytecode =
                    bytecode.substring(0, 2 + start * 2) +
                        address.substring(2) +
                        bytecode.substring(2 + (start + length) * 2);
            }
        }
        return isHex(bytecode) ? bytecode : `0x${bytecode}`;
    });
}
exports.linkBytecode = linkBytecode;
function throwOnAmbigousLibraryNameOrUnnecessaryLink(contractName, libraries, neededLibraries) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const linkedLibraryName of Object.keys(libraries)) {
            const matchingLibraries = neededLibraries.filter(({ sourceName, libraryName }) => libraryName === linkedLibraryName ||
                `${sourceName}:${libraryName}` === linkedLibraryName);
            if (matchingLibraries.length > 1) {
                throw new errors_1.AmbigousLibraryNameError(contractName, linkedLibraryName, matchingLibraries.map(({ sourceName, libraryName }) => `${sourceName}:${libraryName}`));
            }
            else if (matchingLibraries.length === 0) {
                throw new errors_1.UnnecessaryLibraryLinkError(contractName, linkedLibraryName);
            }
        }
    });
}
function throwOnMissingLibrariesAddress(contractName, libraries, neededLibraries) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const missingLibraries = [];
        for (const { sourceName, libraryName } of neededLibraries) {
            const address = (_a = libraries[`${sourceName}:${libraryName}`]) !== null && _a !== void 0 ? _a : libraries[libraryName];
            if (address === undefined) {
                missingLibraries.push({ sourceName, libraryName });
            }
        }
        if (missingLibraries.length > 0) {
            throw new errors_1.MissingLibraryAddressError(contractName, missingLibraries);
        }
    });
}
function throwOnOverlappingLibraryNames(contractName, libraries, neededLibraries) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const { sourceName, libraryName } of neededLibraries) {
            if (libraries[`${sourceName}:${libraryName}`] !== undefined &&
                libraries[libraryName] !== undefined) {
                throw new errors_1.OverlappingLibraryNamesError(sourceName, libraryName);
            }
        }
    });
}
function resolveBytecodeWithLinkedLibraries(artifact, libraries) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { linkReferences } = artifact;
        const neededLibraries = [];
        for (const [sourceName, sourceLibraries] of Object.entries(linkReferences)) {
            for (const libraryName of Object.keys(sourceLibraries)) {
                neededLibraries.push({
                    sourceName,
                    libraryName,
                    address: (_a = libraries[`${sourceName}:${libraryName}`]) !== null && _a !== void 0 ? _a : libraries[libraryName],
                });
            }
        }
        yield throwOnAmbigousLibraryNameOrUnnecessaryLink(artifact.contractName, libraries, neededLibraries);
        yield throwOnOverlappingLibraryNames(artifact.contractName, libraries, neededLibraries);
        yield throwOnMissingLibrariesAddress(artifact.contractName, libraries, neededLibraries);
        return linkBytecode(artifact, neededLibraries);
    });
}
exports.resolveBytecodeWithLinkedLibraries = resolveBytecodeWithLinkedLibraries;
