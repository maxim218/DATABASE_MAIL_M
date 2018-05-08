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
    if(part_2 === "thread" && part_4 === "details") tryToGetFullInformationAboutOneThread(request, response, part_3);
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
        if(part_2 === "thread" && part_4 === "create") tryToAddBigListOfPosts(request, response, mainObj, part_3);
        if(part_2 === "thread" && part_4 === "vote") tryToAddOrUpdateVoteOfUserToThread(request, response, mainObj, part_3);

    });
}