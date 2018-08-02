/*
This class contains export functions with ability to manipulate nodes using + and - buttons
*/

import * as go from 'gojs';
import * as $ from 'jquery';
import {
    blockService
} from "./blockService";
import {
    linkService
} from "./linkService";
import {
    fileService
} from "./fileService";
import {
    renderDiagram as render
} from "./index";

var scrollBarYPosition = 0;


//Expands node if not expanded yet and retracts node and already expanded
export function toggleNode(e, obj) {
    if (typeof obj.part.data !== "undefined") {
        const {
            key
        } = obj.part.data;
        if (isNodeExpanded(key)) {
            retractNode(key);
        } else {
            var d = $("#myDiagramDiv").scrollTop();
            console.log(d);
            console.log(document.getElementById("myDiagramDiv"));
            console.log("Offset Top: "+document.getElementById("myDiagramDiv").offsetTop);
            console.log("Scroll Top: "+document.getElementById("myDiagramDiv").scrollTop);
            console.log("Scroll Y: "+document.getElementById("myDiagramDiv").scrollY);

            expandNode(key);
            //scrollToBlock(scrollBarYPosition);
        }
    }
}

//Uses jQuery to save and reset the Vertical Scroll Position
function scrollToBlock(y) {
 	document.getElementById("myDiagramDiv").scrollTop = y;
    $('#myDiagramDiv').scrollTop(y);
    //document.getElementById("myDiagramDiv").scrollTop(y);
}

//Checks if node is expanded based on visible children and returns true if expanded
export function isNodeExpanded(key) {
    return (blockService.hasVisibleChildren(key) || linkService.hasVisibleUtilities(key));
}

//Returns true if building block has any children
export function doesNodeHaveChildren(key) {
    return (blockService.hasChildren(key) || linkService.hasUtilities(key));
}

//Expands node by adding visible blocks and links and recalculating locations
export function expandNode(key) {
    if (doesNodeHaveChildren(key)) {
        blockService.addVisibleBlocks(key);
        linkService.addVisibleLinks(key);
        blockService.calcLocation(150, 0, 0);
        render();
    }
}

//Retracts node by removing visible nodes and links connected to selected node
export function retractNode(key) {
    blockService.removeVisibleBlocks(key);
    linkService.removeVisibleLinks(key);
    blockService.calcLocation(150, 0, 0);
    render();
}

//Expands all blocks by setting visibleBlocks and visibleLinks to Blocks and Links
export function expandAllNodes() {
    blockService.expandAllBlocks();
    linkService.expandAllLinks();
    blockService.calcLocation(150, 0, 0);
    render();
}

//Retracts all blocks by filtering visibleBlocks and visibleLinks to only display the backbone
export function retractAllNodes() {
    blockService.retractAllBlocks();
    linkService.retractAllLinks();
    blockService.calcLocation(150, 0, 0);
    render();
}
