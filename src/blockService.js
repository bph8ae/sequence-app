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

	//Calculates the location of each visible block in space
	calcLocation(distance, x, y) {
		var maxArr = [];
		//loop through all visible blocks
		this.visibleBlocks.forEach(b => {
			x = this.calculateHorizontalDepth(b.key);
			this.getBlock(b.key).x = x;
		})
		// if (this.isBackbone(b.key) || b.key === 1) {
		this.calculateVisibleVerticalChildrenDepth(1, 0); //Calculate vertical layer
		//store layer as x and y
		// this.getBlock(b.key).y = y;
		//compute actual distance
		this.visibleBlocks.forEach(b => {
			x = this.getBlock(b.key).x;
			y = this.getBlock(b.key).y;
			x = distance * x;
			y = distance * y;
			console.log('Locations- Key: ' + b.key + ' Location: ' + x.toString() + " " + y.toString());
			this.getBlock(b.key).loc = x.toString() + " " + y.toString(); //set location
		})
	}
	// })
	//moves backbone block down vertically to prevent overlap with utilities
	// this.overlapPrevention(maxArr,distance);
	// }

	//Detects if overlap of blocks is possible and moves last backbone to max layer + 1
	// overlapPrevention(maxArr, distance) {
	// 	var max = Math.max(...maxArr); //find max depth possible
	// 	this.visibleBlocks.forEach(b => {
	// 		//check if current block is a destination itself, if it does not have a destination, and it has utilities
	// 		if (this.isDestination(b.key) && this.getBlock(b.key).destination === "" && this.hasUtilities(b.key)) {
	// 			//check if current block's y layer is less than the max utility layer
	// 			if (this.getBlock(b.key).y < max) {
	// 				//reset y location to max+1
	// 				this.getBlock(b.key).loc = (this.getBlock(b.key).x).toString() + " " + ((max + 1) * distance).toString();
	// 				//update locations of any utilities to match the same layer
	// 				if (this.hasVisibleChildren(b.key)) {
	// 					var utilKey = this.getBlock(b.key).utilities;
	// 					var utilOffset = 0;
	// 					utilKey.forEach(k => {
	// 						this.getBlock(k).loc = ((this.getBlock(k).x + utilOffset) * distance).toString() + " " + ((max + 1) * distance).toString();
	// 						utilOffset++;
	// 					})
	// 				}
	// 			}
	// 		}
	// 	});
	// }

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

	visibleUtilities(key) {
		if (this.hasVisibleChildren(key)) {
			return this.getBlock(key).utilities.length;
		} else {
			return 0;
		}
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

	//returns true if building block has any utilities
	hasUtilities(key) {
		if (this.getBlock(key).utilities !== [] && this.getBlock(key).utilities !== null) {
			return true;
		}
		return false;
	}

	//recursive function to calculate horizontal depth of a block based its position
	//relative to the backbone key (0)
	calculateHorizontalDepth(key) {
		var current = this.getBlock(key);
		//check if valid object
		if (current !== null) {
			//if current block part of backbone return 0 layer
			if (current.parent === 0) {
				return 0;
			}
			//recursively traverse to farthest horizontal block and add 1 to layer
			//returned until backbone reached
			else {
				return 1 + this.calculateHorizontalDepth(current.parent);
			}
		}
		return 0;
	}

	//recursive function to calculate vertical depth of a block
	// calculateVerticalDepth(key,layer) {
	//     var current = this.getVisibleBlock(key);
	//     if (current !== null) {
	//         //root node
	//         if (current.parent === 0 && current.prior === 0) {
	//             return 0;
	//         }
	//         else {
	//             //find vertical depth for a utility (defined by parent = prior)
	//             if (current.prior === current.parent) {
	//                 //find vertical offset based on index of current block in the utility array of prior block
	//                 var offset = this.getBlock(current.prior).utilities.indexOf(key);
	//                 //add offset
	//                 return offset+this.calculateVerticalDepth(current.prior);
	//             }
	//             //find vertical depth for destination
	//             else {
	//                   return 1+this.calculateVerticalDepth(current.prior);
	//               }
	//             }
	//     }
	//     return 0;
	// }

	/* +utilities.length-1 (Total Number of Utilities -1 since the first utility shares vertical depth)
	 * +1 for each Utility Destination + VisibleVerticalChildDepth of Destination
	 * +VisibleVerticalChildDepth of each Utility
	 */
	calculateVisibleVerticalChildrenDepth(key, layer) {
		var current = this.getVisibleBlock(key);
		var layerTracker = layer;
		var branchDepth = 0;
		if (typeof(current) != "undefined") {
			for (var i = 0; i < this.visibleUtilities(key); i++) {
				this.calculateVisibleVerticalChildrenDepth(current.utilities[i], layerTracker++);
			}
			if (key === 1) {
				current.y = 0;
			} else {
				current.y = layerTracker;
			}
			if (this.hasDestination(current.key)) {
				this.calculateVisibleVerticalChildrenDepth(current.destination, layerTracker++);
			} else {
				if (branchDepth < layerTracker) {
					branchDepth = layerTracker;
        }
					return branchDepth;
				}
			}
		}
	//     current.utilities.forEach(b => {
	//         var util = this.getBlock(b);
	//         if (util !== null) {
	//             if (this.hasDestination(util.key)) {
	//                 return 1+
	//                 this.calculateVisibleVerticalChildrenDepth(util.key)+
	//                 this.calculateVisibleVerticalChildrenDepth(util.destination);
	//             }
	//             else {
	//                 return this.calculateVisibleVerticalChildrenDepth(util.key);
	//             }
	//         }
	//     });
	//     return current.utilities.length-1;
	// }
	// return 0;
	// }

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
