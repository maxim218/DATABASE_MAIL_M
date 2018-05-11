"use strict";

let postCounter = 42;

/**
 *
 * @param threadSlugId
 * @param continueMethod
 */
function controlThreadParamsSlugAndIdParam(threadSlugId, continueMethod) {
    const buffer = [];
    buffer.push("SELECT thread_id, thread_slug, thread_forum_slug, thread_forum_id FROM thread");

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
           let thread = null;
           if(p.rows.length) {
               thread = {
                   id: p.rows[0].thread_id,
                   slug: p.rows[0].thread_slug,
                   forumSlug: p.rows[0].thread_forum_slug,
                   forumID: p.rows[0].thread_forum_id,
               }
           }
           continueMethod(thread);
        });
}

/**
 *
 * @param comment
 * @param studentsExistsInDatabase
 * @returns {boolean}
 */
function tryControStudentAuthorID(comment, studentsExistsInDatabase) {
    const commentAuthorToLowerCase = comment.author.toLowerCase();
    let exists = false;
    for(let index_student = 0; index_student < studentsExistsInDatabase.length; index_student++) {
        const student = studentsExistsInDatabase[index_student];
        if(commentAuthorToLowerCase === student.student_nickname.toLowerCase()) {
            exists = true;
            comment.studentId = student.student_id;
            comment.author = student.student_nickname;
            break;
        }
    }
    return exists;
}

/**
 *
 * @param request
 * @param response
 * @param commentsList
 * @param part_3
 */
function tryToAddBigListOfPosts(request, response, commentsList, part_3) {
    controlThreadParamsSlugAndIdParam(part_3, (thread) => {
        if(!thread) {
            answer(response, 404, str({
                message: part_3,
            }));
        } else {
            info("Thread OK");
            if(!commentsList.length) {
                info("Empty posts array");
                answer(response, 201, str([]));
            } else {
                info("Big posts array");
                tryToAddBigListOfPostsPartTwo(request, response, commentsList, part_3, thread);
            }
        }
    });
}

/**
 *
 * @param commentsList
 */
function addParentIfNessesary(commentsList) {
    commentsList.forEach((comment) => {
        if(!comment.parent) {
            comment.parent = 0;
        }
    });
}

/**
 *
 * @param parrents
 * @param thread
 * @returns {string}
 */
function generateSetMapQuery(parrents, thread) {
    const setMapStr = parrents.join(",");
    const buffer = [];
    buffer.push("SELECT post_id, post_main_array FROM post");
    buffer.push("WHERE post_thread_id = " + thread.id + " ");
    buffer.push("AND");
    buffer.push("post_id IN (" + setMapStr + "); ");
    return buffer.join(" ");
}

/**
 *
 * @param commentsList
 * @returns {Array}
 */
function getParrentsListFromObj(commentsList) {
    const parrents = [];
    commentsList.forEach((comment) => {
        parrents.push(comment.parent);
    });
    return parrents;
}

/**
 *
 * @param request
 * @param response
 * @param commentsList
 * @param part_3
 * @param thread
 */
function tryToAddBigListOfPostsPartTwo(request, response, commentsList, part_3, thread) {
    addParentIfNessesary(commentsList);
    const parrents = getParrentsListFromObj(commentsList);
    database(generateSetMapQuery(parrents, thread))
        .then((p) => {
            const parrentsExistingInDatabase = p.rows;
            let result = "YES";
            for(let index_comment = 0;  index_comment < commentsList.length; index_comment++) {
                const comment = commentsList[index_comment];
                let exists = false;
                if(!comment.parent) {
                    exists = true;
                    continue;
                }
                if(!exists) {
                    exists = parrentsExistingInDatabaseControlParrents(parrentsExistingInDatabase, comment, exists);
                }
                if(!exists) {
                    result = "NO";
                    break;
                }
            }
            if(result === "NO") {
                answer(response, 409, str({
                    message: result,
                }));
            } else {
                tryToAddBigListOfPostsPartThree(request, response, commentsList, part_3, thread, parrentsExistingInDatabase);
            }
        });
}

