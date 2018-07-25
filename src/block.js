//Block Data Functionality
class Block {

	constructor(key, parent, previous, csect, name, linesOfCode, description, destination, utilities, isRoot, horizontalDepth, verticalDepth, location) {
		//Unique Identifier
		this.key = key;
		/*Parent == Previous indicates Utility
		 *Parent == 0 indicates Backbone
		 *Parent is used to support Retract/Expand functionality
		 */
		this.parent = parent;
		//Previous is whatever block called the current block
		this.previous = previous;
		//Block CSECT Letter
		this.csect = csect;
		//Block Name
		this.name = name;
		//Block Lines of Code
		this.linesOfCode = linesOfCode;
		//Block Description
		this.description = description;
		//Block Destination (exit point)
		this.destination = destination;
		//Block Utilities (common modules invoked)
		this.utilities = utilities;
		//True indicates the Root block
		this.isRoot = isRoot;
		//Block Depth. 0 Indicates Backbone
		this.horizontalDepth = horizontalDepth;
		//Block Vertical Depth
		this.verticalDepth = verticalDepth
		//x y Grid Position (aka Horizontal Depth , Vertical Depth)
		this.loc = location;
	}

}
