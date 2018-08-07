/*
This class sets up the user interface and graphical design using GoJS library
*/
import "bootstrap/dist/css/bootstrap.min.css";
import './index.css';
import * as go from 'gojs';
import {
    expandNode,
    retractNode,
    toggleNode,
    isNodeExpanded,
    doesNodeHaveChildren,
    expandAllNodes,
    retractAllNodes,
} from "./functions";
import {
    fileService
} from "./fileService";
import {
    blockService
} from "./blockService";
import {
    linkService
} from "./linkService";

//Sets up actions for file input browsers, and buttons in html file to read in files and expand and retract all nodes
document.getElementById('JSONFileDiv').addEventListener('change', fileService.jsonRead, false);
document.getElementById('excelFileDiv').addEventListener('change', fileService.excelRead, false);
document.getElementById('expandButton').addEventListener('click', expandAllNodes, false);
document.getElementById('retractButton').addEventListener('click', retractAllNodes, false);

//Initialize GoJS Diagram
var $ = go.GraphObject.make;
var diagram = new go.Diagram("myDiagramDiv");
diagram.model = new go.GraphLinksModel();

//Add Callout Functionality to Building Blocks (nodes)
diagram.toolManager.hoverDelay = 200; //In MilliSeconds
diagram.toolManager.toolTipDuration = 300000; //In MilliSeconds
var commonToolTip =
    $(go.Adornment, "Auto", {
            background: "transparent",
            isShadowed: true
        },
        $(go.Shape, {
            fill: "#FFFFCC"
        }),
        $(go.Panel, "Vertical", {
                margin: 3
            },
            //Show Block CSECT
            $(go.TextBlock, //Bound to node data
                {
                    width: 500,
                    margin: 4,
                    font: "bold 12pt sans-serif",
                    text: "textAlign: 'center'"
                },
                new go.Binding("text", "csect", function(csect) {
                    return "CSECT: " + csect;
                })
            ),
            //Show Block Name
            $(go.TextBlock, //Bound to node data
                {
                    width: 500,
                    margin: 4,
                    font: "bold 12pt sans-serif",
                    text: "textAlign: 'left'"
                },
                new go.Binding("text", "name", function(name) {
                    return "Name: " + name + '\n';
                })
            ),
            //Show Built By Scenario
            $(go.TextBlock, //Bound to node data
                {
                    width: 500,
                    margin: 4,
                    font: "bold 12pt sans-serif",
                    text: "textAlign: 'left'"
                },
                new go.Binding("text", "builtByScenario", function(builtByScenario) {
                    return "Built by Scenario: " + builtByScenario;
                })
            ),
            //Show Used By Scenario
            $(go.TextBlock, //Bound to node data
                {
                    width: 500,
                    margin: 4,
                    font: "bold 12pt sans-serif",
                    text: "textAlign: 'left'"
                },
                new go.Binding("text", "usedByScenario", function(usedByScenario) {
                    return "Used by Scenario: " + usedByScenario + '\n';
                })
            ),
            //Show block Description
            $(go.TextBlock, //Bound to node data
                {
                    width: 500,
                    margin: 4,
                    font: "bold 12pt sans-serif",
                    text: "textAlign: 'center'"
                },
                new go.Binding("text", "description", function(description) {
                    return "Description: " + description + '\n';
                })
            ),
            //Show name of previous block
            $(go.TextBlock, //Bound to node data
                {
                    width: 500,
                    margin: 4,
                    font: "bold 12pt sans-serif",
                    text: "textAlign: 'center'"
                },
                new go.Binding("text", "prior", function(prior) {
                    if (prior === 0) {
                        return "Previous Block: Root";
                    } else {
                        return "Previous Block: " + blockService.getBlock(prior).name;
                    }
                })
            ),
            //Show utilities of current block
            $(go.TextBlock, //Bound to node data
                {
                    width: 500,
                    margin: 4,
                    font: "bold 12pt sans-serif",
                    text: "textAlign: 'center'"
                },
                new go.Binding("text", "utilities", function(utilities) {
                    var utils = "";
                    if (utilities.length > 0) {
                        utils = blockService.getBlock(utilities[0]).name;
                        var utilSlice = utilities.slice(1, utilities.length);
                        utilSlice.forEach(u => {
                            utils = utils + ", " + blockService.getBlock(u).name;
                        });
                    }
                    return "Utilities: " + utils;
                })
            ),
            //Show destination of current block
            $(go.TextBlock, //Bound to node data
                {
                    width: 500,
                    margin: 4,
                    font: "bold 12pt sans-serif",
                    text: "textAlign: 'center'"
                },
                new go.Binding("text", "destination", function(destination) {
                    if (destination !== "") {
                        return "Destination: " + blockService.getBlock(destination).name + '\n';
                    } else {
                        return "Destination: " + '\n';
                    }
                })
            ),
            //Show lines of code of current block
            $(go.TextBlock, //Bound to node data
                {
                    width: 500,
                    margin: 4,
                    font: "bold 12pt sans-serif",
                    text: "textAlign: 'center'"
                },
                new go.Binding("text", "lineRange", function(lineRange) {
                    return "Lines of Code: " + lineRange;
                })
            ),
        )
    );

