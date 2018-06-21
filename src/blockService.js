import { linkService } from "./linkService";
import { fileService } from "./fileService";
import "./block.js";

//Block Data Functionality
class BlockService {

    constructor() {
        this.blocks;
        this.visibleBlocks;
    }

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
      data = data.replace(/[\u0000-\u0019]+/g,"");
      // console.log(data);
      this.blocks = JSON.parse(data);
      // this.visibleBlocks = this.blocks.filter(b => b.depth === 0);
      this.visibleBlocks = this.blocks.filter(b => b.parent === 0);
    }

    calcLocation(distance, x, y) {
      x = distance * x;
      y = distance * y;
      return x.toString() + " " + y.toString();
    }

    getBlocks() {
        console.log("All Blocks:");
        console.log(this.blocks);
        return this.blocks;
    }

    getBlock(key) {
        return this.blocks.find(b => b.key === key);
    }

    getRoot() {
        return this.blocks.find(b => b.isRoot === true);
    }

    getVisibleBlocks() {
        console.log("Visible Blocks:");
        console.log(this.visibleBlocks);
        return this.visibleBlocks;
    }

    getVisibleBlock(key) {
        return this.visibleBlocks.find(b => b.key === key);
    }

    addVisibleBlocks(key) {
        console.log("Key:"+key+" Adding Blocks:")
        console.log(this.blocks.filter(b => b.parent === key));
        this.visibleBlocks.push(...this.blocks.filter(b => b.parent === key));
    }

    removeVisibleBlocks(key) {
        console.log("Key:"+key+" Removing Blocks:");
        const blocksToRemove = this.visibleBlocks.filter(b => b.parent === key);
        if (blocksToRemove.length > 0) {
            blocksToRemove.forEach(b => this.removeVisibleBlocks(b.key));
        }
        this.visibleBlocks = this.visibleBlocks.filter(b => b.parent !== key);
    }

    hasChildren(key) {
        return (this.blocks.filter(b => b.parent === key).length > 0);
    }

    hasVisibleChildren(key) {
        return (this.visibleBlocks.filter(b => b.parent === key).length > 0);
    }

    isBackbone(key) {
       if (this.hasDestination(key)) {
         const destKey = this.getBlock(key).destination;
         if ((this.getBlock(destKey).parent === 0) && (this.getBlock(destKey).parent !== this.getBlock(destKey).prior)) {
           return true;
         } else {
           return false;
         }
     }
    }

    hasDestination(key) {
        if (this.getBlock(key).destination !== null && this.getBlock(key).destination !== "") {
            return true;
        }
        return false;
    }

    hasUtilities(key) {
        if (this.getBlock(key).utilities !== [] && this.getBlock(key).utilities !== null) {
            return true;
        }
        return false;
    }

    calculateHorizontalDepth(key) {
        var current = this.getBlock(key);
        if (current !== null) {
            if (current.parent === 0) {
                return 0;
            }
            else {
                return 1+this.calculateHorizontalDepth(current.parent);
            }
        }
        return 0;
    }

    calculateVisibleVerticalDepth(key) {
        var current = this.getVisibleBlock(key);
        if (current !== null) {
            if (current.isRoot === true) {
                return 0;
            }
            else {
                if (current.previous === current.parent) {//Utility
                    return this.calculateVerticalDepth(current.previous);
                }
                else {//Destination
                    return 1+this.calculateVerticalDepth(current.previous);
                }
            }
        }
        return 0;
    }

    /* +utilities.length-1 (Total Number of Utilities -1 since the first utility shares vertical depth)
     * +1 for each Utility Destination + VisibleVerticalChildDepth of Destination
     * +VisibleVerticalChildDepth of each Utility
     */
    calculateVisibleVerticalChildrenDepth(key) {
        var current = this.getVisibleBlock(key);
        if (current !== null) {
            current.utilities.forEach(b => {
                var util = this.getVisibleBlock(b);
                if (util !== null) {
                    if(this.hasDestination(util.key)) {
                        return 1+
                        this.calculateVisibleVerticalChildrenDepth(util.key)+
                        this.calculateVisibleVerticalChildrenDepth(util.destination);
                    }
                    else {
                        return this.calculateVisibleVerticalChildrenDepth(util.key);
                    }
                }
            });
            return current.utilities.length-1;
        }
        return 0;
    }

    //Initializes the Links and VisibleLinks arrays
    parseBlocksToCreateLinks() {
        this.blocks.forEach(b => {
            if (this.hasDestination(b.key)) {
                var destinationLink = {from:b.key, to:b.destination, type:"destination", isBackbone:false};
                if (this.isBackbone(b.key)) {
                    destinationLink.isBackbone = true;
                }
                linkService.addLink(destinationLink);
            }
            if (this.hasUtilities(b.key)) {
              for (var i = 0; i < b.utilities.length; i++) {
                var utilityLink = {from:b.key, to:b.utilities[i], type:"utility", isBackbone:false};
                linkService.addLink(utilityLink);
              }
            }
        });
    }


}

export const blockService = new BlockService();
