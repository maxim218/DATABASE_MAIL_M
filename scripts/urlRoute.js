"use strict";

let numberOfAllQuerisOfClient = 0;

const QUESTION_CHAR = "?";
const SLASH = "/";

const U = "user";
const C = "create";
const P = "profile";
const F = "forum";
const D = "details";
const T = "threads";
const TT = "thread";
const V = "vote";
const PPP = "posts";
const UU = "users";
const PPPPP = "post";

let initDatabaseParam = false;

application.get('/*', (request, response) => {
    log("\n\n");
    log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
    numberOfAllQuerisOfClient += 1;
    log("Q_Q_Q: " + numberOfAllQuerisOfClient);
    log("GET");
    log("Location: " + request.url);

    if(request.url === "/api") {
        if(initDatabaseParam === false) {
            initDatabaseParam = true;
            send(databaseContentContentString, getEmptyArray(), (arr) => {
                responseGet(response, 200, JSON.stringify({
                    message: "Query /api OK REWRITE DB"
                }));
            });
            return null;
        } else {
            responseGet(response, 200, JSON.stringify({
                message: "Query /api OK with not rewriting db"
            }));
            return null;
        }
    }

    if(request.url === "/api/service/status") {
        findNumberOfElementsInDatabase(response);
        return null;
    }

    const y = request.url.split(QUESTION_CHAR);
    const first = y[0];
    const second = y[1];

    const parts = first.split(SLASH);

    if(parts[2] === U) {
        if(parts[4] === P) {
            studentInformation(response, parts[3]);
            return null;
        }
    }

    if(parts[2] === F) {
        if(parts[4] === D) {
            forumInformation(response, parts[3]);
            return null;
        }
    }

    if(parts[2] === F) {
        if(parts[4] === T) {
            findListOfThreads(response, parts[3], second);
            return null;
        }
    }

    if(parts[2] === TT) {
        if(parts[4] === D) {
            findInformationAboutOneThread(response, parts[3], second);
            return null;
        }
    }

    if(parts[2] === TT) {
        if(parts[4] === PPP) {
            findInformationAboutListOfPosts(response, parts[3], second);
            return null;
        }
    }

    if(parts[2] === F) {
        if(parts[4] === UU) {
            findAllUsersInTheForum(response, parts[3], second);
            return null;
        }
    }

    if(parts[2] === PPPPP) {
        if(parts[4] === D) {
            log("$$$$  POST information GET $$$$");
            findInfoAboutOnePost(response, parts[3], second);
            return null;
        }
    }
});

///////////////////////////////////////// ############################# $$$$$$$$$$$$$$$$$$$$$
///////////////////////////////////////// ############################# $$$$$$$$$$$$$$$$$$$$$
///////////////////////////////////////// ############################# $$$$$$$$$$$$$$$$$$$$$
///////////////////////////////////////// ############################# $$$$$$$$$$$$$$$$$$$$$
///////////////////////////////////////// ############################# $$$$$$$$$$$$$$$$$$$$$
///////////////////////////////////////// ############################# $$$$$$$$$$$$$$$$$$$$$
///////////////////////////////////////// ############################# $$$$$$$$$$$$$$$$$$$$$

let arrGlobal = getEmptyArray();

let emptyProc = true;

let repeatingFuncObj = setInterval(() => {
    if(arrGlobal.length > 0) {
        if(emptyProc === true) {
            emptyProc = false;
            const obj = arrGlobal[0];
            controlPostQuery(obj.request, obj.response, obj.bodyObj);
        }

        if(emptyProc === false) {
            const obj = arrGlobal[0];
            if(obj.response.finished === true) {
                arrGlobal.splice(0,1);
                emptyProc = true;
            }
        }
    }
}, 1);

function pushQueryInformationToGlobalArr(request, response, bodyObj) {
    const resObj = {
        request: request,
        response: response,
        bodyObj: bodyObj,
    };
    arrGlobal.push(resObj);
}

function controlPostQuery(request, response, bodyObj) {
    const y = request.url.split(QUESTION_CHAR);
    const first = y[0];
    const second = y[1];

    const parts = first.split(SLASH);

    if(request.url === "/api/forum/create") {
        createNewForum(response, bodyObj);
        return null;
    }

    if(parts[2] === U) {
        if(parts[4] === C) {
            registrateStudent(response, parts[3], bodyObj);
            return null;
        }
    }

    if(parts[2] === U) {
        if(parts[4] === P) {
            updateStudentInformation(response, parts[3], bodyObj);
            return null;
        }
    }

    if(parts[2] === F) {
        if(parts[4] === C) {
            createNewThread(response, parts[3], bodyObj);
            return null;
        }
    }

    if(parts[2] === TT) {
        if(parts[4] === C) {
            createNewListOfPosts(response, parts[3], bodyObj);
            return null;
        }
    }

    if(parts[2] === TT) {
        if(parts[4] === V) {
            createNewVote(response, parts[3], bodyObj);
            return null;
        }
    }

    if(parts[2] === TT) {
        if(parts[4] === D) {
            updateInformationOfOneThread(response, parts[3], bodyObj);
            return null;
        }
    }

    if(parts[2] === PPPPP) {
        if(parts[4] === D) {
            updataMessageContentOfOnePost(response, parts[3], bodyObj);
            return null;
        }
    }
}

///////////////////////////////////////// ############################# $$$$$$$$$$$$$$$$$$$$$
///////////////////////////////////////// ############################# $$$$$$$$$$$$$$$$$$$$$
///////////////////////////////////////// ############################# $$$$$$$$$$$$$$$$$$$$$
///////////////////////////////////////// ############################# $$$$$$$$$$$$$$$$$$$$$
///////////////////////////////////////// ############################# $$$$$$$$$$$$$$$$$$$$$
///////////////////////////////////////// ############################# $$$$$$$$$$$$$$$$$$$$$
///////////////////////////////////////// ############################# $$$$$$$$$$$$$$$$$$$$$

application.post('/*', (request, response) => {
    let body = "";
    request.on('data', (data) => {
        body += data;
    }).on('end', () => {
        let bodyObj = null;

        log("\n\n");
        log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
        numberOfAllQuerisOfClient += 1;
        log("Q_Q_Q: " + numberOfAllQuerisOfClient);
        log("POST");
        log("Location: " + request.url);
        log("\nBody: " + body);

        if(request.url === "/api/service/clear") {
            dropContentOfAllDataBase(response);
            return null;
        } else {
            bodyObj = JSON.parse(body);
        }

        pushQueryInformationToGlobalArr(request, response, bodyObj);
    });
});

