"use strict";

////////////////////////////////////////

// Modify queue

////////////////////////////////////////

/**
 * get array (for debug)
 * @returns {Array}
 */
function getEmptyArray() {
    return [];
}

/**
 * catch Get queries and call functions
 * @param request
 * @param response
 * @returns {null}
 */
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

    if(request.url === "/api/service/status") {
        functionGetNumberCountOfStudentForumPostThreadSevice(request, response);
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

    if(twoPartsService(part_2,"user",part_4,"profile")) {
        tryToGetInformationAboutUserInDatabase(request, response, part_3);
        return null;
    }

    if(twoPartsService(part_2,"forum",part_4,"details")) {
        tryToGetForumInformation(request, response, part_3);
        return null;
    }

    if(twoPartsService(part_2,"forum",part_4,"threads")) {
        tryToGetForumThreadsList(request, response, part_3, argumentsArr);
        return null;
    }

    if(twoPartsService(part_2,"thread",part_4,"details")) {
        tryToGetFullInformationAboutOneThread(request, response, part_3);
        return null;
    }

    if(twoPartsService(part_2,"thread",part_4,"posts")) {
        tryToGetListOfPostsFlatThreeParentThree(request, response, part_3, argumentsArr);
        return null;
    }

    if(twoPartsService(part_2,"forum",part_4,"users")) {
        tryToGetAllStudentsThatHaveBranchPrPostInTheForum(request, response, part_3, argumentsArr);
        return null;
    }

    if(twoPartsService(part_2,"post",part_4,"details")) {
        tryToGetInformationAboutOnePostSimple(request, response, part_3, argumentsArr);
        return null;
    }
}

// queue
let arrGlobal = getEmptyArray();
let emptyProc = true;

/**
 * push the query to queue
 * @param request
 * @param response
 * @param bodyObj
 */
function pushQueryInformationToGlobalArr(request, response, bodyObj) {
    const resObj = {
        request: request,
        response: response,
        bodyObj: bodyObj,
    };
    arrGlobal.push(resObj);
}

setInterval(() => {
    if(arrGlobal.length) {
        if(emptyProc) {
            emptyProc = false;
            const mainObj = arrGlobal[0];
            postQueryExe(mainObj.request, mainObj.response, mainObj.bodyObj);
        }

        if(!emptyProc) {
            const mainObj = arrGlobal[0];
            if(mainObj.response.finished) {
                arrGlobal.splice(0,1);
                emptyProc = true;
            }
        }
    }
}, TIMER_WAIT_TIME_PARAM);

/**
 * catch Post query and save it to queue
 * @param request
 * @param response
 */
function postQuery(request, response) {
    if(request.url === "/api/service/clear") {
        pushQueryInformationToGlobalArr(request, response, getObj());
    } else {
        const dataArr = [];
        request.on('data', (data) => {
            dataArr.push(data.toString());
        }).on('end', () => {
            const mainObj = obj(dataArr.join(""));
            pushQueryInformationToGlobalArr(request, response, mainObj);
        });
    }
}

/**
 * catch Post queries and call functions
 * @param request
 * @param response
 * @param mainObj
 * @returns {null}
 */
function postQueryExe(request, response, mainObj) {
    if(mainObj) {
        if (request.url === "/api/service/clear") {
            database(result)
                .then((p) => {
                    answer(response, 200, str({
                        message: "welcome service",
                    }));
                });
            return null;
        }

        if (request.url === "/api/forum/create") {
            tryToAddNewForumOfStudentToDatabase(request, response, mainObj);
            return null;
        }

        const parts = request.url.split(MAIN_SPLIT_CHAR);
        const part_2 = parts[2];
        const part_3 = parts[3];
        const part_4 = parts[4];

        if (twoPartsService(part_2, "thread", part_4, "vote")) {
            tryToAddOrUpdateVoteOfUserToThread(request, response, mainObj, part_3);
            return null;
        }

        if (twoPartsService(part_2, "thread", part_4, "create")) {
            tryToAddBigListOfPosts(request, response, mainObj, part_3);
            return null;
        }

        if (twoPartsService(part_2, "forum", part_4, "create")) {
            tryToCreateThreadInForum(request, response, mainObj, part_3);
            return null;
        }

        if (twoPartsService(part_2, "user", part_4, "create")) {
            tryToAddUserToDatabase(request, response, mainObj, part_3);
            return null;
        }

        if (twoPartsService(part_2, "user", part_4, "profile")) {
            tryToUpdateInformationAboutUser(request, response, mainObj, part_3);
            return null;
        }

        if (twoPartsService(part_2, "thread", part_4, "details")) {
            tryToUpdateMessageOrTitleOfTheThread(request, response, mainObj, part_3);
            return null;
        }

        if (twoPartsService(part_2, "post", part_4, "details")) {
            tryToUpdatePostMessageInComment(request, response, mainObj, part_3);
            return null;
        }
    }
}
