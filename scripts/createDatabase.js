"use strict";

const functionsDataBase = fs.readFileSync('./functions.sql', 'utf8').toString();

function createTable(tableName, fieldsArray) {
    let type = "";
    type += "DROP TYPE IF EXISTS " + tableName + "_type CASCADE; \n";
    type += "CREATE TYPE " + tableName + "_type AS \n";

    let body = "";
    body = body + "DROP TABLE IF EXISTS " + tableName + "; \n";
    body = body + "CREATE TABLE IF NOT EXISTS " + tableName + " \n";
    body = body + "( \n";
    type = type + "( \n";
    fieldsArray.forEach((fieldObj) => {
        if(fieldObj.type === "P") {
            const data = "  " + tableName + "_" + fieldObj.name + " SERIAL PRIMARY KEY, \n";
            body += data.toString();
            const dataType = "  " + tableName + "_" + fieldObj.name + " INTEGER, \n";
            type += dataType.toString();
        }

        if(fieldObj.type === "T") {
            const data = "  " + tableName + "_" + fieldObj.name + ' TEXT COLLATE "ucs_basic", ' + " \n";
            body += data.toString();
            type += data.toString();
        }

        if(fieldObj.type === "I") {
            const data = "  " + tableName + "_" + fieldObj.name + ' INTEGER, ' + " \n";
            body += data.toString();
            type += data.toString();
        }
    });

    const data = "  " + tableName + "_" + "flag " + "BOOLEAN \n); \n";
    body += data.toString();
    type += data.toString();

    body = "\n" + body + "\n" + type + "\n";

    return body;
}

const students = createTable("student", [
    {
        name: "id",
        type: "P",
    }, {
        name: "about",
        type: "T",
    }, {
        name: "email",
        type: "T",
    }, {
        name: "fullname",
        type: "T",
    }, {
        name: "nickname",
        type: "T",
    }
]);

const forums = createTable("forum", [
    {
        name: "id",
        type: "P",
    }, {
        name: "posts",
        type: "I",
    }, {
        name: "slug",
        type: "T",
    }, {
        name: "threads",
        type: "I",
    }, {
        name: "title",
        type: "T",
    }, {
        name: "user_nickname",
        type: "T",
    }, {
        name: "user_id",
        type: "I"
    }
]);

const databaseContentArray = [];

databaseContentArray.push(students);
databaseContentArray.push(forums);
databaseContentArray.push(functionsDataBase);

const databaseContentContentString = databaseContentArray.join("\n");

log(databaseContentContentString);
