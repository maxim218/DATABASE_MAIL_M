"use strict";

function info(information) {
    console.log(information);
}

function str(obj) {
    return JSON.stringify(obj);
}

function obj(string) {
    return JSON.parse(string);
}

const pg = require('pg');

const connectParamsObj = {};

connectParamsObj["user"] = USER;
connectParamsObj["host"] = HOST;
connectParamsObj["database"] = DATABASE;
connectParamsObj["password"] = PASSWORD;
connectParamsObj["port"] =  PORT;

const connectObj = new pg.Pool(connectParamsObj);

function database(queryContentString) {
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

function answer(response, code, content) {
    info("code: " + code);
    info("result: " + content);
    response.status(code);
    response.end(content);
}

