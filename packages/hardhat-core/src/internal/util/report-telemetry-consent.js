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
const analytics_1 = require("../cli/analytics");
function main() {
  return __awaiter(this, void 0, void 0, function* () {
    // This default value shouldn't be necessary, but we add one to make it
    // easier to recognize if the telemetry consent value is not passed.
    const [telemetryConsent = "<undefined-telemetry-consent>"] =
      process.argv.slice(2);
    // we pass undefined as the telemetryConsent value because
    // this hit is done before the consent is saved
    const analytics = yield analytics_1.Analytics.getInstance(undefined);
    const [_, consentHitPromise] = yield analytics.sendTelemetryConsentHit(
      telemetryConsent
    );
    yield consentHitPromise;
  });
}
main().catch(() => {});
