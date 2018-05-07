"use strict";

let postCounter = 42;

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

function addParentIfNessesary(commentsList) {
    commentsList.forEach((comment) => {
        if(!comment.parent) {
            comment.parent = 0;
        }
    });
}

function generateSetMapQuery(parrents, thread) {
    const setMapStr = parrents.join(",");
    const buffer = [];
    buffer.push("SELECT post_id, post_main_array FROM post");
    buffer.push("WHERE post_thread_id = " + thread.id + " ");
    buffer.push("AND");
    buffer.push("post_id IN (" + setMapStr + "); ");
    return buffer.join(" ");
}

function getParrentsListFromObj(commentsList) {
    const parrents = [];
    commentsList.forEach((comment) => {
        parrents.push(comment.parent);
    });
    return parrents;
}

function tryToAddBigListOfPostsPartTwo(request, response, commentsList, part_3, thread) {
    addParentIfNessesary(commentsList);
    const parrents = getParrentsListFromObj(commentsList);
    database(generateSetMapQuery(parrents, thread))
        .then((p) => {
            const parrentsExistingInDatabase = p.rows;
            let result = "YES";

            commentsList.forEach((comment) => {
                let exists = false;
                if(!comment.parent) {
                    exists = true;
                }
                if(!exists) {
                    parrentsExistingInDatabase.forEach((parrentComment) => {
                        if (comment.parent === parrentComment.post_id) {
                            exists = true;
                        }
                    });
                }
                if(!exists) {
                    result = "NO";
                }
            });
            if(result === "NO") {
                answer(response, 409, str({
                    message: result,
                }));
            } else {
                tryToAddBigListOfPostsPartThree(request, response, commentsList, part_3, thread, parrentsExistingInDatabase);
            }
        });
}

function getListStudentsPost(commentsList) {
    const studentsLower = [];
    commentsList.forEach((comment) => {
        const studentNickname = comment.author;
        const lower = " LOWER('" + studentNickname + "') ";
        studentsLower.push(lower);
    });
    return studentsLower.join(",");
}

function tryToAddBigListOfPostsPartThree(request, response, commentsList, part_3, thread, parrentsExistingInDatabase) {
    info("All parents exists");

    const buffer = [];
    buffer.push("SELECT student_id, student_nickname FROM student");
    buffer.push("WHERE LOWER(student_nickname) IN (" + getListStudentsPost(commentsList) + ");");
    const bufferStrQuery = buffer.join(" ");

    database(bufferStrQuery)
        .then((p) => {
            const studentsExistsInDatabase = p.rows;
            let result = "YES";
            commentsList.forEach((comment) => {
                let exists = false;
                studentsExistsInDatabase.forEach((student) => {
                    if(comment.author.toLowerCase() === student.student_nickname.toLowerCase()) {
                        exists = true;
                        comment.studentId = student.student_id;
                        comment.author = student.student_nickname;
                    }
                });
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

function tryToAddBigListOfPostsPartFour(request, response, commentsList, part_3, thread, parrentsExistingInDatabase) {
    const bufferGlobal = [];
    const created = makeCreated();

    info("All students exists");

    commentsList.forEach((comment) => {
        postCounter += 1;
        comment.commentID = postCounter;

        let exists = false;

        parrentsExistingInDatabase.forEach((parent) => {
            if(comment.parent === parent.post_id) {
                comment.root = 0;
                let arr = parent.post_main_array;
                comment.path = [];
                makeDouble(comment.path, arr);
                exists = true;
            }
        });

        if(!exists || comment.parent === 0) {
            comment.root = comment.commentID;
            comment.path = " ARRAY [ " + comment.commentID + " ] ";
        } else {
            comment.root = comment.path[0];
            comment.path = "ARRAY [ " +  comment.path.join(" , ") + " ] ";
        }

        comment.path = "" + comment.path;

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
                .then((p) => {
                    answer(response, 201, str(arr));
                });
        });
}

function addPostsNumberInOneForumQuery(postNumberAll, thread) {
    const buffer = [];
    buffer.push("UPDATE forum SET");
    buffer.push("forum_posts = forum_posts + " + postNumberAll + " ");
    buffer.push("WHERE forum_id = " + thread.forumID + "; ");
    return buffer.join(" ");
}
