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
exports.showForkRecommendationsBannerIfNecessary = void 0;
const picocolors_1 = __importDefault(require("picocolors"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
function getAlreadyShownFilePath(forkCachePath) {
  return path_1.default.join(
    forkCachePath,
    "recommendations-already-shown.json"
  );
}
function displayBanner() {
  console.warn(
    picocolors_1.default
      .yellow(`You're running a network fork starting from the latest block.
Performance may degrade due to fetching data from the network with each run.
If connecting to an archival node (e.g. Alchemy), we strongly recommend setting
blockNumber to a fixed value to increase performance with a local cache.`)
  );
}
function showForkRecommendationsBannerIfNecessary(
  currentNetworkConfig,
  forkCachePath
) {
  var _a, _b;
  return __awaiter(this, void 0, void 0, function* () {
    if (!("forking" in currentNetworkConfig)) {
      return;
    }
    if (
      ((_a = currentNetworkConfig.forking) === null || _a === void 0
        ? void 0
        : _a.enabled) !== true
    ) {
      return;
    }
    if (
      ((_b = currentNetworkConfig.forking) === null || _b === void 0
        ? void 0
        : _b.blockNumber) !== undefined
    ) {
      return;
    }
    const shownPath = getAlreadyShownFilePath(forkCachePath);
    if (yield fs_extra_1.default.pathExists(shownPath)) {
      return;
    }
    displayBanner();
    yield fs_extra_1.default.ensureDir(path_1.default.dirname(shownPath));
    yield fs_extra_1.default.writeJSON(shownPath, true);
  });
}
exports.showForkRecommendationsBannerIfNecessary =
  showForkRecommendationsBannerIfNecessary;
