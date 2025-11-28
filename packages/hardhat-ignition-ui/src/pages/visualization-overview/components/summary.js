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
exports.Summary = void 0;
const react_1 = __importStar(require("react"));
const styled_components_1 = __importDefault(require("styled-components"));
const futures_1 = require("../../../queries/futures");
const Summary = ({ ignitionModule }) => {
    const deployFutures = (0, react_1.useMemo)(() => (0, futures_1.getAllDeployFuturesFor)(ignitionModule), [ignitionModule]);
    const deployCountPerContract = deployFutures.reduce((acc, future) => {
        var _a;
        const count = (_a = acc[future.contractName]) !== null && _a !== void 0 ? _a : 0;
        return Object.assign(Object.assign({}, acc), { [future.contractName]: count + 1 });
    }, {});
    return (<SummaryStyle>
      <Title>Contracts to be deployed</Title>

      <div>
        {deployFutures.length === 0 ? null : (<StyledList>
            {Object.entries(deployCountPerContract).map(([contractName, count]) => (<ListItem key={contractName}>
                  {contractName}
                  {count > 1 ? ` x${count}` : null}
                </ListItem>))}
          </StyledList>)}
      </div>
    </SummaryStyle>);
};
exports.Summary = Summary;
const SummaryStyle = styled_components_1.default.div ``;
const Title = styled_components_1.default.div `
  font-size: 24px;
  font-weight: 700;
  line-height: 30px;
  letter-spacing: 0em;

  color: #16181d;
`;
const StyledList = styled_components_1.default.ul `
  padding-inline-start: 1rem;
`;
const ListItem = styled_components_1.default.li `
  font-size: 17px;
  line-height: 1.6rem;
  text-align: left;
  color: #040405;
`;
