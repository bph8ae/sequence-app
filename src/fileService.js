import {
	renderDiagram as render
} from "./index";
import {
	blockService
} from "./blockService";
import {
	linkService
} from "./linkService";
import * as XLSX from 'xlsx';

/*
File Handler class with ability to read in JSON files upon click of render button
and create blocks, create links, and set locations
*/

class FileService {

	constructor() {
		this.data = [];
	}

	excelRead(input) {
		//Excel read-in
		var file = input.target.files[0];
		var excelURL = file; //The URL of the Excel Input File NOTE: MUST CHANGE URL

		var fileReader = new FileReader();
		fileReader.onload = function(input) {
			var filename = file.name;
			// pre-process data
			var binary = "";
			var bytes = new Uint8Array(input.target.result);
			var length = bytes.byteLength;
			for (var i = 0; i < length; i++) {
				binary += String.fromCharCode(bytes[i]);
			}
			var oFile = XLSX.read(binary, {
				type: 'binary',
				cellDates: true,
				cellStyles: true
			});
			console.log(oFile);

					var row_object = XLSX.utils.sheet_to_json(oFile, {
						header: ["csect","name","description","builtByScenario","usedByScenario","linesOfCode"]
					});
					var json_object = JSON.stringify(row_object);
					console.log('new line: '+json_object);
				// });

			};
			fileReader.readAsArrayBuffer(file);

			//Open the Excel File
			// var oReq = new XMLHttpRequest();
			// oReq.open("GET", excelURL, true);
			// oReq.responseType = "arraybuffer";
			// //Load the Data
			// oReq.onload = function(e) {
			// 	var arraybuffer = oReq.response;
			// 	//Convert data to binary string
			// 	var data = new Uint8Array(arraybuffer);
			// 	console.log(data);
			// 	// var arr = new Array();
			// 	// for (var i = 0; i != data.length; ++i) {
			// 	// 	arr[i] = String.fromCharCode(data[i]);
			// 	// }
			// 	// var bstr = arr.join("");
			// 	//Call XLSX Function
			// 	// var workbook = XLSX.read(bstr, {
			// 	// 	type: "binary"
			// 	// });
			// 	var workbook = XLSX.read(data, {
			// 		type: "array"
			// 	});
			// 	console.log(workbook);
			// 	//Process Workbook Data
			// 	var sheet_name_list = workbook.SheetNames;
			// 	sheet_name_list.forEach(function(y) { /* iterate through sheets */
			// 		var worksheet = workbook.Sheets[y];
			// 		var csect;
			// 		var name;
			// 		var description;
			// 		var builtByScenario;
			// 		var usedByScenario;
			// 		var linesOfCode;
			// 		for (var i in worksheet) {
			// 			//All keys that do not begin with "!" correspond to cell addresses
			// 			if (i[0] === '!') continue;
			// 			//***Need to figure out how to best skip the first header row in Excel***
			// 			switch (i.charAt(0)) {
			// 				case 'A':
			// 					csect = worksheet[i].v;
			// 					break;
			// 				case 'B':
			// 					name = worksheet[i].v;
			// 					break;
			// 				case 'C':
			// 					description = worksheet[i].v;
			// 					break;
			// 				case 'D':
			// 					builtByScenario = worksheet[i].v;
			// 					break;
			// 				case 'E':
			// 					usedByScenario = worksheet[i].v;
			// 					break;
			// 				case 'F':
			// 					linesOfCode = worksheet[i].v;
			// 					break;
			// 				case 'G': //skip run/job
			// 					break;
			// 				case 'H': //skip BB group
			// 					break;
			// 				case 'I': //skip BB type
			// 					break;
			// 				case 'J': //skip total
			// 					break;
			// 				case 'K': //skip code
			// 					break;
			// 				case 'L': //skip comments
			// 					break;
			//
			// 			}
			//
			// 			blockService.getBlocks().forEach(b => {
			// 				console.log('csect/name: ' + csect + ' ' + name);
			//
			// 				if (blockService.getBlock(b.key).csect === csect) {
			// 					if (blockService.getBlock(b.key).name === name) {
			// 						console.log('csect/name: ' + csect + ' ' + name);
			// 						blockService.getBlock(b.key).description = description;
			// 						blockService.getBlock(b.key).linesOfCode = linesOfCode;
			// 					}
			// 				}
			// 			})
			// 		}
			// 	});
			// };
			// oReq.send();
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
						blockService.calcLocation(150, 0, 0);
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
