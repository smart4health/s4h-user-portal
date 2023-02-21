import * as R from "fp-ts/Record";

export type GNodeMap = Record<string, GNode>;

export class GDigraph {

    private defaultGraphParams: Record<string, unknown> = {};
    private defaultNodeParams:  Record<string, unknown> = {};
    private defaultEdgeParams:  Record<string, unknown> = {};
    private nodes: GNodeMap = {};
    private edges: GEdge[]  = [];

    private clusters: GDigraph[] = [];

    constructor (private graphId: string) {
    }

    set (param: string, value: string): GDigraph {
        this.defaultGraphParams[param] = value;
        return this;
    }

    // eslint-disable-next-line complexity
    toString (structureName = "digraph"): string {
        const lines = [
            `${structureName} "${this.graphId}" {`
        ];

        if (!R.isEmpty(this.defaultGraphParams)) {
            lines.push("graph [");
            for (const [ sParam, sValue ] of R.toArray(this.defaultGraphParams)) {
                lines.push( `${sParam} = "${sValue}";` );
            }
            lines.push("];");
        }

        if (!R.isEmpty(this.defaultNodeParams)) {
            lines.push("node [");
            for (const [ sParam, sValue ] of R.toArray(this.defaultNodeParams)) {
                lines.push( `${sParam} = "${sValue}";` );
            }
            lines.push("];");
        }

        if (!R.isEmpty(this.defaultEdgeParams)) {
            lines.push("edge [");
            for (const [ sParam, sValue ] of R.toArray(this.defaultEdgeParams)) {
                lines.push( `${sParam} = "${sValue}";` );
            }
            lines.push("];");
        }

        for (const cluster of this.clusters) {
            lines.push(cluster.toString("subgraph"));
        }

        for (const nid of Object.keys(this.nodes)) {
            lines.push(this.nodes[nid].toString());
        }

        for (const edge of this.edges) {
            lines.push(edge.toString());
        }

        lines.push("}");
        return lines.join("\n");
    }

    addNode (node: GNode): GDigraph {
        this.nodes[node.id()] = node;
        return this;
    }

    addEdge (edge: GEdge): GDigraph {
        this.edges.push(edge);
        return this;
    }

    setDefaultNodeParam (param: string, value: string): GDigraph {
        this.defaultNodeParams[param] = value;
        return this;
    }

    setDefaultEdgeParam (param: string, value: string): GDigraph {
        this.defaultEdgeParams[param] = value;
        return this;
    }

    getNodes (): GNodeMap {
        return this.nodes;
    }

    getNode (nodeId: string): GNode {
        return this.nodes[nodeId];
    }

    addCluster (cluster: GDigraph): void {
        this.clusters.push(cluster);
    }
}


export class GNode {

    constructor (private nodeId: string, private nodeParams: Record<string, unknown>) {
    }

    id (): string { return this.nodeId; }

    set (sParam: string, sValue: string): GNode {
        this.nodeParams[sParam] = sValue;
        return this;
    }

    get (sParam: string): unknown { return this.nodeParams[sParam]; }

    toString (): string {
        const lines = [ `"${this.nodeId}" [` ];

        for (const [ key, value ] of R.toArray(this.nodeParams)) {
            if (key === "label") {
                if (typeof value === "string") {
                    if (value.charAt(0) === "<") {
                        lines.push( `${key} =  ${value};\n`);
                    } else {
                        lines.push(`${key} = "${value}";\n`);
                    }
                } else if (typeof value.toString === "function") {
                    lines.push(key + " = " + value.toString() + ";\n");
                }
            } else {
                lines.push(`${key} = "${value}";\n`);
            }
        }

        lines.push("]");

        return lines.join(" ");
    }

}

export class GEdge {
    private mEdgeParams: Record<string, unknown> = {};

    constructor (private sSourceId: string, private sTargetId: string, mParams?: Record<string, unknown>) {
        this.mEdgeParams = mParams || {};
    }

    set (sParam: string, sValue: string): GEdge {
        this.mEdgeParams[sParam] = sValue;
        return this;
    }

    toString (): string {
        const aReturn = [
            `"${this.sSourceId}"`,
            " -> ",
            `"${this.sTargetId}"`
        ];

        if (!R.isEmpty(this.mEdgeParams)) {
            aReturn.push(" [");
            for (const [ k, v ] of R.toArray(this.mEdgeParams)) {
                aReturn.push( `"${k}"="${v}"`);
            }
            aReturn.push("]");
        }

        aReturn.push(";");
        return aReturn.join("");
    }
}
