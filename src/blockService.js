/*
This class adds functionality to building block objects. It includes methods for
creating building block objects, setting their location automatically, and
returning pertinent data about the blocks and the block object itself
*/

import {
    linkService
} from "./linkService";
import {
    fileService
} from "./fileService";
import {
    functions
} from "./block.js";
import "./functions.js";



//Block Data Functionality
class BlockService {

	//Creates the BlockService
    constructor() {
        this.blocks;
        this.visibleBlocks;
    }

    //Parses data from input JSON file into building block objects
    setBlocks(data) {
        // preserve newlines, etc - use valid JSON
        data = data.replace(/\\n/g, "\\n")
            .replace(/\\'/g, "\\'")
            .replace(/\\"/g, '\\"')
            .replace(/\\&/g, "\\&")
            .replace(/\\r/g, "\\r")
            .replace(/\\t/g, "\\t")
            .replace(/\\b/g, "\\b")
            .replace(/\\f/g, "\\f");
        // remove non-printable and other non-valid JSON chars
        data = data.replace(/[\u0000-\u0019]+/g, "");
        try {
            this.blocks = JSON.parse(data);
            this.retractAllBlocks();
        } catch (error) {
            alert('Improperly formatted JSON. Please select a different file.');
        }
    }

    setBlockMetaData(blockDescriptions) {
        this.blocks.forEach(b => {
            var matchingBlock = blockDescriptions.find(m => m.csect === b.csect && m.name === b.name);
            if (matchingBlock !== null && matchingBlock !== "" && typeof(matchingBlock) !== "undefined") {
                b.description = matchingBlock.description;
                b.lineRange = matchingBlock.lineRange;
                b.builtByScenario = matchingBlock.builtByScenario;
                b.usedByScenario = matchingBlock.usedByScenario;
                b.buildingBlockGroup = matchingBlock.buildingBlockGroup;
                b.buildingBlockType = matchingBlock.buildingBlockType;
                b.totalLines = matchingBlock.totalLines;
                b.codeLines = matchingBlock.codeLines;
                b.commentLines = matchingBlock.commentLines;
            }
        })
    }

    //Set this.visibleBlocks = this.blocks in order to display all Blocks
    //NOTE: Need to resolve this function as it breaks the program
    expandAllBlocks() {
        this.visibleBlocks = this.blocks;
    }

    //Reset this.visibleBlocks to display only the Backbone Blocks
    retractAllBlocks() {
        this.visibleBlocks = this.blocks.filter(b => b.parent === 0);
    }

    //Calculates the location of each visible block in pixel space
    calcLocation(distance, x, y) {
        var maxArr = [];
        //loop through all visible blocks
        this.visibleBlocks.forEach(b => {
            x = this.calculateHorizontalDepth(b.key);
            this.getBlock(b.key).x = x;
        });
        //Root Key = 1, Root Y Layer = 0, 1st Link Label is 1
        this.setVisibleVerticalDepths(1, 0, 1);
        //Compute actual distance based on x,y coordinates
        this.visibleBlocks.forEach(b => {
            x = this.getBlock(b.key).x;
            y = this.getBlock(b.key).y;
            x = distance * x;
            y = distance * y;
            this.getBlock(b.key).loc = x.toString() + " " + y.toString(); //set location
        })
    }

    //Returns true if the block is a destination block
    isDestination(key) {
        return this.getBlock(key).parent !== this.getBlock(key).prior;
    }

    //Return this.blocks to return all Block Objects
    getBlocks() {
        return this.blocks;
    }

    //Returns a select block corresponding to input parameter: key
    getBlock(key) {
        return this.blocks.find(b => b.key === key);
    }

    //Returns the root block of the sequence trace
    getRoot() {
        return this.blocks.find(b => b.isRoot === true);
    }

    //returns this.visibleBlocks to return all rendered visible block objects
    getVisibleBlocks() {
        return this.visibleBlocks;
    }

    //Returns a select visible block corresponding to input parameter: key
    getVisibleBlock(key) {
        return this.visibleBlocks.find(b => b.key === key);
    }

    //Pushes block with corresponding key onto this.visibleBlocks
    addVisibleBlocks(key) {
        this.visibleBlocks.push(...this.blocks.filter(b => b.parent === key));
    }

    //Removes block with corresponding key from this.visibleBlocks
    removeVisibleBlocks(key) {
        const blocksToRemove = this.visibleBlocks.filter(b => b.parent === key);
        if (blocksToRemove.length > 0) {
            blocksToRemove.forEach(b => this.removeVisibleBlocks(b.key));
        }
        this.visibleBlocks = this.visibleBlocks.filter(b => b.parent !== key);
    }

    //Returns true if building block has any destinations or utilities
    hasChildren(key) {
        return (this.blocks.filter(b => b.parent === key).length > 0);
    }

    //Returns true if building block has any visible destinations or utilities
    hasVisibleChildren(key) {
        return (this.visibleBlocks.filter(b => b.parent === key).length > 0);
    }

    //Returns all utility block objects of block with corresponding key
    getVisibleUtilities(key) {
        return this.visibleBlocks.filter(b => b.parent === key && b.prior == key);
    }

    //Returns true if building block is part of sequence backbone
    isBackbone(key) {
        // check if block has a destination
        if (this.hasDestination(key)) {
            if (this.getBlock(key).parent === 0 && this.getBlock(key).prior === 0) {
                return true;
            }
            const destKey = this.getBlock(key).destination;
            //check if destination of current block has a parent of 0 (indicating backbone) and destination parent != prior
            if ((this.getBlock(key).parent === 0) && (this.getBlock(key).parent !== this.getBlock(key).prior)) {
                return true;
            } else {
                return false;
            }
        }
    }

    //Returns true if building block has a destination
    hasDestination(key) {
        if (this.getBlock(key).destination !== null && this.getBlock(key).destination !== "") {
            return true;
        }
        return false;
    }

    //Returns true if visible building block has a visible destination
    hasVisibleDestination(key) {
        var currentBlock = this.getVisibleBlock(key);
        if (currentBlock !== null && currentBlock !== "" && typeof(currentBlock) !== "undefined") {
            var destinationBlock = this.getVisibleBlock(currentBlock.destination);
            if (destinationBlock !== null && destinationBlock !== "" && typeof(destinationBlock) !== "undefined") {
                return true;
            }
        }
        return false;
    }

    //Returns true if building block has any utilities
    hasUtilities(key) {
        if (this.getBlock(key).utilities !== [] && this.getBlock(key).utilities !== null) {
            return true;
        }
        return false;
    }

    //Returns true if visible building block has visible utilities
    hasVisibleUtilities(key) {
        var currentBlock = this.getVisibleBlock(key);
        if (currentBlock !== null && currentBlock !== "" && typeof(currentBlock) !== "undefined") {
            var utilities = this.getVisibleUtilities(key);
            if (utilities !== null && utilities !== [] && utilities !== "undefined" && utilities.length > 0) {
                return true;
            }
        }
        return false;
    }

    //Recursive function to calculate horizontal depth of a block based its position
    //Relative to the backbone key (0)
    calculateHorizontalDepth(key) {
        var currentBlock = this.getBlock(key);
        //check if valid object
        if (currentBlock !== null && currentBlock !== "" && typeof(currentBlock) !== "undefined") {
            //if current block part of backbone return 0 layer
            if (currentBlock.parent === 0) {
                return 0;
            }
            //recursively traverse to farthest horizontal block and add 1 to layer
            //returned until backbone reached
            else {
                return 1 + this.calculateHorizontalDepth(currentBlock.parent);
            }
        }
        return 0;
    }

    //Recursive function to calculate the Visible Vertical Depth given any block key.
    calculateVisibleVerticalDepth(key) {
        return this.calculateVisibleVerticalUtilityDepth(key) + this.calculateVisibleVerticalDestinationDepth(key);
    }

    //Recursively calculate the Destination Depth, given a block key
    calculateVisibleVerticalDestinationDepth(key) {
        var currentBlock = this.getVisibleBlock(key);
        var destinationDepth = 0;
        if (this.hasVisibleDestination(key)) {
            destinationDepth = 1 + this.calculateVisibleVerticalDepth(currentBlock.destination);
        }
        //console.log("Key: "+key+" Destination Depth " + destinationDepth);
        return destinationDepth;
    }

    //Recursively calculate the Utility Depth, given a block key
    calculateVisibleVerticalUtilityDepth(key) {
        var currentBlock = this.getVisibleBlock(key);
        var utilityDepth = 0;
        if (currentBlock !== null && currentBlock !== "" && typeof(currentBlock) !== "undefined") {
            if (this.hasVisibleUtilities(key)) {
                var utilities = this.getVisibleUtilities(key);
                for (let i = 0; i < utilities.length; i++) {
                    utilityDepth += this.calculateVisibleVerticalDepth(utilities[i].key);
                }
                utilityDepth += utilities.length;
            }
        }
        return utilityDepth;
    }

    /*
	 * Sets all Visible Vertical Depths given a starting key and starting layer.
	 * Additionally, sets Link Numbers.
     * This function should only be invoked by passing in the root node, a layer of 0, and a linkCount of 1
    */
	setVisibleVerticalDepths(key, layer, linkCount) {
        var currentBlock = this.getVisibleBlock(key);
        if (currentBlock !== null && currentBlock !== "" && typeof(currentBlock) !== "undefined") {
            this.getVisibleBlock(key).y = layer;
            var utilityDepth = 0;
            var utilityCount = 0;
            if (this.hasVisibleUtilities(key)) {
                var utilities = this.getVisibleUtilities(key);
                utilityCount = utilities.length;
                for (var i = 0; i < utilityCount; i++) {
                    linkService.setLinkNumber(key, utilities[i].key, linkCount)
                    this.setVisibleVerticalDepths(utilities[i].key, layer+i+utilityDepth+1, ++linkCount);
                    var incrementalDepth = this.calculateVisibleVerticalDepth(utilities[i].key);
                    utilityDepth += incrementalDepth;
                    linkCount += incrementalDepth;
                }
            }
            if (this.hasVisibleDestination(key)) {
                layer++;
                linkService.setLinkNumber(key, currentBlock.destination, linkCount)
                this.setVisibleVerticalDepths(currentBlock.destination, layer + utilityDepth + utilityCount, ++linkCount);
            }
        }
    }

    //Traverses all building blocks to create all links via the linkService class
    parseBlocksToCreateLinks() {
        this.blocks.forEach(b => {
            //Create destination link from current block to next block
            if (this.hasDestination(b.key)) {
                var destinationLink = {
                    from: b.key,
                    to: b.destination,
                    type: "destination",
                    isBackbone: false
                };
                if (this.isBackbone(b.key)) {
                    destinationLink.isBackbone = true;
                }
                linkService.addLink(destinationLink);
            }
            //Create utility link from current block to utility blocks
            if (this.hasUtilities(b.key)) {
                for (var i = 0; i < b.utilities.length; i++) {
                    var utilityLink = {
                        from: b.key,
                        to: b.utilities[i],
                        type: "utility",
                        isBackbone: false
                    };
                    linkService.addLink(utilityLink);
                }
            }
        });
    }
}

//Export the blockService Singleton
export const blockService = new BlockService();
