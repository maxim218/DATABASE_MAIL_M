"use strict";

let threadCounter = 42;

function tryToGetOneStudentForThread(mainObj) {
    const buffer = [];
    buffer.push("SELECT student_id, student_nickname FROM student");
    buffer.push("WHERE LOWER(student_nickname) = LOWER('" + mainObj.author + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

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

function beSureExistsForumQuery(part_3) {
    const buffer = [];
    buffer.push("SELECT forum_id, forum_slug FROM forum");
    buffer.push("WHERE LOWER(forum_slug) = LOWER('" + part_3 + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

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
                database(getConflictThreadData(mainObj))
                    .then((p) => {
                        const thread = p.arr[0];
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
                        answer(response, 409, str(threadResult));
                    });
           } else {
               info("Insert Thread OK");
               tryToCreateThreadInForumPartFourLast(request, response, mainObj, part_3, user, forum);
           }
        });
}

function getConflictThreadData(mainObj) {
    const buffer = [];
    buffer.push("SELECT * FROM thread");
    buffer.push("WHERE LOWER(thread_slug) = LOWER('" + mainObj.slug + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function incrementOfPostNumberInForumQuery(forum) {
    const buffer = [];
    buffer.push("UPDATE forum SET");
    buffer.push("forum_threads = forum_threads + 1");
    buffer.push("WHERE forum_id = " +  forum.id + ";");
    return buffer.join(" ");
}

function addToJoinTablePair(forum, user) {
    const buffer = [];
    buffer.push("INSERT INTO jointable");
    buffer.push("(jointable_forum_id, jointable_user_id)");
    buffer.push("VALUES(" + forum.id + "," +  user.id + ");");
    return buffer.join(" ");
}

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
                           answer(response, 201, str(threadResult));
                       });
                });
        });
}

function getInformationOneForumSlugId(part_3) {
    const buffer = [];
    buffer.push("SELECT forum_id, forum_slug FROM forum");
    buffer.push("WHERE LOWER(forum_slug) = LOWER('" + part_3 + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

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

function tryToGetForumThreadsListPartTwo(request, response, part_3, argumentsArr, forum) {



    const buffer = [];

    buffer.push("SELECT * FROM thread");
    buffer.push("WHERE thread_forum_id = " + forum.id + " ");



}