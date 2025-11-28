"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionBatches = void 0;
const ui_helpers_1 = require("@nomicfoundation/ignition-core/ui-helpers");
const react_1 = require("react");
const react_tooltip_1 = require("react-tooltip");
const styled_components_1 = __importDefault(require("styled-components"));
const futures_1 = require("../../../queries/futures");
const future_batch_1 = require("./future-batch");
const TooltipIcon_1 = require("../../../assets/TooltipIcon");
const ExecutionBatches = ({ ignitionModule, batches }) => {
    const futures = (0, react_1.useMemo)(() => (0, futures_1.getAllFuturesForModule)(ignitionModule), [ignitionModule]);
    const nonLibraryFutureIds = futures
        .filter(({ type }) => type !== ui_helpers_1.FutureType.LIBRARY_DEPLOYMENT &&
        type !== ui_helpers_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT)
        .map(({ id }) => id);
    const scrollRefMap = (0, react_1.useRef)(nonLibraryFutureIds.reduce((acc, id) => {
        return Object.assign(Object.assign({}, acc), { [id]: (0, react_1.createRef)() });
    }, {}));
    const toggleMap = Object.fromEntries(nonLibraryFutureIds.map((id) => [id, false]));
    const [toggleState, setToggledInternal] = (0, react_1.useState)(toggleMap);
    const setToggled = (id, newToggleState) => {
        var _a;
        if (newToggleState) {
            (_a = scrollRefMap.current[id].current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
        const newState = Object.assign(Object.assign({}, toggleState), { [id]: newToggleState });
        setToggledInternal(newState);
    };
    const [currentlyHovered, setCurrentlyHovered] = (0, react_1.useState)("");
    const futureBatches = batches.reduce((acc, batch) => {
        const fullBatch = batch.map((id) => futures.find((f) => f.id === id));
        return [...acc, fullBatch];
    }, []);
    /* logic for highlighting a future based on future details hover */
    const futureHoverMap = Object.fromEntries(batches.flatMap((batch, i) => {
        const batchId = `batch-${i + 1}`;
        return batch.map((id, j) => [id, `${batchId}-future-${j}`]);
    }));
    const [hoveredFuture, setHoveredFutureInternal] = (0, react_1.useState)("");
    const setHoveredFuture = (id) => {
        const futureId = futureHoverMap[id];
        setHoveredFutureInternal(futureId);
    };
    return (<div>
      <SectionHeader>
        Execution batches <BatchesTooltip />
      </SectionHeader>

      <SectionSubHeader>
        <strong>{futures.length} futures</strong> will be executed across{" "}
        {batches.length} <strong>batches</strong>
      </SectionSubHeader>

      <RootModuleBackground>
        <RootModuleName>[ {ignitionModule.id} ]</RootModuleName>
        <Actions currentlyHovered={currentlyHovered} hoveredFuture={hoveredFuture}>
          {futureBatches.map((batch, i) => (<future_batch_1.FutureBatch key={`batch-${i}`} batch={batch} index={i + 1} toggleState={toggleState} setToggled={setToggled} setCurrentlyHovered={setCurrentlyHovered} setHoveredFuture={setHoveredFuture} scrollRefMap={scrollRefMap.current}/>))}
        </Actions>
      </RootModuleBackground>
    </div>);
};
exports.ExecutionBatches = ExecutionBatches;
const BatchesTooltip = () => (<span style={{ paddingLeft: "0.5rem", cursor: "pointer" }}>
    <a data-tooltip-id="batches-tooltip">
      <TooltipIcon_1.TooltipIcon />
    </a>
    <react_tooltip_1.Tooltip className="styled-tooltip batches-tooltip" id="batches-tooltip">
      <div>
        Futures that can be run simultaneously are executed at the same time in
        batches.
      </div>
      <br />
      <div>
        The sequence order shown for each batch doesn&apos;t reflect the final
        execution order. The exact order is determined once they&apos;re run.
        However, this specific order isn&apos;t relevant to the process,
        allowing for simultaneous execution.
      </div>
    </react_tooltip_1.Tooltip>
  </span>);
const RootModuleName = styled_components_1.default.div `
  font-weight: 700;
  padding-bottom: 1.5rem;
  padding-left: 1.5rem;
`;
const RootModuleBackground = styled_components_1.default.div `
  border: 1px solid #e5e6e7;
  border-radius: 10px;
  padding: 1.5rem;
`;
const SectionHeader = styled_components_1.default.div `
  font-size: 28px;
  font-weight: 700;
  line-height: 30px;
  letter-spacing: 0em;
  display: inline-flex;
  align-items: center;

  margin-bottom: 1rem;
  margin-top: 1rem;
`;
const SectionSubHeader = styled_components_1.default.div `
  margin-bottom: 2rem;
  margin-top: 2rem;
`;
const Actions = styled_components_1.default.div `
  display: grid;
  row-gap: 1.5rem;

  ${({ currentlyHovered }) => currentlyHovered &&
    `
    .${currentlyHovered} {
      background: #16181D;
      color: #FBF8D8;
    }
  `}

  ${({ hoveredFuture }) => hoveredFuture &&
    `
    .${hoveredFuture} {
      background: #16181D;
      color: #FBF8D8;
      box-shadow: -2px 2px 4px 0px #6C6F7433;
    }
  `}
`;
