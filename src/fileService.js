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
        // const allLines = data.split(/\r\n|\n/);
        //Reading line by line
        // allLines.forEach((line) => {
				// 	// data.push(line);
				// 	// console.log(line);
				// });
				// setData(this.data);
				document.getElementById('renderButton').addEventListener('click', function() {
					if (data !== null) {
						blockService.setBlocks(data);
						linkService.createLinks();
						render();
						console.log('Post Render');
					}
				});
    }
    reader.onerror = (event) => {
        alert(event.target.error.name);
    };

    reader.readAsText(file);

		// function setData(data) {
		// 	this.data = data;
		// }

	}
}

export const fileService = new FileService();
