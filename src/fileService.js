import { blockService } from "./blockService";

class FileService {

	constructor() {
		this.file;
	}

	handleFileSelect(event) {
		if(event.target.files.length != 0) {
			this.file = event.target.files[0];
    		console.log(this.file);
    		console.log(typeof(this.file));
    		var data = (typeof this.file == "object" ? this.file : JSON.parse(this.file));
    		console.log(typeof(data));
    		console.log(data);
		}
		else {
			alert("No file chosen");
		}
	}

}

export const fileService = new FileService();
