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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentFlow = void 0;
const ui_helpers_1 = require("@nomicfoundation/ignition-core/ui-helpers");
const react_1 = __importStar(require("react"));
const react_tooltip_1 = require("react-tooltip");
const styled_components_1 = __importStar(require("styled-components"));
const TooltipIcon_1 = require("../../../assets/TooltipIcon");
const mermaid_1 = require("../../../components/mermaid");
const futures_1 = require("../../../queries/futures");
const to_escaped_id_1 = require("../../../utils/to-escaped-id");
const DeploymentFlow = ({ ignitionModule, batches }) => {
    /* batch highlighting logic */
    const escapedIdMap = batches.reduce((acc, batch, i) => {
        const batchId = `batch-${i}`;
        const escapedFutureIds = batch.map(to_escaped_id_1.toEscapedId);
        return Object.assign(Object.assign({}, acc), { [batchId]: escapedFutureIds });
    }, {});
    const [currentlyHovered, setCurrentlyHovered] = (0, react_1.useState)("");
    const futuresToHighlight = escapedIdMap[currentlyHovered] || [];
    /* basic future node styling */
    const futures = (0, futures_1.getAllFuturesForModule)(ignitionModule);
    const deploys = [];
    const others = [];
    futures.forEach((future) => {
        if ((0, ui_helpers_1.isDeploymentFuture)(future)) {
            deploys.push((0, to_escaped_id_1.toEscapedId)(future.id));
        }
        else {
            others.push((0, to_escaped_id_1.toEscapedId)(future.id));
        }
    });
    return (<div>
      <SectionHeader>
        Deployment flow <FlowTooltip />
      </SectionHeader>

      {futures.length <= 1 ? (<SingleFutureNotice>
          A module diagram will show once you have more than 1 future.
        </SingleFutureNotice>) : (<div>
          <BatchBtnSection>
            <VisualizeDiv>Visualize batches</VisualizeDiv>
            {batches.map((_, i) => (<BatchBtn key={`batch-btn-${i}`} onMouseEnter={() => setCurrentlyHovered(`batch-${i}`)} onMouseLeave={() => setCurrentlyHovered("")} isCurrentlyHovered={currentlyHovered === `batch-${i}`}>
                Batch <strong>#{i + 1}</strong>
              </BatchBtn>))}
          </BatchBtnSection>

          <HighlightedFutures futures={futuresToHighlight} deploys={deploys} others={others}>
            <mermaid_1.Mermaid ignitionModule={ignitionModule}/>
          </HighlightedFutures>
        </div>)}
    </div>);
};
exports.DeploymentFlow = DeploymentFlow;
const SingleFutureNotice = styled_components_1.default.div `
  padding-top: 1rem;
`;
const VisualizeDiv = styled_components_1.default.div `
  font-weight: 700;
  padding: 1.5rem;
  width: 100%;
`;
// TODO: when we added the future-to-module dependency, we created a non-ideal situation where
// a module-to-module dependency arrow still gets added to the mermaid graph, even if the dependant module
// is only used as a future-to-module dependency. This is because the dependant module has to get added to the
// parent module as a submodule, and we currently don't have a way of distinguishing at this point in the code between
// a submodule that is exclusively used as a future-to-module dependency (i.e. in { after: [...] })
// and a submodule that is used as a module-to-module dependency (i.e. in m.useModule(...)).
// This is a known issue that we have decided to revisit at a later point in time because the solution is not trivial.
const FlowTooltip = () => (<span style={{ paddingLeft: "0.5rem", cursor: "pointer" }}>
    <a data-tooltip-id="flow-tooltip">
      <TooltipIcon_1.TooltipIcon />
    </a>
    <react_tooltip_1.Tooltip className="styled-tooltip flow-tooltip" id="flow-tooltip">
      <div>Diagram reference</div>
      <span>Future to future dependency</span>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span style={{ marginLeft: "-7px", letterSpacing: "-2px" }}>
        -----------&gt;
      </span>
      <br />
      <span>Future to module dependency</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span style={{ marginLeft: "-4px" }} className="future-to-module-arrow">
        ----&gt;
      </span>
      <br />
      <span>Module to module dependency</span>&nbsp;&nbsp;&nbsp;&nbsp;
      <span style={{ marginLeft: "-3px" }}>- - -&gt;</span>
    </react_tooltip_1.Tooltip>
  </span>);
const HighlightedFutures = styled_components_1.default.div `
  ${({ deploys }) => deploys.map((id) => (0, styled_components_1.css) `
          g[id^="flowchart-${id}-"] rect {
            fill: #fbf8d8 !important;
          }
        `)}

  ${({ others }) => others.map((id) => (0, styled_components_1.css) `
          g[id^="flowchart-${id}-"] rect {
            fill: #f8f2ff !important;
          }
        `)}

  ${({ futures }) => futures.map((id) => (0, styled_components_1.css) `
          g[id^="flowchart-${id}-"] rect {
            fill: #16181d !important;
          }

          g[id^="flowchart-${id}-"] span {
            color: #fbf8d8 !important;
          }
        `)}
`;
const SectionHeader = styled_components_1.default.div `
  font-size: 28px;
  font-weight: 700;
  line-height: 30px;
  letter-spacing: 0em;
  text-align: left;
  display: inline-flex;
  align-items: center;

  margin-bottom: 1rem;
  margin-top: 1rem;
`;
const BatchBtnSection = styled_components_1.default.div `
  margin-bottom: 40px;
  text-align: center;
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  row-gap: 1rem;
  width: 100%;
`;
const BatchBtn = styled_components_1.default.span `
  font-size: 0.8rem;
  width: 86px;
  text-align: center;
  padding: 0.5rem 1rem;
  margin: auto 0.5rem;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #edcf00;
  cursor: pointer;
  white-space: nowrap;

  ${(props) => props.isCurrentlyHovered &&
    `
    background: #16181D;
    color: #FBF8D8;
    border: 1px solid #16181D;
  `}
`;
