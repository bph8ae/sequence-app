import { renderDiagram as render } from "./index";
import { blockService } from "./blockService";
import { linkService } from "./linkService";

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
				document.getElementById('renderButton').addEventListener('click', function() {
					if (data !== null) {
						blockService.setBlocks(data);
						linkService.createLinks();
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
