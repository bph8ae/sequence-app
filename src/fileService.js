import { renderDiagram as render } from "./index";
import { blockService } from "./blockService";
import { linkService } from "./linkService";

/*
File Handler class with ability to read in JSON files upon click of render button
and create blocks, create links, and set locations
*/

class FileService {

	constructor() {
		this.data = [];
	}

		handleFileSelect(input) {
		const file = input.target.files[0];
    const reader = new FileReader();
		var data = [];
    reader.onload = (event) => {
        data = event.target.result;
				//wait until render button clicked before creating objects
				document.getElementById('renderButton').addEventListener('click', function() {
					if (data !== null) {
						//create block objects
						blockService.setBlocks(data);
						//create link objects
						linkService.createLinks();
						//set locations of blocks using parameters (distance,x,y)
						blockService.calcLocation(150,0,0);
						render();
						console.log('Post Render');
					}
				});
    }
    reader.onerror = (event) => {
        alert(event.target.error.name);
    };

    reader.readAsText(file);

	}
}

export const fileService = new FileService();
