

// ********************************
// element 1

"use strict";

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

console.log("*************************************\n\n");

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
        }
    });

    const h1 = DROP + table + ";";
    const h2 = CREATE + table;
    const h3 = "(";
    const h4 = buffer.join("," + "\n");
    const h5 = ");";

    return h1 + "\n" + h2 + "\n" + h3 + "\n" + h4 + "\n" + h5 + "\n";
}

const student = getTableSqlString("student", ["count.id", "string.about", "string.email", "string.fullname", "string.nickname"]);
const forum = getTableSqlString("forum", ["count.id", "int.posts", "string.slug", "int.threads", "string.title", "string.nickname"]);
const thread = getTableSqlString("thread", ["count.id", "string.author_nickname", "int.author_id", "time.created", "string.forum_slug", "int.forum_id", "string.message", "string.slug", "string.title", "int.votes"]);
const jointable = getTableSqlString("jointable", ["int.forum_id", "int.user_id"]);

function dropIndexes() {
    const buffer = [];
    const number = 10;
    for(let i = 0; i < 15; i++) {
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
];

const databaseTables = tablesBuffer.join("\n");

function createIndexes() {
    const buffer = [
        "UNIQUE INDEX **** ON student (LOWER(student_email))",
        "UNIQUE INDEX **** ON student (LOWER(student_nickname))",
        "INDEX **** ON student (LOWER(student_nickname))",
        "UNIQUE INDEX **** ON forum (LOWER(forum_slug))",
        "INDEX **** ON forum (LOWER(forum_slug))",
        "UNIQUE INDEX **** ON thread (LOWER(thread_slug))",
        "INDEX **** ON thread (LOWER(thread_slug))",
        "UNIQUE INDEX **** ON jointable (jointable_forum_id, jointable_user_id)",
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

function getObj() {
    return {};
}





// ********************************
// element 2

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

function answer(response, code, content) {
    info("code: " + code);
    info("result: " + content);
    response.status(code);
    response.end(content);
}

function makeCreated() {
    return new Date().toISOString().toString();
}





// ********************************
// element 3

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







// ********************************
// element 4

"use strict";

let databaseCreated = false;

function getQuery(request, response) {
    if(request.url === "/api") {
        if(databaseCreated === false) {
            databaseCreated = true;
            database(result)
                .then((p) => {
                    answer(response, 200, str({
                        message: "welcome",
                    }));
                });
        } else {
            answer(response, 200, str({
                message: "welcome",
            }));
        }
        return null;
    }

    const arr = request.url.split("?");
    const a0 = arr[0] + "";
    const a1 = arr[1] + "";

    const parts = a0.split(MAIN_SPLIT_CHAR);
    const part_2 = parts[2];
    const part_3 = parts[3];
    const part_4 = parts[4];

    const argumentsArr = wordsArray(a1);

    if(part_2 === "user" && part_4 === "profile") tryToGetInformationAboutUserInDatabase(request, response, part_3);
    if(part_2 === "forum" && part_4 === "details") tryToGetForumInformation(request, response, part_3);
    if(part_2 === "forum" && part_4 === "threads") tryToGetForumThreadsList(request, response, part_3, argumentsArr);
}

function postQuery(request, response) {
    const dataArr = [];
    request.on('data', (data) => {
        dataArr.push(data.toString());
    }).on('end', () => {
        const mainObj = obj(dataArr.join(""));

        if(request.url === "/api/forum/create") {
            tryToAddNewForumOfStudentToDatabase(request, response, mainObj);
            return null;
        }

        const parts = request.url.split(MAIN_SPLIT_CHAR);
        const part_2 = parts[2];
        const part_3 = parts[3];
        const part_4 = parts[4];

        if(part_2 === "user" && part_4 === "create") tryToAddUserToDatabase(request, response, mainObj, part_3);
        if(part_2 === "user" && part_4 === "profile") tryToUpdateInformationAboutUser(request, response, mainObj, part_3);
        if(part_2 === "forum" && part_4 === "create") tryToCreateThreadInForum(request, response, mainObj, part_3);

    });
}




// ********************************
// element 5

"use strict";

function updateUserQuery(mainObj, part_3) {
    const buffer = [];
    buffer.push("UPDATE student SET student_id = student_id + 0");
    if(mainObj.about) {
        buffer.push("student_about = '" + mainObj.about + "'");
    }
    if(mainObj.email) {
        buffer.push("student_email = '" + mainObj.email + "'");
    }
    if(mainObj.fullname) {
        buffer.push("student_fullname = '" + mainObj.fullname + "'");
    }
    let part = buffer.join(" , ");
    part = part + " WHERE LOWER(student_nickname) = LOWER('" + part_3 + "');";
    return part;
}

function selectOneUserQuery(part_3) {
    const buffer = [];
    buffer.push("SELECT * FROM student");
    buffer.push("WHERE LOWER(student_nickname) = LOWER('" + part_3 + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function getOneStudentFromArr(p) {
    const arr = [];
    p.rows.forEach((element) => {
        arr.push({
            about: element.student_about,
            email: element.student_email,
            fullname: element.student_fullname,
            nickname: element.student_nickname,
        });
    });
    return arr[0];
}

function tryToUpdateInformationAboutUserAfterControlUserExists(request, response, mainObj, part_3) {
    const part = updateUserQuery(mainObj, part_3);
    database(part)
        .then((p) => {
            if(p.err) {
                answer(response, 409, str({
                    message: part_3,
                }));
            } else {
                database(selectOneUserQuery(part_3))
                    .then((p) => {
                        const data = getOneStudentFromArr(p);
                        answer(response, 200, str(data));
                    });
            }
        });
}

function getStudentCountFromArr(part_3) {
    const buffer = [];
    buffer.push("SELECT COUNT(*) FROM student WHERE");
    buffer.push("LOWER(student_nickname) = LOWER('" + part_3 + "');");
    return buffer.join(" ");
}

function tryToUpdateInformationAboutUser(request, response, mainObj, part_3) {
    database(getStudentCountFromArr(part_3))
        .then((p) => {
            const count = parseInt(p.rows[0].count);
            if(!count) {
                answer(response, 404, str({
                    message: part_3,
                }));
            } else {
                tryToUpdateInformationAboutUserAfterControlUserExists(request, response, mainObj, part_3);
            }
        });
}

function getOneStudentFromArray(part_3) {
    const buffer = [];
    buffer.push("SELECT * FROM student WHERE");
    buffer.push("LOWER(student_nickname) = LOWER('" + part_3 + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function getInfoOneStudentFromArr(p, response) {
    const arr = [];
    p.rows.forEach((element) => {
        arr.push({
            about: element.student_about,
            email: element.student_email,
            fullname: element.student_fullname,
            nickname: element.student_nickname,
        });
    });
    answer(response, 200, str(arr[0]));
}

function tryToGetInformationAboutUserInDatabase(request, response, part_3) {
    database(getOneStudentFromArray(part_3))
        .then((p) => {
           if(p.rows.length) {
               getInfoOneStudentFromArr(p, response);
           } else {
               answer(response, 404, str({
                   message: part_3,
               }))
           }
        });
}

function insertStudentQuery(mainObj, part_3) {
    const buffer = [];
    buffer.push("INSERT INTO student (student_about, student_email, ");
    buffer.push("student_fullname, student_nickname) VALUES (");
    let arr = [mainObj.about, mainObj.email, mainObj.fullname, part_3];
    arr = arr.map((value) => {
        return "'" + value + "'";
    });
    buffer.push(arr.join(","));
    buffer.push(");");
    return buffer.join("");
}

function getConflictStudentsQuery(mainObj, part_3) {
    const buffer = [];
    buffer.push("SELECT * FROM student WHERE ");
    buffer.push("LOWER(student_email) = LOWER('" + mainObj.email + "')");
    buffer.push("OR");
    buffer.push("LOWER(student_nickname) = LOWER('" + part_3 + "')");
    buffer.push("LIMIT 2;");
    return buffer.join(" ");
}

function sendConflictStudents(p, response) {
    const arr = [];
    p.rows.forEach((element) => {
        arr.push({
            about: element.student_about,
            email: element.student_email,
            fullname: element.student_fullname,
            nickname: element.student_nickname,
        });
    });
    answer(response, 409, str(arr));
}

function tryToAddUserToDatabase(request, response, mainObj, part_3) {
    database(insertStudentQuery(mainObj, part_3) )
        .then((p) => {
            if(p.err) {
                database(getConflictStudentsQuery(mainObj, part_3))
                    .then((p) => {
                        sendConflictStudents(p, response);
                    });
            } else {
                answer(response, 201, str({
                    about: mainObj.about,
                    email: mainObj.email,
                    fullname: mainObj.fullname,
                    nickname: part_3,
                }));
            }
        })
}





// ********************************
// element 6

"use strict";

function getTheOneStudentQuery(mainObj) {
    const buffer = [];
    buffer.push("SELECT student_nickname FROM student WHERE");
    buffer.push("LOWER(student_nickname) = LOWER('" + mainObj.user + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function tryToAddNewForumOfStudentToDatabase(request, response, mainObj) {
    database(getTheOneStudentQuery(mainObj))
        .then((p) => {
            if(!p.rows.length) {
                answer(response, 404, str({
                    message: mainObj.user,
                }));
            } else {
                insertForumOfStudentToDatabase(request, response, mainObj, p.rows[0].student_nickname);
            }
        });
}

function addStudentForumInDatabaseQuery(mainObj, student) {
    const buffer = [];
    buffer.push("INSERT INTO forum");
    buffer.push("(forum_posts, forum_slug, forum_threads, forum_title, forum_nickname)");
    buffer.push("VALUES (0, '" + mainObj.slug + "', 0, '" + mainObj.title + "', '" + student + "');");
    return buffer.join(" ");
}

function getObjOneForumOfStudentQuery(mainObj) {
    const buffer = [];
    buffer.push("SELECT * FROM forum");
    buffer.push("WHERE LOWER(forum_slug) = LOWER('" + mainObj.slug + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function insertForumOfStudentToDatabase(request, response, mainObj, student) {
    database(addStudentForumInDatabaseQuery(mainObj, student))
        .then((p) => {
            if(!p.err) {
                answer(response, 201, str({
                    posts: 0,
                    slug: mainObj.slug,
                    threads: 0,
                    title: mainObj.title,
                    user: student,

                }));
            } else {
                database(getObjOneForumOfStudentQuery(mainObj))
                    .then((p) => {
                        const data = p.rows[0];
                        answer(response, 409, str({
                           posts: data.forum_posts,
                           slug: data.forum_slug,
                           threads: data.forum_threads,
                           title: data.forum_title,
                           user: data.forum_nickname,
                        }));
                    });
            }
        })
}

function tryOneForumBySlugValue(part_3) {
    const buffer = [];
    buffer.push("SELECT * FROM forum");
    buffer.push("WHERE LOWER(forum_slug) = LOWER('" + part_3 + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function tryToGetForumInformation(request, response, part_3) {
    database(tryOneForumBySlugValue(part_3))
        .then((p) => {
            if(!p.rows.length) {
                answer(response, 404, str({
                    message: part_3,
                }));
            } else {
                const data = p.rows[0];
                answer(response, 200, str({
                    posts: data.forum_posts,
                    slug: data.forum_slug,
                    threads: data.forum_threads,
                    title: data.forum_title,
                    user: data.forum_nickname,
                }));
            }
        })
}





// ********************************
// element 7

"use strict";

let threadCounter = 42;

function tryToGetOneStudentForThread(mainObj) {
    const buffer = [];
    buffer.push("SELECT student_id, student_nickname FROM student");
    buffer.push("WHERE LOWER(student_nickname) = LOWER('" + mainObj.author + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function tryToCreateThreadInForum(request, response, mainObj, part_3) {
    database(tryToGetOneStudentForThread(mainObj))
        .then((p) => {
            if(!p.rows.length) {
                answer(response, 404, str({
                    message: mainObj.author,
                }));
            } else {
                tryToCreateThreadInForumPartTwo(request, response, mainObj, part_3, {
                    id: p.rows[0].student_id,
                    nickname: p.rows[0].student_nickname,
                });
            }
        });
}

function beSureExistsForumQuery(part_3) {
    const buffer = [];
    buffer.push("SELECT forum_id, forum_slug FROM forum");
    buffer.push("WHERE LOWER(forum_slug) = LOWER('" + part_3 + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function tryToCreateThreadInForumPartTwo(request, response, mainObj, part_3, user) {
    database(beSureExistsForumQuery(part_3))
        .then((p) => {
           if(!p.rows.length) {
               answer(response, 404, str({
                   message: part_3,
               }));
           } else {
               tryToCreateThreadInForumPartThree(request, response, mainObj, part_3, user, {
                   id: p.rows[0].forum_id,
                   slug: p.rows[0].forum_slug,
               })
           }
        });
}

function tryToCreateThreadInForumPartThree(request, response, mainObj, part_3, user, forum) {
    threadCounter++;

    if(!mainObj.created) {
        mainObj.created = makeCreated();
    }

    if(!mainObj.slug) {
        mainObj.slug = threadCounter.toString();
    }

    const buffer = [];
    buffer.push("INSERT INTO thread (thread_id, thread_author_nickname, thread_author_id, thread_created,");
    buffer.push("thread_forum_slug, thread_forum_id, thread_message, thread_slug, thread_title, thread_votes)");
    buffer.push("VALUES (");
    const arr = [
        threadCounter,
        "'" + user.nickname + "'",
        user.id,
        "'" + mainObj.created + "'",
        "'" + forum.slug + "'",
        forum.id,
        "'" + mainObj.message + "'",
        "'" + mainObj.slug + "'",
        "'" + mainObj.title + "'",
        0,
    ];
    buffer.push(arr.join(","));
    buffer.push(");");
    const bufferStrQuery = buffer.join(" ");

    database(bufferStrQuery)
        .then((p) => {
           if(p.err) {
                database(getConflictThreadData(mainObj))
                    .then((p) => {
                        const thread = p.arr[0];
                        const threadResult = {
                            author: thread.thread_author_nickname,
                            created: thread.thread_created,
                            forum: thread.thread_forum_slug,
                            id: thread.thread_id,
                            message: thread.thread_message,
                            title: thread.thread_title,
                            votes: thread.thread_votes,
                        };
                        if(onlyNumbers(thread.thread_slug) === false) {
                            threadResult.slug = thread.thread_slug;
                        }
                        answer(response, 409, str(threadResult));
                    });
           } else {
               info("Insert Thread OK");
               tryToCreateThreadInForumPartFourLast(request, response, mainObj, part_3, user, forum);
           }
        });
}

function getConflictThreadData(mainObj) {
    const buffer = [];
    buffer.push("SELECT * FROM thread");
    buffer.push("WHERE LOWER(thread_slug) = LOWER('" + mainObj.slug + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function incrementOfPostNumberInForumQuery(forum) {
    const buffer = [];
    buffer.push("UPDATE forum SET");
    buffer.push("forum_threads = forum_threads + 1");
    buffer.push("WHERE forum_id = " +  forum.id + ";");
    return buffer.join(" ");
}

function addToJoinTablePair(forum, user) {
    const buffer = [];
    buffer.push("INSERT INTO jointable");
    buffer.push("(jointable_forum_id, jointable_user_id)");
    buffer.push("VALUES(" + forum.id + "," +  user.id + ");");
    return buffer.join(" ");
}

function tryToCreateThreadInForumPartFourLast(request, response, mainObj, part_3, user, forum) {
    info("end function");
    database(incrementOfPostNumberInForumQuery(forum))
        .then((p1) => {
            database(addToJoinTablePair(forum, user))
                .then((p2) => {
                   database(getConflictThreadData(mainObj))
                       .then((p) => {
                           info("BEGIN end of big function");
                           const thread = p.rows[0];
                           const threadResult = {
                               author: thread.thread_author_nickname,
                               created: thread.thread_created,
                               forum: thread.thread_forum_slug,
                               id: thread.thread_id,
                               message: thread.thread_message,
                               title: thread.thread_title,
                               votes: thread.thread_votes,
                           };
                           if(onlyNumbers(thread.thread_slug) === false) {
                               threadResult.slug = thread.thread_slug;
                           }
                           info("END end of big function");
                           answer(response, 201, str(threadResult));
                       });
                });
        });
}

function getInformationOneForumSlugId(part_3) {
    const buffer = [];
    buffer.push("SELECT forum_id, forum_slug FROM forum");
    buffer.push("WHERE LOWER(forum_slug) = LOWER('" + part_3 + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function tryToGetForumThreadsList(request, response, part_3, argumentsArr) {
    database(getInformationOneForumSlugId(part_3))
        .then((p) => {
           if(!p.rows.length) {
               answer(response, 404, str({
                   message: part_3,
               }))
           } else {
               tryToGetForumThreadsListPartTwo(request, response, part_3, argumentsArr, {
                   id: p.rows[0].forum_id,
                   slug: p.rows[0].forum_slug,
               });
           }
        });
}

function tryToGetForumThreadsListPartTwo(request, response, part_3, argumentsArr, forum) {
    const since = getSince(argumentsArr);
    const vector = getSort(argumentsArr);
    const buffer = [];
    buffer.push("SELECT * FROM thread");
    buffer.push("WHERE thread_forum_id = " + forum.id + " ");
    if(since) {
        if(vector === "ASC") {
            buffer.push("AND thread_created >= '" + since + "' ");
        } else {
            buffer.push("AND thread_created <= '" + since + "' ");
        }
    }
    buffer.push(" ORDER BY thread_created " + vector + " ");
    const limit = getLimit(argumentsArr);
    if(limit) {
        buffer.push("LIMIT " + limit);
    }
    buffer.push(" ; ");
    const bufferQuery = buffer.join(" ");
    database(bufferQuery)
        .then((p) => {
            const arr = [];
            p.rows.forEach((element) => {
                const thread = {
                    author: element.thread_author_nickname,
                    created: element.thread_created,
                    forum: element.thread_forum_slug,
                    id: element.thread_id,
                    message: element.thread_message,
                    title: element.thread_title,
                    votes: element.thread_votes,
                };

                if(onlyNumbers(element.thread_slug) === false) {
                    thread.slug = element.thread_slug;
                }

                arr.push(thread);
            });

            answer(response, 200, str(arr));
        });
}