/*
File Handler class with ability to read in JSON files upon click of render button
to create blocks, create links, and set locations. Also has functionality to
read in .xlsx files from SharePoint URL using XLSX SheetJS library for automated
description and lines of code updating
*/

import * as $ from 'jquery';
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

var excelURL = "ITPE Scenario Decision Tracker.xlsm";

class FileService {

    constructor() {
        this.JSONData = [];
        this.excelData = [];
        this.allBlocks = [];
    }

    //Reads JSON input file to create blocks and links
    jsonRead(input) {
        const file = input.target.files[0];
        const fileName = file.name;
        $('#JSONFileDiv').next('.custom-file-label').html(fileName);
        if (file === undefined) {
            alert('Please select a file.');
            return;
        } else if (/\.(json|txt)$/i.test(fileName) === false) {
            alert("Please select a json formatted file (.json or .txt)!");
            return;
        } else {
            try {
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
            } catch (error) {
                console.log(error);
            }

        }
    }

    excelRead(input) {
        console.log("In Excel Read");
        const file = input.target.files[0];
        const fileName = file.name;
        $('#excelFileDiv').next('.custom-file-label').html(fileName);
        if (file === undefined) {
            alert('Please select a file.');
            return;
        } else if (/\.(xlsm|xlsx|xls)$/i.test(fileName) === false) {
            alert("Please select an .xlsx .xlsm or .xls file!");
            return;
        } else {
            try {
                var req = new XMLHttpRequest();
                //req.open("GET", file, true);
                req.open("GET", excelURL, true);
                console.log(file);
                req.responseType = "arraybuffer";
                req.onload = function(input) {
                    console.log("In Onload");
                    //Convert data to binary string
                    var data = new Uint8Array(req.response);
                    var workbook = XLSX.read(data, {
                        type: "array"
                    });
                    //Process Workbook Data
                    var sheet_name_list = workbook.SheetNames;
                    sheet_name_list.forEach(
                        function(y) {
                            var worksheet = workbook.Sheets(y);
                            var csect;
                            var name;
                            var description;
                            var builtByScenario;
                            var usedByScenario;
                            var lineRange;
                            var run;
                            var group;
                            var type;
                            var totalLines;
                            var codeLines;
                            var commentLines;
                            var z;
                            for (z in worksheet) {
                                //All keys that do not begin with "!" correspond to cell addresses
                                if (z[0] === '!') continue;
                                //***Need to figure out how to best skip the first header row in Excel***
                                switch (z.charAt(0)) {
                                    case 'A':
                                        csect = worksheet[z].v;
                                        break;
                                    case 'B':
                                        name = worksheet[z].v;
                                        break;
                                    case 'C':
                                        description = worksheet[z].v;
                                        break;
                                    case 'D':
                                        builtByScenario = worksheet[z].v;
                                        break;
                                    case 'E':
                                        usedByScenario = worksheet[z].v;
                                        break;
                                    case 'F':
                                        lineRange = worksheet[z].v;
                                        break;
                                    case 'G':
                                        run = worksheet[z].v;
                                        break;
                                    case 'H':
                                        group = worksheet[z].v;
                                        break;
                                    case 'I':
                                        type = worksheet[z].v;
                                        break;
                                    case 'J':
                                        totalLines = worksheet[z].v;
                                        break;
                                    case 'K':
                                        codeLines = worksheet[z].v;
                                        break;
                                    case 'L':
                                        commentLines = worksheet[z].v;
                                        var block = {
                                            "csect": csect,
                                            "name": name,
                                            "description": description,
                                            "builtByScenario": builtByScenario,
                                            "usedByScenario": usedByScenario,
                                            "lineRange": lineRange,
                                            "run": run,
                                            "group": group,
                                            "type": type,
                                            "totalLines": totalLines,
                                            "codeLines": codeLines,
                                            "commentLines": commentLines,
                                        }
                                        console.log(block);
                                        this.allBlocks.push(block);
                                        break;
                                }
                            }
                        }
                    );
                }
                console.log("After OnLoad");
                req.send();
                console.log(this.allBlocks);
            } catch (error) {
                console.log(error);
            }
        }
    }
}

//Export the fileService Singleton
export const fileService = new FileService();