/**
 *
 * @param commentsList
 * @returns {string}
 */
function getStudentsPathDataObj(commentsList) {
    const buffer = [];
    buffer.push("SELECT student_id, student_nickname FROM student");
    buffer.push("WHERE LOWER(student_nickname) IN (" + getListStudentsPost(commentsList) + ");");
    return buffer.join(" ");
}

/**
 *
 * @param commentsList
 * @returns {string}
 */
function getListStudentsPost(commentsList) {
    const studentsLower = [];
    commentsList.forEach((comment) => {
        const studentNickname = comment.author;
        const lower = " LOWER('" + studentNickname + "') ";
        studentsLower.push(lower);
    });
    return studentsLower.join(",");
}

/**
 *
 * @param request
 * @param response
 * @param commentsList
 * @param part_3
 * @param thread
 * @param parrentsExistingInDatabase
 */
function tryToAddBigListOfPostsPartThree(request, response, commentsList, part_3, thread, parrentsExistingInDatabase) {
    info("All parents exists");
    database(getStudentsPathDataObj(commentsList))
        .then((p) => {
            const studentsExistsInDatabase = p.rows;
            let result = "YES";
            commentsList.forEach((comment) => {
                const exists = tryControStudentAuthorID(comment, studentsExistsInDatabase);
                if(!exists) {
                    result = "NO";
                }
            });
            if(result === "NO") {
                answer(response, 404, str({
                    message: result,
                }))
            } else {
                tryToAddBigListOfPostsPartFour(request, response, commentsList, part_3, thread, parrentsExistingInDatabase);
            }
        });
}

/**
 * init root and path of element
 * @param comment
 * @param flag
 */
function tryInitCommentWay(comment, flag) {
    if(flag) {
        commentFirstPath(comment);
    } else {
        commentLongWay(comment);
    }
}

/**
 *
 * @param request
 * @param response
 * @param commentsList
 * @param part_3
 * @param thread
 * @param parrentsExistingInDatabase
 */
function tryToAddBigListOfPostsPartFour(request, response, commentsList, part_3, thread, parrentsExistingInDatabase) {
    const bufferGlobal = [];
    const created = makeCreated();

    info("All students exists");

    commentsList.forEach((comment) => {
        postCounter += 1;
        comment.commentID = postCounter;

        let exists = false;

        for(let index = 0; index < parrentsExistingInDatabase.length; index++) {
            const parent = parrentsExistingInDatabase[index];
            if(comment.parent === parent.post_id) {
                comment.root = FIRST_INDEX;
                let arr = parent.post_main_array;
                comment.path = makeDouble(arr);
                exists = true;
                comment.path.push(comment.commentID);
                break;
            }
        }

        tryInitCommentWay(comment,testFistElFirstElement(exists, comment));

        const buffer = [];
        buffer.push("INSERT INTO post (");

        buffer.push('post_id');
        buffer.push(" , ");
        buffer.push('post_student_nickname');
        buffer.push(" , ");
        buffer.push('post_student_id');
        buffer.push(" , ");
        buffer.push('post_created');
        buffer.push(" , ");
        buffer.push('post_forum_slug');
        buffer.push(" , ");
        buffer.push('post_forum_id');
        buffer.push(" , ");
        buffer.push('post_is_edited');
        buffer.push(" , ");
        buffer.push('post_message');
        buffer.push(" , ");
        buffer.push('post_parent');
        buffer.push(" , ");
        buffer.push('post_thread_id');
        buffer.push(" , ");
        buffer.push('post_starting_number');
        buffer.push(" , ");
        buffer.push('post_main_array');

        buffer.push(') VALUES (');

        buffer.push(comment.commentID);
        buffer.push(" , ");
        buffer.push("'" + comment.author + "'");
        buffer.push(" , ");
        buffer.push(comment.studentId);
        buffer.push(" , ");
        buffer.push("'" + created + "'");
        buffer.push(" , ");
        buffer.push("'" + thread.forumSlug + "'");
        buffer.push(" , ");
        buffer.push(thread.forumID);
        buffer.push(" , ");
        buffer.push("False");
        buffer.push(" , ");
        buffer.push("'" + comment.message + "'");
        buffer.push(" , ");
        buffer.push(comment.parent);
        buffer.push(" , ");
        buffer.push(thread.id);
        buffer.push(" , ");
        buffer.push(comment.root);
        buffer.push(" , ");
        buffer.push(comment.path);

        buffer.push(' ); ');

        bufferGlobal.push(buffer.join(" "));
    });

    const arr = [];
    const isEdited = false;

    const bufferStr = bufferGlobal.join(" ");
    database(bufferStr)
        .then((p) => {
            info("adding comment ok");
            commentsList.forEach((comment) => {
                arr.push({
                    author: comment.author,
                    created: created,
                    forum: thread.forumSlug,
                    id: comment.commentID,
                    isEdited: isEdited,
                    message: comment.message,
                    parent: comment.parent,
                    thread: thread.id,
                });
            });

            const postNumberAll = commentsList.length;

            database(addPostsNumberInOneForumQuery(postNumberAll, thread))
                .then((p1) => {
                    database(addingJoiningPairsForumStudent(commentsList, thread))
                        .then((p2) => {
                            answer(response, 201, str(arr));
                        });
                });
        });
}

