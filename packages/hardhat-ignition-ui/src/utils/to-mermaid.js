"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMermaid = void 0;
const ui_helpers_1 = require("@nomicfoundation/ignition-core/ui-helpers");
const futures_js_1 = require("../queries/futures.js");
const argumentTypeToString_js_1 = require("./argumentTypeToString.js");
const to_escaped_id_js_1 = require("./to-escaped-id.js");
function toMermaid(ignitionModule) {
    const modules = recursivelyListModulesAndSubmodulesFor(ignitionModule);
    const subgraphSections = modules
        .map((m) => prettyPrintModule(m, "  "))
        .join("\n");
    const futureDependencies = [
        ...new Set((0, futures_js_1.getAllFuturesForModule)(ignitionModule)
            .flatMap((f) => Array.from(f.dependencies).map((d) => [
            (0, to_escaped_id_js_1.toEscapedId)(f.id),
            (0, to_escaped_id_js_1.toEscapedId)(d.id),
            /#/.test(d.id),
        ]))
            .map(([from, to, isFuture]) => `${from} ${isFuture ? "-->" : "==>"} ${to}`)),
    ].join("\n");
    const moduleDependencies = [
        ...new Set(modules
            .flatMap((f) => Array.from(f.submodules).map((d) => [
            (0, to_escaped_id_js_1.toEscapedId)(f.id),
            (0, to_escaped_id_js_1.toEscapedId)(d.id),
        ]))
            .map(([from, to]) => `${from} -.-> ${to}`)),
    ].join("\n");
    return `flowchart BT\n\n${(0, to_escaped_id_js_1.toEscapedId)(ignitionModule.id)}\n\n${subgraphSections}${futureDependencies === "" ? "" : "\n\n" + futureDependencies}${moduleDependencies === "" ? "" : "\n\n" + moduleDependencies}`;
}
exports.toMermaid = toMermaid;
function recursivelyListModulesAndSubmodulesFor(module) {
    return [module].concat(Array.from(module.submodules).flatMap(recursivelyListModulesAndSubmodulesFor));
}
function prettyPrintModule(module, lineIndent = "") {
    const futures = Array.from(module.futures);
    const futureList = futures
        .map((f) => `${lineIndent}${(0, to_escaped_id_js_1.toEscapedId)(f.id)}["${toLabel(f)}"]:::futureNode`)
        .join(`\n${lineIndent}`);
    if (futures.length > 0) {
        const inner = `${lineIndent}subgraph ${(0, to_escaped_id_js_1.toEscapedId)(module.id)}Inner[ ]\n${lineIndent}  direction BT\n\n${lineIndent}${futureList}\n${lineIndent}end\n\nstyle ${(0, to_escaped_id_js_1.toEscapedId)(module.id)}Inner fill:none,stroke:none`;
        const title = `${lineIndent}subgraph ${(0, to_escaped_id_js_1.toEscapedId)(module.id)}Padding["[ ${module.id} ]"]\n${lineIndent}  direction BT\n\n${lineIndent}${inner}\n${lineIndent}end\n\nstyle ${(0, to_escaped_id_js_1.toEscapedId)(module.id)}Padding fill:none,stroke:none`;
        const outer = `${lineIndent}subgraph ${(0, to_escaped_id_js_1.toEscapedId)(module.id)}[ ]\n${lineIndent} direction BT\n\n${lineIndent}${title}\n${lineIndent}end\n\nstyle ${(0, to_escaped_id_js_1.toEscapedId)(module.id)} fill:#fbfbfb,stroke:#e5e6e7`;
        return outer;
    }
    const title = `${lineIndent}subgraph ${(0, to_escaped_id_js_1.toEscapedId)(module.id)}Padding["<strong>[ ${module.id} ]</strong>"]\n${lineIndent}  direction BT\n\n${lineIndent}end\n\nstyle ${(0, to_escaped_id_js_1.toEscapedId)(module.id)}Padding fill:none,stroke:none`;
    return `${lineIndent}subgraph ${(0, to_escaped_id_js_1.toEscapedId)(module.id)}[ ]\n${lineIndent} direction BT\n\n${lineIndent}${title}\n${lineIndent}end\n\nstyle ${(0, to_escaped_id_js_1.toEscapedId)(module.id)} fill:#fbfbfb,stroke:#e5e6e7`;
}
function toLabel(f) {
    switch (f.type) {
        case ui_helpers_1.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT:
            return `Deploy ${f.contractName}`;
        case ui_helpers_1.FutureType.CONTRACT_DEPLOYMENT:
            return `Deploy from artifact ${f.contractName}`;
        case ui_helpers_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT:
            return `Deploy library ${f.contractName}`;
        case ui_helpers_1.FutureType.LIBRARY_DEPLOYMENT:
            return `Deploy library from artifact ${f.contractName}`;
        case ui_helpers_1.FutureType.CONTRACT_CALL:
            return `Call ${f.contract.contractName}.${f.functionName}`;
        case ui_helpers_1.FutureType.STATIC_CALL:
            return `Static call ${f.contract.contractName}.${f.functionName}`;
        case ui_helpers_1.FutureType.ENCODE_FUNCTION_CALL:
            return `Encoded call ${f.contract.contractName}.${f.functionName}`;
        case ui_helpers_1.FutureType.NAMED_ARTIFACT_CONTRACT_AT:
            return `Existing contract ${f.contractName} (${typeof f.address === "string"
                ? f.address
                : (0, ui_helpers_1.isFuture)(f.address)
                    ? f.address.id
                    : (0, argumentTypeToString_js_1.argumentTypeToString)(f.address)})`;
        case ui_helpers_1.FutureType.CONTRACT_AT:
            return `Existing contract from artifact ${f.contractName} (${typeof f.address === "string"
                ? f.address
                : (0, ui_helpers_1.isFuture)(f.address)
                    ? f.address.id
                    : (0, argumentTypeToString_js_1.argumentTypeToString)(f.address)})`;
        case ui_helpers_1.FutureType.READ_EVENT_ARGUMENT:
            return `Read event from future ${f.futureToReadFrom.id} (event ${f.eventName} argument ${f.nameOrIndex})`;
        case ui_helpers_1.FutureType.SEND_DATA:
            return `Send data to ${typeof f.to === "string"
                ? f.to
                : (0, ui_helpers_1.isFuture)(f.to)
                    ? f.to.id
                    : (0, argumentTypeToString_js_1.argumentTypeToString)(f.to)}`;
    }
}
