"use strict";

let threadCounter = 42;

/**
 *
 * @param mainObj
 * @returns {string}
 */
function tryToGetOneStudentForThread(mainObj) {
    const buffer = [];
    buffer.push("SELECT student_id, student_nickname FROM student");
    buffer.push("WHERE LOWER(student_nickname) = LOWER('" + mainObj.author + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

/**
 *
 * @param request
 * @param response
 * @param mainObj
 * @param part_3
 */
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

/**
 *
 * @param part_3
 * @returns {string}
 */
function beSureExistsForumQuery(part_3) {
    const buffer = [];
    buffer.push("SELECT forum_id, forum_slug FROM forum");
    buffer.push("WHERE LOWER(forum_slug) = LOWER('" + part_3 + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

/**
 *
 * @param request
 * @param response
 * @param mainObj
 * @param part_3
 * @param user
 */
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

/**
 *
 * @param request
 * @param response
 * @param mainObj
 * @param part_3
 * @param user
 * @param forum
 */
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
                info("ERROR ERROR ERROR");
                database(getConflictThreadData(mainObj))
                    .then((p) => {
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
                        info("SEND CONFLICT");
                        answer(response, 409, str(threadResult));
                    });
           } else {
               info("Insert Thread OK");
               tryToCreateThreadInForumPartFourLast(request, response, mainObj, part_3, user, forum);
           }
        });
}

/**
 *
 * @param mainObj
 * @returns {string}
 */
function getConflictThreadData(mainObj) {
    const buffer = [];
    buffer.push("SELECT * FROM thread");
    buffer.push("WHERE LOWER(thread_slug) = LOWER('" + mainObj.slug + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

/**
 *
 * @param forum
 * @returns {string}
 */
function incrementOfPostNumberInForumQuery(forum) {
    const buffer = [];
    buffer.push("UPDATE forum SET");
    buffer.push("forum_threads = forum_threads + 1");
    buffer.push("WHERE forum_id = " +  forum.id + ";");
    return buffer.join(" ");
}

/**
 *
 * @param forum
 * @param user
 * @returns {string}
 */
function addToJoinTablePair(forum, user) {
    const buffer = [];
    buffer.push("INSERT INTO jointable");
    buffer.push("(jointable_forum_id, jointable_user_id)");
    buffer.push("VALUES(" + forum.id + "," +  user.id + ");");
    return buffer.join(" ");
}

/**
 *
 * @param request
 * @param response
 * @param mainObj
 * @param part_3
 * @param user
 * @param forum
 */
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
                           /////////////////////////////////////////////////
                           // push threads
                           lowerThreadsBuffer.push({
                              id: thread.thread_id.toString(),
                              slug: thread.thread_slug.toString().toLowerCase(),
                              arr: [],
                              free: true,
                           });
                           /////////////////////////////////////////////////
                           answer(response, 201, str(threadResult));
                       });
                });
        });
}

/**
 *
 * @param part_3
 * @returns {string}
 */
function getInformationOneForumSlugId(part_3) {
    const buffer = [];
    buffer.push("SELECT forum_id, forum_slug FROM forum");
    buffer.push("WHERE LOWER(forum_slug) = LOWER('" + part_3 + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

/**
 *
 * @param request
 * @param response
 * @param part_3
 * @param argumentsArr
 */
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

/**
 *
 * @param request
 * @param response
 * @param part_3
 * @param argumentsArr
 * @param forum
 */
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
            info("Get threads of forum !!!!!!");
            answer(response, 200, str(arr));
        });
}
