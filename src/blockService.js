import { linkService } from "./linkService";
import { fileService } from "./fileService";
import { functions } from "./block.js";
import "./functions.js";

//Block Data Functionality
class BlockService {

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
      data = data.replace(/[\u0000-\u0019]+/g,"");
      this.blocks = JSON.parse(data);
      this.visibleBlocks = this.blocks.filter(b => b.parent === 0);
    }

    //Calculates the location of each visible block in space
    calcLocation(distance, x, y) {
        var maxArr = [];
        var locations = [];
        //loop through all visible blocks
        this.visibleBlocks.forEach(b => {
          x = this.calculateHorizontalDepth(b.key); //Calculate horizontal layer
          y = this.calculateVerticalDepth(b.key); //Calculate vertical layer
          if (!(this.isBackbone(b.key))) { //Creates array of max layers for use in overlap detection
            maxArr.push(y);
          }
          //store layer as x and y
          this.getBlock(b.key).x = x;
          this.getBlock(b.key).y = y;
          //compute actual distance
          x = distance * x;
          y = distance * y;
          this.getBlock(b.key).loc = x.toString() + " " + y.toString(); //set location
          locations.push(x.toString() + " " + y.toString());
        })
        this.overlapPrevention(maxArr,distance);
    }

    //Detects if overlap of blocks is possible and moves last backbone to max layer + 1
    overlapPrevention(maxArr,distance) {
      var max = Math.max(...maxArr); //find max depth possible
      this.visibleBlocks.forEach(b => {
        //determine if block is a destination block, is the last block of t
        // if ((this.getBlock(b.key).utilities).length > 2) {
        //   var offset = 0;
        //   this.getBlock(b.key).utilities.forEach(u => {
        //     this.getBlock(u).loc = ((this.getBlock(u).x+offset)*distance).toString() + " " + (this.getBlock(u).y*distance).toString();
        //   })
        // }
        if (this.isDestination(b.key) && this.getBlock(b.key).destination === "" && this.hasUtilities(b.key)) {
          if (this.getBlock(b.key).y < max) {
            this.getBlock(b.key).loc = (this.getBlock(b.key).x).toString() + " " + ((max+1)*distance).toString();
            if (this.hasVisibleChildren(b.key)) {
              var utilKey = this.getBlock(b.key).utilities;
              var utilOffset = 0;
              utilKey.forEach(k => {
                this.getBlock(k).loc = ((this.getBlock(k).x+utilOffset)*distance).toString() + " " + ((max+1)*distance).toString();
                utilOffset++;
              })
            }
          }
        }
      });
    }

    isDestination(key) {
      return this.getBlock(key).parent !== this.getBlock(key).prior;
    }

    getBlocks() {
        return this.blocks;
    }

    getBlock(key) {
        return this.blocks.find(b => b.key === key);
    }

    getRoot() {
        return this.blocks.find(b => b.isRoot === true);
    }

    getVisibleBlocks() {
        return this.visibleBlocks;
    }

    getVisibleBlock(key) {
        return this.visibleBlocks.find(b => b.key === key);
    }

    addVisibleBlocks(key) {
        this.visibleBlocks.push(...this.blocks.filter(b => b.parent === key));
    }

    removeVisibleBlocks(key) {
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

    calculateVerticalDepth(key) {
        var current = this.getVisibleBlock(key);
        if (current !== null) {
            if (current.parent === 0 && current.prior === 0) {
                return 0;
            }
            else {
                if (current.prior === current.parent) { //Utility
                    var offset = this.getBlock(current.prior).utilities.indexOf(key);
                    // if (offset > 0) {
                    //   if (this.hasDestination(this.getBlock(current.prior).utilities[offset-1]))   {
                    //     offset = offset + this.calculateVerticalDepth(this.getBlock(current.prior).utilities[offset-1]);
                    //   }
                    // }
                    return offset+this.calculateVerticalDepth(current.prior);
                }
                else {//Destination
                      return 1+this.calculateVerticalDepth(current.prior);
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
        var current = this.getBlock(key);
        if (current !== null) {
            current.utilities.forEach(b => {
                var util = this.getBlock(b);
                if (util !== null) {
                    if (this.hasDestination(util.key)) {
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
