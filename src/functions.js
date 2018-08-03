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
            var divChild = document.getElementById("myDiagramDiv").children[1];
            scrollBarYPosition = divChild.scrollTop;
            console.log(scrollBarYPosition);
            expandNode(key);
            scrollToBlock(scrollBarYPosition);
        }
    }
}

//Uses jQuery to save and reset the Vertical Scroll Position
function scrollToBlock(y) {
    console.log("In functions.js scrollToBlock(y) setting ScrollTop to: "+y);
    document.getElementById("myDiagramDiv").children[1].scrollTop = y;
    console.log("After setting scrolltop "+document.getElementById("myDiagramDiv").children[1].scrollTop);
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
        render(0,blockService.getBlock(key).y*150);
    }
}

//Retracts node by removing visible nodes and links connected to selected node
export function retractNode(key) {
    blockService.removeVisibleBlocks(key);
    linkService.removeVisibleLinks(key);
    blockService.calcLocation(150, 0, 0);
    render(0,blockService.getBlock(key).y*150);
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
