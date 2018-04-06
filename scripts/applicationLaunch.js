"use strict";

const express = require("express");
const application = express();

application.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.header("Creator-Information", "Kolotovkin Maxim");
    next();
});

application.listen(mainConfigObj.port);
log("Launch: " + mainConfigObj.port);
log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n");
