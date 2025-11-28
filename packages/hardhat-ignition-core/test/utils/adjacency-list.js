"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-unused-modules */
const chai_1 = require("chai");
const adjacency_list_1 = require("../../src/internal/utils/adjacency-list");
describe("adjacency list", () => {
    it("should provide a topological sort", () => {
        const adjacencyList = new adjacency_list_1.AdjacencyList([
            "5",
            "7",
            "3",
            "11",
            "8",
            "2",
            "9",
            "10",
        ]);
        adjacencyList.addDependency({ from: "5", to: "11" });
        adjacencyList.addDependency({ from: "7", to: "11" });
        adjacencyList.addDependency({ from: "7", to: "8" });
        adjacencyList.addDependency({ from: "3", to: "8" });
        adjacencyList.addDependency({ from: "3", to: "10" });
        adjacencyList.addDependency({ from: "11", to: "2" });
        adjacencyList.addDependency({ from: "11", to: "9" });
        adjacencyList.addDependency({ from: "11", to: "10" });
        adjacencyList.addDependency({ from: "8", to: "9" });
        chai_1.assert.deepStrictEqual(adjacency_list_1.AdjacencyList.topologicalSort(adjacencyList), [
            "3",
            "7",
            "8",
            "5",
            "11",
            "10",
            "9",
            "2",
        ]);
    });
});
