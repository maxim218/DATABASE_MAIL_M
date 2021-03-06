"use strict";

// // //

/**
 * print text information for debugging project
 */
function info() {
    // empty method
    // was used for printing
}

// init main constants

const COUNT = " SERIAL PRIMARY KEY";
const STRING = ' TEXT COLLATE "ucs_basic"';
const INT = " INTEGER";
const BOOL = " BOOLEAN";
const TIME = " TIMESTAMPTZ";
const DROP = "DROP TABLE IF EXISTS ";
const CREATE = "CREATE TABLE ";
const USER = "postgres";
const HOST = "localhost";
const DATABASE = "maxim_database";
const PASSWORD = "12345";
const PORT = 5432;
const DROP_INDEX = "DROP INDEX IF EXISTS index_";
const MAIN_PORT = 5000;
const ALLOW_ALL_PATH = '/*';
const MAIN_SPLIT_CHAR = "/";
const START_PARRENT_VALUE = 0;
const ARR = " INTEGER [] DEFAULT ARRAY [0]";
const FORUM = "forum";
const THREAD = "thread";
const COMMENT = "post";
const BUFFER = " ARRAY ";
const STUDENT = "student";
const POINT = ",";
const OK = 200;
const LEFT = "[";
const RIGHT = "]";
const TIMER_WAIT_TIME_PARAM = 1;
const FIRST_INDEX = 0;
const SORT_TYPE_1 = "flat";
const SORT_TYPE_2 = "tree";
const SORT_TYPE_3 = "parent_tree";

console.log("*************************************\n\n");

/**
 * generate code of SQL table
 * @param table
 * @param arr
 * @returns {string}
 */
function getTableSqlString(table, arr) {
    const buffer = [];
    const beginString = "    " + table + "_";
    arr.forEach((value) => {
        const type = value.split(".")[0];
        switch (type) {
            case "count":
                buffer.push(beginString + value.split(".")[1] + COUNT);
                break;
            case "string":
                buffer.push(beginString + value.split(".")[1] + STRING);
                break;
            case "int":
                buffer.push(beginString + value.split(".")[1] + INT);
                break;
            case "bool":
                buffer.push(beginString + value.split(".")[1] + BOOL);
                break;
            case "time":
                buffer.push(beginString + value.split(".")[1] + TIME);
                break;
            case "arr":
                buffer.push(beginString + value.split(".")[1] + ARR);
                break;
        }
    });

    const h1 = DROP + table + ";";
    const h2 = CREATE + table;
    const h3 = "(";
    const h4 = buffer.join("," + "\n");
    const h5 = ");";

    return h1 + "\n" + h2 + "\n" + h3 + "\n" + h4 + "\n" + h5 + "\n";
}

// create tables of database

const student = getTableSqlString("student", ["count.id", "string.about", "string.email", "string.fullname", "string.nickname"]);
const forum = getTableSqlString("forum", ["count.id", "int.posts", "string.slug", "int.threads", "string.title", "string.nickname"]);
const thread = getTableSqlString("thread", ["count.id", "string.author_nickname", "int.author_id", "time.created", "string.forum_slug", "int.forum_id", "string.message", "string.slug", "string.title", "int.votes"]);
const jointable = getTableSqlString("jointable", ["int.forum_id", "int.user_id"]);
const post = getTableSqlString("post", ["count.id", "string.student_nickname", "int.student_id", "time.created",
        "string.forum_slug", "int.forum_id", "bool.is_edited", "string.message", "int.parent", "int.thread_id", "int.starting_number", "arr.main_array"]);
const vote = getTableSqlString("vote", ["int.student_id", "int.voice", "int.thread_id"]);

/**
 * generate code for delete old indexes
 * @returns {string}
 */
function dropIndexes() {
    const buffer = [];
    const number = 10;
    for(let i = 0; i < 50; i++) {
        buffer.push(DROP_INDEX + i.toString() + ";");
    }
    const content = buffer.join("\n") + "\n";
    return content.toString();
}

const indexesDrop = dropIndexes();

let tablesBuffer = [
    student,
    forum,
    thread,
    jointable,
    post,
    vote,
];

const databaseTables = tablesBuffer.join("\n");

/**
 * generate code of all indexes to accelerate database working
 * @returns {string}
 */
function createIndexes() {
    const buffer = [
        "UNIQUE INDEX **** ON student (LOWER(student_email))",
        "UNIQUE INDEX **** ON student (LOWER(student_nickname))",
        "INDEX **** ON student (LOWER(student_nickname))",
        "INDEX **** ON student (LOWER(student_nickname), student_id)",
        "UNIQUE INDEX **** ON forum (LOWER(forum_slug))",
        "INDEX **** ON forum (LOWER(forum_slug))",
        "UNIQUE INDEX **** ON thread (LOWER(thread_slug))",
        "INDEX **** ON thread (LOWER(thread_slug))",
        "INDEX **** ON thread (LOWER(thread_slug), thread_id)",
        "UNIQUE INDEX **** ON jointable (jointable_forum_id, jointable_user_id)",
        "UNIQUE INDEX **** ON vote (vote_student_id, vote_thread_id)",
        "INDEX **** ON thread (LOWER(thread_slug), thread_id, thread_slug, thread_forum_slug, thread_forum_id)",
        "INDEX **** ON thread (thread_id, thread_slug, thread_forum_slug, thread_forum_id)",
        "INDEX **** ON post (post_thread_id, post_id, post_main_array)",
        "INDEX **** ON student (LOWER(student_nickname), student_id, student_nickname)",
        "INDEX **** ON thread (thread_forum_id, thread_created)",
        "INDEX **** ON jointable (jointable_forum_id)",
        "INDEX **** ON post (post_thread_id)",
        "INDEX **** ON post (post_thread_id, post_id)",
        "INDEX **** ON post (post_thread_id, post_main_array)",
        "INDEX **** ON post (post_id, post_main_array)",
        "INDEX **** ON post (post_thread_id, post_parent, post_starting_number, post_id)",
        "INDEX **** ON post (post_starting_number)",
        "INDEX **** ON post (post_starting_number, post_main_array)",
    ];

    for(let i = 0; i < buffer.length; i++) {
        const data = buffer[i].toString();
        const arr = data.split("****");
        buffer[i] = "CREATE " + arr[0].toString() + "index_" + i.toString() + arr[1].toString() + ";";
    }

    return buffer.join("\n");
}

const indexesCreate = createIndexes();

const result = indexesDrop.toString() + "\n" + databaseTables.toString() + "\n" + indexesCreate.toString();
console.log(result);

let databaseCreated = false;

/**
 * help to parse url content
 * @param part_2
 * @param value_2
 * @param part_4
 * @param value_4
 * @returns {boolean}
 */
function twoPartsService(part_2, value_2, part_4, value_4) {
    if(part_2 !== value_2) {
        return false;
    }
    return part_4 === value_4;
}

/**
 * get empty object
 * @returns {{}}
 */
function getObj() {
    return {};
}
