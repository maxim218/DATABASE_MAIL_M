"use strict";

const fs = require("fs");

const mainConfigStr = fs.readFileSync('./main_config.json', 'utf8');
const mainConfigObj = JSON.parse(mainConfigStr);
