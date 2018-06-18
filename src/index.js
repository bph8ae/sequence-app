import * as go from 'gojs';

import './index.css';
import { expandNode, retractNode, toggleNode, isNodeExpanded, doesNodeHaveChildren } from "./functions";
import { blockService } from "./blockService";
import { linkService } from "./linkService";
import { fileService } from "./fileService";

document.getElementById('fileDiv').addEventListener('change', fileService.handleFileSelect, false);

var $ = go.GraphObject.make;

var diagram = new go.Diagram("myDiagramDiv");
	diagram.model = new go.GraphLinksModel(
	);

// Node template describes how each Node should be constructed
diagram.nodeTemplate =
	$(go.Node, "Auto",  // the Shape automatically fits around the TextBlock
		new go.Binding("location", "loc", go.Point.parse),
		$(go.Shape, "Square",  // use this kind of figure for the Shape
		// bind Shape.fill to Node.data.color
			{
				fill: "gold",
				width: 100,
				height: 100 }
			//new go.Binding("fill", "color")
		),
		$(go.Panel, "Vertical",
			$(go.TextBlock,
				{ margin: 3 },  // some room around the text
				// bind TextBlock.text to Node.data.key
				new go.Binding("text", "key", (key) => "key:"+key)
			),
			$(go.TextBlock,
				{
					margin: 3,
					font: "bold 12pt sans-serif"
				},  // some room around the text
				// bind TextBlock.text to Node.data.key
				new go.Binding("text", "name")
			),
			$(go.TextBlock,
				{ margin: 3 },  // some room around the text
				// bind TextBlock.text to Node.data.key
				new go.Binding("text", "parent", (parent) => "parent:"+parent)
			),
			//Feature - Remove Button if no children
		),
		$("Button",
			{ 	margin: 2,
				click: toggleNode,
				alignment:go.Spot.Bottom,
				visible:true },
			$(go.TextBlock,
				new go.Binding("text", "key", function(key) {
					if(doesNodeHaveChildren(key)) {
						if (isNodeExpanded(key)) {
							return "–";
						}
						else {
							return "+";
						}
					}
					return "";
				}
				),
			)
		)
	);

// Link Template describes how each Link should be constructed
diagram.linkTemplate =
	$(go.Link,
		{ routing: go.Link.Orthogonal},
		$(go.Shape, //Link
			{fill: "black"}
		),
		$(go.Shape, //First Arrow
			{ toArrow: "Standard", fill: "black" }
		),
		$(go.Shape, //Second Arrow
			{ fromArrow: "Backward", fill: "white", stroke:"white", scale: 2 },
			new go.Binding("fill", "type", function(type) {
				if (type === "utility") {
					console.log("Backwards Arrow Needed");
					return "black";
				}
				else {
					console.log("No Arrow Needed");
					return "white";
				}
			})
		)
	);

// the Model holds only the essential information describing the diagram

diagram.initialContentAlignment = go.Spot.Center;
// enable Ctrl-Z to undo and Ctrl-Y to redo
diagram.undoManager.isEnabled = true;
diagram.animationManager.isEnabled = false;
renderDiagram();

export function renderDiagram() {
	console.log("\n====================REDRAWING DIAGRAM====================\n\n")
	diagram.model = new go.GraphLinksModel(blockService.getVisibleBlocks(),linkService.getVisibleLinks());
}
