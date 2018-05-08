"use strict";

function tryToGetFullInformationThreadForReadingPosts(request, response, threadSlugId, continueMetod) {
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

function sortTypeFirstMethodPosts(request, response, threadSlugId, argumentsArr, threadID) {
    const limit = getLimit(argumentsArr);
    const type = getSort(argumentsArr);
    const since = getSince(argumentsArr);
    const buffer = [];
    buffer.push("SELECT * FROM post");
    buffer.push("WHERE post_thread_id = " + threadID + " ");
    if(since) {
        if(type === "ASC") {
            buffer.push(" AND post_id > " + since + " ");
        } else {
            buffer.push(" AND post_id < " + since + " ");
        }
    }
    buffer.push("ORDER BY post_id " + type + " ");
    if(limit) {
        buffer.push("LIMIT " + limit);
    }
    buffer.push(" ; ");
    const bufferStr = buffer.join(" ");
    database(bufferStr)
        .then((p) => {
            const arr = [];
            p.rows.forEach((comment) => {
                arr.push({
                    author: comment.post_student_nickname,
                    created: comment.post_created,
                    forum: comment.post_forum_slug,
                    id: comment.post_id,
                    isEdited: comment.post_is_edited,
                    message: comment.post_message,
                    parent: comment.post_parent,
                    thread: comment.post_thread_id,
                });
            });
            answer(response, 200, str(arr));
        });
}

function sortTypeSecondMethodPosts(request, response, threadSlugId, argumentsArr, threadID) {
    const limit = getLimit(argumentsArr);
    const type = getSort(argumentsArr);
    const since = getSince(argumentsArr);
    const buffer = [];
    buffer.push("SELECT * FROM post");
    buffer.push("WHERE post_thread_id = " + threadID + " ");
    if(since) {
        if(type === "ASC") {
            buffer.push("AND post.post_main_array > ");
        } else {
            buffer.push("AND post.post_main_array < ");
        }
        buffer.push("(SELECT post_main_array FROM post WHERE post_id = " + since + ")");
    }
    buffer.push("ORDER BY post.post_main_array " + type + " ");
    if(limit) {
        buffer.push("LIMIT " + limit);
    }
    buffer.push(" ; ");
    const bufferStr = buffer.join(" ");
    database(bufferStr)
        .then((p) => {
            const arr = [];
            p.rows.forEach((comment) => {
                arr.push({
                    author: comment.post_student_nickname,
                    created: comment.post_created,
                    forum: comment.post_forum_slug,
                    id: comment.post_id,
                    isEdited: comment.post_is_edited,
                    message: comment.post_message,
                    parent: comment.post_parent,
                    thread: comment.post_thread_id,
                });
            });
            answer(response, 200, str(arr));
        });
}

function sortTypeThirdMethodPosts(request, response, threadSlugId, argumentsArr, threadID) {
    const limit = getLimit(argumentsArr);
    const type = getSort(argumentsArr);
    const since = getSince(argumentsArr);
    const buffer = [];
    buffer.push("WITH buffer AS (SELECT post_id FROM post WHERE post_thread_id = " + threadID + " AND post_parent = " + START_PARRENT_VALUE + " ");
    if(since) {
        if(type === "ASC") {
            buffer.push(" AND post_starting_number > ");
        } else {
            buffer.push(" AND post_starting_number < ");
        }
        buffer.push(" (SELECT post_starting_number FROM post WHERE post_id = " + since + ") ");
    }
    buffer.push("ORDER BY post_id " + type + " ");
    if(limit) {
        buffer.push("LIMIT " + limit);
    }
    buffer.push(")");
    buffer.push("SELECT * , post.post_id AS post_id_new");
    buffer.push("FROM post INNER JOIN buffer");
    buffer.push("ON buffer.post_id = post.post_starting_number");
    buffer.push("ORDER BY post.post_starting_number " + type + ", post.post_main_array ASC;");
    const bufferStr = buffer.join(" ");
    database(bufferStr)
        .then((p) => {
            const arr = [];
            p.rows.forEach((comment) => {
                arr.push({
                    author: comment.post_student_nickname,
                    created: comment.post_created,
                    forum: comment.post_forum_slug,
                    id: comment.post_id_new,
                    isEdited: comment.post_is_edited,
                    message: comment.post_message,
                    parent: comment.post_parent,
                    thread: comment.post_thread_id,
                });
            });
            answer(response, 200, str(arr));
        });
}

function tryToGetListOfPostsFlatThreeParentThree(request, response, threadSlugId, argumentsArr) {
    tryToGetFullInformationThreadForReadingPosts(request, response, threadSlugId, (threadID) => {
        info("Thread Id: " + threadID);
        let type = SORT_TYPE_1;
        if(argumentsArr["sort"]) {
            type = argumentsArr["sort"];
        }
        info("Sort type: " + type);
        switch (type) {
            case SORT_TYPE_1:
                sortTypeFirstMethodPosts(request, response, threadSlugId, argumentsArr, threadID);
                break;
            case SORT_TYPE_2:
                sortTypeSecondMethodPosts(request, response, threadSlugId, argumentsArr, threadID);
                break;
            case SORT_TYPE_3:
                sortTypeThirdMethodPosts(request, response, threadSlugId, argumentsArr, threadID);
                break;
        }
    });
}