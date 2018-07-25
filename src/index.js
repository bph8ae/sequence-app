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


diagram.add(
	$(go.Part, {
			layerName: "Grid", // must be in a Layer that is Layer.isTemporary,
			// to avoid being recorded by the UndoManager
			_viewPosition: new go.Point(1000, 0) // some position in the viewport,
			// not in document coordinates
		},
		$(go.TextBlock, "Legend", {
			font: "bold 20pt sans-serif",
			stroke: "black"
		})));

// Whenever the Diagram.position or Diagram.scale change,
// update the position of all simple Parts that have a _viewPosition property.
diagram.addDiagramListener("ViewportBoundsChanged", function(e) {
	var dia = e.diagram;
	dia.startTransaction("fix Parts");
	// only iterates through simple Parts in the diagram, not Nodes or Links
	dia.parts.each(function(part) {
		// and only on those that have the "_viewPosition" property set to a Point
		if (part._viewPosition) {
			part.position = dia.transformViewToDoc(part._viewPosition);
			part.scale = 1 / dia.scale;
		}
	});
	dia.commitTransaction("fix Parts");
});

diagram.add(
	$(go.Part, {
			layerName: "Grid", // must be in a Layer that is Layer.isTemporary,
			// to avoid being recorded by the UndoManager
			_viewPosition: new go.Point(1000, 50) // some position in the viewport,
			// not in document coordinates
		},
		$(go.TextBlock, "Hover Over Blocks for Callouts", {
			font: "bold 12pt sans-serif",
			stroke: "black"
		})));

// Whenever the Diagram.position or Diagram.scale change,
// update the position of all simple Parts that have a _viewPosition property.
diagram.addDiagramListener("ViewportBoundsChanged", function(e) {
	var dia = e.diagram;
	dia.startTransaction("fix Parts");
	// only iterates through simple Parts in the diagram, not Nodes or Links
	dia.parts.each(function(part) {
		// and only on those that have the "_viewPosition" property set to a Point
		if (part._viewPosition) {
			part.position = dia.transformViewToDoc(part._viewPosition);
			part.scale = 1 / dia.scale;
		}
	});
	dia.commitTransaction("fix Parts");
});

diagram.add(
	$(go.Part, {
			layerName: "Grid", // must be in a Layer that is Layer.isTemporary,
			// to avoid being recorded by the UndoManager
			_viewPosition: new go.Point(1000, 75) // some position in the viewport,
			// not in document coordinates
		},
		$(go.TextBlock, "Single Arrow- Destination Link", {
			font: "bold 12pt sans-serif",
			stroke: "black"
		})));

// Whenever the Diagram.position or Diagram.scale change,
// update the position of all simple Parts that have a _viewPosition property.
diagram.addDiagramListener("ViewportBoundsChanged", function(e) {
	var dia = e.diagram;
	dia.startTransaction("fix Parts");
	// only iterates through simple Parts in the diagram, not Nodes or Links
	dia.parts.each(function(part) {
		// and only on those that have the "_viewPosition" property set to a Point
		if (part._viewPosition) {
			part.position = dia.transformViewToDoc(part._viewPosition);
			part.scale = 1 / dia.scale;
		}
	});
	dia.commitTransaction("fix Parts");
});

diagram.add(
	$(go.Part, {
			layerName: "Grid", // must be in a Layer that is Layer.isTemporary,
			// to avoid being recorded by the UndoManager
			_viewPosition: new go.Point(1000, 100) // some position in the viewport,
			// not in document coordinates
		},
		$(go.TextBlock, "Double Arrow- Utility Link", {
			font: "bold 12pt sans-serif",
			stroke: "black"
		})));

// Whenever the Diagram.position or Diagram.scale change,
// update the position of all simple Parts that have a _viewPosition property.
diagram.addDiagramListener("ViewportBoundsChanged", function(e) {
	var dia = e.diagram;
	dia.startTransaction("fix Parts");
	// only iterates through simple Parts in the diagram, not Nodes or Links
	dia.parts.each(function(part) {
		// and only on those that have the "_viewPosition" property set to a Point
		if (part._viewPosition) {
			part.position = dia.transformViewToDoc(part._viewPosition);
			part.scale = 1 / dia.scale;
		}
	});
	dia.commitTransaction("fix Parts");
});

diagram.add(
	$(go.Part, {
			layerName: "Grid", // must be in a Layer that is Layer.isTemporary,
			// to avoid being recorded by the UndoManager
			_viewPosition: new go.Point(1000, 125) // some position in the viewport,
			// not in document coordinates
		},
		$(go.TextBlock, "Blue Blocks- Utility", {
			font: "bold 12pt sans-serif",
			stroke: "#cce6ff"
		})));

// Whenever the Diagram.position or Diagram.scale change,
// update the position of all simple Parts that have a _viewPosition property.
diagram.addDiagramListener("ViewportBoundsChanged", function(e) {
	var dia = e.diagram;
	dia.startTransaction("fix Parts");
	// only iterates through simple Parts in the diagram, not Nodes or Links
	dia.parts.each(function(part) {
		// and only on those that have the "_viewPosition" property set to a Point
		if (part._viewPosition) {
			part.position = dia.transformViewToDoc(part._viewPosition);
			part.scale = 1 / dia.scale;
		}
	});
	dia.commitTransaction("fix Parts");
});


diagram.add(
	$(go.Part, {
			layerName: "Grid", // must be in a Layer that is Layer.isTemporary,
			// to avoid being recorded by the UndoManager
			_viewPosition: new go.Point(1000, 150) // some position in the viewport,
			// not in document coordinates
		},
		$(go.TextBlock, "Green Blocks- Destination", {
			font: "bold 12pt sans-serif",
			stroke: "lightgreen"
		})));

// Whenever the Diagram.position or Diagram.scale change,
// update the position of all simple Parts that have a _viewPosition property.
diagram.addDiagramListener("ViewportBoundsChanged", function(e) {
	var dia = e.diagram;
	dia.startTransaction("fix Parts");
	// only iterates through simple Parts in the diagram, not Nodes or Links
	dia.parts.each(function(part) {
		// and only on those that have the "_viewPosition" property set to a Point
		if (part._viewPosition) {
			part.position = dia.transformViewToDoc(part._viewPosition);
			part.scale = 1 / dia.scale;
		}
	});
	dia.commitTransaction("fix Parts");
});


diagram.add(
	$(go.Part, {
			layerName: "Grid", // must be in a Layer that is Layer.isTemporary,
			// to avoid being recorded by the UndoManager
			_viewPosition: new go.Point(1000, 175) // some position in the viewport,
			// not in document coordinates
		},
		$(go.TextBlock, "Click on 'Add Note' to edit text", {
			font: "bold 12pt sans-serif",
			stroke: "black"
		})));

// Whenever the Diagram.position or Diagram.scale change,
// update the position of all simple Parts that have a _viewPosition property.
diagram.addDiagramListener("ViewportBoundsChanged", function(e) {
	var dia = e.diagram;
	dia.startTransaction("fix Parts");
	// only iterates through simple Parts in the diagram, not Nodes or Links
	dia.parts.each(function(part) {
		// and only on those that have the "_viewPosition" property set to a Point
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
