"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FutureHeader = void 0;
const styled_components_1 = __importDefault(require("styled-components"));
const FutureHeader = ({ isLibrary, toggled, displayText, setCurrentlyHovered, future }) => {
    return (<ToggleNameWrap>
      {isLibrary ? <div /> : <ToggleBtn toggled={toggled}/>}
      <Text>{displayText}</Text>
      <div />
      <ModuleName className={future.module.id} onMouseEnter={() => setCurrentlyHovered(future.module.id)} onMouseLeave={() => setCurrentlyHovered("")}>
        [ {future.module.id} ]
      </ModuleName>
    </ToggleNameWrap>);
};
exports.FutureHeader = FutureHeader;
const ToggleNameWrap = styled_components_1.default.div `
  display: grid;
  grid-template-columns: 1rem auto 1fr auto;
`;
const ToggleBtn = ({ toggled }) => {
    return <ToggleBtnText>{toggled ? "- " : "+ "}</ToggleBtnText>;
};
const ModuleName = styled_components_1.default.div `
  font-weight: 700;
  padding: 0.5rem;
`;
const Text = styled_components_1.default.p `
  margin: 0;
  display: inline;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: left;
`;
const ToggleBtnText = (0, styled_components_1.default)(Text) `
  text-align: center;
`;
