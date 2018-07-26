import * as go from 'gojs';

import './index.css';
import {
	expandNode,
	retractNode,
	toggleNode,
	isNodeExpanded,
	doesNodeHaveChildren,
	expandAllNodes,
	retractAllNodes
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

/*
This class sets up the user interface and graphical design using GoJS library
*/

document.getElementById('JSONfileDiv').addEventListener('change', fileService.handleFileSelect, false);
document.getElementById('ExcelfileDiv').addEventListener('change', fileService.excelRead, false);
document.getElementById('expandButton').addEventListener('click', expandAllNodes, false);
document.getElementById('retractButton').addEventListener('click', retractAllNodes, false);
var $ = go.GraphObject.make;

var diagram = new go.Diagram("myDiagramDiv");
diagram.model = new go.GraphLinksModel();

//Add hover callout functionality
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
			//Show csect of block
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
			//Show name of block
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
			//Show block Description
			//NOTE: CURRENTLY HARD CODED IN
			$(go.TextBlock, //Bound to node data
				{
					width: 500,
					margin: 4,
					font: "bold 12pt sans-serif",
					// text: "textAlign: 'center'"
					text: "Description: This is a block \n"
				},
				// new go.Binding("text", "description", function(description) { return "Description: Please work :)" + '\n'; })
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
					var utils = blockService.getBlock(utilities[0]).name;
					var utilSlice = utilities.slice(1, utilities.length);
					utilSlice.forEach(u => {
						utils = utils + ", " + blockService.getBlock(u).name;
					})
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
					return "Destination: " +
						blockService.getBlock(destination).name + '\n';
				})
			),
			//Show lines of code of current block
			//NOTE: HARD CODED IN
			$(go.TextBlock, //Bound to node data
				{
					width: 500,
					margin: 4,
					font: "bold 12pt sans-serif",
					// text: "textAlign: 'center'"
					text: "Lines of Code: blah blah"
				},
				// 		new go.Binding("text", "linesOfCode", function(linesOfCode) { return "Lines of Code: " + linesOfCode; })
			),
		)
	);

// Node template describes how each Node should be constructed
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
				// fill: "lightgreen"
			},
			new go.Binding("fill", "nodeType", function(nodeType) {
				if (nodeType === 'Utility') {
					return '#cce6ff';
				} else {
					return 'lightgreen';
				}
			})
		),
		$(go.Panel, "Vertical",
			$(go.TextBlock, {
					margin: 3
				}, // some room around the text
				// bind TextBlock.text to Node.data.key
				new go.Binding("text", "key", (key) => "key:" + key)
			),
			$(go.TextBlock, {
					margin: 3,
					font: "bold 10pt sans-serif",
					width: 80,
					wrap: go.TextBlock.WrapFit
				}, // some room around the text
				// bind TextBlock.text to Node.data.key
				new go.Binding("text", "name")
			),
			// $(go.TextBlock,
			// 	{ margin: 3 },  // some room around the text
			// 	// bind TextBlock.text to Node.data.key
			// 	new go.Binding("text", "parent", (parent) => "parent:"+parent)
			// ),
			$(go.TextBlock, {
				margin: 4,
				editable: true,
				text: "Add Note: "
			}),
			//Feature - Remove Button if no children
		),
		$("Button", {
				margin: 2,
				click: toggleNode,
				alignment: go.Spot.Bottom,
				visible: true
			},
			$(go.TextBlock,
				new go.Binding("text", "key", function(key) {
					if (doesNodeHaveChildren(key)) {
						if (isNodeExpanded(key)) {
							return "–";
						} else {
							return "+";
						}
					}
					return "";
				}),
			)
		)
	);

// Link Template describes how each Link should be constructed
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
			new go.Binding("fromArrow", "type", function(type) {
				if (type === "utility") {
					return "Backward";
				} else {
					return "line";
				}
			})
		)
	);

//Legend
diagram.add(
	$(go.Part, go.Panel.Position, {
			padding: 10,
			layerName: "Grid",
			_viewPosition: new go.Point(0, 315)
		},
		$(go.TextBlock, "Legend", {
			font: "bold 14pt sans-serif",
			stroke: "black"
		}),
		$(go.Shape, "Rectangle", {
			position: new go.Point(0, 35),
			fill: "#FFFFCC",
			stroke: "black",
			desiredSize: new go.Size(20, 20)
		}),
		$(go.TextBlock, "Hover Over Blocks for Callout", {
			position: new go.Point(35, 39),
			font: "bold 8pt sans-serif",
			stroke: "black"
		}),
		$(go.Shape, "Procedure", {
			position: new go.Point(0, 65),
			fill: "lightgreen",
			stroke: "black",
			desiredSize: new go.Size(20, 20)
		}),
		$(go.TextBlock, "Destination Block", {
			position: new go.Point(35, 69),
			font: "bold 8pt sans-serif",
			stroke: "black"
		}),
		$(go.Shape, "Procedure", {
			position: new go.Point(0, 95),
			fill: "#cce6ff",
			stroke: "black",
			desiredSize: new go.Size(20, 20)
		}),
		$(go.TextBlock, "Utility Block", {
			position: new go.Point(35, 99),
			font: "bold 8pt sans-serif",
			stroke: "black"
		}),
		$(go.Shape, "LineH", {
			position: new go.Point(0, 125),
			fill: "white",
			stroke: "black",
			desiredSize: new go.Size(20, 20)
		}),
		$(go.Shape, "TriangleRight", {
			position: new go.Point(18, 132),
			fill: "gray",
			stroke: "black",
			desiredSize: new go.Size(6, 6)
		}),
		$(go.Shape, "TriangleLeft", {
			position: new go.Point(0, 132),
			fill: "gray",
			stroke: "black",
			desiredSize: new go.Size(6, 6)
		}),
		$(go.TextBlock, "Utility Link", {
			position: new go.Point(35, 129),
			font: "bold 8pt sans-serif",
			stroke: "black"
		}),
		$(go.Shape, "LineV", {
			position: new go.Point(2, 155),
			fill: "gray",
			stroke: "black",
			desiredSize: new go.Size(20, 20)
		}),
		$(go.Shape, "TriangleDown", {
			position: new go.Point(9, 170),
			fill: "gray",
			stroke: "black",
			desiredSize: new go.Size(6, 6)
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
			desiredSize: new go.Size(20, 20)
		}),
		$(go.Shape, "PlusLine", {
			position: new go.Point(7, 193),
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
			desiredSize: new go.Size(20, 20)
		}),
		$(go.Shape, "LineH", {
			position: new go.Point(7, 223),
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



// the Model holds only the essential information describing the diagram

diagram.initialContentAlignment = go.Spot.Center;
// enable Ctrl-Z to undo and Ctrl-Y to redo
diagram.undoManager.isEnabled = true;
diagram.animationManager.isEnabled = false;

export function renderDiagram() {
	console.log("\n====================REDRAWING DIAGRAM====================\n\n")
	diagram.model = new go.GraphLinksModel(blockService.getVisibleBlocks(), linkService.getVisibleLinks());
}
