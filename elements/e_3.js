"use strict";

let application = require("express")();

/**
 * print query GET information
 * @param request
 */
function printGetQueryInfo(request) {
    info("\n");
    info("************************************");
    info("method ** GET");
    info("path ** " + request.url);
}

/**
 * print query POST information
 * @param request
 */
function printPostQueryInfoPost(request) {
    info("\n");
    info("************************************");
    info("method ^^ POST");
    info("path ^^ " + request.url);
}

/**
 * header for client init
 * @param response
 */
function allowAll(response) {
    response.header("Access-Control-Allow-Origin", "*");
}

/**
 * sending header to client
 */
application.use(function(request, response, next) {
    allowAll(response);
    next();
});

/**
 * run the application
 */
function startMainServer() {
    const portValueInt = process.env.PORT || MAIN_PORT;
    application.listen(portValueInt);
    console.log("\n\n");
    console.log("Port: " + portValueInt);
    console.log("\n\n");
}

startMainServer();

/**
 * catch GET queries
 * @param application
 */
function incGetEvent(application) {
    application.get(ALLOW_ALL_PATH, (request, response) => {
        printGetQueryInfo(request);
        getQuery(request, response);
    });
}

/**
 * catch POST queries
 * @param application
 */
function incPostEvent(application) {
    application.post(ALLOW_ALL_PATH, (request, response) => {
        printPostQueryInfoPost(request);
        postQuery(request, response);
    });
}

/**
 * catch all queries
 */
function addGetPostEvents() {
    incGetEvent(application);
    incPostEvent(application);
}

addGetPostEvents();

const NUMBERS = "1234567890";

const NO = -1;

/**
 * get 1 (for debug)
 * @returns {boolean}
 */
function getYes() {
    return true;
}

/**
 * get 0 (f0r debug)
 * @returns {boolean}
 */
function getNo() {
    return false;
}

/**
 * control slug or id of thread
 * @param stringContentParam
 * @returns {boolean}
 */
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

/**
 * parse variables in url
 * @param stringContentParam
 * @returns {{}}
 */
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

/**
 * get since variable
 * @param argumentsArr
 * @returns {*}
 */
function getSince(argumentsArr) {
    let since = null;
    if(argumentsArr["since"]) {
        since = argumentsArr["since"];
    }
    return since;
}

/**
 * get limit variable
 * @param argumentsArr
 * @returns {*}
 */
function getLimit(argumentsArr) {
    let limit = null;
    if(argumentsArr["limit"]) {
        limit = argumentsArr["limit"];
    }
    return limit;
}

/**
 * get sort variable
 * @param argumentsArr
 * @returns {string}
 */
function getSort(argumentsArr) {
    let sortingString = "ASC";
    if(argumentsArr["desc"] === "true") {
        sortingString = "DESC";
    }
    return sortingString;
}

/**
 * duplicate integer arrays
 * @param resultArray
 * @param buffer
 */
function makeDouble(resultArray, buffer) {
    buffer.forEach((element) => {
        resultArray.push(element);
    });
}

/**
 * find the word in string
 * @param bigString
 * @param littleString
 * @returns {boolean}
 */
function includeString(bigString, littleString) {
    return bigString.indexOf(littleString) !== NO;
}
