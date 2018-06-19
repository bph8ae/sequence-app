import { blockService } from "./blockService";

class FileService {

	constructor() {
		this.file;
	}

	handleFileSelect(input) {
		this.file = input.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        const file = event.target.result;
				console.log(file);
        const allLines = file.split(/\r\n|\n/);
        //Reading line by line
        allLines.forEach((line) => {
            console.log(line);
        });
    };

    reader.onerror = (event) => {
        alert(event.target.error.name);
    };

    reader.readAsText(this.file);
	}

}

export const fileService = new FileService();