//The Node template describes how each Node should be displayed
diagram.nodeTemplate =
    $(go.Node, "Auto", // the Shape automatically fits around the TextBlock
        {
            toolTip: commonToolTip
        },
        new go.Binding("location", "loc", go.Point.parse),
        $(go.Shape, "Procedure", // use this kind of figure for the Shape
            {
                width: 100,
                height: 100,
            },
            //Change color of building block based on type
            new go.Binding("fill", "builtByScenario", function(builtByScenario) {
                if (typeof builtByScenario !== "undefined") {
                    if (builtByScenario === "") {
                        return 'indianred';
                    } else if (builtByScenario === "Skip" || builtByScenario === "skip") {
                        return 'gray';
                    } else {
                        return 'lightgreen';
                    }
                } else {
                    return 'indianred';
                }
            })
        ),
        $(go.Panel, "Vertical",
            //Display Key for Testing purposes
            // $(go.TextBlock, {
            //         margin: 3
            //     }, // some room around the text
            //     new go.Binding("text", "key", (key) => "key:" + key)
            // ),
            $(go.TextBlock, {
                    margin: 3,
                    font: "9pt sans-serif",
                    width: 80,
                    wrap: go.TextBlock.WrapFit
                }, // some room around the text
                new go.Binding("text", "csect", function(csect) {
                    return csect;
                }),
            ),
            $(go.TextBlock, {
                    margin: 3,
                    font: "bold 10pt sans-serif",
                    width: 80,
                    wrap: go.TextBlock.WrapFit
                }, // some room around the text
                new go.Binding("text", "name")
            ),
            //Display Parent for Testing purposes
            // $(go.TextBlock,
            // 	{ margin: 3 },  // some room around the text
            // 	// bind TextBlock.text to Node.data.key
            // 	new go.Binding("text", "parent", (parent) => "parent:"+parent)
            // ),
        ),
        $("Button", {
                margin: 2,
                click: toggleNode,
                alignment: go.Spot.Bottom,
            },
            new go.Binding("visible", "key", function(key) {
                return doesNodeHaveChildren(key);
            }),
            $(go.TextBlock,
                new go.Binding("text", "key", function(key) {
                    if (isNodeExpanded(key)) {
                        return "–";
                    } else {
                        return "+";
                    }
                }),
            )
        )
    );

//The Link Template describes how each Link should be displayed
diagram.linkTemplate =
    $(go.Link, {
            routing: go.Link.AvoidsNodes
        },
        $(go.Shape, //Link
            {
                fill: "black"
            }
        ),
        $(go.Shape, //First Arrow
            {
                toArrow: "Standard",
                fill: "black",
                stroke: "black"
            }
        ),
        $(go.Shape, //Second Arrow
            {
                fromArrow: "Backward",
                fill: "black",
                stroke: "black"
            },
            //Add backward arrow if utility link
            new go.Binding("fromArrow", "type", function(type) {
                if (type === "utility") {
                    return "Backward";
                } else {
                    return "line";
                }
            })
        ),
        $(go.TextBlock, {
                segmentIndex: -1,
                segmentFraction: 0.5,
                segmentOffset: new go.Point(-15, -15)
            },
            new go.Binding("text", "linkNumber"),
        )
    );

