"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@fontsource/roboto");
require("@fontsource/roboto/400.css");
require("@fontsource/roboto/700.css");
const react_1 = __importDefault(require("react"));
const ui_helpers_1 = require("@nomicfoundation/ignition-core/ui-helpers");
const client_1 = __importDefault(require("react-dom/client"));
const react_router_dom_1 = require("react-router-dom");
const visualization_overview_1 = require("./pages/visualization-overview/visualization-overview");
require("./main.css");
const loadDeploymentFromEmbeddedDiv = () => {
    const scriptTag = document.getElementById("deployment");
    if (scriptTag === null || scriptTag.textContent === null) {
        return null;
    }
    const data = JSON.parse(scriptTag.textContent);
    if (data.unloaded) {
        return null;
    }
    return {
        ignitionModule: ui_helpers_1.IgnitionModuleDeserializer.deserialize(data.module),
        batches: data.batches,
    };
};
const loadDeploymentFromDevFile = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch("./deployment.json");
    const data = yield response.json();
    return {
        ignitionModule: ui_helpers_1.IgnitionModuleDeserializer.deserialize(data.module),
        batches: data.batches,
    };
});
const loadDeploymentData = () => {
    var _a;
    return (_a = loadDeploymentFromEmbeddedDiv()) !== null && _a !== void 0 ? _a : loadDeploymentFromDevFile();
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ignitionModule, batches } = yield loadDeploymentData();
        document.title = `${ignitionModule.id} Deployment Visualization - Hardhat Ignition`;
        const router = (0, react_router_dom_1.createHashRouter)([
            {
                path: "/",
                element: (<visualization_overview_1.VisualizationOverview ignitionModule={ignitionModule} batches={batches}/>),
            },
        ]);
        client_1.default.createRoot(document.getElementById("root")).render(<react_1.default.StrictMode>
        <react_router_dom_1.RouterProvider router={router}/>
      </react_1.default.StrictMode>);
    }
    catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "unknown error";
        client_1.default.createRoot(document.getElementById("root")).render(<div>
        <h2>
          Error during deployment loading: <em>{message}</em>
        </h2>
      </div>);
    }
});
main();
