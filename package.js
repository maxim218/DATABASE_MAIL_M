"use strict";

const number = 11;

/**********************************************/
/**********************************************/
/**********************************************/

function generateInfoText(i) {
    const s0 = "\n\n";
    const s1 = "// ********************************\n";
    const s2 = "// element " + i.toString();
    const s3 = "\n\n";
    const s4 = s0 + s1 + s2 + s3;
    return s4.toString();
}

const fs = require('fs');

const buffer = [];

for(let i = 1; i <= number; i++) {
    const name = "./elements/e_" + i.toString() + ".js";
    const info = generateInfoText(i);
    const content = fs.readFileSync(name, 'utf8');
    buffer.push(info.toString() + content.toString());
}

const resultFileName = "index.js";
const space = "\n";
const content = buffer.join(space);

fs.writeFileSync(resultFileName, content, 'utf8');

console.log("***************************************");
console.log("Package OK");
console.log("***************************************");
