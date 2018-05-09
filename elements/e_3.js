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

const NUMBERS = "1234567890";

const NO = -1;

function getYes() {
    return true;
}

function getNo() {
    return false;
}

function onlyNumbers(stringContentParam) {
    for(let i = 0; i < stringContentParam.length; ++i) {
        const stringElement = stringContentParam.charAt(i);
        if(NUMBERS.indexOf(stringElement) === NO) {
            return getNo();
        }
    }
    return getYes();
}

const URL_SPLITTER = "&";
const EQUAL_CHAR = "=";

function wordsArray(stringContentParam) {
    if(stringContentParam) {
        const wordsObject = getObj();
        const a = stringContentParam.split(URL_SPLITTER);
        a.forEach((element) => {
            const q = element.toString().split(EQUAL_CHAR);
            const w1 = q[0];
            const w2 = q[1];
            wordsObject[w1] = decodeURIComponent(w2);
        });
        return wordsObject;
    } else {
        return {};
    }
}

function getSince(argumentsArr) {
    let since = null;
    if(argumentsArr["since"]) {
        since = argumentsArr["since"];
    }
    return since;
}

function getLimit(argumentsArr) {
    let limit = null;
    if(argumentsArr["limit"]) {
        limit = argumentsArr["limit"];
    }
    return limit;
}

function getSort(argumentsArr) {
    let sortingString = "ASC";
    if(argumentsArr["desc"] === "true") {
        sortingString = "DESC";
    }
    return sortingString;
}

function makeDouble(resultArray, buffer) {
    buffer.forEach((element) => {
        resultArray.push(element);
    });
}

function includeString(bigString, littleString) {
    return bigString.indexOf(littleString) !== NO;
}
