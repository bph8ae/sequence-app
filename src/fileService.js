import { blockService } from "./blockService";

class FileService {

	constructor() {
		this.file;
	}

	handleFileSelect(input) {
		const file = input.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        this.file = event.target.result;
				console.log(this.file);
        const allLines = this.file.split(/\r\n|\n/);
        //Reading line by line
        allLines.forEach((line) => {
            console.log(line);
        });
    };

    reader.onerror = (event) => {
        alert(event.target.error.name);
    };

    reader.readAsText(file);
	}

}

export const fileService = new FileService();
