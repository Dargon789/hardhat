"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FutureBatch = void 0;
const ui_helpers_1 = require("@nomicfoundation/ignition-core/ui-helpers");
const react_1 = __importDefault(require("react"));
const styled_components_1 = __importDefault(require("styled-components"));
const argumentTypeToString_1 = require("../../../utils/argumentTypeToString");
const future_header_1 = require("./future-header");
const FutureBatch = ({ batch, index, toggleState, setToggled, setCurrentlyHovered, setHoveredFuture, scrollRefMap, }) => {
    return (<Batch>
      <BatchHeader>
        Batch <strong>#{index}</strong>
      </BatchHeader>
      {batch.map((future, i) => (<FutureBlock key={`batch-${index}-future-${i}`} classKey={`batch-${index}-future-${i}`} future={future} toggleState={toggleState} setToggled={setToggled} setCurrentlyHovered={setCurrentlyHovered} setHoveredFuture={setHoveredFuture} scrollRef={scrollRefMap[future.id]}/>))}
    </Batch>);
};
exports.FutureBatch = FutureBatch;
const Batch = styled_components_1.default.div `
  padding: 1rem;
  border: 1px solid #edcf00;
  border-radius: 7px;
`;
const BatchHeader = styled_components_1.default.div `
  padding: 1rem;
`;
const FutureBtn = styled_components_1.default.div `
  padding: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  margin: 1rem;

  border-top-left-radius: 5px;
  border-top-right-radius: 5px;

  ${(props) => props.toggled &&
    `
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    `}

  ${(props) => !props.toggled &&
    `
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
    `}

  ${(props) => !props.isLibrary &&
    `
    cursor: pointer;
  `}
`;
const FutureBlock = ({ future, toggleState, setToggled, setCurrentlyHovered, setHoveredFuture, classKey, scrollRef, }) => {
    const futureId = future.id;
    const toggled = toggleState[futureId];
    const displayText = toDisplayText(future);
    const isLibrary = future.type === ui_helpers_1.FutureType.LIBRARY_DEPLOYMENT ||
        future.type === ui_helpers_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT;
    const className = (0, ui_helpers_1.isDeploymentType)(future.type)
        ? "deploy-background"
        : "call-background";
    return (<div ref={scrollRef}>
      <FutureBtn className={`${className} ${classKey}`} isLibrary={isLibrary} toggled={toggled} onClick={() => setToggled(futureId, !toggled)}>
        <future_header_1.FutureHeader isLibrary={isLibrary} toggled={toggled} displayText={displayText} future={future} setCurrentlyHovered={setCurrentlyHovered}></future_header_1.FutureHeader>
      </FutureBtn>
      {toggled && (<FutureDetailsSection className={className} future={future} setToggled={setToggled} setHoveredFuture={setHoveredFuture}/>)}
    </div>);
};
function toDisplayText(future) {
    switch (future.type) {
        case ui_helpers_1.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT:
        case ui_helpers_1.FutureType.CONTRACT_DEPLOYMENT:
            return `Deploy ${future.contractName}`;
        case ui_helpers_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT:
            return `Library deploy ${future.id}`;
        case ui_helpers_1.FutureType.LIBRARY_DEPLOYMENT:
            return `Library deploy ${future.id} from artifact`;
        case ui_helpers_1.FutureType.CONTRACT_CALL:
            return `Call ${future.contract.contractName}.${future.functionName}`;
        case ui_helpers_1.FutureType.STATIC_CALL:
            return `Static call ${future.id}`;
        case ui_helpers_1.FutureType.ENCODE_FUNCTION_CALL:
            return `Encode function call ${future.id}`;
        case ui_helpers_1.FutureType.NAMED_ARTIFACT_CONTRACT_AT:
            return `Existing contract ${future.id} (${typeof future.address === "string"
                ? future.address
                : (0, ui_helpers_1.isFuture)(future.address)
                    ? future.address.id
                    : (0, argumentTypeToString_1.argumentTypeToString)(future.address)})`;
        case ui_helpers_1.FutureType.CONTRACT_AT:
            return `Existing contract ${future.id} from artifact (${typeof future.address === "string"
                ? future.address
                : (0, ui_helpers_1.isFuture)(future.address)
                    ? future.address.id
                    : (0, argumentTypeToString_1.argumentTypeToString)(future.address)})`;
        case ui_helpers_1.FutureType.READ_EVENT_ARGUMENT:
            return `Read event from future ${future.futureToReadFrom.id} (event ${future.eventName} argument ${future.nameOrIndex})`;
        case ui_helpers_1.FutureType.SEND_DATA:
            return `Send data ${future.id} to ${typeof future.to === "string"
                ? future.to
                : (0, ui_helpers_1.isFuture)(future.to)
                    ? future.to.id
                    : (0, argumentTypeToString_1.argumentTypeToString)(future.to)}`;
    }
}
const FutureDetailsStyle = styled_components_1.default.div `
  cursor: auto;
  padding: 1rem 2rem;
  margin: -1rem 1rem 1rem 1rem;

  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;

  -webkit-box-shadow: inset 0px 6px 8px -8px rgba(0, 0, 0, 0.3);
  -moz-box-shadow: inset 0px 6px 8px -8px rgba(0, 0, 0, 0.3);
  box-shadow: inset 0px 6px 8px -8px rgba(0, 0, 0, 0.3);
`;
const FutureDetailsSection = ({ className, future, setToggled, setHoveredFuture }) => {
    switch (future.type) {
        case ui_helpers_1.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT:
        case ui_helpers_1.FutureType.CONTRACT_DEPLOYMENT: {
            const args = Object.entries(future.constructorArgs);
            return (<FutureDetailsStyle className={className}>
          <p>{args.length === 0 ? "No " : null}Constructor Arguments</p>
          <ul>
            {args.map(([, arg], i) => (<li key={`arg-${i}`}>
                <Argument setToggled={setToggled} arg={arg} setHoveredFuture={setHoveredFuture}/>
              </li>))}
          </ul>
        </FutureDetailsStyle>);
        }
        case ui_helpers_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT:
        case ui_helpers_1.FutureType.LIBRARY_DEPLOYMENT:
            return null;
        case ui_helpers_1.FutureType.CONTRACT_CALL: {
            const args = Object.entries(future.args);
            return (<FutureDetailsStyle className={className}>
          <p>{args.length === 0 ? "No " : null}Arguments</p>
          <ul>
            {args.map(([, arg], i) => (<li key={`arg-${i}`}>
                <Argument setToggled={setToggled} arg={arg} setHoveredFuture={setHoveredFuture}/>
              </li>))}
          </ul>
        </FutureDetailsStyle>);
        }
        case ui_helpers_1.FutureType.STATIC_CALL: {
            const args = Object.entries(future.args);
            return (<FutureDetailsStyle className={className}>
          <p>{args.length === 0 ? "No " : null}Arguments</p>
          <ul>
            {args.map(([, arg], i) => (<li key={`arg-${i}`}>
                <Argument setToggled={setToggled} arg={arg} setHoveredFuture={setHoveredFuture}/>
              </li>))}
          </ul>
        </FutureDetailsStyle>);
        }
        case ui_helpers_1.FutureType.ENCODE_FUNCTION_CALL: {
            const args = Object.entries(future.args);
            return (<FutureDetailsStyle className={className}>
          <p>{args.length === 0 ? "No " : null}Arguments</p>
          <ul>
            {args.map(([, arg], i) => (<li key={`arg-${i}`}>
                <Argument setToggled={setToggled} arg={arg} setHoveredFuture={setHoveredFuture}/>
              </li>))}
          </ul>
        </FutureDetailsStyle>);
        }
        case ui_helpers_1.FutureType.NAMED_ARTIFACT_CONTRACT_AT:
        case ui_helpers_1.FutureType.CONTRACT_AT: {
            return (<FutureDetailsStyle className={className}>
          <p>Contract - {future.contractName}</p>
          <p>
            Address -{" "}
            {typeof future.address === "string" ? (future.address) : (<Argument setToggled={setToggled} arg={future.address} setHoveredFuture={setHoveredFuture}/>)}
          </p>
        </FutureDetailsStyle>);
        }
        case ui_helpers_1.FutureType.READ_EVENT_ARGUMENT: {
            return (<FutureDetailsStyle className={className}>
          <p>Emitter - {future.emitter.id}</p>
          <p>Event - {future.eventName}</p>
          <p>Event index - {future.eventIndex}</p>
          <p>Argument - {future.nameOrIndex}</p>
        </FutureDetailsStyle>);
        }
        case ui_helpers_1.FutureType.SEND_DATA: {
            return (<FutureDetailsStyle className={className}>
          <p>
            To -{" "}
            {typeof future.to === "string" ? (future.to) : (<Argument setToggled={setToggled} arg={future.to} setHoveredFuture={setHoveredFuture}/>)}
          </p>
          <p>
            Data -{" "}
            {typeof future.data === "string" ? (future.data) : future.data === undefined ? ("0x") : (<Argument setToggled={setToggled} arg={future.data} setHoveredFuture={setHoveredFuture}/>)}
          </p>
        </FutureDetailsStyle>);
        }
    }
};
const Argument = ({ setToggled, arg, setHoveredFuture }) => {
    if ((0, ui_helpers_1.isFuture)(arg)) {
        return (<ArgumentLink style={{
                textDecoration: "underline",
                color: "#16181D",
                cursor: "pointer",
            }} className="future-argument" onClick={() => setToggled(arg.id, true)} onMouseEnter={() => setHoveredFuture(arg.id)} onMouseLeave={() => setHoveredFuture("")}>
        {(0, argumentTypeToString_1.argumentTypeToString)(arg)}
      </ArgumentLink>);
    }
    return <ArgumentText>{(0, argumentTypeToString_1.argumentTypeToString)(arg)}</ArgumentText>;
};
const ArgumentText = styled_components_1.default.p `
  margin: 0;
`;
const ArgumentLink = styled_components_1.default.a `
  textdecoration: underline;
  color: #16181d;
  cursor: pointer;

  &:hover {
    font-weight: 700;
  }
`;
