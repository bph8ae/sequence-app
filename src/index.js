import * as go from 'gojs';

import './index.css';
import { expandNode, retractNode, toggleNode, isNodeExpanded, doesNodeHaveChildren } from "./functions";
import { fileService } from "./fileService";
import { blockService } from "./blockService";
import { linkService } from "./linkService";

document.getElementById('fileDiv').addEventListener('change', fileService.handleFileSelect, false);

var $ = go.GraphObject.make;

var diagram = new go.Diagram("myDiagramDiv");
	diagram.model = new go.GraphLinksModel(
	);

	diagram.toolManager.hoverDelay = 200; //In MilliSeconds
  diagram.toolManager.toolTipDuration = 300000; //In MilliSeconds
	var commonToolTip =
    $(go.Adornment, "Auto",
        { background: "transparent",
            isShadowed: true },
        $(go.Shape, { fill: "#FFFFCC" }),
        $(go.Panel, "Vertical",
            { margin: 3 },
            $(go.TextBlock,  //Bound to node data
                {
                    width: 500,
                    margin: 4,
                    font: "bold 12pt sans-serif",
                    text: "textAlign: 'center'"
                },
                new go.Binding("text", "csect", function(csect) { return "CSECT: " + csect; })
							),
							$(go.TextBlock,  //Bound to node data
	                {
	                    width: 500,
	                    margin: 4,
	                    font: "bold 12pt sans-serif",
	                    text: "textAlign: 'left'"
	                },
									new go.Binding("text", "name", function(name) { return "Name: " + name + '\n'; })
								),
							$(go.TextBlock,  //Bound to node data
									{
											width: 500,
											margin: 4,
											font: "bold 12pt sans-serif",
											// text: "textAlign: 'center'"
											text: "Description: This is a block \n"
									},
										// new go.Binding("text", "description", function(description) { return "Description: Please work :)" + '\n'; })
									),
							$(go.TextBlock,  //Bound to node data
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
												return "Previous Block: "+blockService.getBlock(prior).name;
											}
										 	})
									),
							$(go.TextBlock,  //Bound to node data
									{
										 width: 500,
										 margin: 4,
										 font: "bold 12pt sans-serif",
										 text: "textAlign: 'center'"
									},
											new go.Binding("text", "utilities", function(utilities) {
												var utils = blockService.getBlock(utilities[0]).name;
												var utilSlice = utilities.slice(1,utilities.length);
												utilSlice.forEach(u => {
												utils = utils + ", " + blockService.getBlock(u).name;
												})
												return "Utilities: " + utils;
											})
									),
							$(go.TextBlock,  //Bound to node data
									{
										 width: 500,
										 margin: 4,
										 font: "bold 12pt sans-serif",
										 text: "textAlign: 'center'"
									},
											new go.Binding("text", "destination", function(destination) { return "Destination: " +
												blockService.getBlock(destination).name + '\n'; })
									),
							$(go.TextBlock,  //Bound to node data
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
	$(go.Node, "Auto",  // the Shape automatically fits around the TextBlock
		{
			toolTip: commonToolTip
		},
		new go.Binding("location", "loc", go.Point.parse),
		$(go.Shape, "Square",  // use this kind of figure for the Shape
		// bind Shape.fill to Node.data.color
			{
				fill: "gold",
				width: 100,
				height: 100}
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
		{ routing: go.Link.AvoidsNodes},
		$(go.Shape, //Link
			{fill: "black"}
		),
		$(go.Shape, //First Arrow
			{ toArrow: "Standard", fill: "black", stroke:"black" }
		),
		$(go.Shape, //Second Arrow
			{ fromArrow: "Backward", fill: "black", stroke:"black" },
			new go.Binding("fromArrow", "type", function(type) {
				if (type === "utility") {
					return "Backward";
				}
				else {
					return "line";
				}
			})
		)
	);

// the Model holds only the essential information describing the diagram

diagram.initialContentAlignment = go.Spot.Center;
// enable Ctrl-Z to undo and Ctrl-Y to redo
diagram.undoManager.isEnabled = true;
diagram.animationManager.isEnabled = false;

// document.getElementById('renderButton').addEventListener('click', function() {
// 	console.log('in init');
// 	console.log(fileService.data);
// 	if (fileService.data !== null) {
// 		console.log('in funct');
// 		blockService.setBlocks();
// 		renderDiagram();
// 		console.log('post render');
// 	}
// });

export function renderDiagram() {
	console.log("\n====================REDRAWING DIAGRAM====================\n\n")
	diagram.model = new go.GraphLinksModel(blockService.getVisibleBlocks(),linkService.getVisibleLinks());
}
