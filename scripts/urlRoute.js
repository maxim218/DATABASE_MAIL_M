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

const GET_POST_SLASH_STAR = '/*';

let initDatabaseParam = false;

const API_SERVISE_STATUS_CONST = "/api/service/status";
const API_FORUM_CREATE_CONST = "/api/forum/create";

////////////////////////////

application.get(GET_POST_SLASH_STAR, (request, response) => {
    console.log(request.url + "\n\n");

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

    if(request.url === API_SERVISE_STATUS_CONST) {
        findNumberOfElementsInDatabase(response);
        return null;
    }

    const y = request.url.split(QUESTION_CHAR);
    const first = y[0];
    const second = y[1];

    const parts = first.split(SLASH);

    const PART_2 = parts[2];
    const PART_3 = parts[3];
    const PART_4 = parts[4];

    if(PART_2 === U) {
        if(PART_4 === P) {
            studentInformation(response, PART_3);
            return null;
        }
    }

    if(PART_2 === F) {
        if(PART_4 === D) {
            forumInformation(response, PART_3);
            return null;
        }
    }

    if(PART_2 === F) {
        if(PART_4 === T) {
            findListOfThreads(response, PART_3, second);
            return null;
        }
    }

    if(PART_2 === TT) {
        if(PART_4 === D) {
            findInformationAboutOneThread(response, PART_3, second);
            return null;
        }
    }

    if(PART_2 === TT) {
        if(PART_4 === PPP) {
            findInformationAboutListOfPosts(response, PART_3, second);
            return null;
        }
    }

    if(PART_2 === F) {
        if(PART_4 === UU) {
            findAllUsersInTheForum(response, PART_3, second);
            return null;
        }
    }

    if(PART_2 === PPPPP) {
        if(PART_4 === D) {
            findInfoAboutOnePost(response, PART_3, second);
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

const TIMER_WAIT_TIME_PARAM = 1;

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
}, TIMER_WAIT_TIME_PARAM);

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

    const PART_2 = parts[2];
    const PART_3 = parts[3];
    const PART_4 = parts[4];

    if(request.url === API_FORUM_CREATE_CONST) {
        createNewForum(response, bodyObj);
        return null;
    }

    if(PART_2 === U) {
        if(PART_4 === C) {
            registrateStudent(response, PART_3, bodyObj);
            return null;
        }
    }

    if(PART_2 === U) {
        if(PART_4 === P) {
            updateStudentInformation(response, PART_3, bodyObj);
            return null;
        }
    }

    if(PART_2 === F) {
        if(PART_4 === C) {
            createNewThread(response, PART_3, bodyObj);
            return null;
        }
    }

    if(PART_2 === TT) {
        if(PART_4 === C) {
            createNewListOfPosts(response, PART_3, bodyObj);
            return null;
        }
    }

    if(PART_2 === TT) {
        if(PART_4 === V) {
            createNewVote(response, PART_3, bodyObj);
            return null;
        }
    }

    if(PART_2 === TT) {
        if(PART_4 === D) {
            updateInformationOfOneThread(response, PART_3, bodyObj);
            return null;
        }
    }

    if(PART_2 === PPPPP) {
        if(PART_4 === D) {
            updataMessageContentOfOnePost(response, PART_3, bodyObj);
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

application.post(GET_POST_SLASH_STAR, (request, response) => {
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

        /*
        const y = request.url.split(QUESTION_CHAR);
        const first = y[0];
        const second = y[1];
        */

        pushQueryInformationToGlobalArr(request, response, bodyObj);
    });
});

