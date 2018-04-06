"use strict";

console.log("\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

const fs = require("fs");

const mainConfigStr = fs.readFileSync('./main_config.json', 'utf8');
const mainConfigObj = JSON.parse(mainConfigStr);
const scriptsArray = mainConfigObj.scripts;

let body = "";

console.log("\nStart collecting: \n");

scriptsArray.forEach((script) => {
    console.log("Script: " + script);
    const code = fs.readFileSync('./scripts/' + script, 'utf8');
    body = body + "\n\n" + "///////////////////////////////////////////////////////////////////" + "\n\n" + "// File: " + script + "\n\n" + code;
});

fs.writeFileSync("MAIN_RESULT_SCRIPT.js", body, "utf8");

console.log("\nCreate MAIN_RESULT_SCRIPT.js OK\n");

console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n");
