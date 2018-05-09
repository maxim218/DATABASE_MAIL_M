"use strict";

let databaseCreated = false;

function twoPartsService(part_2, value_2, part_4, value_4) {
    if(part_2 !== value_2) {
        return false;
    }
    return part_4 === value_4;
}

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

function postQuery(request, response) {
    if(request.url === "/api/service/clear") {
        database(result)
            .then((p) => {
                answer(response, 200, str({
                    message: "welcome service",
                }));
            });
        return null;
    }

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

        if(twoPartsService(part_2,"user",part_4,"create")) {
            tryToAddUserToDatabase(request, response, mainObj, part_3);
            return null;
        }

        if(twoPartsService(part_2,"user",part_4,"profile")) {
            tryToUpdateInformationAboutUser(request, response, mainObj, part_3);
            return null;
        }

        if(twoPartsService(part_2,"forum",part_4,"create")) {
            tryToCreateThreadInForum(request, response, mainObj, part_3);
            return null;
        }

        if(twoPartsService(part_2,"thread",part_4,"create")) {
            tryToAddBigListOfPosts(request, response, mainObj, part_3);
            return null;
        }

        if(twoPartsService(part_2,"thread",part_4,"vote")) {
            tryToAddOrUpdateVoteOfUserToThread(request, response, mainObj, part_3);
            return null;
        }

        if(twoPartsService(part_2,"thread",part_4,"details")) {
            tryToUpdateMessageOrTitleOfTheThread(request, response, mainObj, part_3);
            return null;
        }

        if(twoPartsService(part_2,"post",part_4,"details")) {
            tryToUpdatePostMessageInComment(request, response, mainObj, part_3);
            return null;
        }
    });
}