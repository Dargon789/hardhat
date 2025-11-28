"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbiT, Abi;
 > (contractName);
string,
    artifact;
(artifact_1.Artifact),
    args ?  : module_1.ArgumentType[],
    options ?  : ContractOptions;
module_1.ContractDeploymentFuture;
/**
 * Deploy a library.
 *
 * @param libraryName - The name of the library to deploy
 * @param options - The options for the deployment
 *
 * @example
 * ```
 * const owner = m.getAccount(1);
 * const myLibrary = m.library("MyLibrary", { from: owner } );
 * ```
 */
library(libraryName, LibraryNameT, options ?  : LibraryOptions);
module_1.NamedArtifactLibraryDeploymentFuture;
/**
 * Deploy a library.
 *
 * @param libraryName - The name of the library to deploy
 * @param artifact - The artifact of the library to deploy
 * @param options - The options for the deployment
 *
 * @example
 * ```
 * const owner = m.getAccount(1);
 * const myLibrary = m.library(
 *   "MyLibrary",
 *   myLibraryArtifact,
 *   { from: owner }
 * );
 * ```
 */
library < ;
const AbiT, Abi;
 > (libraryName);
string,
    artifact;
(artifact_1.Artifact),
    options ?  : LibraryOptions;
module_1.LibraryDeploymentFuture;
/**
 * Call a contract function.
 *
 * @param contractFuture - The contract to call
 * @param functionName - The name of the function to call
 * @param args - The arguments to pass to the function
 * @param options - The options for the call
 *
 * @example
 * ```
 * const myContract = m.contract("MyContract");
 * const myContractCall = m.call(myContract, "updateCounter", [100]);
 * ```
 */
call(contractFuture, (module_1.CallableContractFuture), functionName, FunctionNameT, args ?  : module_1.ArgumentType[], options ?  : CallOptions);
module_1.ContractCallFuture;
/**
 * Statically call a contract function and return the result.
 *
 * This allows you to read data from a contract without sending a transaction.
 * This is only supported for functions that are marked as `view` or `pure`,
 * or variables marked `public`.
 *
 * @param contractFuture - The contract to call
 * @param functionName - The name of the function to call
 * @param args - The arguments to pass to the function
 * @param nameOrIndex - The name or index of the return argument to read
 * @param options - The options for the call
 *
 * @example
 * ```
 * const myContract = m.contract("MyContract");
 * const counter = m.staticCall(
 *   myContract,
 *   "getCounterAndOwner",
 *   [],
 *   "counter"
 * );
 * ```
 */
staticCall(contractFuture, (module_1.CallableContractFuture), functionName, FunctionNameT, args ?  : module_1.ArgumentType[], nameOrIndex ?  : string | number, options ?  : StaticCallOptions);
module_1.StaticCallFuture;
/**
 * ABI encode a function call, including both the function's name and
 * the parameters it is being called with. This is useful when
 * sending a raw transaction to invoke a smart contract or
 * when invoking a smart contract proxied through an intermediary function.
 *
 * @param contractFuture - The contract that the ABI for encoding will be taken from
 * @param functionName - The name of the function
 * @param args - The arguments to pass to the function
 * @param options - The options for the call
 *
 * @example
 * ```
 * const myContract = m.contract("MyContract");
 * const data = m.encodeFunctionCall(myContract, "updateCounter", [100]);
 * m.send("callUpdateCounter", myContract, 0n, data);
 * ```
 */
encodeFunctionCall(contractFuture, (module_1.CallableContractFuture), functionName, FunctionNameT, args ?  : module_1.ArgumentType[], options ?  : EncodeFunctionCallOptions);
module_1.EncodeFunctionCallFuture;
/**
 * Create a future for an existing deployed contract so that it can be
 * referenced in subsequent futures.
 *
 * The resulting future can be used anywhere a contract future or address
 * is expected.
 *
 * @param contractName - The name of the contract
 * @param address - The address of the contract
 * @param options - The options for the instance
 *
 * @example
 * ```
 * const myContract = m.contractAt("MyContract", "0x1234...");
 * ```
 */
