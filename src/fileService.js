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
to create blocks, create links, and set locations. Also has functionality to
read in .xlsx files from SharePoint URL using XLSX SheetJS library for automated
description and lines of code updating
*/

class FileService {

    constructor() {
        this.JSONData = [];
		this.excelData = [];
    }

	//NOTE: Currently unimplemented. Ability to read in the excel block database
	excelRead(input) {
		const file = input.target.files[0];
		//input.t.next('.custom-file-label').html(file);
        if (file === undefined) {
            alert('Please select a file.');
            return;
        } else {

		}
	}

    // 	//Reading in xlsx file from sharepoint NOTE: NEEDS UPDATED- NOT TESTED
    // 	excelRead(input) {
    //
    // 	//var excelURL = 'CHANGE ME'; //The URL of the Excel Input File NOTE: MUST CHANGE URL
    //
    // 	/* set up an async GET request */
    // 	var req = new XMLHttpRequest();
    // 	req.open("GET", excelURL, true);
    // 	req.responseType = "arraybuffer";
    //
    // 	req.onload = function(input) {
    // 		/* parse the data when it is received */
    // 		var data = new Uint8Array(req.response);
    // 		var workbook = XLSX.read(data, {
    // 			type: "array"
    // 		});
    //
    // 		//NOTE: NEEDS TO BE UPDATED
    // 		var row_object = XLSX.utils.sheet_to_json(workbook, {
    // 			header: ["csect", "name", "description", "builtByScenario", "usedByScenario", "linesOfCode"]
    // 		});
    // 		var json_object = JSON.stringify(row_object);
    // 	};
    // 	req.send();
    //
    // 	blockService.getBlocks().forEach(b => {
    // 		json_object.forEach(j => {
    // 			if (blockService.getBlock(b.key).csect === j.csect) {
    // 				if (blockService.getBlock(b.key).name === j.name) {
    // 					blockService.getBlock(b.key).description = j.description;
    // 					blockService.getBlock(b.key).linesOfCode = j.linesOfCode;
    // 				}
    // 			}
    // 		})
    // 	})
    //
    // 	//Reading in xlsx file from local
    // 	// var fileReader = new FileReader();
    // 	// fileReader.onload = function(input) {
    // 	// 	var filename = file.name;
    // 	// 	// pre-process data
    // 	// 	var binary = "";
    // 	// 	var bytes = new Uint8Array(input.target.result);
    // 	// 	var length = bytes.byteLength;
    // 	// 	for (var i = 0; i < length; i++) {
    // 	// 		binary += String.fromCharCode(bytes[i]);
    // 	// 	}
    // 	// 	var oFile = XLSX.read(binary, {
    // 	// 		type: 'binary',
    // 	// 		cellDates: true,
    // 	// 		cellStyles: true
    // 	// 	});
    // 	// 	console.log(oFile);
    // 	//
    // 	// 	var row_object = XLSX.utils.sheet_to_json(oFile, {
    // 	// 		header: ["csect", "name", "description", "builtByScenario", "usedByScenario", "linesOfCode"]
    // 	// 	});
    // 	// 	var json_object = JSON.stringify(row_object);
    // 	// 	console.log('new line: ' + row_object);
    // 	// 	// });
    // 	//
    // 	// };
    // 	// fileReader.readAsArrayBuffer(file);
    // }

    //handles JSON input file to create blocks and links
    jsonRead(input) {
        const file = input.target.files[0];
		//input.t.next('.custom-file-label').html(file);
        if (file === undefined) {
            alert('Please select a file.');
            return;
        } else {
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
                        //set locations of blocks using parameters (distance between blocks (pixels),x,y)
                        blockService.calcLocation(150, 0, 0);
                        //render diagram
                        render();
                    }
                });
            }
            reader.onerror = (event) => {
                alert(event.target.error.name);
            };
            reader.readAsText(file);
        }
    }
}

//Export the fileService Singleton
export const fileService = new FileService();
