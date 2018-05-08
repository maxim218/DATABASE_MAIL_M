"use strict";

function tryToGetFullInformationThreadForUpdatingThreadContent(request, response, threadSlugId, continueMetod) {
    const buffer = [];
    buffer.push("SELECT thread_id FROM thread");

    if(onlyNumbers(threadSlugId)) {
        const id = parseInt(threadSlugId);
        buffer.push("WHERE thread_id = " + id + " ");
    } else {
        const slug = threadSlugId.toString();
        buffer.push("WHERE LOWER(thread_slug) = LOWER('" + slug + "') ");
    }
    buffer.push("LIMIT 1;");
    const bufferStr = buffer.join(" ");

    database(bufferStr)
        .then((p) => {
            if(!p.rows.length) {
                answer(response, 404, str({
                    message: threadSlugId,
                }));
            } else {
                info("Thread exists");
                continueMetod(p.rows[0].thread_id);
            }
        });
}

function tryToGetThreadFullInfoAfterUpdate(threadID) {
    const buffer = [];
    buffer.push("SELECT * FROM thread");
    buffer.push("WHERE thread_id = " + threadID + " ");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function tryToUpdateMessageOrTitleOfTheThread(request, response, mainObj, threadSlugId) {
    tryToGetFullInformationThreadForUpdatingThreadContent(request, response, threadSlugId, (threadID) => {
        database(tryUpdateBranchContent(mainObj, threadID) + tryToGetThreadFullInfoAfterUpdate(threadID))
            .then((p) => {
                const element = p.rows[0];
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
                answer(response, 200, str(thread));
            });
    });
}

function tryUpdateBranchContent(mainObj, threadID) {
    const buffer = [];
    buffer.push("UPDATE thread SET thread_author_id = thread_author_id + 0");
    if(mainObj.title) {
        buffer.push(" , thread_title = '" + mainObj.title + "' ");
    }
    if(mainObj.message) {
        buffer.push(" , thread_message = '" + mainObj.message + "' ");
    }
    buffer.push("WHERE thread_id = " + threadID + " ; ");
    return buffer.join(" ");
}

function getForumTheIDForGettingForumUsers(part_3) {
    const buffer = [];
    buffer.push("SELECT forum_id FROM forum");
    buffer.push("WHERE LOWER(forum_slug) = LOWER('" + part_3 + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function tryToGetAllStudentsThatHaveBranchPrPostInTheForum(request, response, part_3, argumentsArr) {
    database(getForumTheIDForGettingForumUsers(part_3))
        .then((p) => {
           if(!p.rows.length) {
               answer(response, 404, str({
                   message: part_3,
               }));
           } else {
               const forumID = p.rows[0].forum_id;
               tryToGetAllStudentsThatHaveBranchPrPostInTheForumPartTwo(request, response, part_3, argumentsArr, forumID);
           }
        });
}

function tryToGetAllStudentsThatHaveBranchPrPostInTheForumPartTwo(request, response, part_3, argumentsArr, forumID) {
    const limit = getLimit(argumentsArr);
    const type = getSort(argumentsArr);
    const since = getSince(argumentsArr);
    const buffer = [];
    buffer.push("SELECT * FROM student");
    buffer.push("INNER JOIN jointable ON");
    buffer.push("student_id = jointable_user_id");
    buffer.push("WHERE jointable_forum_id = " + forumID + " ");
    if(since) {
        buffer.push("AND LOWER(student_nickname)");
        if(type === "ASC") {
            buffer.push(" > ");
        } else {
            buffer.push(" < ");
        }
        buffer.push("LOWER('" + since + "')");
    }
    buffer.push("ORDER BY LOWER(student_nickname) " + type);
    if(limit) {
        buffer.push("LIMIT");
        buffer.push(limit);
    }
    buffer.push(";");
    const bufferStr = buffer.join(" ");
    database(bufferStr)
        .then((p) => {
            const arr = [];
            p.rows.forEach((element) => {
                arr.push({
                    about: element.student_about,
                    email: element.student_email,
                    fullname: element.student_fullname,
                    nickname: element.student_nickname,
                });
            });
            answer(response, 200, str(arr));
        });
}