"use strict";

const functionsDataBase = fs.readFileSync('./functions.sql', 'utf8').toString();

const dropIndexesText = getDropIndexes();
const createIndexesText = getCreateIndexes();

cout(dropIndexesText);

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

        if(fieldObj.type === "Q") {
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

        if(fieldObj.type === "D") {
            const data = "  " + tableName + "_" + fieldObj.name + ' TIMESTAMPTZ, ' + " \n";
            body += data.toString();
            type += data.toString();
        }

        if(fieldObj.type === "B") {
            const data = "  " + tableName + "_" + fieldObj.name + ' BOOLEAN, ' + " \n";
            body += data.toString();
            type += data.toString();
        }

        if(fieldObj.type === "A") {
            const data = "  " + tableName + "_" + fieldObj.name + ' INTEGER [] DEFAULT ARRAY [0], ' + " \n";
            body += data.toString();
            const dataType = "  " + tableName + "_" + fieldObj.name + ' INTEGER [], ' + " \n";
            type += dataType.toString();
        }
    });

    const data = "  " + tableName + "_" + "flag " + "BOOLEAN \n); \n";
    body += data.toString();
    type += data.toString();

    cout(body);

    body = "\n" + " " + "\n" + body + "\n" + " " + "\n\n" + type + "\n";

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

const threads = createTable("thread", [
    {
        name: "id",
        type: "Q",
    }, {
        name: "author_nickname",
        type: "T",
    }, {
        name: "author_id",
        type: "I",
    }, {
        name: "created",
        type: "D",
    }, {
        name: "forum_slug",
        type: "T",
    }, {
        name: "forum_id",
        type: "I",
    }, {
        name: "message",
        type: "T",
    }, {
        name: "slug",
        type: "T",
    }, {
        name: "title",
        type: "T",
    }, {
        name: "votes",
        type: "I",
    }
]);

const pairs = createTable("pair", [
    {
        name: "id",
        type: "P",
    }, {
        name: "student_id",
        type: "I",
    }, {
        name: "forum_id",
        type: "I",
    }
]);

const posts = createTable("post", [
    {
        name: "id",
        type: "Q",
    }, {
        name: "student_nickname",
        type: "T",
    }, {
        name: "student_id",
        type: "I",
    }, {
        name: "created",
        type: "D",
    }, {
        name: "forum_slug",
        type: "T",
    }, {
        name: "forum_id",
        type: "I",
    }, {
        name: "is_edited",
        type: "B",
    }, {
        name: "message",
        type: "T",
    }, {
        name: "parent",
        type: "I",
    }, {
        name: "thread_id",
        type: "I",
    }, {
        name: "starting_number",
        type: "I",
    }, {
        name: "main_array",
        type: "A",
    }
]);

const votes = createTable("vote", [
    {
        name: "id",
        type: "P",
    },
    {
        name: "nickname",
        type: "T",
    }, {
        name: "voice",
        type: "I",
    }, {
        name: "thread_id",
        type: "I",
    }
]);

const databaseContentArray = [];

databaseContentArray.push(students);
databaseContentArray.push(forums);
databaseContentArray.push(threads);
databaseContentArray.push(pairs);
databaseContentArray.push(posts);
databaseContentArray.push(votes);
databaseContentArray.push(functionsDataBase);

const databaseContentContentString = dropIndexesText + databaseContentArray.join("\n") + createIndexesText;

cout(createIndexesText);
