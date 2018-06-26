import { blockService } from "./blockService";
import { linkService } from "./linkService";
import { fileService } from "./fileService";
import { renderDiagram as render } from "./index";

export function toggleNode(e, obj) {
    if (typeof obj.part.data !== "undefined") {
        const { key } = obj.part.data;
        if (isNodeExpanded(key)) {
            retractNode(key);
        }
        else {
            expandNode(key);
        }
    }
}

export function isNodeExpanded(key) {
    return (blockService.hasVisibleChildren(key) || linkService.hasVisibleChildren(key));
}

export function doesNodeHaveChildren(key) {
    return (blockService.hasChildren(key) || linkService.hasChildren(key));
}

export function expandNode(key) {
    if (doesNodeHaveChildren(key)) {
        blockService.addVisibleBlocks(key);
        linkService.addVisibleLinks(key);
        blockService.calcLocation(150,0,0);
        render();
    }
}

export function retractNode(key) {
    blockService.removeVisibleBlocks(key);
    linkService.removeVisibleLinks(key);
    render();
}
