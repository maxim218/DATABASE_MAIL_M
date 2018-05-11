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
 *
 * @param request
 * @param response
 * @param bodyObj
 * @param parts
 */
function pushQueryInformationToGlobalArr(request, response, bodyObj, parts) {
    const resObj = {
        request: request,
        response: response,
        bodyObj: bodyObj,
        parts: parts,
    };
    arrGlobal.push(resObj);
}

setInterval(() => {
    if(arrGlobal.length) {
        if(emptyProc) {
            emptyProc = false;
            const mainObj = arrGlobal[0];
            postQueryExe(mainObj.request, mainObj.response, mainObj.bodyObj, mainObj.parts);
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


const lowerThreadsBuffer = [];

setInterval(() => {
    lowerThreadsBuffer.forEach((queueObj) => {
        if(queueObj.arr.length > 0) {
            const queueObjArrZero = queueObj.arr[0];

            if(queueObj.free === true) {
                queueObj.free = false;
                tryToAddOrUpdateVoteOfUserToThread(queueObjArrZero.request, queueObjArrZero.response, queueObjArrZero.mainObj, queueObjArrZero.parts[3]);
            }

            if(queueObj.free === false) {
                if(queueObjArrZero.response.finished) {
                    queueObj.arr.splice(0,1);
                    queueObj.free = true;
                }
            }
        }
    });
}, TIMER_WAIT_TIME_PARAM);

/**
 * catch Post query and save it to queue
 * @param request
 * @param response
 */
function postQuery(request, response) {
        const parts = request.url.split(MAIN_SPLIT_CHAR);
        const part_4 = parts[4];

        if (request.url === "/api/service/clear") {
            pushQueryInformationToGlobalArr(request, response, getObj(), parts);
        } else {
            const dataArr = [];
            request.on('data', (data) => {
                dataArr.push(data.toString());
            }).on('end', () => {
                const mainObj = obj(dataArr.join(""));

                if(part_4 !== "vote") {
                    pushQueryInformationToGlobalArr(request, response, mainObj, parts);
                } else {
                    // vote
                    // vote
                    // vote

                    const voteSlugID = parts[3].toLowerCase();
                    let slugType = false;
                    let idType = false;

                    if(onlyNumbers(voteSlugID) === true) {
                        idType = true;
                    } else {
                        slugType = true;
                    }

                    let threadIndex = -1;

                    if(idType === true) {
                        for (let i = 0; i < lowerThreadsBuffer.length; i++) {
                            if(lowerThreadsBuffer[i].id === voteSlugID) {
                                threadIndex = i;
                                break;
                            }
                        }
                    }

                    if(slugType === true) {
                        for (let i = 0; i < lowerThreadsBuffer.length; i++) {
                            if(lowerThreadsBuffer[i].slug === voteSlugID) {
                                threadIndex = i;
                                break;
                            }
                        }
                    }

                    if(threadIndex === -1) {
                        answer(response, 404, str({
                            message: voteSlugID,
                        }));
                        return null;
                    }

                    const queueObj = lowerThreadsBuffer[threadIndex];
                    queueObj.arr.push({
                        request: request,
                        response: response,
                        mainObj: mainObj,
                        parts: parts,
                    });
                }
            });
        }
}

/**
 *
 * @param request
 * @param response
 * @param mainObj
 * @param parts
 * @returns {null}
 */
function postQueryExe(request, response, mainObj, parts) {
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

        const part_2 = parts[2];
        const part_3 = parts[3];
        const part_4 = parts[4];

        if (request.url === "/api/forum/create") {
            tryToAddNewForumOfStudentToDatabase(request, response, mainObj);
            return null;
        }

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
