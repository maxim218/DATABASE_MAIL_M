"use strict";

function responseGet(response, code, contentStringParam) {
    log("\n");
    response.status(code);
    log("Response: " + contentStringParam);
    response.end(contentStringParam);
}

function responsePost(response, code, contentStringParam) {
    log("\n");
    response.status(code);
    log("Response: " + contentStringParam);
    response.end(contentStringParam);
}
