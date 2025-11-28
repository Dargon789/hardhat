"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
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
const fs_extra_1 = __importDefault(require("fs-extra"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const artifacts_1 = require("../../src/internal/artifacts");
const errors_list_1 = require("../../src/internal/core/errors-list");
const contract_names_1 = require("../../src/utils/contract-names");
const errors_1 = require("../helpers/errors");
const fs_1 = require("../helpers/fs");
function storeAllArtifacts(sourceName, artifacts) {
  return __awaiter(this, void 0, void 0, function* () {
    const solcVersion = "0.5.6";
    const solcLongVersion = "0.5.6+12321";
    const solcInput = { input: true };
    const solcOutput = { output: true };
    const buildInfoPath = yield artifacts.saveBuildInfo(
      solcVersion,
      solcLongVersion,
      solcInput,
      solcOutput
    );
    for (const [name, output] of Object.entries(COMPILER_OUTPUTS)) {
      const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
        sourceName,
        name,
        output
      );
      yield artifacts.saveArtifactAndDebugFile(artifact, buildInfoPath);
    }
  });
}
describe("Artifacts class", function () {
  describe("getArtifactFromContractOutput", function () {
    it("Should always return a bytecode, linkReference, deployedBytecode and deployedLinkReferences", function () {
      const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
        "source.sol",
        "Interface",
        Object.assign(Object.assign({}, COMPILER_OUTPUTS.Interface), {
          evm: undefined,
        })
      );
      const expectedArtifact = {
        _format: "hh-sol-artifact-1",
        contractName: "Interface",
        sourceName: "source.sol",
        abi: COMPILER_OUTPUTS.Interface.abi,
        bytecode: "0x",
        linkReferences: {},
        deployedBytecode: "0x",
        deployedLinkReferences: {},
      };
      chai_1.assert.deepEqual(artifact, expectedArtifact);
      const artifact2 = (0, artifacts_1.getArtifactFromContractOutput)(
        "source.sol",
        "Interface",
        Object.assign(Object.assign({}, COMPILER_OUTPUTS.Interface), {
          evm: {},
        })
      );
      const expectedArtifact2 = {
        _format: "hh-sol-artifact-1",
        contractName: "Interface",
        sourceName: "source.sol",
        abi: COMPILER_OUTPUTS.Interface.abi,
        bytecode: "0x",
        linkReferences: {},
        deployedBytecode: "0x",
        deployedLinkReferences: {},
      };
      chai_1.assert.deepEqual(artifact2, expectedArtifact2);
      const artifact3 = (0, artifacts_1.getArtifactFromContractOutput)(
        "source.sol",
        "Interface",
        Object.assign(Object.assign({}, COMPILER_OUTPUTS.Interface), {
          evm: { bytecode: {} },
        })
      );
      const expectedArtifact3 = {
        _format: "hh-sol-artifact-1",
        contractName: "Interface",
        sourceName: "source.sol",
        abi: COMPILER_OUTPUTS.Interface.abi,
        bytecode: "0x",
        linkReferences: {},
        deployedBytecode: "0x",
        deployedLinkReferences: {},
      };
      chai_1.assert.deepEqual(artifact3, expectedArtifact3);
    });
    it("Should return the right artifact for an interface", function () {
      const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
        "source.sol",
        "Interface",
        COMPILER_OUTPUTS.Interface
      );
      const expectedArtifact = {
        _format: "hh-sol-artifact-1",
        contractName: "Interface",
        sourceName: "source.sol",
        abi: COMPILER_OUTPUTS.Interface.abi,
        bytecode: "0x",
        linkReferences: {},
        deployedBytecode: "0x",
        deployedLinkReferences: {},
      };
      chai_1.assert.deepEqual(artifact, expectedArtifact);
    });
    it("Should return the right artifact for a library", function () {
      const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
        "source.sol",
        "Lib",
        COMPILER_OUTPUTS.Lib
      );
      const expectedArtifact = {
        _format: "hh-sol-artifact-1",
        contractName: "Lib",
        sourceName: "source.sol",
        abi: COMPILER_OUTPUTS.Lib.abi,
        bytecode: `0x${COMPILER_OUTPUTS.Lib.evm.bytecode.object}`,
        linkReferences: {},
        deployedBytecode: `0x${COMPILER_OUTPUTS.Lib.evm.deployedBytecode.object}`,
        deployedLinkReferences: {},
      };
      chai_1.assert.deepEqual(artifact, expectedArtifact);
    });
    it("Should return the right artifact for a contract without libs", function () {
      const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
        "source.sol",
        "WithBytecodeNoLibs",
        COMPILER_OUTPUTS.WithBytecodeNoLibs
      );
      const expectedArtifact = {
        _format: "hh-sol-artifact-1",
        contractName: "WithBytecodeNoLibs",
        sourceName: "source.sol",
        abi: COMPILER_OUTPUTS.WithBytecodeNoLibs.abi,
        bytecode: `0x${COMPILER_OUTPUTS.WithBytecodeNoLibs.evm.bytecode.object}`,
        linkReferences: {},
        deployedBytecode: `0x${COMPILER_OUTPUTS.WithBytecodeNoLibs.evm.deployedBytecode.object}`,
        deployedLinkReferences: {},
      };
      chai_1.assert.deepEqual(artifact, expectedArtifact);
    });
    it("Should return the right artifact for a contract with libs", function () {
      const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
        "source.sol",
        "WithBytecodeAndLibs",
        COMPILER_OUTPUTS.WithBytecodeAndLibs
      );
      const expectedArtifact = {
        _format: "hh-sol-artifact-1",
        contractName: "WithBytecodeAndLibs",
        sourceName: "source.sol",
        abi: COMPILER_OUTPUTS.WithBytecodeAndLibs.abi,
        bytecode: `0x${COMPILER_OUTPUTS.WithBytecodeAndLibs.evm.bytecode.object}`,
        linkReferences:
          COMPILER_OUTPUTS.WithBytecodeAndLibs.evm.bytecode.linkReferences,
        deployedBytecode: `0x${COMPILER_OUTPUTS.WithBytecodeAndLibs.evm.deployedBytecode.object}`,
        deployedLinkReferences:
          COMPILER_OUTPUTS.WithBytecodeAndLibs.evm.deployedBytecode
            .linkReferences,
      };
      chai_1.assert.deepEqual(artifact, expectedArtifact);
    });
    it("Should return the right artifact for an abstract contract without libs", function () {
      const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
        "source.sol",
        "WithoutBytecodeNoLibs",
        COMPILER_OUTPUTS.WithoutBytecodeNoLibs
      );
      const expectedArtifact = {
        _format: "hh-sol-artifact-1",
        contractName: "WithoutBytecodeNoLibs",
        sourceName: "source.sol",
        abi: COMPILER_OUTPUTS.WithoutBytecodeNoLibs.abi,
        bytecode: `0x${COMPILER_OUTPUTS.WithoutBytecodeNoLibs.evm.bytecode.object}`,
        linkReferences: {},
        deployedBytecode: `0x${COMPILER_OUTPUTS.WithoutBytecodeNoLibs.evm.deployedBytecode.object}`,
        deployedLinkReferences: {},
      };
      chai_1.assert.deepEqual(artifact, expectedArtifact);
    });
    it("Should return the right artifact for an abstract contract with libs", function () {
      const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
        "source.sol",
        "WithoutBytecodeWithLibs",
        COMPILER_OUTPUTS.WithoutBytecodeWithLibs
      );
      const expectedArtifact = {
        _format: "hh-sol-artifact-1",
        contractName: "WithoutBytecodeWithLibs",
        sourceName: "source.sol",
        abi: COMPILER_OUTPUTS.WithoutBytecodeWithLibs.abi,
        bytecode: "0x",
        linkReferences:
          COMPILER_OUTPUTS.WithoutBytecodeWithLibs.evm.bytecode.linkReferences,
        deployedBytecode: "0x",
        deployedLinkReferences:
          COMPILER_OUTPUTS.WithoutBytecodeWithLibs.evm.deployedBytecode
            .linkReferences,
      };
      chai_1.assert.deepEqual(artifact, expectedArtifact);
    });
  });
  describe("Artifacts reading and saving", function () {
    (0, fs_1.useTmpDir)("artifacts");
    it("It should write and read (async) the right artifacts", function () {
      return __awaiter(this, void 0, void 0, function* () {
        for (const [name, output] of Object.entries(COMPILER_OUTPUTS)) {
          const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
            "source.sol",
            name,
            output
          );
          const artifacts = new artifacts_1.Artifacts(this.tmpDir);
          yield artifacts.saveArtifactAndDebugFile(artifact, "");
          const storedArtifact = yield artifacts.readArtifact(
            artifact.contractName
          );
          chai_1.assert.deepEqual(storedArtifact, artifact);
        }
      });
    });
    it("Should save the debug file if a build info is provided", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const contractName = "Lib";
        const sourceName = "source.sol";
        const output = COMPILER_OUTPUTS.Lib;
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          sourceName,
          contractName,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "buildInfo");
        const storedArtifact = yield artifacts.readArtifact(
          artifact.contractName
        );
        chai_1.assert.deepEqual(storedArtifact, artifact);
        // eslint-disable-next-line  dot-notation,@typescript-eslint/dot-notation
        const artifactPath = yield artifacts["_getArtifactPath"](
          artifact.contractName
        );
        // eslint-disable-next-line  dot-notation,@typescript-eslint/dot-notation
        const debugFilePath = artifacts["_getDebugFilePath"](artifactPath);
        chai_1.assert.isTrue(
          yield fs_extra_1.default.pathExists(debugFilePath)
        );
      });
    });
    it("Should not save the debug file if a build info is not provided", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const contractName = "Lib";
        const sourceName = "source.sol";
        const output = COMPILER_OUTPUTS.Lib;
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          sourceName,
          contractName,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact);
        const storedArtifact = yield artifacts.readArtifact(
          artifact.contractName
        );
        chai_1.assert.deepEqual(storedArtifact, artifact);
        // eslint-disable-next-line  dot-notation,@typescript-eslint/dot-notation
        const artifactPath = yield artifacts["_getArtifactPath"](
          artifact.contractName
        );
        // eslint-disable-next-line  dot-notation, @typescript-eslint/dot-notation
        const debugFilePath = artifacts["_getDebugFilePath"](artifactPath);
        chai_1.assert.isFalse(
          yield fs_extra_1.default.pathExists(debugFilePath)
        );
      });
    });
    it("Should save the artifact even if the artifacts directory doesn't exist", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const nonexistentPath = path.join(this.tmpDir, "I-DONT-EXIST");
        const name = "Lib";
        const output = COMPILER_OUTPUTS.Lib;
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "source.sol",
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(nonexistentPath);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        const storedArtifact = yield artifacts.readArtifact(name);
        chai_1.assert.deepEqual(storedArtifact, artifact);
      });
    });
    it("It should write and read (sync) the right artifacts", function () {
      return __awaiter(this, void 0, void 0, function* () {
        for (const [name, output] of Object.entries(COMPILER_OUTPUTS)) {
          const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
            "source.sol",
            name,
            output
          );
          const artifacts = new artifacts_1.Artifacts(this.tmpDir);
          yield artifacts.saveArtifactAndDebugFile(artifact, "");
          const storedArtifact = artifacts.readArtifactSync(name);
          chai_1.assert.deepEqual(storedArtifact, artifact);
        }
      });
    });
    it("Should find the right artifact even if the source name has slashes", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const name = "Lib";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "folder/source.sol",
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        const storedArtifact = yield artifacts.readArtifact(name);
        chai_1.assert.deepEqual(storedArtifact, artifact);
      });
    });
    it("Should find the right artifact even if the source name is different", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const sourceName = "source.sol";
        const name = "Lib";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          sourceName,
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        const storedArtifact = yield artifacts.readArtifact(name);
        chai_1.assert.deepEqual(storedArtifact, artifact);
      });
    });
    it("Should find the right artifact when using the fully qualified name", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const sourceName = "MyLib.sol";
        const name = "Lib";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          sourceName,
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact);
        const storedArtifact = yield artifacts.readArtifact("MyLib.sol:Lib");
        chai_1.assert.deepEqual(storedArtifact, artifact);
      });
    });
    it("Should find the right artifact when using the fully qualified name (sync)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const sourceName = "MyLib.sol";
        const name = "Lib";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          sourceName,
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        const storedArtifact = artifacts.readArtifactSync("MyLib.sol:Lib");
        chai_1.assert.deepEqual(storedArtifact, artifact);
      });
    });
    it("Should find the right artifact when using the fully qualified with slashes", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const sourceName = "contracts/MyLib.sol";
        const name = "Lib";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          sourceName,
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        const storedArtifact = yield artifacts.readArtifact(
          "contracts/MyLib.sol:Lib"
        );
        chai_1.assert.deepEqual(storedArtifact, artifact);
      });
    });
    it("Should throw when reading a non-existent contract (async)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => artifacts.readArtifact("NonExistent"), errors_list_1.ERRORS.ARTIFACTS.NOT_FOUND);
      });
    });
    it("Should throw when reading a non-existent contract (sync)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        (0,
        errors_1.expectHardhatError)(() => artifacts.readArtifactSync("NonExistent"), errors_list_1.ERRORS.ARTIFACTS.NOT_FOUND);
      });
    });
    it("Should throw when multiple artifacts match a given name (async)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const name = "Lib";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib.sol",
          name,
          output
        );
        const artifact2 = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib2.sol",
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        yield artifacts.saveArtifactAndDebugFile(artifact2, "");
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => artifacts.readArtifact(name), errors_list_1.ERRORS.ARTIFACTS.MULTIPLE_FOUND, `Lib.sol:Lib${os.EOL}Lib2.sol:Lib`);
      });
    });
    it("Should throw when multiple artifacts match a given name (sync)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const name = "Lib";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib.sol",
          name,
          output
        );
        const artifact2 = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib2.sol",
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        yield artifacts.saveArtifactAndDebugFile(artifact2, "");
        (0,
        errors_1.expectHardhatError)(() => artifacts.readArtifactSync(name), errors_list_1.ERRORS.ARTIFACTS.MULTIPLE_FOUND, `Lib.sol:Lib${os.EOL}Lib2.sol:Lib`);
      });
    });
    it("Should throw with typo suggestions when no artifacts match a given name (async)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const name = "Lib";
        const typo = "Lob";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib.sol",
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => artifacts.readArtifact(typo), errors_list_1.ERRORS.ARTIFACTS.NOT_FOUND, /Did you mean "Lib"\?$/);
      });
    });
    it("Should throw with typo suggestions when no artifacts match a given name (sync)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const name = "Lib";
        const typo = "Lob";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib.sol",
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        (0,
        errors_1.expectHardhatError)(() => artifacts.readArtifactSync(typo), errors_list_1.ERRORS.ARTIFACTS.NOT_FOUND, /Did you mean "Lib"\?$/);
      });
    });
    it("Should throw with fully qualified names for identical suggestions (async)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const name = "Lib";
        const name3 = "Lab";
        const typo = "Lob";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib.sol",
          name,
          output
        );
        const artifact2 = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib2.sol",
          name,
          output
        );
        const artifact3 = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lab.sol",
          name3,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        yield artifacts.saveArtifactAndDebugFile(artifact2, "");
        yield artifacts.saveArtifactAndDebugFile(artifact3, "");
        const expected = ["Lab", "Lib.sol:Lib", "Lib2.sol:Lib"]
          .map((n) => `  * ${n}`)
          .join(os.EOL);
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => artifacts.readArtifact(typo), errors_list_1.ERRORS.ARTIFACTS.NOT_FOUND, expected);
      });
    });
    it("Should throw with fully qualified names for identical suggestions (sync)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const name = "Lib";
        const name3 = "Lab";
        const typo = "Lob";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib.sol",
          name,
          output
        );
        const artifact2 = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib2.sol",
          name,
          output
        );
        const artifact3 = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lab.sol",
          name3,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        yield artifacts.saveArtifactAndDebugFile(artifact2, "");
        yield artifacts.saveArtifactAndDebugFile(artifact3, "");
        const expected = ["Lab", "Lib.sol:Lib", "Lib2.sol:Lib"]
          .map((n) => `  * ${n}`)
          .join(os.EOL);
        (0,
        errors_1.expectHardhatError)(() => artifacts.readArtifactSync(typo), errors_list_1.ERRORS.ARTIFACTS.NOT_FOUND, expected);
      });
    });
    it("Should throw with typo suggestions when no artifacts match a given fully qualified name (async)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const name = "Lib";
        const typo = "Lib.sol:Lob";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib.sol",
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => artifacts.readArtifact(typo), errors_list_1.ERRORS.ARTIFACTS.NOT_FOUND, /Did you mean "Lib\.sol:Lib"\?/);
      });
    });
    it("Should throw with typo suggestions when no artifacts match a given fully qualified name (sync)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const name = "Lib";
        const typo = "Lib.sol:Lob";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib.sol",
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        (0,
        errors_1.expectHardhatError)(() => artifacts.readArtifactSync(typo), errors_list_1.ERRORS.ARTIFACTS.NOT_FOUND, /Did you mean "Lib\.sol:Lib"\?/);
      });
    });
    it("Should throw with multiple typo suggestions if they are the same distance from a given fully qualified name (async)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const name = "Lob";
        const name2 = "Lib";
        const typo = "Lib.sol:Lib";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib.sol",
          name,
          output
        );
        const artifact2 = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lob.sol",
          name2,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        yield artifacts.saveArtifactAndDebugFile(artifact2, "");
        const expected = ["Lib.sol:Lob", "Lob.sol:Lib"]
          .map((n) => `  * ${n}`)
          .join(os.EOL);
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => artifacts.readArtifact(typo), errors_list_1.ERRORS.ARTIFACTS.NOT_FOUND, expected);
      });
    });
    it("Should throw with multiple typo suggestions if they are the same distance from a given fully qualified name (sync)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const name = "Lob";
        const name2 = "Lib";
        const typo = "Lib.sol:Lib";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib.sol",
          name,
          output
        );
        const artifact2 = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lob.sol",
          name2,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        yield artifacts.saveArtifactAndDebugFile(artifact2, "");
        const expected = ["Lib.sol:Lob", "Lob.sol:Lib"]
          .map((n) => `  * ${n}`)
          .join(os.EOL);
        (0,
        errors_1.expectHardhatError)(() => artifacts.readArtifactSync(typo), errors_list_1.ERRORS.ARTIFACTS.NOT_FOUND, expected);
      });
    });
    it("Should not throw with suggestions if the given contract name is further than EDIT_DISTANCE_THRESHOLD (async)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const name = "Lib";
        const typo = "aaaa";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib.sol",
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => artifacts.readArtifact(typo), errors_list_1.ERRORS.ARTIFACTS.NOT_FOUND, /not found\.\s*$/);
      });
    });
    it("Should not throw with suggestions if the given contract name is further than EDIT_DISTANCE_THRESHOLD (sync)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const name = "Lib";
        const typo = "aaaa";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib.sol",
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        (0,
        errors_1.expectHardhatError)(() => artifacts.readArtifactSync(typo), errors_list_1.ERRORS.ARTIFACTS.NOT_FOUND, /not found\.\s*$/);
      });
    });
    it("Should not throw with suggestions if the given fully qualified name is further than EDIT_DISTANCE_THRESHOLD (async)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const name = "Lib";
        const typo = "Lib.sol:aaaa";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib.sol",
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => artifacts.readArtifact(typo), errors_list_1.ERRORS.ARTIFACTS.NOT_FOUND, /not found\.\s*$/);
      });
    });
    it("Should not throw with suggestions if the given fully qualified name is further than EDIT_DISTANCE_THRESHOLD (sync)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const output = COMPILER_OUTPUTS.Lib;
        const name = "Lib";
        const typo = "Lib.sol:aaaa";
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib.sol",
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        (0,
        errors_1.expectHardhatError)(() => artifacts.readArtifactSync(typo), errors_list_1.ERRORS.ARTIFACTS.NOT_FOUND, /not found\.\s*$/);
      });
    });
    it("Should be possible to get all the fully qualified names of the artifacts", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield storeAllArtifacts("source.sol", artifacts);
        const names = yield artifacts.getAllFullyQualifiedNames();
        chai_1.assert.equal(names.length, Object.keys(COMPILER_OUTPUTS).length);
        const expected = [
          "source.sol:Interface",
          "source.sol:Lib",
          "source.sol:WithBytecodeAndLibs",
          "source.sol:WithBytecodeNoLibs",
          "source.sol:WithoutBytecodeNoLibs",
          "source.sol:WithoutBytecodeWithLibs",
        ];
        expected.sort();
        chai_1.assert.deepEqual(names, expected);
      });
    });
    it("Should be possible to get an absolute path to an artifact given a fully qualified name", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const name = "Lib";
        const output = COMPILER_OUTPUTS.Lib;
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "Lib.sol",
          name,
          output
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        const fullyQualifiedName = "Lib.sol:Lib";
        const artifactPath =
          artifacts.formArtifactPathFromFullyQualifiedName(fullyQualifiedName);
        chai_1.assert.isTrue(artifactPath.startsWith(this.tmpDir));
        chai_1.assert.isTrue(artifactPath.endsWith(".json"));
      });
    });
    it("Should be possible to get a build info from a fully qualified name (async)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const contractName = "Lib";
        const sourceName = "source.sol";
        const output = COMPILER_OUTPUTS.Lib;
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        const solcVersion = "0.5.6";
        const solcLongVersion = "0.5.6+12321";
        const solcInput = { input: {} };
        const solcOutput = { sources: {}, contracts: {} };
        const buildInfoPath = yield artifacts.saveBuildInfo(
          solcVersion,
          solcLongVersion,
          solcInput,
          solcOutput
        );
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          sourceName,
          contractName,
          output
        );
        yield artifacts.saveArtifactAndDebugFile(artifact, buildInfoPath);
        const storedBuildInfo = yield artifacts.getBuildInfo(
          (0, contract_names_1.getFullyQualifiedName)(sourceName, contractName)
        );
        chai_1.assert.equal(
          storedBuildInfo === null || storedBuildInfo === void 0
            ? void 0
            : storedBuildInfo.solcVersion,
          solcVersion
        );
        chai_1.assert.equal(
          storedBuildInfo === null || storedBuildInfo === void 0
            ? void 0
            : storedBuildInfo.solcLongVersion,
          solcLongVersion
        );
        chai_1.assert.deepEqual(
          storedBuildInfo === null || storedBuildInfo === void 0
            ? void 0
            : storedBuildInfo.input,
          solcInput
        );
        chai_1.assert.deepEqual(
          storedBuildInfo === null || storedBuildInfo === void 0
            ? void 0
            : storedBuildInfo.output,
          solcOutput
        );
      });
    });
    it("Should be possible to get a build info from a fully qualified name (sync)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const contractName = "Lib";
        const sourceName = "source.sol";
        const output = COMPILER_OUTPUTS.Lib;
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        const solcVersion = "0.5.6";
        const solcLongVersion = "0.5.6+12321";
        const solcInput = { input: {} };
        const solcOutput = { sources: {}, contracts: {} };
        const buildInfoPath = yield artifacts.saveBuildInfo(
          solcVersion,
          solcLongVersion,
          solcInput,
          solcOutput
        );
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          sourceName,
          contractName,
          output
        );
        yield artifacts.saveArtifactAndDebugFile(artifact, buildInfoPath);
        const storedBuildInfo = artifacts.getBuildInfoSync(
          (0, contract_names_1.getFullyQualifiedName)(sourceName, contractName)
        );
        chai_1.assert.equal(
          storedBuildInfo === null || storedBuildInfo === void 0
            ? void 0
            : storedBuildInfo.solcVersion,
          solcVersion
        );
        chai_1.assert.equal(
          storedBuildInfo === null || storedBuildInfo === void 0
            ? void 0
            : storedBuildInfo.solcLongVersion,
          solcLongVersion
        );
        chai_1.assert.deepEqual(
          storedBuildInfo === null || storedBuildInfo === void 0
            ? void 0
            : storedBuildInfo.input,
          solcInput
        );
        chai_1.assert.deepEqual(
          storedBuildInfo === null || storedBuildInfo === void 0
            ? void 0
            : storedBuildInfo.output,
          solcOutput
        );
      });
    });
    it("Trying to get a build info of an artifact that doesn't have one should just return undefined (async)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const contractName = "Lib";
        const sourceName = "source.sol";
        const output = COMPILER_OUTPUTS.Lib;
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          sourceName,
          contractName,
          output
        );
        yield artifacts.saveArtifactAndDebugFile(artifact);
        const storedBuildInfo = yield artifacts.getBuildInfo(
          (0, contract_names_1.getFullyQualifiedName)(sourceName, contractName)
        );
        chai_1.assert.isUndefined(storedBuildInfo);
      });
    });
    it("Trying to get a build info of an artifact that doesn't have one should just return undefined (sync)", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const contractName = "Lib";
        const sourceName = "source.sol";
        const output = COMPILER_OUTPUTS.Lib;
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          sourceName,
          contractName,
          output
        );
        yield artifacts.saveArtifactAndDebugFile(artifact);
        const storedBuildInfo = artifacts.getBuildInfoSync(
          (0, contract_names_1.getFullyQualifiedName)(sourceName, contractName)
        );
        chai_1.assert.isUndefined(storedBuildInfo);
      });
    });
    it("Should be possible to get the paths to all the artifacts, debug files and build infos", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield storeAllArtifacts("source.sol", artifacts);
        const artifactPaths = yield artifacts.getArtifactPaths();
        const debugFilePaths = yield artifacts.getDebugFilePaths();
        const buildInfoPaths = yield artifacts.getBuildInfoPaths();
        chai_1.assert.lengthOf(
          artifactPaths,
          Object.keys(COMPILER_OUTPUTS).length
        );
        chai_1.assert.isTrue(
          artifactPaths.every((p) => p.startsWith(this.tmpDir))
        );
        chai_1.assert.isTrue(artifactPaths.every((p) => p.endsWith(".json")));
        chai_1.assert.lengthOf(
          debugFilePaths,
          Object.keys(COMPILER_OUTPUTS).length
        );
        chai_1.assert.isTrue(
          debugFilePaths.every((p) => p.startsWith(this.tmpDir))
        );
        chai_1.assert.isTrue(
          debugFilePaths.every((p) => p.endsWith(".dbg.json"))
        );
        chai_1.assert.lengthOf(buildInfoPaths, 1);
        chai_1.assert.isTrue(
          buildInfoPaths.every((p) => p.startsWith(this.tmpDir))
        );
        chai_1.assert.isTrue(buildInfoPaths.every((p) => p.endsWith(".json")));
      });
    });
    it("Should use a deterministic build info name based on the solc version and input", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        const solcVersion = "0.5.6";
        const solcLongVersion = "0.5.6+12321";
        const solcInput = { input: true };
        const solcOutput = { output: true };
        const buildInfoPath = yield artifacts.saveBuildInfo(
          solcVersion,
          solcLongVersion,
          solcInput,
          solcOutput
        );
        yield fs_extra_1.default.unlink(buildInfoPath);
        const buildInfoPath2 = yield artifacts.saveBuildInfo(
          solcVersion,
          solcLongVersion,
          solcInput,
          solcOutput
        );
        yield fs_extra_1.default.unlink(buildInfoPath2);
        const buildInfoPathChangedVersion = yield artifacts.saveBuildInfo(
          `${solcVersion}changed`,
          solcLongVersion,
          solcInput,
          solcOutput
        );
        const buildInfoPathChangedLongVersion = yield artifacts.saveBuildInfo(
          solcVersion,
          `${solcLongVersion}changed`,
          solcInput,
          solcOutput
        );
        const buildInfoPathChangedInput = yield artifacts.saveBuildInfo(
          solcVersion,
          solcLongVersion,
          Object.assign(Object.assign({}, solcInput), { changed: true }),
          solcOutput
        );
        // The output depends on the other params, so this test just makes sure that
        // it's not used
        const buildInfoPathChangedOutput = yield artifacts.saveBuildInfo(
          solcVersion,
          solcLongVersion,
          solcInput,
          Object.assign(Object.assign({}, solcInput), { changed: true })
        );
        chai_1.assert.equal(buildInfoPath, buildInfoPath2);
        chai_1.assert.equal(buildInfoPath, buildInfoPathChangedOutput);
        const allPaths = [
          buildInfoPath,
          buildInfoPath2,
          buildInfoPathChangedVersion,
          buildInfoPathChangedLongVersion,
          buildInfoPathChangedInput,
          buildInfoPathChangedOutput,
        ];
        // -2 because of the ones that we tested above that are equal
        chai_1.assert.equal(new Set(allPaths).size, allPaths.length - 2);
      });
    });
    it("Should be able to save build-infos with partial fields", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        function assertBuildInfoIsCorrectylSavedAndHasTheRightOutput(
          solcOutput
        ) {
          return __awaiter(this, void 0, void 0, function* () {
            const solcInput = {
              language: "solidity",
              sources: {},
              settings: {
                optimizer: {},
                outputSelection: {},
              },
            };
            const buildInfoPath = yield artifacts.saveBuildInfo(
              "0.4.12",
              "0.4.12+asd",
              solcInput,
              solcOutput
            );
            const read = yield fs_extra_1.default.readJSON(buildInfoPath);
            chai_1.assert.deepEqual(read.output, solcOutput);
          });
        }
        // empty sources and contracts
        yield assertBuildInfoIsCorrectylSavedAndHasTheRightOutput({
          sources: {},
          contracts: {},
        });
        // with unrelated data
        yield assertBuildInfoIsCorrectylSavedAndHasTheRightOutput({
          sources: {},
          contracts: {},
          otherStuff: { a: 1 },
        });
        // with a single source
        yield assertBuildInfoIsCorrectylSavedAndHasTheRightOutput({
          sources: { a: { id: 123, ast: {} } },
          contracts: {},
        });
        // with a multiple sources
        yield assertBuildInfoIsCorrectylSavedAndHasTheRightOutput({
          sources: {
            a: { id: 123, ast: {} },
            b: { id: 1, ast: { asdas: 123 } },
          },
          contracts: {},
        });
        const contract = {
          abi: [],
          evm: {
            bytecode: {
              object: "123",
              sourceMap: "asd",
              opcodes: "123asd",
              linkReferences: {},
            },
            deployedBytecode: {
              object: "123",
              sourceMap: "asd",
              opcodes: "123asd",
              linkReferences: {},
            },
            methodIdentifiers: {},
          },
        };
        // with a single contract
        yield assertBuildInfoIsCorrectylSavedAndHasTheRightOutput({
          sources: {},
          contracts: {
            asd: {
              C: contract,
            },
          },
        });
        // with multiple contracts
        yield assertBuildInfoIsCorrectylSavedAndHasTheRightOutput({
          sources: {},
          contracts: {
            asd: {
              C: contract,
              B: contract,
            },
            f: {
              F: contract,
            },
          },
        });
      });
    });
  });
  // TODO: How do we test that getting a path for an artifact and build
  //   info gets cached?
  describe("Caching", function () {
    (0, fs_1.useTmpDir)("artifacts");
    const SOLC_INPUT = {
      sources: {},
      settings: { optimizer: {}, outputSelection: {} },
      language: "",
    };
    const SOLC_OUPUT = {
      sources: {},
      contracts: {},
    };
    let artifacts;
    let buildInfoPath;
    beforeEach(function () {
      return __awaiter(this, void 0, void 0, function* () {
        artifacts = new artifacts_1.Artifacts(this.tmpDir);
        buildInfoPath = yield artifacts.saveBuildInfo(
          "0.4.12",
          "0.4.12+123",
          SOLC_INPUT,
          SOLC_OUPUT
        );
        yield artifacts.saveArtifactAndDebugFile(
          {
            _format: "",
            abi: [],
            contractName: "C",
            sourceName: "c.sol",
            bytecode: "",
            deployedBytecode: "",
            linkReferences: {},
            deployedLinkReferences: {},
          },
          buildInfoPath
        );
      });
    });
    describe("Successful caching", function () {
      it("Should cache the path to each artifact and build info, and the lists of paths", function () {
        return __awaiter(this, void 0, void 0, function* () {
          chai_1.assert.lengthOf(yield artifacts.getArtifactPaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getDebugFilePaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getBuildInfoPaths(), 1);
          // we create some other files, which shouldn't be returned
          yield fs_extra_1.default.writeJSON(
            path.join(this.tmpDir, "c.sol", "B.json"),
            {}
          );
          yield fs_extra_1.default.writeJSON(
            path.join(this.tmpDir, "c.sol", "B.dbg.json"),
            {}
          );
          yield fs_extra_1.default.writeJSON(
            path.join(this.tmpDir, "build-info", "something.json"),
            {}
          );
          chai_1.assert.lengthOf(yield artifacts.getArtifactPaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getDebugFilePaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getBuildInfoPaths(), 1);
        });
      });
    });
    describe("Clear cache", function () {
      it("Should clear all the caches", function () {
        return __awaiter(this, void 0, void 0, function* () {
          chai_1.assert.lengthOf(yield artifacts.getArtifactPaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getDebugFilePaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getBuildInfoPaths(), 1);
          // we create some other files, which should be returned after clearing
          //  the cache
          yield fs_extra_1.default.writeJSON(
            path.join(this.tmpDir, "c.sol", "B.json"),
            {}
          );
          yield fs_extra_1.default.writeJSON(
            path.join(this.tmpDir, "c.sol", "B.dbg.json"),
            {}
          );
          yield fs_extra_1.default.writeJSON(
            path.join(this.tmpDir, "build-info", "something.json"),
            {}
          );
          artifacts.clearCache();
          chai_1.assert.lengthOf(yield artifacts.getArtifactPaths(), 2);
          chai_1.assert.lengthOf(yield artifacts.getDebugFilePaths(), 2);
          chai_1.assert.lengthOf(yield artifacts.getBuildInfoPaths(), 2);
        });
      });
      it("Shouldn't re-enable the cache", function () {
        return __awaiter(this, void 0, void 0, function* () {
          artifacts.disableCache();
          chai_1.assert.lengthOf(yield artifacts.getArtifactPaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getDebugFilePaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getBuildInfoPaths(), 1);
          // We clear the cache here and call the getters again, this shouldn't
          // cache the results
          artifacts.clearCache();
          chai_1.assert.lengthOf(yield artifacts.getArtifactPaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getDebugFilePaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getBuildInfoPaths(), 1);
          // we create some other files, which should be returned, as there's
          // no cache
          yield fs_extra_1.default.writeJSON(
            path.join(this.tmpDir, "c.sol", "B.json"),
            {}
          );
          yield fs_extra_1.default.writeJSON(
            path.join(this.tmpDir, "c.sol", "B.dbg.json"),
            {}
          );
          yield fs_extra_1.default.writeJSON(
            path.join(this.tmpDir, "build-info", "something.json"),
            {}
          );
          chai_1.assert.lengthOf(yield artifacts.getArtifactPaths(), 2);
          chai_1.assert.lengthOf(yield artifacts.getDebugFilePaths(), 2);
          chai_1.assert.lengthOf(yield artifacts.getBuildInfoPaths(), 2);
        });
      });
    });
    describe("Automatic cache clearing", function () {
      it("Should clear all the caches", function () {
        return __awaiter(this, void 0, void 0, function* () {
          chai_1.assert.lengthOf(yield artifacts.getArtifactPaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getDebugFilePaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getBuildInfoPaths(), 1);
          // create new artifacts clears the cache
          buildInfoPath = yield artifacts.saveBuildInfo(
            "0.4.13",
            "0.4.13+123",
            SOLC_INPUT,
            SOLC_OUPUT
          );
          yield artifacts.saveArtifactAndDebugFile(
            {
              _format: "",
              abi: [],
              contractName: "C",
              sourceName: "e.sol",
              bytecode: "",
              deployedBytecode: "",
              linkReferences: {},
              deployedLinkReferences: {},
            },
            buildInfoPath
          );
          chai_1.assert.lengthOf(yield artifacts.getArtifactPaths(), 2);
          chai_1.assert.lengthOf(yield artifacts.getDebugFilePaths(), 2);
          chai_1.assert.lengthOf(yield artifacts.getBuildInfoPaths(), 2);
        });
      });
      it("Shouldn't re-enable the cache", function () {
        return __awaiter(this, void 0, void 0, function* () {
          artifacts.disableCache();
          artifacts.clearCache();
          chai_1.assert.lengthOf(yield artifacts.getArtifactPaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getDebugFilePaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getBuildInfoPaths(), 1);
          // create new artifacts clears the cache
          buildInfoPath = yield artifacts.saveBuildInfo(
            "0.4.13",
            "0.4.13+123",
            SOLC_INPUT,
            SOLC_OUPUT
          );
          yield artifacts.saveArtifactAndDebugFile(
            {
              _format: "",
              abi: [],
              contractName: "C",
              sourceName: "e.sol",
              bytecode: "",
              deployedBytecode: "",
              linkReferences: {},
              deployedLinkReferences: {},
            },
            buildInfoPath
          );
          chai_1.assert.lengthOf(yield artifacts.getArtifactPaths(), 2);
          chai_1.assert.lengthOf(yield artifacts.getDebugFilePaths(), 2);
          chai_1.assert.lengthOf(yield artifacts.getBuildInfoPaths(), 2);
          // we create some other files, which should be returned, as the cache
          //  is disabled
          yield fs_extra_1.default.writeJSON(
            path.join(this.tmpDir, "c.sol", "B.json"),
            {}
          );
          yield fs_extra_1.default.writeJSON(
            path.join(this.tmpDir, "c.sol", "B.dbg.json"),
            {}
          );
          yield fs_extra_1.default.writeJSON(
            path.join(this.tmpDir, "build-info", "something.json"),
            {}
          );
          chai_1.assert.lengthOf(yield artifacts.getArtifactPaths(), 3);
          chai_1.assert.lengthOf(yield artifacts.getDebugFilePaths(), 3);
          chai_1.assert.lengthOf(yield artifacts.getBuildInfoPaths(), 3);
        });
      });
    });
    describe("Disabling cache", function () {
      it("Should clear the cache", function () {
        return __awaiter(this, void 0, void 0, function* () {
          chai_1.assert.lengthOf(yield artifacts.getArtifactPaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getDebugFilePaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getBuildInfoPaths(), 1);
          // we create some other files, which shouldn't be returned
          yield fs_extra_1.default.writeJSON(
            path.join(this.tmpDir, "c.sol", "B.json"),
            {}
          );
          yield fs_extra_1.default.writeJSON(
            path.join(this.tmpDir, "c.sol", "B.dbg.json"),
            {}
          );
          yield fs_extra_1.default.writeJSON(
            path.join(this.tmpDir, "build-info", "something.json"),
            {}
          );
          chai_1.assert.lengthOf(yield artifacts.getArtifactPaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getDebugFilePaths(), 1);
          chai_1.assert.lengthOf(yield artifacts.getBuildInfoPaths(), 1);
          artifacts.disableCache();
          // we disabled the cache, so now they should be returned
          chai_1.assert.lengthOf(yield artifacts.getArtifactPaths(), 2);
          chai_1.assert.lengthOf(yield artifacts.getDebugFilePaths(), 2);
          chai_1.assert.lengthOf(yield artifacts.getBuildInfoPaths(), 2);
        });
      });
    });
  });
  describe("artifactExists", function () {
    (0, fs_1.useTmpDir)("artifacts");
    it("should check that the artifact exists", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "source.sol",
          "Interface",
          Object.assign(Object.assign({}, COMPILER_OUTPUTS.Interface), {
            evm: undefined,
          })
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        // FQN
        chai_1.assert.isTrue(
          yield artifacts.artifactExists("source.sol:Interface")
        );
        // non-FQN
        chai_1.assert.isTrue(yield artifacts.artifactExists("Interface"));
      });
    });
    it("should check that the artifact doesn't exist", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const artifact = (0, artifacts_1.getArtifactFromContractOutput)(
          "source.sol",
          "Interface",
          Object.assign(Object.assign({}, COMPILER_OUTPUTS.Interface), {
            evm: undefined,
          })
        );
        const artifacts = new artifacts_1.Artifacts(this.tmpDir);
        yield artifacts.saveArtifactAndDebugFile(artifact, "");
        // FQN, missing file
        chai_1.assert.isFalse(
          yield artifacts.artifactExists("invalid/path.sol:A")
        );
        // FQN, missing artifact
        chai_1.assert.isFalse(yield artifacts.artifactExists("source.sol:A"));
        // FQN, wrong casing
        chai_1.assert.isFalse(
          yield artifacts.artifactExists("source.sol:interface")
        );
        // non-FQN, missing artifact
        chai_1.assert.isFalse(yield artifacts.artifactExists("A"));
      });
    });
  });
});
// TODO: All of these outputs have their evm.bytecode duplicated as
//  evm.deployedBytecode. This should be corrected, using the actual output
const COMPILER_OUTPUTS = {
  Interface: {
    abi: [
      {
        constant: false,
        inputs: [],
        name: "abstractFunction",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    evm: {
      bytecode: {
        linkReferences: {},
        object: "",
        opcodes: "",
        sourceMap: "",
      },
      deployedBytecode: {
        linkReferences: {},
        object: "",
        opcodes: "",
        sourceMap: "",
      },
    },
  },
  Lib: {
    abi: [
      {
        constant: true,
        inputs: [
          {
            name: "_v",
            type: "uint256",
          },
        ],
        name: "a",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "pure",
        type: "function",
      },
    ],
    evm: {
      bytecode: {
        linkReferences: {},
        object:
          "60cd61002f600b82828239805160001a6073146000811461001f57610021565bfe5b5030600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106050576000357c010000000000000000000000000000000000000000000000000000000090048063f0fdf834146055575b600080fd5b607e60048036036020811015606957600080fd5b81019080803590602001909291905050506094565b6040518082815260200191505060405180910390f35b600060018201905091905056fea165627a7a72305820a41f21f6acb16402773e617b7af23322ee8a67257edfe689db80e26fc133648e0029",
        opcodes:
          "PUSH1 0xCD PUSH2 0x2F PUSH1 0xB DUP3 DUP3 DUP3 CODECOPY DUP1 MLOAD PUSH1 0x0 BYTE PUSH1 0x73 EQ PUSH1 0x0 DUP2 EQ PUSH2 0x1F JUMPI PUSH2 0x21 JUMP JUMPDEST INVALID JUMPDEST POP ADDRESS PUSH1 0x0 MSTORE PUSH1 0x73 DUP2 MSTORE8 DUP3 DUP2 RETURN INVALID PUSH20 0x0 ADDRESS EQ PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x4 CALLDATASIZE LT PUSH1 0x50 JUMPI PUSH1 0x0 CALLDATALOAD PUSH29 0x100000000000000000000000000000000000000000000000000000000 SWAP1 DIV DUP1 PUSH4 0xF0FDF834 EQ PUSH1 0x55 JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST PUSH1 0x7E PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x20 DUP2 LT ISZERO PUSH1 0x69 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH1 0x94 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH1 0x0 PUSH1 0x1 DUP3 ADD SWAP1 POP SWAP2 SWAP1 POP JUMP INVALID LOG1 PUSH6 0x627A7A723058 KECCAK256 LOG4 0x1f 0x21 0xf6 0xac 0xb1 PUSH5 0x2773E617B PUSH27 0xF23322EE8A67257EDFE689DB80E26FC133648E0029000000000000 ",
        sourceMap:
          "25:103:0:-;;132:2:-1;166:7;155:9;146:7;137:37;252:7;246:14;243:1;238:23;232:4;229:33;270:1;265:20;;;;222:63;;265:20;274:9;222:63;;298:9;295:1;288:20;328:4;319:7;311:22;352:7;343;336:24",
      },
      deployedBytecode: {
        linkReferences: {},
        object:
          "60cd61002f600b82828239805160001a6073146000811461001f57610021565bfe5b5030600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106050576000357c010000000000000000000000000000000000000000000000000000000090048063f0fdf834146055575b600080fd5b607e60048036036020811015606957600080fd5b81019080803590602001909291905050506094565b6040518082815260200191505060405180910390f35b600060018201905091905056fea165627a7a72305820a41f21f6acb16402773e617b7af23322ee8a67257edfe689db80e26fc133648e0029",
        opcodes:
          "PUSH1 0xCD PUSH2 0x2F PUSH1 0xB DUP3 DUP3 DUP3 CODECOPY DUP1 MLOAD PUSH1 0x0 BYTE PUSH1 0x73 EQ PUSH1 0x0 DUP2 EQ PUSH2 0x1F JUMPI PUSH2 0x21 JUMP JUMPDEST INVALID JUMPDEST POP ADDRESS PUSH1 0x0 MSTORE PUSH1 0x73 DUP2 MSTORE8 DUP3 DUP2 RETURN INVALID PUSH20 0x0 ADDRESS EQ PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x4 CALLDATASIZE LT PUSH1 0x50 JUMPI PUSH1 0x0 CALLDATALOAD PUSH29 0x100000000000000000000000000000000000000000000000000000000 SWAP1 DIV DUP1 PUSH4 0xF0FDF834 EQ PUSH1 0x55 JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST PUSH1 0x7E PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x20 DUP2 LT ISZERO PUSH1 0x69 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH1 0x94 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH1 0x0 PUSH1 0x1 DUP3 ADD SWAP1 POP SWAP2 SWAP1 POP JUMP INVALID LOG1 PUSH6 0x627A7A723058 KECCAK256 LOG4 0x1f 0x21 0xf6 0xac 0xb1 PUSH5 0x2773E617B PUSH27 0xF23322EE8A67257EDFE689DB80E26FC133648E0029000000000000 ",
        sourceMap:
          "25:103:0:-;;132:2:-1;166:7;155:9;146:7;137:37;252:7;246:14;243:1;238:23;232:4;229:33;270:1;265:20;;;;222:63;;265:20;274:9;222:63;;298:9;295:1;288:20;328:4;319:7;311:22;352:7;343;336:24",
      },
    },
  },
  WithBytecodeAndLibs: {
    abi: [
      {
        constant: true,
        inputs: [
          {
            name: "_v",
            type: "uint256",
          },
        ],
        name: "b",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "pure",
        type: "function",
      },
    ],
    evm: {
      bytecode: {
        linkReferences: {
          "contracts/Greeter.sol": {
            Lib: [
              {
                length: 20,
                start: 179,
              },
            ],
          },
        },
        object:
          "608060405234801561001057600080fd5b5061016a806100206000396000f3fe60806040526004361061003b576000357c010000000000000000000000000000000000000000000000000000000090048063cd580ff314610040575b600080fd5b34801561004c57600080fd5b506100796004803603602081101561006357600080fd5b810190808035906020019092919050505061008f565b6040518082815260200191505060405180910390f35b600073__$3baa23f5ca7f58d5ae3c2c5442fb05c7c2$__63f0fdf834836040518263ffffffff167c01000000000000000000000000000000000000000000000000000000000281526004018082815260200191505060206040518083038186803b1580156100fc57600080fd5b505af4158015610110573d6000803e3d6000fd5b505050506040513d602081101561012657600080fd5b8101908080519060200190929190505050905091905056fea165627a7a723058202f8f784cceecf0165b9ece17246235b575bec1a6ae4751e4aeb0a6b1bd1eb1340029",
        opcodes:
          "PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH2 0x10 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x16A DUP1 PUSH2 0x20 PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN INVALID PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x4 CALLDATASIZE LT PUSH2 0x3B JUMPI PUSH1 0x0 CALLDATALOAD PUSH29 0x100000000000000000000000000000000000000000000000000000000 SWAP1 DIV DUP1 PUSH4 0xCD580FF3 EQ PUSH2 0x40 JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x4C JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x79 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x20 DUP2 LT ISZERO PUSH2 0x63 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x8F JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH1 0x0 PUSH20 0x0 PUSH4 0xF0FDF834 DUP4 PUSH1 0x40 MLOAD DUP3 PUSH4 0xFFFFFFFF AND PUSH29 0x100000000000000000000000000000000000000000000000000000000 MUL DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x20 PUSH1 0x40 MLOAD DUP1 DUP4 SUB DUP2 DUP7 DUP1 EXTCODESIZE ISZERO DUP1 ISZERO PUSH2 0xFC JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP GAS DELEGATECALL ISZERO DUP1 ISZERO PUSH2 0x110 JUMPI RETURNDATASIZE PUSH1 0x0 DUP1 RETURNDATACOPY RETURNDATASIZE PUSH1 0x0 REVERT JUMPDEST POP POP POP POP PUSH1 0x40 MLOAD RETURNDATASIZE PUSH1 0x20 DUP2 LT ISZERO PUSH2 0x126 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP SWAP1 POP SWAP2 SWAP1 POP JUMP INVALID LOG1 PUSH6 0x627A7A723058 KECCAK256 0x2f DUP16 PUSH25 0x4CCEECF0165B9ECE17246235B575BEC1A6AE4751E4AEB0A6B1 0xbd 0x1e 0xb1 CALLVALUE STOP 0x29 ",
        sourceMap:
          "342:123:0:-;;;;8:9:-1;5:2;;;30:1;27;20:12;5:2;342:123:0;;;;;;;",
      },
      deployedBytecode: {
        linkReferences: {
          "contracts/Greeter.sol": {
            Lib: [
              {
                length: 20,
                start: 179,
              },
            ],
          },
        },
        object:
          "608060405234801561001057600080fd5b5061016a806100206000396000f3fe60806040526004361061003b576000357c010000000000000000000000000000000000000000000000000000000090048063cd580ff314610040575b600080fd5b34801561004c57600080fd5b506100796004803603602081101561006357600080fd5b810190808035906020019092919050505061008f565b6040518082815260200191505060405180910390f35b600073__$3baa23f5ca7f58d5ae3c2c5442fb05c7c2$__63f0fdf834836040518263ffffffff167c01000000000000000000000000000000000000000000000000000000000281526004018082815260200191505060206040518083038186803b1580156100fc57600080fd5b505af4158015610110573d6000803e3d6000fd5b505050506040513d602081101561012657600080fd5b8101908080519060200190929190505050905091905056fea165627a7a723058202f8f784cceecf0165b9ece17246235b575bec1a6ae4751e4aeb0a6b1bd1eb1340029",
        opcodes:
          "PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH2 0x10 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x16A DUP1 PUSH2 0x20 PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN INVALID PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x4 CALLDATASIZE LT PUSH2 0x3B JUMPI PUSH1 0x0 CALLDATALOAD PUSH29 0x100000000000000000000000000000000000000000000000000000000 SWAP1 DIV DUP1 PUSH4 0xCD580FF3 EQ PUSH2 0x40 JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x4C JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x79 PUSH1 0x4 DUP1 CALLDATASIZE SUB PUSH1 0x20 DUP2 LT ISZERO PUSH2 0x63 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x8F JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH1 0x0 PUSH20 0x0 PUSH4 0xF0FDF834 DUP4 PUSH1 0x40 MLOAD DUP3 PUSH4 0xFFFFFFFF AND PUSH29 0x100000000000000000000000000000000000000000000000000000000 MUL DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x20 PUSH1 0x40 MLOAD DUP1 DUP4 SUB DUP2 DUP7 DUP1 EXTCODESIZE ISZERO DUP1 ISZERO PUSH2 0xFC JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP GAS DELEGATECALL ISZERO DUP1 ISZERO PUSH2 0x110 JUMPI RETURNDATASIZE PUSH1 0x0 DUP1 RETURNDATACOPY RETURNDATASIZE PUSH1 0x0 REVERT JUMPDEST POP POP POP POP PUSH1 0x40 MLOAD RETURNDATASIZE PUSH1 0x20 DUP2 LT ISZERO PUSH2 0x126 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP2 ADD SWAP1 DUP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP SWAP1 POP SWAP2 SWAP1 POP JUMP INVALID LOG1 PUSH6 0x627A7A723058 KECCAK256 0x2f DUP16 PUSH25 0x4CCEECF0165B9ECE17246235B575BEC1A6AE4751E4AEB0A6B1 0xbd 0x1e 0xb1 CALLVALUE STOP 0x29 ",
        sourceMap:
          "342:123:0:-;;;;8:9:-1;5:2;;;30:1;27;20:12;5:2;342:123:0;;;;;;;",
      },
    },
  },
  WithBytecodeNoLibs: {
    abi: [],
    evm: {
      bytecode: {
        linkReferences: {},
        object:
          "6080604052348015600f57600080fd5b50603580601d6000396000f3fe6080604052600080fdfea165627a7a7230582007ac6029c1d58f4d28523d347bdf495350ea8691438d6bfcc5a7c88bf8d586c40029",
        opcodes:
          "PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH1 0xF JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x35 DUP1 PUSH1 0x1D PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN INVALID PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x0 DUP1 REVERT INVALID LOG1 PUSH6 0x627A7A723058 KECCAK256 SMOD 0xac PUSH1 0x29 0xc1 0xd5 DUP16 0x4d 0x28 MSTORE RETURNDATASIZE CALLVALUE PUSH28 0xDF495350EA8691438D6BFCC5A7C88BF8D586C4002900000000000000 ",
        sourceMap:
          "215:31:0:-;;;;8:9:-1;5:2;;;30:1;27;20:12;5:2;215:31:0;;;;;;;",
      },
      deployedBytecode: {
        linkReferences: {},
        object:
          "6080604052348015600f57600080fd5b50603580601d6000396000f3fe6080604052600080fdfea165627a7a7230582007ac6029c1d58f4d28523d347bdf495350ea8691438d6bfcc5a7c88bf8d586c40029",
        opcodes:
          "PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH1 0xF JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x35 DUP1 PUSH1 0x1D PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN INVALID PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x0 DUP1 REVERT INVALID LOG1 PUSH6 0x627A7A723058 KECCAK256 SMOD 0xac PUSH1 0x29 0xc1 0xd5 DUP16 0x4d 0x28 MSTORE RETURNDATASIZE CALLVALUE PUSH28 0xDF495350EA8691438D6BFCC5A7C88BF8D586C4002900000000000000 ",
        sourceMap:
          "215:31:0:-;;;;8:9:-1;5:2;;;30:1;27;20:12;5:2;215:31:0;;;;;;;",
      },
    },
  },
  WithoutBytecodeWithLibs: {
    abi: [
      {
        constant: false,
        inputs: [],
        name: "abstractFunction",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [
          {
            name: "_v",
            type: "uint256",
          },
        ],
        name: "b",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "pure",
        type: "function",
      },
    ],
    evm: {
      bytecode: {
        linkReferences: {},
        object: "",
        opcodes: "",
        sourceMap: "",
      },
      deployedBytecode: {
        linkReferences: {},
        object: "",
        opcodes: "",
        sourceMap: "",
      },
    },
  },
  WithoutBytecodeNoLibs: {
    abi: [
      {
        constant: false,
        inputs: [],
        name: "abstractFunction",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    evm: {
      bytecode: {
        linkReferences: {},
        object: "",
        opcodes: "",
        sourceMap: "",
      },
      deployedBytecode: {
        linkReferences: {},
        object: "",
        opcodes: "",
        sourceMap: "",
      },
    },
  },
};
