"use strict";

const LITTLE_LINE = "_";

function findNumberOfElementsInDatabase(response) {
    send("SELECT * FROM find_number_of_elements_in_database();", [], (obj) => {
        const paramsSting = obj.find_number_of_elements_in_database;
        let arr = paramsSting.split(LITTLE_LINE);
        arr = arr.map((x) => {
           return parseInt(x);
        });
        responseGet(response, 200, JSON.stringify({
            forum: arr[1],
            post: arr[2],
            thread: arr[3],
            user: arr[4]
        }));
    });
}

function dropContentOfAllDataBase(response) {
    send(databaseContentContentString, getEmptyArray(), (obj) => {
        responsePost(response, 200, JSON.stringify({
            message: "Rewrite database OK"
        }));
    });
}
