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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mermaid = void 0;
const react_1 = __importStar(require("react"));
const styled_components_1 = __importDefault(require("styled-components"));
const svg_pan_zoom_1 = __importDefault(require("svg-pan-zoom"));
const mermaid_1 = __importDefault(require("mermaid"));
const to_mermaid_1 = require("../utils/to-mermaid");
const Mermaid = ({ ignitionModule }) => {
    const diagram = (0, react_1.useMemo)(() => {
        const d = (0, to_mermaid_1.toMermaid)(ignitionModule);
        // NOTE: this is explicitly added to aid troubleshooting
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.diagram = d;
        return d;
    }, [ignitionModule]);
    (0, react_1.useEffect)(() => {
        mermaid_1.default.initialize({
            maxTextSize: 5000000,
            flowchart: {
                padding: 50,
            },
        });
        mermaid_1.default.contentLoaded();
    });
    // requestAnimationFrame is used to ensure that the svgPanZoom is called after the svg is rendered
    (0, react_1.useEffect)(() => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                (0, svg_pan_zoom_1.default)(".mermaid > svg", {
                    zoomEnabled: true,
                    controlIconsEnabled: true,
                    fit: true,
                    center: true,
                });
            }, 0);
        });
    });
    return (<Wrap>
      <div className="mermaid">{diagram}</div>
    </Wrap>);
};
exports.Mermaid = Mermaid;
const Wrap = styled_components_1.default.div ``;
