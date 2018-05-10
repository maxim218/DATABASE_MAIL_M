"use strict";

/**
 *
 * @param request
 * @param response
 * @param threadSlugId
 * @param continueMetod
 */
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

/**
 *
 * @param threadID
 * @returns {string}
 */
function tryToGetThreadFullInfoAfterUpdate(threadID) {
    const buffer = [];
    buffer.push("SELECT * FROM thread");
    buffer.push("WHERE thread_id = " + threadID + " ");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

/**
 *
 * @param request
 * @param response
 * @param mainObj
 * @param threadSlugId
 */
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

/**
 *
 * @param mainObj
 * @param threadID
 * @returns {string}
 */
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

/**
 *
 * @param part_3
 * @returns {string}
 */
function getForumTheIDForGettingForumUsers(part_3) {
    const buffer = [];
    buffer.push("SELECT forum_id FROM forum");
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

/**
 *
 * @param request
 * @param response
 * @param part_3
 * @param argumentsArr
 * @param forumID
 */
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
            info("Get forum users )))) ((((");
            answer(response, 200, str(arr));
        });
}

/**
 *
 * @param postID
 * @returns {string}
 */
function getOnePostToInfoPostDetails(postID) {
    const buffer = [];
    buffer.push("SELECT * FROM post");
    buffer.push("WHERE post_id = " + postID + " ");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

/**
 *
 * @param request
 * @param response
 * @param mainObj
 * @param postID
 */
function tryToUpdatePostMessageInComment(request, response, mainObj, postID) {
    info("Update post method");
    database(getOnePostToInfoPostDetails(postID))
        .then((p) => {
            if(!p.rows.length) {
                answer(response, 404, str({
                    message: postID,
                }));
            } else {
                const post = p.rows[0];
                tryToUpdatePostMessageInCommentPartFive(request, response, mainObj, postID, post);
            }
        });
}

/**
 *
 * @param messageAfter
 * @param postID
 * @returns {string}
 */
function getUpdateOneCommentQuery(messageAfter, postID) {
    const buffer = [];
    buffer.push("UPDATE post SET");
    buffer.push("post_is_edited = True, ");
    buffer.push("post_message = '" + messageAfter + "' ");
    buffer.push("WHERE post_id = " + postID + " ; ");
    return buffer.join(" ");
}

/**
 *
 * @param request
 * @param response
 * @param mainObj
 * @param postID
 * @param post
 */
function tryToUpdatePostMessageInCommentPartFive(request, response, mainObj, postID, post) {
    info("post exists ok");
    const messageBefore = post.post_message;
    const messageAfter = mainObj.message;
    if(!messageAfter || (messageAfter === messageBefore)) {
        const comment = post;
        const postResult = {
            author: comment.post_student_nickname,
            created: comment.post_created,
            forum: comment.post_forum_slug,
            id: comment.post_id,
            isEdited: comment.post_is_edited,
            message: comment.post_message,
            parent: comment.post_parent,
            thread: comment.post_thread_id,
        };
        info("No Changes");
        answer(response, 200, str(postResult));
    } else {
        info("Yes Changes");
        database(getUpdateOneCommentQuery(messageAfter, postID))
            .then((p) => {
                const comment = post;
                const postResult = {
                    author: comment.post_student_nickname,
                    created: comment.post_created,
                    forum: comment.post_forum_slug,
                    id: comment.post_id,
                    isEdited: true,
                    message: messageAfter,
                    parent: comment.post_parent,
                    thread: comment.post_thread_id,
                };
                answer(response, 200, str(postResult));
            });
    }
}

/**
 *
 * @param request
 * @param response
 * @param postID
 * @param argumentsArr
 */
function tryToGetInformationAboutOnePostSimple(request, response, postID, argumentsArr) {
    database(getOnePostToInfoPostDetails(postID))
        .then((p) => {
           if(!p.rows.length) {
               answer(response, 404, str({
                   message: postID,
               }));
           } else {
               const post = p.rows[0];
               tryToGetInformationAboutOnePostSimplePartTwo(request, response, postID, argumentsArr, post);
           }
        });
}

/**
 *
 * @param request
 * @param response
 * @param postID
 * @param argumentsArr
 * @param post
 */
function tryToGetInformationAboutOnePostSimplePartTwo(request, response, postID, argumentsArr, post) {
    info("Post Exists");
    if(!argumentsArr["related"]) {
        const comment = post;
        const postResult = {
            author: comment.post_student_nickname,
            created: comment.post_created,
            forum: comment.post_forum_slug,
            id: comment.post_id,
            isEdited: comment.post_is_edited,
            message: comment.post_message,
            parent: comment.post_parent,
            thread: comment.post_thread_id,
        };
        answer(response, 200, str({
            post: postResult
        }));
    } else {
        info("Related exists");
        const related = argumentsArr["related"].toString();
        const postResult = {
            author: null,
            forum: null,
            post: null,
            thread: null,
        };
        const comment = post;
        postResult.post = {
            author: comment.post_student_nickname,
            created: comment.post_created,
            forum: comment.post_forum_slug,
            id: comment.post_id,
            isEdited: comment.post_is_edited,
            message: comment.post_message,
            parent: comment.post_parent,
            thread: comment.post_thread_id,
        };

        const buffer = [];
        buffer.push("SELECT * FROM post");
        buffer.push("INNER JOIN student ON student_id = post_student_id");
        buffer.push("INNER JOIN forum ON forum_id = post_forum_id");
        buffer.push("INNER JOIN thread ON thread_id = post_thread_id");
        buffer.push("WHERE post_id = " + postID + " ");
        buffer.push("LIMIT 1;");
        const bufferStr = buffer.join(" ");
        database(bufferStr)
            .then((p) => {
                const bigObj = p.rows[0];

                if(includeString(related, "user")) {
                    const element = bigObj;
                    postResult.author = {
                        about: element.student_about,
                        email: element.student_email,
                        fullname: element.student_fullname,
                        nickname: element.student_nickname,
                    }
                }

                if(includeString(related, "thread")) {
                    const thread = bigObj;
                    postResult.thread = {
                        author: thread.thread_author_nickname,
                        created: thread.thread_created,
                        forum: thread.thread_forum_slug,
                        id: thread.thread_id,
                        message: thread.thread_message,
                        title: thread.thread_title,
                        votes: thread.thread_votes,
                    };
                    if(!onlyNumbers(thread.thread_slug)) {
                        postResult.thread.slug = thread.thread_slug;
                    }
                }

                if(includeString(related, "forum")) {
                    const data = bigObj;
                    postResult.forum = {
                        posts: data.forum_posts,
                        slug: data.forum_slug,
                        threads: data.forum_threads,
                        title: data.forum_title,
                        user: data.forum_nickname,
                    }
                }

                answer(response, 200, str(postResult));
            });
    }
}
