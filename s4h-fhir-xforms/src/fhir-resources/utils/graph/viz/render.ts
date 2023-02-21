import * as O from "fp-ts/Option";

import { FHIR_Identifier_A } from "../../../types";
import { BSupportedResource } from "../../../base/resource";

import { RefGraph, RefNodeList } from "..";

import { GDigraph, GEdge, GNode } from "./viz";


const missingResource = () => ({
    boxed: {
        resourceType: "**unknown**"
    }
});

const RESOURCE_COLORS = {
    "Encounter":             "#A4BDF3",
    "Observation":           "#78D175",
    "QuestionnaireResponse": "#FFB6C1",
    "Questionnaire":         "#C089FD",
    "DocumentReference":     "#F0E68C"
};

function resourceColor (resourceType: string): string {
    return RESOURCE_COLORS[resourceType] ?? "#ff8800";
}

function getIdentifiers (res: O.Option<BSupportedResource>): FHIR_Identifier_A[] {
    if (O.isNone(res)) {
        return [];
    }

    if (res.value.boxed.identifier) {
        if (res.value.boxed.identifier instanceof Array) {
            return res.value.boxed.identifier;
        } else {
            return [ res.value.boxed.identifier ];
        }
    }

    return [];
}

export function refGraphToDot (g: RefGraph, components: RefNodeList[]): string {
    const dg = new GDigraph("FHIR resources");
    dg.setDefaultNodeParam("fontname", "Helvetica");
    dg.setDefaultNodeParam("fontsize", "10");
    dg.setDefaultNodeParam("margin",   "0");
    dg.set("ranksep", "1");
    dg.set("rankdir", "LR");
    dg.set("ratio", "auto");


    for (let c = 0; c < components.length; c++) {
        const gc = new GDigraph(`cluster_${c}`);
        gc.set("label", "Component " + c);
        gc.set("fontname", "Helvetica");
        gc.set("fontsize", "10");
        gc.set("style", "filled");
        gc.set("color", "#DDDDDD");

        for (const node of components[c]) {
            const resourceType = O.getOrElse(missingResource)(node.fhir()).boxed.resourceType;
            gc.addNode(new GNode(node.name(), {
                label: makeResourceGNode({
                    resourceType,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    fhirId: (O.getOrElse(missingResource)(node.fhir()).boxed as any).id,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    url:    (O.getOrElse(missingResource)(node.fhir()).boxed as any).url,
                    ids:    getIdentifiers(node.fhir())
                }),
                // href: "http://localhost:8080/#/resources/" + (O.getOrElse(missingResource)(node.fhir()).boxed as any).id,
                fillcolor: resourceColor(resourceType),
                // penwidth: 0,
                style:     "filled,solid",
                shape:     "none"
                // shape: "box"
            }));
        }

        dg.addCluster(gc);
    }

    for (const type of g.getEdgeTypes()) {
        const edges = g.getEdgesByType(type);
        for (const edge of edges) {
            const n0 = g.getNode(edge[0]);
            const n1 = g.getNode(edge[1]);
            if (O.isSome(n0) && O.isSome(n1)) {
                const e = new GEdge(n0.value.name(), n1.value.name());
                e.set("label", type);
                e.set("fontsize", "10");
                e.set("fontname", "Helvetica");
                if (type === "questionnaire") {
                    e.set("color", "#aaaaaa");
                    e.set("fontcolor", "#aaaaaa");
                    e.set("style", "solid");
                }
                dg.addEdge(e);
            }
        }
    }

    return dg.toString();
}

function makeResourceGNode ({
    resourceType,
    fhirId,
    url,
    ids
}: {
    resourceType: string,
    fhirId: string | undefined,
    url: string | undefined,
    ids: FHIR_Identifier_A[]
}): string {
    return `< <table cellspacing="0" cellpadding="1" border="0" cellborder="0">
        <tr>
            <td align="left"><b><font point-size="10">${resourceType}</font></b></td>
        </tr>
        <tr>
            <td align="left" href="http://localhost:9090/#/resources/${fhirId ?? "no ID"}">${fhirId ?? "no ID"}</td>
        </tr>
        ${url ? `<tr><td>URL: ${url}</td></tr>` : ""}
        ${ids.map(id => `<tr><td align="left"><font point-size="9">${identifierString(id)}</font></td></tr>`)}
    </table> >`;
}

function identifierString (id: FHIR_Identifier_A): string {
    return id.system + " / " + id.value;
}
