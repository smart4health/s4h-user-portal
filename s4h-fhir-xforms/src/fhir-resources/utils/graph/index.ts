import { Eq } from "fp-ts/Eq";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { flow } from "fp-ts/function";

import { uuidv4 } from "../../../utils/uuid";
import { Issue_A, err, msg } from "../../../utils/issues";

import { FHIR_Identifier_A } from "../../types";
import { BSupportedResource } from "../../base/resource";

import { IdBag, Set } from "../set";


export class RefNode extends IdBag {

    private _name:  string;
    private _fhir: O.Option<BSupportedResource>;

    constructor (ids: FHIR_Identifier_A[], fhir?: BSupportedResource) { // must be later extended to []
        super(ids);
        this._fhir = O.fromNullable(fhir);
        this._name = uuidv4();
    }

    name (): string {
        return this._name;
    }

    fhir (): O.Option<BSupportedResource> {
        return this._fhir;
    }

    setFhir (fhir: BSupportedResource): void {
        this._fhir = O.fromNullable(fhir);
    }

    clone (): RefNode {
        return new RefNode(JSON.parse(JSON.stringify(super.getIdentifiers())), O.getOrElse(() => undefined)(this._fhir));
    }

    createMerged (other: RefNode): E.Either<Issue_A, RefNode> {
        if (O.isSome(this._fhir) && O.isSome(other._fhir)) {
            if (this._fhir.value.boxed.id !== other._fhir.value.boxed.id) {
                return E.left(err({ ...msg(`nodes cannot be merged: ${this._fhir.value.boxed.id} vs ${other._fhir.value.boxed.id}`) }));
            }
        }

        const n = new RefNode(this._ids.concat(other._ids));

        if (O.isNone(this._fhir)) {
            n._fhir = other._fhir;
        } else {
            n._fhir = this._fhir;
        }

        return E.right(n);
    }
}

export type RefNodeList = RefNode[];

export type RefEdge = [ FHIR_Identifier_A, FHIR_Identifier_A ];

export function idString (id: FHIR_Identifier_A): string {
    return id.system + "/" + id.value;
}

/**
 * Graph class
 */
export class RefGraph {
    private nodes = new Set<RefNode>([]);
    private edges: Record<string, RefEdge[]> = {};

    getNodes (): RefNodeList {
        return this.nodes.getElements();
    }

    addNode (node: RefNode): E.Either<Issue_A, void> {
        return this.nodes.add(node);
    }

    addNodes (nodes: Set<RefNode>): void {
        for (const node of nodes.getElements()) {
            this.nodes.add(node);
        }
    }

    addEdge (a: FHIR_Identifier_A, b: FHIR_Identifier_A, type: string): void {
        if (!this.nodes.contains(a)) {
            this.nodes.add(new RefNode([ a ]));
        }
        if (!this.nodes.contains(b)) {
            this.nodes.add(new RefNode([ b ]));
        }

        if (!this.edges[type]) {
            this.edges[type] = [];
        }
        this.edges[type].push([ a, b ]);
    }

    getEdgesByType (edgeType: string): RefEdge[] {
        return this.edges[edgeType] ?? [];
    }

    getEdgeTypes (): string[] {
        return Object.keys(this.edges);
    }

    getNode (id: FHIR_Identifier_A): O.Option<RefNode> {
        const result = this.nodes.get(id);
        if (E.isLeft(result)) {
            // This is one of two (production) console messages in this library.
            // We turn an Either into an Option, thus ignoring the error that led to the node being not found.
            // eslint-disable-next-line no-console
            console.error(`RefGraph.getNode: ${result.left.message}`);
            return O.none;
        } else {
            return result.right;
        }
    }

    getChildren (x: RefNode): Record<string, FHIR_Identifier_A[]> {
        const children: Record<string, FHIR_Identifier_A[]> = {};

        for (const edgeType of Object.keys(this.edges)) {
            children[edgeType] = [];
            for (const edge of this.edges[edgeType]) {
                if (x.intersectsWithIdentifiers([ edge[1] ])) {
                    children[edgeType].push(edge[0]);
                }
            }
        }
        return children;
    }

    getNeighbors (x: RefNode, edgeTypes?: string[]): FHIR_Identifier_A[] {
        const neighbors: FHIR_Identifier_A[] = [];

        for (const edgeType of Object.keys(this.edges)) {
            if ((typeof edgeTypes !== "undefined") && (edgeTypes.indexOf(edgeType) === -1)) { continue; }

            neighbors[edgeType] = [];
            for (const edge of this.edges[edgeType]) {
                if (x.intersectsWithIdentifiers([ edge[1] ])) {
                    neighbors.push(edge[0]);
                }
                if (x.intersectsWithIdentifiers([ edge[0] ])) {
                    neighbors.push(edge[1]);
                }
            }
        }
        return neighbors;
    }

    getNodesByResourceType (resourceType: string): RefNodeList {
        return this.nodes.filter(n => {
            const fhir = n.fhir();
            if (O.isSome(fhir)) {
                return fhir.value.boxed.resourceType === resourceType;
            }
            return false;
        });
    }

    getFloodfillNodes (seedNode: RefNode, edgeTypes?: string[]): RefNodeList {

        const visited: Record<string, RefNode> = { [ seedNode.name() ]: seedNode };

        const setVisited    = (n: RefNode): RefNode => { visited[n.name()] = n; return n; };
        const notYetVisited = (n: RefNode): boolean => typeof visited[n.name()] === "undefined";

        const visitNeighbors = (f: (n: RefNode) => RefNode): (n: RefNode) => void => n => flow(
            A.map(this.getNode.bind(this)), // Option<RefNode> from IIdentifier
            A.compact,                      // keep only the Some<RefNode> values and extract them
            A.filter(notYetVisited),        // kick out already visited nodes
            A.map(f),                       // mark the remaining as visited
            A.map(visitNeighbors(f))        // recurse into their neighbors
        )(this.getNeighbors(n, edgeTypes));

        visitNeighbors(setVisited)(seedNode);

        return Object.values(visited);
    }

    getDisconnectedComponents (edgeTypes?: string[]): RefNodeList[] {
        const eqRefNode: Eq<RefNode> = { equals: (x, y) => x.name() === y.name() };

        let nodes = this.getNodes();
        const components: RefNodeList[] = [];

        while (nodes.length > 0) {
            const component = this.getFloodfillNodes(nodes[0], edgeTypes);
            components.push(component);

            // nodes := nodes \ component
            nodes = A.difference(eqRefNode)(component)(nodes);
        }

        return components;
    }

    getSubgraphFromNodes (nodes: RefNodeList): RefGraph {
        const set = new Set<RefNode>(nodes);

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

    // Helper methods

    getRootNodes (): RefNodeList {
        const rootCandidates = this.nodes.clone();
        for (const edgeType of Object.keys(this.edges)) {
            for (const edge of this.edges[edgeType]) {
                if (rootCandidates.contains(edge[1])) {
                    rootCandidates.remove(edge[1]);
                }
            }
        }
        return rootCandidates.getElements();
    }
}
