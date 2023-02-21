/* eslint-disable max-nested-callbacks */
import { assert, expect } from "chai";

import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";

import { RefGraph, RefNode } from "../../../../src/fhir-resources/utils/graph";
import { BSupportedResource } from "../../../../src/fhir-resources/base/resource";
import { assertEitherLeft, assertOptionNone } from "../../../utils";


describe("graph suite", () => {

    const names = A.map( (n: RefNode) => n.name() );

    describe("node merges", () => {

        it("a", () => {
            const g = new RefGraph();
            g.addEdge({ system: "A", value: "a" }, { system: "B", value: "b" }, "red");
            g.addEdge({ system: "A", value: "a" }, { system: "B", value: "b" }, "blue");

            expect(g.getNodes().length).to.equal(2);
        });

        it("b", () => {
            const g = new RefGraph();
            g.addEdge({ system: "A", value: "a" }, { system: "B", value: "b" }, "red");
            g.addEdge({ system: "A", value: "a" }, { system: "C", value: "c" }, "blue");

            expect(g.getNodes().length).to.equal(3);
        });

        it("c", () => {
            const g = new RefGraph();

            // { {A}, {B}, {C} }
            g.addEdge({ system: "A", value: "a" }, { system: "B", value: "b" }, "red");
            g.addEdge({ system: "A", value: "a" }, { system: "C", value: "c" }, "blue");
            expect(g.getNodes().length).to.equal(3);

            // { {A}, {B}, {C} }
            g.addNode(new RefNode([{ system: "A", value: "a" }]));
            expect(g.getNodes().length).to.equal(3);

            // { {A, D}, {B}, {C} }
            g.addNode(new RefNode([{ system: "A", value: "a" }, { system: "D", value: "d" }]));
            expect(g.getNodes().length).to.equal(3);

            // { {A, C, D}, {B} }
            g.addNode(new RefNode([{ system: "A", value: "a" }, { system: "C", value: "c" }]));
            expect(g.getNodes().length).to.equal(2);
        });

        it("d", () => {
            const g = new RefGraph();

            // { {A}, {B}, {C} }
            g.addEdge({ system: "A", value: "a" }, { system: "B", value: "b" }, "red");
            g.addEdge({ system: "A", value: "a" }, { system: "C", value: "c" }, "blue");
            expect(g.getNodes().length).to.equal(3);

            // { {A, B, C} }
            g.addNode(new RefNode([{ system: "A", value: "a" }, { system: "B", value: "b" }, { system: "C", value: "c" }]));
            expect(g.getNodes().length).to.equal(1);
        });

        it("e", () => {
            const g = new RefGraph();

            // { {A} }
            g.addEdge({ system: "A", value: "a" }, { system: "A", value: "a" }, "red");
            expect(g.getNodes().length).to.equal(1);

            g.addEdge({ system: "A", value: "a" }, { system: "A", value: "a" }, "red");
            expect(g.getNodes().length).to.equal(1);
        });


        it("f", () => {
            const f: BSupportedResource = {
                boxed: {
                    resourceType: "Encounter",
                    id: "foo",
                    status: "planned",
                    identifier: [],
                    class: {}
                },
                period: {
                    min: -Infinity,
                    max: +Infinity
                },
                type: []
            };

            const h: BSupportedResource = {
                boxed: {
                    resourceType: "Encounter",
                    id: "bar",
                    status: "planned",
                    identifier: [],
                    class: {}
                },
                period: {
                    min: -Infinity,
                    max: +Infinity
                },
                type: []
            };
            const g = new RefGraph();

            // { {A}--0, {B}--0 }
            g.addEdge({ system: "A", value: "a" }, { system: "B", value: "b" }, "red");
            let n = g.getNode({ system: "A", value: "a" });
            if (O.isSome(n)) {
                const fhir = n.value.fhir();
                assertOptionNone(fhir);
            } else {
                assert.fail("node is none");
            }

            // { {A}--f, {B}--0 }
            const a = new RefNode([{ system: "A", value: "a" }]);
            a.setFhir(f);
            g.addNode(a);

            n = g.getNode({ system: "A", value: "a" });
            if (O.isSome(n)) {
                const fhir = n.value.fhir();
                if (O.isSome(fhir)) {
                    expect(fhir.value.boxed.id).to.equal("foo");
                } else {
                    assert.fail("fhir is none");
                }
            } else {
                assert.fail("node is none");
            }

            // { {A}--f, {B}--f }
            const b = new RefNode([{ system: "B", value: "b" }]);
            b.setFhir(f);
            g.addNode(b);

            n = g.getNode({ system: "B", value: "b" });
            if (O.isSome(n)) {
                const fhir = n.value.fhir();
                if (O.isSome(fhir)) {
                    expect(fhir.value.boxed.id).to.equal("foo");
                } else {
                    assert.fail("fhir is none");
                }
            } else {
                assert.fail("node is none");
            }

            // { {A, B, C}--f }
            const abc = new RefNode([{ system: "A", value: "a" }, { system: "B", value: "b" }, { system: "C", value: "c" }]);
            abc.setFhir(f);
            g.addNode(abc);
            g.addNode(abc);
            g.addNode(abc);

            expect(g.getNodes().length).to.equal(1);

            n = g.getNode({ system: "B", value: "b" });
            if (O.isSome(n)) {
                const fhir = n.value.fhir();
                if (O.isSome(fhir)) {
                    expect(fhir.value.boxed.id).to.equal("foo");
                } else {
                    assert.fail("fhir is none");
                }
            } else {
                assert.fail("node is none");
            }

            // Conflict with C: { {A, B, C}--f, {C}--h }
            const c = new RefNode([{ system: "C", value: "c" }]);
            c.setFhir(h);

            assertEitherLeft(g.addNode(c));
        });

    });

    describe("floodfill suite", () => {

        it("one node graph", () => {
            // n

            const g = new RefGraph();
            const n = new RefNode([{ system: "foo", value: "bar" }]);
            g.addNode(n);

            const nodes = g.getFloodfillNodes(n);
            expect(nodes.length).to.equal(1);
            expect(nodes[0].name()).to.equal(n.name());
        });

        it("two node disconnected graph", () => {
            // n0   n1

            const g = new RefGraph();
            const n0 = new RefNode([{ system: "foo", value: "zero" }]);
            const n1 = new RefNode([{ system: "foo", value: "one" }]);
            g.addNode(n0);
            g.addNode(n1);

            let nodes = g.getFloodfillNodes(n0);
            expect(nodes.length).to.equal(1);
            expect(nodes[0].name()).to.equal(n0.name());

            nodes = g.getFloodfillNodes(n1);
            expect(nodes.length).to.equal(1);
            expect(nodes[0].name()).to.equal(n1.name());
        });

        it("two node connected graph", () => {
            // n0 --> n1

            const g = new RefGraph();
            const n0 = new RefNode([{ system: "foo", value: "zero" }]);
            const n1 = new RefNode([{ system: "foo", value: "one" }]);
            g.addNode(n0);
            g.addNode(n1);
            g.addEdge({ system: "foo", value: "zero" }, { system: "foo", value: "one" }, "red");

            let nodes = g.getFloodfillNodes(n0);
            expect(nodes.length).to.equal(2);
            expect(names(nodes)).to.have.same.members(names([ n0, n1 ]));

            nodes = g.getFloodfillNodes(n1);
            expect(nodes).to.have.length(2);
            expect(names(nodes)).to.have.same.members(names([ n0, n1 ]));
        });

        it("single node graph with self-loop", () => {
            // +-> n0 -+
            // |       |
            // +-------+

            const g = new RefGraph();
            const n0 = new RefNode([{ system: "foo", value: "zero" }]);
            g.addNode(n0);
            g.addEdge({ system: "foo", value: "zero" }, { system: "foo", value: "zero" }, "red");

            const nodes = g.getFloodfillNodes(n0);
            expect(nodes).to.have.length(1);
            expect(names(nodes)).to.have.same.members(names([ n0 ]));
        });


        it("three node connected graph", () => {
            // n0 --> n1 --> n2

            const g = new RefGraph();
            const n0 = new RefNode([{ system: "foo", value: "zero" }]);
            const n1 = new RefNode([{ system: "foo", value: "one" }]);
            const n2 = new RefNode([{ system: "foo", value: "two" }]);
            g.addNode(n0);
            g.addNode(n1);
            g.addNode(n2);
            g.addEdge({ system: "foo", value: "zero" }, { system: "foo", value: "one" }, "red");
            g.addEdge({ system: "foo", value: "one"  }, { system: "foo", value: "two" }, "red");

            let nodes = g.getFloodfillNodes(n0);
            expect(nodes).to.have.length(3);
            expect(names(nodes)).to.have.same.members(names([ n0, n1, n2 ]));

            nodes = g.getFloodfillNodes(n1);
            expect(nodes).to.have.length(3);
            expect(names(nodes)).to.have.same.members(names([ n0, n1, n2 ]));

            nodes = g.getFloodfillNodes(n2);
            expect(nodes).to.have.length(3);
            expect(names(nodes)).to.have.same.members(names([ n0, n1, n2 ]));
        });

        it("three node connected graph", () => {
            // n0 --> n1 <-- n2

            const g = new RefGraph();
            const n0 = new RefNode([{ system: "foo", value: "zero" }]);
            const n1 = new RefNode([{ system: "foo", value: "one" }]);
            const n2 = new RefNode([{ system: "foo", value: "two" }]);
            g.addNode(n0);
            g.addNode(n1);
            g.addNode(n2);
            g.addEdge({ system: "foo", value: "zero" }, { system: "foo", value: "one" }, "red");
            g.addEdge({ system: "foo", value: "two"  }, { system: "foo", value: "one" }, "red");

            let nodes = g.getFloodfillNodes(n0);
            expect(nodes).to.have.length(3);
            expect(names(nodes)).to.have.same.members(names([ n0, n1, n2 ]));

            nodes = g.getFloodfillNodes(n1);
            expect(nodes).to.have.length(3);
            expect(names(nodes)).to.have.same.members(names([ n0, n1, n2 ]));

            nodes = g.getFloodfillNodes(n2);
            expect(nodes).to.have.length(3);
            expect(names(nodes)).to.have.same.members(names([ n0, n1, n2 ]));
        });

        it("three node connected graph, triangle", () => {
            // n0 ------> n1
            //  |         |
            //  +->  n2 <-+

            const g = new RefGraph();
            const n0 = new RefNode([{ system: "foo", value: "zero" }]);
            const n1 = new RefNode([{ system: "foo", value: "one" }]);
            const n2 = new RefNode([{ system: "foo", value: "two" }]);
            g.addNode(n0);
            g.addNode(n1);
            g.addNode(n2);
            g.addEdge({ system: "foo", value: "zero" }, { system: "foo", value: "one" }, "red");
            g.addEdge({ system: "foo", value: "zero" }, { system: "foo", value: "two" }, "red");
            g.addEdge({ system: "foo", value: "one"  }, { system: "foo", value: "two" }, "red");

            let nodes = g.getFloodfillNodes(n0);
            expect(nodes).to.have.length(3);
            expect(names(nodes)).to.have.same.members(names([ n0, n1, n2 ]));

            nodes = g.getFloodfillNodes(n1);
            expect(nodes).to.have.length(3);
            expect(names(nodes)).to.have.same.members(names([ n0, n1, n2 ]));

            nodes = g.getFloodfillNodes(n2);
            expect(nodes).to.have.length(3);
            expect(names(nodes)).to.have.same.members(names([ n0, n1, n2 ]));
        });


        it("four node graph, triangle and single node", () => {
            // n0 ------> n1
            //  |         |     n3
            //  +->  n2 <-+

            const g = new RefGraph();
            const n0 = new RefNode([{ system: "foo", value: "zero"  }]);
            const n1 = new RefNode([{ system: "foo", value: "one"   }]);
            const n2 = new RefNode([{ system: "foo", value: "two"   }]);
            const n3 = new RefNode([{ system: "foo", value: "three" }]);
            g.addNode(n0);
            g.addNode(n1);
            g.addNode(n2);
            g.addNode(n3);

            g.addEdge({ system: "foo", value: "zero" }, { system: "foo", value: "one" }, "red");
            g.addEdge({ system: "foo", value: "zero" }, { system: "foo", value: "two" }, "red");
            g.addEdge({ system: "foo", value: "one"  }, { system: "foo", value: "two" }, "red");

            let nodes = g.getFloodfillNodes(n0);
            expect(nodes).to.have.length(3);
            expect(names(nodes)).to.have.same.members(names([ n0, n1, n2 ]));

            nodes = g.getFloodfillNodes(n1);
            expect(nodes).to.have.length(3);
            expect(names(nodes)).to.have.same.members(names([ n0, n1, n2 ]));

            nodes = g.getFloodfillNodes(n2);
            expect(nodes).to.have.length(3);
            expect(names(nodes)).to.have.same.members(names([ n0, n1, n2 ]));

            nodes = g.getFloodfillNodes(n3);
            expect(nodes).to.have.length(1);
            expect(names(nodes)).to.have.same.members(names([ n3 ]));
        });


        it("six node graph, two components", () => {
            // n0 ------> n1 ----> n5
            //  |         |
            //  +->  n2 <-+        n3 ---> n4

            const g = new RefGraph();
            const n0 = new RefNode([{ system: "foo", value: "zero"  }]);
            const n1 = new RefNode([{ system: "foo", value: "one"   }]);
            const n2 = new RefNode([{ system: "foo", value: "two"   }]);
            const n3 = new RefNode([{ system: "foo", value: "three" }]);
            const n4 = new RefNode([{ system: "foo", value: "four"  }]);
            const n5 = new RefNode([{ system: "foo", value: "five"  }]);
            g.addNode(n0);
            g.addNode(n1);
            g.addNode(n2);
            g.addNode(n3);
            g.addNode(n4);
            g.addNode(n5);

            g.addEdge({ system: "foo", value: "zero"  }, { system: "foo", value: "one"  }, "red");
            g.addEdge({ system: "foo", value: "zero"  }, { system: "foo", value: "two"  }, "red");
            g.addEdge({ system: "foo", value: "one"   }, { system: "foo", value: "two"  }, "red");
            g.addEdge({ system: "foo", value: "one"   }, { system: "foo", value: "five" }, "red");
            g.addEdge({ system: "foo", value: "three" }, { system: "foo", value: "four" }, "red");

            let nodes = g.getFloodfillNodes(n0);
            expect(names(nodes)).to.have.same.members(names([ n0, n1, n2, n5 ]));

            nodes = g.getFloodfillNodes(n1);
            expect(names(nodes)).to.have.same.members(names([ n0, n1, n2, n5 ]));

            nodes = g.getFloodfillNodes(n2);
            expect(names(nodes)).to.have.same.members(names([ n0, n1, n2, n5 ]));

            nodes = g.getFloodfillNodes(n5);
            expect(names(nodes)).to.have.same.members(names([ n0, n1, n2, n5 ]));

            nodes = g.getFloodfillNodes(n3);
            expect(names(nodes)).to.have.same.members(names([ n3, n4 ]));

            nodes = g.getFloodfillNodes(n4);
            expect(names(nodes)).to.have.same.members(names([ n3, n4 ]));
        });

    });

    describe("disconnected components suite", () => {

        it("", () => {
            // n0 ------> n1 ----> n5
            //  |         |
            //  +->  n2 <-+        n3 ---> n4

            const g = new RefGraph();
            const n0 = new RefNode([{ system: "foo", value: "zero"  }]);
            const n1 = new RefNode([{ system: "foo", value: "one"   }]);
            const n2 = new RefNode([{ system: "foo", value: "two"   }]);
            const n3 = new RefNode([{ system: "foo", value: "three" }]);
            const n4 = new RefNode([{ system: "foo", value: "four"  }]);
            const n5 = new RefNode([{ system: "foo", value: "five"  }]);
            g.addNode(n0);
            g.addNode(n1);
            g.addNode(n2);
            g.addNode(n3);
            g.addNode(n4);
            g.addNode(n5);

            g.addEdge({ system: "foo", value: "zero"  }, { system: "foo", value: "one"  }, "red");
            g.addEdge({ system: "foo", value: "zero"  }, { system: "foo", value: "two"  }, "red");
            g.addEdge({ system: "foo", value: "one"   }, { system: "foo", value: "two"  }, "red");
            g.addEdge({ system: "foo", value: "one"   }, { system: "foo", value: "five" }, "red");
            g.addEdge({ system: "foo", value: "three" }, { system: "foo", value: "four" }, "red");

            const components = g.getDisconnectedComponents();
            expect(components).to.have.length(2);

            // Check that the set of sets are identical (up to ordering)
            expect([
                names(components[0]).sort().join("/"),
                names(components[1]).sort().join("/")
            ]).to.have.same.members([
                names([ n0, n1, n2, n5 ]).sort().join("/"),
                names([ n3, n4 ]).sort().join("/")
            ]);
        });


        it("", () => {
            // n0   n1   n2

            const g = new RefGraph();
            const n0 = new RefNode([{ system: "foo", value: "zero"  }]);
            const n1 = new RefNode([{ system: "foo", value: "one"   }]);
            const n2 = new RefNode([{ system: "foo", value: "two"   }]);
            g.addNode(n0);
            g.addNode(n1);
            g.addNode(n2);

            const components = g.getDisconnectedComponents();
            expect(components).to.have.length(3);

            expect([
                names(components[0]).sort().join("/"),
                names(components[1]).sort().join("/"),
                names(components[2]).sort().join("/")
            ]).to.have.same.members([
                names([ n0 ]).sort().join("/"),
                names([ n1 ]).sort().join("/"),
                names([ n2 ]).sort().join("/")
            ]);
        });


        it("", () => {
            // (n0)-----> n1 ----> n2
            //  |         |
            //  |         +------> n3
            //  +-------> n4 ----> n5
            //  |         |
            //  |         +------> n6
            //  +---------n7 ----> n8
            //
            // n9
            //
            // (n10)----> (n11) ---> n12

            const g = new RefGraph();
            // n0 missing
            const n1  = new RefNode([{ system: "foo", value: "one"   }]);
            const n2  = new RefNode([{ system: "foo", value: "two"   }]);
            const n3  = new RefNode([{ system: "foo", value: "three" }]);
            const n4  = new RefNode([{ system: "foo", value: "four"  }]);
            const n5  = new RefNode([{ system: "foo", value: "five"  }]);
            const n6  = new RefNode([{ system: "foo", value: "six"   }]);
            const n7  = new RefNode([{ system: "foo", value: "seven" }]);
            const n8  = new RefNode([{ system: "foo", value: "eight" }]);
            const n9  = new RefNode([{ system: "foo", value: "nine"  }]);
            // n10 missing
            // n11 missing
            const n12 = new RefNode([{ system: "foo", value: "twelve"  }]);

            // n0 missing
            g.addNode(n1);
            g.addNode(n2);
            g.addNode(n3);
            g.addNode(n4);
            g.addNode(n5);
            g.addNode(n6);
            g.addNode(n7);
            g.addNode(n8);
            g.addNode(n9);
            // n10 missing
            // n11 missing
            g.addNode(n12);

            g.addEdge({ system: "foo", value: "zero"   }, { system: "foo", value: "one"    }, "red");
            g.addEdge({ system: "foo", value: "one"    }, { system: "foo", value: "two"    }, "red");
            g.addEdge({ system: "foo", value: "one"    }, { system: "foo", value: "three"  }, "red");
            g.addEdge({ system: "foo", value: "zero"   }, { system: "foo", value: "four"   }, "red");
            g.addEdge({ system: "foo", value: "four"   }, { system: "foo", value: "five"   }, "red");
            g.addEdge({ system: "foo", value: "four"   }, { system: "foo", value: "six"    }, "red");
            g.addEdge({ system: "foo", value: "zero"   }, { system: "foo", value: "seven"  }, "red");
            g.addEdge({ system: "foo", value: "seven"  }, { system: "foo", value: "eight"  }, "red");

            g.addEdge({ system: "foo", value: "ten"    }, { system: "foo", value: "eleven" }, "red");
            g.addEdge({ system: "foo", value: "eleven" }, { system: "foo", value: "twelve" }, "red");

            const components = g.getDisconnectedComponents();
            expect(components).to.have.length(3);

            components.sort( (a, b) => a.length - b.length);

            expect(names(components[0])).to.have.same.members(names([ n9 ]));
            expect(names(components[1])).to.include.members(names([ n12 ]));
            expect(names(components[2])).to.include.members(names([ n1, n2, n3, n4, n5, n6 ]));
        });

    });

    describe("subgraph suite", () => {
        it("empty subgraph from empty graph", () => {
            const g = new RefGraph();
            const h = g.getSubgraphFromNodes([]);

            expect(h.getNodes()).to.have.length(0);
        });

        it("empty subgraph from single node graph", () => {
            const g = new RefGraph();
            g.addNode(new RefNode([{ system: "foo", value: "" }]));
            const h = g.getSubgraphFromNodes([]);

            expect(h.getNodes()).to.have.length(0);
        });

        it("subgraphs of single edge graph", () => {
            const g = new RefGraph();
            g.addEdge({ system: "foo", value: "1" }, { system: "foo", value: "2" }, "blue");

            let h = g.getSubgraphFromNodes([]);
            expect(h.getNodes()).to.have.length(0);

            h = g.getSubgraphFromNodes(A.compact([ g.getNode({ system: "foo", value: "1" }) ]));
            expect(h.getNodes()).to.have.length(1);
            expect(h.getEdgesByType("blue")).to.have.length(0);

            h = g.getSubgraphFromNodes(A.compact([ g.getNode({ system: "foo", value: "2" }) ]));
            expect(h.getNodes()).to.have.length(1);
            expect(h.getEdgesByType("blue")).to.have.length(0);

            h = g.getSubgraphFromNodes(A.compact([ g.getNode({ system: "foo", value: "not-existent" }) ]));
            expect(h.getNodes()).to.have.length(0);
            expect(h.getEdgesByType("blue")).to.have.length(0);
        });

    });

    describe("FHIR resource handling", () => {
        it("", () => {
            let n: O.Option<RefNode>;
            const g = new RefGraph();

            g.addEdge({ system: "A", value: "a" }, { system: "B", value: "b" }, "red");

            n = g.getNode({ system: "A", value: "a" });
            if (O.isSome(n)) {
                expect(O.isNone(n.value.fhir()));
            } else {
                assert.fail("node is none");
            }

            n = g.getNode({ system: "B", value: "b" });
            if (O.isSome(n)) {
                expect(O.isNone(n.value.fhir()));
            } else {
                assert.fail("node is none");
            }

            const a = new RefNode([{ system: "A", value: "a" }, { system: "A", value: "aaa" }]);
            a.setFhir({
                boxed: {
                    resourceType: "Encounter",
                    id: "enc/A:a",
                    identifier: [ /* */ ],
                    status: "planned",
                    class: {}
                },
                period: {
                    min: -Infinity,
                    max: +Infinity
                },
                type: []
            });

            g.addNode(a);


            n = g.getNode({ system: "A", value: "a" });
            if (O.isSome(n)) {
                const x = n.value.fhir();
                if (O.isSome(x)) {
                    expect(x.value.boxed.id).to.equal("enc/A:a");
                } else {
                    assert.fail("x is none");
                }
            } else {
                assert.fail("node is none");
            }

        });
    });

});