/**
 *
 * @param commentsList
 * @param thread
 * @returns {string}
 */
function addingJoiningPairsForumStudent(commentsList, thread) {
    const forum_id = thread.forumID;
    const buffer = [];
    commentsList.forEach((comment) => {
        const student_id = comment.studentId;
        const query = addToJoinTablePairAfterAddingPost(forum_id, student_id);
        buffer.push(query);
    });
    return buffer.join(" ");
}

/**
 *
 * @param forum_id
 * @param student_id
 * @returns {string}
 */
function addToJoinTablePairAfterAddingPost(forum_id, student_id) {
    const buffer = [];
    buffer.push("INSERT INTO jointable");
    buffer.push("(jointable_forum_id, jointable_user_id)");
    buffer.push("VALUES(" + forum_id + "," + student_id + ") ON CONFLICT DO NOTHING;");
    return buffer.join(" ");
}

/**
 *
 * @param postNumberAll
 * @param thread
 * @returns {string}
 */
function addPostsNumberInOneForumQuery(postNumberAll, thread) {
    const buffer = [];
    buffer.push("UPDATE forum SET");
    buffer.push("forum_posts = forum_posts + " + postNumberAll + " ");
    buffer.push("WHERE forum_id = " + thread.forumID + "; ");
    return buffer.join(" ");
}

/**
 * is it only one element in array
 * @returns {boolean}
 */
function testFistElFirstElement(exists, comment) {
    return !exists || !comment.parent;
}

/**
 *
 * @param parrentsExistingInDatabase
 * @param comment
 * @param exists
 * @returns {*}
 */
function parrentsExistingInDatabaseControlParrents(parrentsExistingInDatabase, comment, exists) {
    for(let index_parrentComment = 0; index_parrentComment < parrentsExistingInDatabase.length; index_parrentComment++) {
        const parrentComment = parrentsExistingInDatabase[index_parrentComment];
        if (comment.parent === parrentComment.post_id) {
            exists = true;
            break;
        }
    }
    return exists;
}

/**
 * init my self
 * @param comment
 */
function commentFirstPath(comment) {
    comment.root = comment.commentID;
    comment.path = BUFFER + LEFT + comment.commentID + RIGHT;
}

/**
 * init elements before
 * @param comment
 */
function commentLongWay(comment) {
    comment.root = comment.path[FIRST_INDEX];
    comment.path = BUFFER +  LEFT +  comment.path.join(POINT) + RIGHT;
}
