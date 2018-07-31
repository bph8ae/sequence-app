import * as go from 'gojs';
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

/*
This class contains export functions with ability to manipulate nodes using + and - buttons
*/

//Expands node if not expanded yet and retracts node and already expanded
export function toggleNode(e, obj) {
    if (typeof obj.part.data !== "undefined") {
        const {
            key
        } = obj.part.data;
        if (isNodeExpanded(key)) {
            retractNode(key);
            // scrollToBlock(key);
        } else {
            expandNode(key);
            // scrollToBlock(key);
        }
    }
}

//Uses GoJS to scroll to y location of expanded or retracted block
// function scrollToBlock(key) {
// 	var blockY = blockService.getBlock(key).y * 150;
// 	go.Diagram.scroll('pixel','down',blockY);
// }

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
