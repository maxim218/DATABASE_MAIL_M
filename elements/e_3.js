"use strict";

let application = require("express")();

function allowAll(response) {
    response.header("Access-Control-Allow-Origin", "*");
}

application.use(function(request, response, next) {
    allowAll(response);
    next();
});

function startMainServer() {
    const portValueInt = process.env.PORT || MAIN_PORT;
    application.listen(portValueInt);
    console.log("\n\n");
    console.log("Port: " + portValueInt);
    console.log("\n\n");
}

startMainServer();

function addGetPostEvents() {
    application.get(ALLOW_ALL_PATH, (request, response) => {
        info("\n");
        info("************************************");
        info("method: GET");
        info("path: " + request.url);
        getQuery(request, response);
    });

    application.post(ALLOW_ALL_PATH, (request, response) => {
        info("\n");
        info("************************************");
        info("method: POST");
        info("path: " + request.url);
        postQuery(request, response);
    });
}

addGetPostEvents();
