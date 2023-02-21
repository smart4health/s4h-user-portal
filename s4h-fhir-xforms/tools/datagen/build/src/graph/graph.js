"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.RefGraph = exports.idString = exports.RefNode = void 0;
const A = __importStar(require("fp-ts/Array"));
const O = __importStar(require("fp-ts/Option"));
const E = __importStar(require("fp-ts/Either"));
const function_1 = require("fp-ts/function");
const uuid_1 = require("../utils/uuid");
const set_1 = require("../utils/set");
class RefNode extends set_1.IdBag {
    constructor(ids, fhir) {
        super(ids);
        this._fhir = O.fromNullable(fhir);
        this._name = uuid_1.uuidv4();
    }
    name() {
        return this._name;
    }
    fhir() {
        return this._fhir;
    }
    setFhir(fhir) {
        this._fhir = O.fromNullable(fhir);
    }
    createMerged(other) {
        if (O.isSome(this._fhir) && O.isSome(other._fhir)) {
            if (this._fhir.value.boxed.id !== other._fhir.value.boxed.id) {
                throw new Error(`nodes cannot be merged: ${this._fhir.value.boxed.id} vs ${other._fhir.value.boxed.id}`);
            }
        }
        const n = new RefNode(this._ids.concat(other._ids));
        if (O.isNone(this._fhir)) {
            n._fhir = other._fhir;
        }
        else {
            n._fhir = this._fhir;
        }
        return n;
    }
}
exports.RefNode = RefNode;
function idString(id) {
    return id.system + "/" + id.value;
}
exports.idString = idString;
/**
 * Graph class
 */
class RefGraph {
    constructor() {
        this.nodes = new set_1.Set([]);
        this.edges = {};
    }
    getNodes() {
        return this.nodes.getElements();
    }
    addNode(node) {
        this.nodes.add(node);
    }
    addNodes(nodes) {
        for (const node of nodes.getElements()) {
            this.nodes.add(node);
        }
    }
    addEdge(a, b, type) {
        if (!this.nodes.contains(a)) {
            this.nodes.add(new RefNode([a]));
        }
        if (!this.nodes.contains(b)) {
            this.nodes.add(new RefNode([b]));
        }
        if (!this.edges[type]) {
            this.edges[type] = [];
        }
        this.edges[type].push([a, b]);
    }
    getEdgesByType(edgeType) {
        var _a;
        return (_a = this.edges[edgeType]) !== null && _a !== void 0 ? _a : [];
    }
    getEdgeTypes() {
        return Object.keys(this.edges);
    }
    getNode(id) {
        const result = this.nodes.get(id);
        if (E.isLeft(result)) {
            // This is the only (production) console message of this library.
            // We turn an Either into an Option, thus ignoring the error that led to the node being not found.
            // eslint-disable-next-line no-console
            console.error(result.left.message);
            return O.none;
        }
        else {
            return result.right;
        }
    }
    getChildren(x) {
        const children = {};
        for (const edgeType of Object.keys(this.edges)) {
            children[edgeType] = [];
            for (const edge of this.edges[edgeType]) {
                if (x.intersectsWithIdentifiers([edge[1]])) {
                    children[edgeType].push(edge[0]);
                }
            }
        }
        return children;
    }
    getNeighbors(x, edgeTypes) {
        const neighbors = [];
        for (const edgeType of Object.keys(this.edges)) {
            if ((typeof edgeTypes !== "undefined") && (edgeTypes.indexOf(edgeType) === -1)) {
                continue;
            }
            neighbors[edgeType] = [];
            for (const edge of this.edges[edgeType]) {
                if (x.intersectsWithIdentifiers([edge[1]])) {
                    neighbors.push(edge[0]);
                }
                if (x.intersectsWithIdentifiers([edge[0]])) {
                    neighbors.push(edge[1]);
                }
            }
        }
        return neighbors;
    }
    getNodesByResourceType(resourceType) {
        return this.nodes.filter(n => {
            const fhir = n.fhir();
            if (O.isSome(fhir)) {
                return fhir.value.boxed.resourceType === resourceType;
            }
            return false;
        });
    }
    getFloodfillNodes(seedNode, edgeTypes) {
        const visited = { [seedNode.name()]: seedNode };
        const setVisited = (n) => { visited[n.name()] = n; return n; };
        const notYetVisited = (n) => typeof visited[n.name()] === "undefined";
        const visitNeighbors = (f) => n => function_1.flow(A.map(this.getNode.bind(this)), // Option<RefNode> from IIdentifier
        A.compact, // keep only the Some<RefNode> values and extract them
        A.filter(notYetVisited), // kick out already visited nodes
        A.map(f), // mark the remaining as visited
        A.map(visitNeighbors(f)) // recurse into their neighbors
        )(this.getNeighbors(n, edgeTypes));
        visitNeighbors(setVisited)(seedNode);
        return Object.values(visited);
    }
    getDisconnectedComponents(edgeTypes) {
        const eqRefNode = { equals: (x, y) => x.name() === y.name() };
        let nodes = this.getNodes();
        const components = [];
        while (nodes.length > 0) {
            const component = this.getFloodfillNodes(nodes[0], edgeTypes);
            components.push(component);
            // nodes := nodes \ component
            nodes = A.difference(eqRefNode)(component)(nodes);
        }
        return components;
    }
    getSubgraphFromNodes(nodes) {
        const set = new set_1.Set(nodes);
        const sg = new RefGraph();
        sg.addNodes(set);
        for (const edgeType of Object.keys(this.edges)) {
            for (const edge of this.edges[edgeType]) {
                if (set.contains(edge[0]) && set.contains(edge[1])) {
                    sg.addEdge(edge[0], edge[1], edgeType);
                }
            }
        }
        return sg;
    }
}
exports.RefGraph = RefGraph;
