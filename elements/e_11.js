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

