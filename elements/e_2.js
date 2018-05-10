"use strict";

/**
 * get JSON string from simple object
 * @param obj
 * @returns {string}
 */
function str(obj) {
    return JSON.stringify(obj);
}

/**
 * get object from JSON string (for parsing body of query from client)
 * @param string
 * @returns {any}
 */
function obj(string) {
    return JSON.parse(string);
}

const pg = require('pg');

const connectParamsObj = {};

// params for database

connectParamsObj["user"] = USER;
connectParamsObj["host"] = HOST;
connectParamsObj["database"] = DATABASE;
connectParamsObj["password"] = PASSWORD;
connectParamsObj["port"] =  PORT;

const connectObj = new pg.Pool(connectParamsObj);

/**
 * send SQL query to database
 * @param queryContentString
 * @returns {Promise<any>}
 */
function database(queryContentString) {
    info("Query: " + queryContentString);
    return new Promise((resolve) => {
        connectObj.query(queryContentString, [], (err, ok) => {
            if (err) {
                info("Database error");
                info(err);
                resolve({
                   err: err,
                });
            } else {
                info("Database ok");
                resolve({
                    rows: ok.rows
                });
            }
        });
    });
}

/**
 * send result to client
 * @param response
 * @param code
 * @param content
 */
function answer(response, code, content) {
    info("code: " + code);
    info("result: " + content);
    response.status(code);
    response.end(content);
}

/**
 * get date in timestamp with zone format
 * @returns {string}
 */
function makeCreated() {
    return new Date().toISOString().toString();
}
