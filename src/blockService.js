import { linkService } from "./linkService";
import { fileService } from "./fileService";
import "./block.js";

//Block Data Functionality
class BlockService {

    constructor() {
        // this.blocks = fileService.file;
        //     this.blocks = [
        //     {key:1, loc:"0 0", parent:0, csect:"E", name:"test block", linesOfCode:"1-100", description:"test", color: "brown"},
        //     {key:2, loc:"150 0", parent:1, csect:"E", name:"test", linesOfCode:"101-200", description:"test"},
        //     {key:3, loc:"0 150", parent:0, csect:"E", name:"test", linesOfCode:"201-300", description:"test"},
        //     {key:4, loc:"150 150", parent:3, csect:"E", name:"test", linesOfCode:"301-400", description:"test"},
        //     {key:5, loc:"150 300", parent:3, csect:"E", name:"test", linesOfCode:"401-500", description:"test"},
        //     {key:6, loc:"300 0", parent:2, csect:"E", name:"test", linesOfCode:"501-600", description:"test"},
        //     {key:7, loc:"300 150", parent:4, csect:"E", name:"Test", linesOfCode:"501-600", description:"test"},
        //     {key:8, loc:"150 450", parent:3, csect:"E", name:"Test", linesOfCode:"501-600", description:"test"},
        //     {key:9, loc:"300 300", parent:5, csect:"E", name:"Test", linesOfCode:"501-600", description:"test"},
        //     {key:10, loc:"300 450", parent:5, csect:"E", name:"Test", linesOfCode:"501-600", description:"test"}
        // ];
        this.blocks;
        this.visibleBlocks;
    }

    setBlocks(data) {
      // data = data.substr(1,data.length-6);
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
      console.log(typeof(this.blocks));
      // this.visibleBlocks = this.blocks.filter(b => b.depth === 0);
      this.visibleBlocks = this.blocks.filter(b => b.parent === 0);
      console.log(this.blocks);
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
       return this.getBlock(key).depth === 0 ? true : false;
    }

    hasDestination(key) {
        if (this.getBlock(key).destination !== null || this.getBlock(key).destination !== "") {
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
                var destinationLink = {from:b.key, to:b.destination, type:"destination"};
                if (this.isRootLevel(b.key)) {
                    destinationLink.root = true;
                }
                else {
                    destinationLink.root = false;
                }
                linkService.addLink(destinationLink);
                if(this.getVisibleBlock(b.key) !== null) {
                    linkService.addVisibleLink(destinationLink);
                }
            }
            b.Utilities.forEach(u => {
                var utilityLink = {from:b.key, to:u.key, type:"utility", root:false};
                linkService.addLink(utilityLink);
                if(this.getVisibleBlock(u.key) !== null) {
                    linkService.addVisibleLink(utilityLink);
                }
            });
        });
    }


}

export const blockService = new BlockService();
