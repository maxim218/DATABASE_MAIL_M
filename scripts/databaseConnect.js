"use strict";

const pg = require("pg");

const pool = new pg.Pool(mainConfigObj.database);

pool.on("error", function(error, obj) {
    // error of pool
});

function send(content, arr, foo) {
    pool.query(content, arr, function(error, res) {
        if(error) {
            log("Database error: " + error);
        }

        foo(res.rows[0]);
    });
}