//Adds a Legend to the Bottom Left Corner of the diagram
diagram.add(
    $(go.Part, go.Panel.Position, {
            padding: 10,
            layerName: "Grid",
            _viewPosition: new go.Point(0, 315)
        },
        $(go.TextBlock, "Legend - Hover Over Block for More Details", {
            font: "bold 14pt sans-serif",
            stroke: "black"
        }),
        $(go.Shape, "Procedure", {
            position: new go.Point(0, 35),
            fill: "lightgreen",
            stroke: "black",
            desiredSize: new go.Size(20, 20)
        }),
        $(go.TextBlock, "Covered by a Scenario", {
            position: new go.Point(35, 39),
            font: "bold 8pt sans-serif",
            stroke: "black"
        }),
        $(go.Shape, "Procedure", {
            position: new go.Point(0, 65),
            fill: "indianred",
            stroke: "black",
            desiredSize: new go.Size(20, 20)
        }),
        $(go.TextBlock, "Not Yet Assigned to a Scenario", {
            position: new go.Point(35, 69),
            font: "bold 8pt sans-serif",
            stroke: "black"
        }),
        $(go.Shape, "Procedure", {
            position: new go.Point(0, 95),
            fill: "gray",
            stroke: "black",
            desiredSize: new go.Size(20, 20)
        }),
        $(go.TextBlock, "Skipped (by all Scenarios)", {
            position: new go.Point(35, 99),
            font: "bold 8pt sans-serif",
            stroke: "black"
        }),
        $(go.Shape, "LineH", {
            position: new go.Point(-2, 125),
            fill: "white",
            stroke: "black",
            desiredSize: new go.Size(20, 20)
        }),
        $(go.Shape, "TriangleRight", {
            position: new go.Point(16, 132),
            fill: "gray",
            stroke: "black",
            desiredSize: new go.Size(6, 6)
        }),
        $(go.Shape, "TriangleLeft", {
            position: new go.Point(-2, 132),
            fill: "gray",
            stroke: "black",
            desiredSize: new go.Size(6, 6)
        }),
        $(go.TextBlock, "Utility Link", {
            position: new go.Point(35, 129),
            font: "bold 8pt sans-serif",
            stroke: "black"
        }),
        $(go.Shape, "LineH", {
            position: new go.Point(8, 153),
            fill: "gray",
            stroke: "black",
            desiredSize: new go.Size(4, 4)
        }),
        $(go.Shape, "LineV", {
            position: new go.Point(0, 155),
            fill: "gray",
            stroke: "black",
            desiredSize: new go.Size(20, 20)
        }),
        $(go.TextBlock, "#", {
            position: new go.Point(8, 125),
            font: "bold 8pt sans-serif",
            stroke: "black",
        }),
        $(go.Shape, "TriangleDown", {
            position: new go.Point(7, 170),
            fill: "gray",
            stroke: "black",
            desiredSize: new go.Size(6, 6)
        }),
        $(go.TextBlock, "#", {
            position: new go.Point(13, 157),
            font: "bold 8pt sans-serif",
            stroke: "black",
        }),
        $(go.TextBlock, "Destination Link", {
            position: new go.Point(35, 159),
            font: "bold 8pt sans-serif",
            stroke: "black"
        }),
        $(go.Shape, "Rectangle", {
            position: new go.Point(2, 189),
            fill: "lightgray",
            stroke: "black",
            desiredSize: new go.Size(16, 16)
        }),
        $(go.Shape, "PlusLine", {
            position: new go.Point(5, 192),
            fill: "lightgray",
            stroke: "black",
            desiredSize: new go.Size(10, 10)
        }),
        $(go.TextBlock, "Click to Expand", {
            position: new go.Point(35, 195),
            font: "bold 8pt sans-serif",
            stroke: "black"
        }),
        $(go.Shape, "Rectangle", {
            position: new go.Point(2, 219),
            fill: "lightgray",
            stroke: "black",
            desiredSize: new go.Size(16, 16)
        }),
        $(go.Shape, "LineH", {
            position: new go.Point(5, 222),
            fill: "lightgray",
            stroke: "black",
            desiredSize: new go.Size(10, 10)
        }),
        $(go.TextBlock, "Click to Retract", {
            position: new go.Point(35, 225),
            font: "bold 8pt sans-serif",
            stroke: "black"
        })
    ));

//Fixes the Legend's position while scrolling
diagram.addDiagramListener("ViewportBoundsChanged", function(e) {
    var dia = e.diagram;
    dia.startTransaction("fix Parts");
    dia.parts.each(function(part) {
        if (part._viewPosition) {
            part.position = dia.transformViewToDoc(part._viewPosition);
            part.scale = 1 / dia.scale;
        }
    });
    dia.commitTransaction("fix Parts");
});

//Sets Initial Content Location to the Center
diagram.initialContentAlignment = go.Spot.Center;
//Enables Ctrl-Z to undo and Ctrl-Y to redo
diagram.undoManager.isEnabled = true;
//Disable Animations
diagram.animationManager.isEnabled = false;

//Renders the entire Diagram - Note that this function is called whenever a node is expanded or retracted
export function renderDiagram(x, y) {
    diagram.model = new go.GraphLinksModel(blockService.getVisibleBlocks(), linkService.getVisibleLinks());
    if(typeof x !== "undefined" && typeof y !== "undefined") {
        setTimeout(() => {
            const muhRect = new go.Rect(x, y, 1, 1);
            diagram.scrollToRect(muhRect);
        }, 50);
    }
}