contractAt(contractName, ContractNameT, address, 
    | string
    | module_1.AddressResolvableFuture
    | (module_1.ModuleParameterRuntimeValue), options ?  : ContractAtOptions);
module_1.NamedArtifactContractAtFuture;
/**
 * Create a future for an existing deployed contract so that it can be
 * referenced in subsequent futures.
 *
 * The resulting future can be used anywhere a contract future or address is
 * expected.
 *
 * @param contractName - The name of the contract
 * @param artifact - The artifact of the contract
 * @param address - The address of the contract
 * @param options - The options for the instance
 *
 * @example
 * ```
 * const myContract = m.contractAt(
 *   "MyContract",
 *   myContractArtifact,
 *   "0x1234..."
 * );
 * ```
 */
contractAt < ;
const AbiT, Abi;
 > (contractName);
string,
    artifact;
(artifact_1.Artifact),
    address;
    | string
    | module_1.AddressResolvableFuture
    | (module_1.ModuleParameterRuntimeValue),
    options ?  : ContractAtOptions;
module_1.ContractAtFuture;
/**
 * Read an event argument from a contract.
 *
 * The resulting value can be used wherever a value of the same type is
 * expected i.e. contract function arguments, `send` value, etc.
 *
 * @param futureToReadFrom - The future to read the event from
 * @param eventName - The name of the event
 * @param nameOrIndex - The name or index of the event argument to read
 * @param options - The options for the event
 *
 * @example
 * ```
 * const myContract = m.contract("MyContract");
 * // assuming the event is emitted by the constructor of MyContract
 * const owner = m.readEventArgument(myContract, "ContractCreated", "owner");
 *
 * // or, if the event is emitted during a function call:
 * const myContractCall = m.call(myContract, "updateCounter", [100]);
 * const counter = m.readEventArgument(
 *   myContractCall,
 *   "CounterUpdated",
 *   "counter",
 *   {
 *     emitter: myContract
 *   }
 * );
 * ```
 */
readEventArgument(futureToReadFrom, 
    | (module_1.NamedArtifactContractDeploymentFuture)
    | module_1.ContractDeploymentFuture
    | module_1.SendDataFuture
    | (module_1.ContractCallFuture), eventName, string, nameOrIndex, string | number, options ?  : ReadEventArgumentOptions);
module_1.ReadEventArgumentFuture;
/**
 * Send an arbitrary transaction.
 *
 * Can be used to transfer ether and/or send raw data to an address.
 *
 * @param id - A custom id for the Future
 * @param to - The address to send the transaction to
 * @param value - The amount of wei to send
 * @param data - The data to send
 * @param options - The options for the transaction
 *
 * @example
 * ```
 * const myContract = m.contract("MyContract");
 * m.send("sendToMyContract", myContract, 100);
 *
 * // you can also send to an address directly
 * const owner = m.getAccount(1);
 * const otherAccount = m.getAccount(2);
 * m.send("sendToOwner", owner, 100, undefined, { from: otherAccount });
 * ```
 */
send(id, string, to, 
    | string
    | module_1.AddressResolvableFuture
    | (module_1.ModuleParameterRuntimeValue)
    | module_1.AccountRuntimeValue, value ?  : bigint | (module_1.ModuleParameterRuntimeValue), data ?  : string | (module_1.EncodeFunctionCallFuture), options ?  : SendDataOptions);
module_1.SendDataFuture;
/**
 * Allows you to deploy then use the results of another module within this
 * module.
 *
 * @param ignitionSubmodule - The submodule to use
 *
 * @example
 * ```
 * const otherModule = buildModule("otherModule", (m) => {
 *  const myContract = m.contract("MyContract");
 *
 *  return { myContract };
 * });
 *
 * const mainModule = buildModule("mainModule", (m) => {
 *  const { myContract } = m.useModule(otherModule);
 *
 *  const myContractCall = m.call(myContract, "updateCounter", [100]);
 * });
 * ```
 */
useModule(ignitionSubmodule, (module_1.IgnitionModule));
IgnitionModuleResultsT;
