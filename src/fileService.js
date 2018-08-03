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

var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
var fileBlocks = [];
var jsonReadSuccessful = false;
var excelReadSuccessful = false;

class FileService {

    constructor() {
        this.allBlocks;
    }

    setDescriptions(blocks) {
        if (jsonReadSuccessful && excelReadSuccessful) {
            blockService.setBlockMetaData(blocks);
            return true;
        }
        return false;
    }

    //Reads JSON input file to create blocks and links
    jsonRead(input) {
        jsonReadSuccessful = false;
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

                            jsonReadSuccessful = true;
                            //this.setDescriptions(fileBlocks);
                            if (jsonReadSuccessful && excelReadSuccessful) {
                                blockService.setBlockMetaData(fileBlocks);
                            }

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

    //Helper method for excelRead
    fixdata(data) {
        var o = "",
            l = 0,
            w = 10240;
        for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
        return o;
    }

    //Reads excel block descriptions to link with blockService
    excelRead(input) {
        excelReadSuccessful = false;
        const file = input.target.files[0];
        const fileName = file.name;
        $('#excelFileDiv').next('.custom-file-label').html(fileName);
        if (file === undefined) {
            alert('Please select a file.');
            return;
        } else if (/\.(xls|xlsx|xlsm)$/i.test(fileName) === false) {
            alert("Please select a valid excel formatted file (.xls or .xlsx or .xlsm)!");
            return;
        } else {
            try {
                fileBlocks = [];
                var reader = new FileReader();
                reader.onload = function(event) {
                    var data = event.target.result;
                    var workbook;
                    if (rABS) {
                        /* if binary string, read with type 'binary' */
                        workbook = XLSX.read(data, {
                            type: 'binary'
                        });
                    } else {
                        /* if array buffer, convert to base64 */
                        var arr = this.fixdata(data);
                        workbook = XLSX.read(btoa(arr), {
                            type: 'base64'
                        });
                    }
                    /* DO SOMETHING WITH workbook HERE */
                    //Process Workbook Data
                    var sheet_name_list = workbook.SheetNames;
                    sheet_name_list.forEach(
                        function(y) {
                            var worksheet = workbook.Sheets[y];
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
                            var i = 0;
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
                                            "buildingBlockGroup": group,
                                            "buildingBlockType": type,
                                            "totalLines": totalLines,
                                            "codeLines": codeLines,
                                            "commentLines": commentLines,
                                        }
                                        //Skip Header Row
                                        if (i === 0) {
                                            i++;
                                        } else {
                                            fileBlocks.push(block);
                                        }
                                        csect = "";
                                        name = "";
                                        description = "";
                                        builtByScenario = "";
                                        usedByScenario = "";
                                        lineRange = "";
                                        run = "";
                                        group = "";
                                        type = "";
                                        totalLines = "";
                                        codeLines = "";
                                        commentLines = "";
                                        break;
                                }
                            }
                            excelReadSuccessful = true;
                            //this.setDescriptions(fileBlocks);
                            if (jsonReadSuccessful && excelReadSuccessful) {
                                blockService.setBlockMetaData(fileBlocks);
                            }
                        }
                    );
                };
                reader.readAsBinaryString(file);
            } catch (error) {
                console.log(error);
            }
        }
    }
}

//Export the fileService Singleton
export const fileService = new FileService();
