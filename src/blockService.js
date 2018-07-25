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

/*
This class adds functionality to building block objects. It includes methods for
creating building block objects, setting their location automatically, and
returning pertinent data about the blocks and the block object itself
*/

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
    data = data.replace(/[\u0000-\u0019]+/g, "");
    this.blocks = JSON.parse(data);
    this.visibleBlocks = this.blocks.filter(b => b.parent === 0);
  }

  //Display all blocks
  expandAllBlocks() {
    this.visibleBlocks = this.blocks;
  }

  //Display only the backbone blocks
  retractAllBlocks() {
    this.visibleBlocks = this.blocks.filter(b => b.parent === 0);
  }

  //Calculates the location of each visible block in space
  calcLocation(distance, x, y) {
    var maxArr = [];
    //loop through all visible blocks
    this.visibleBlocks.forEach(b => {
      x = this.calculateHorizontalDepth(b.key);
      this.getBlock(b.key).x = x;
    })
    // if (this.isBackbone(b.key) || b.key === 1) {
    this.setVisibleVerticalDepths(1, 0);
    //store layer as x and y
    // this.getBlock(b.key).y = y;
    //compute actual distance
    this.visibleBlocks.forEach(b => {
      x = this.getBlock(b.key).x;
      y = this.getBlock(b.key).y;
      x = distance * x;
      y = distance * y;
      this.getBlock(b.key).loc = x.toString() + " " + y.toString(); //set location
    })
  }

  //returns true if the block is a destination block
  isDestination(key) {
    return this.getBlock(key).parent !== this.getBlock(key).prior;
  }

  //return all building block objects
  getBlocks() {
    return this.blocks;
  }

  //returns building block corresponding to passed key identifier
  getBlock(key) {
    return this.blocks.find(b => b.key === key);
  }

  //returns root block of sequence trace
  getRoot() {
    return this.blocks.find(b => b.isRoot === true);
  }

  //returns all rendered visible block objects
  getVisibleBlocks() {
    return this.visibleBlocks;
  }

  //returns visible block corresponding to key identifier
  getVisibleBlock(key) {
    return this.visibleBlocks.find(b => b.key === key);
  }

  //pushes block with corresponding key onto visible block stack
  addVisibleBlocks(key) {
    this.visibleBlocks.push(...this.blocks.filter(b => b.parent === key));
  }

  //removes block with corresponding key from visible block stack
  removeVisibleBlocks(key) {
    const blocksToRemove = this.visibleBlocks.filter(b => b.parent === key);
    if (blocksToRemove.length > 0) {
      blocksToRemove.forEach(b => this.removeVisibleBlocks(b.key));
    }
    this.visibleBlocks = this.visibleBlocks.filter(b => b.parent !== key);
  }

  //returns true if building block has any destinations or utilities
  hasChildren(key) {
    return (this.blocks.filter(b => b.parent === key).length > 0);
  }

  //returns true if building block has any visible destinations or utilities
  hasVisibleChildren(key) {
    return (this.visibleBlocks.filter(b => b.parent === key).length > 0);
  }

  getVisibleUtilities(key) {
    return this.visibleBlocks.filter(b => b.parent === key && b.prior == key);
  }

  //returns true if buildilng block is part of sequence backbaone
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

  //returns true if building block has a destination
  hasDestination(key) {
    if (this.getBlock(key).destination !== null && this.getBlock(key).destination !== "") {
      return true;
    }
    return false;
  }

  //returns true if visible building block has a visible destination
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

  //returns true if building block has any utilities
  hasUtilities(key) {
    if (this.getBlock(key).utilities !== [] && this.getBlock(key).utilities !== null) {
      return true;
    }
    return false;
  }

  //returns true if visible building block has visible utilities
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

  //recursive function to calculate horizontal depth of a block based its position
  //relative to the backbone key (0)
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
      destinationDepth = 1+this.calculateVisibleVerticalDepth(currentBlock.destination);
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
        for (var i = 0; i < utilities.length; i++) {
          utilityDepth += this.calculateVisibleVerticalDepth(utilities[i]);
        }
        utilityDepth += utilities.length - 1;
      }
    }
    //console.log("Key: "+key+" Utility Depth " + utilityDepth);
    return utilityDepth;
  }

  //Sets all Visible Vertical Depths given a starting key and starting layer.
  //This function should only be invoked by passing in the root node and a layer of 0.
  setVisibleVerticalDepths(key, layer) {
    var currentBlock = this.getVisibleBlock(key);
    if (currentBlock !== null && currentBlock !== "" && typeof(currentBlock) !== "undefined") {
      //console.log("Setting Key "+key+" to Layer "+layer);
      this.getVisibleBlock(key).y = layer;
      var utilityDepth = 0;
      var utilityLength = 0;
      if (this.hasVisibleUtilities(key)) {
        var utilities = this.getVisibleUtilities(key);
        //console.log("Has Visible Utilities")
        //console.log(utilities);
        utilityLength = utilities.length - 1;
        //console.log("Utility Length-1: "+utilityLength);
        for (var i = 0; i <= utilityLength; i++) {
          if (i === 0) {
            //console.log("key "+utilities[i].key+" i = 0, layer " + layer);
            this.setVisibleVerticalDepths(utilities[i].key, layer);
          } else {
            var newLayer = layer+i+utilityDepth;
            //console.log("key "+utilities[i].key+ " i = " + i + ", newlayer " + newLayer);
            this.setVisibleVerticalDepths(utilities[i].key, newLayer);
          }
          utilityDepth += this.calculateVisibleVerticalDepth(utilities[i].key);
        }
      }
      if (this.hasVisibleDestination(key)) {
        //console.log("Key "+key+" Has Visible Destination "+currentBlock.destination);
        layer++;
        this.setVisibleVerticalDepths(currentBlock.destination, layer + utilityDepth + utilityLength);
      }
    }
  }

  //Traverses all building blocks to create links- uses linkService class
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

export const blockService = new BlockService();
