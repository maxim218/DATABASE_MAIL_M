"use strict";

function getTheOneStudentQuery(mainObj) {
    const buffer = [];
    buffer.push("SELECT student_nickname FROM student WHERE");
    buffer.push("LOWER(student_nickname) = LOWER('" + mainObj.user + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function tryToAddNewForumOfStudentToDatabase(request, response, mainObj) {
    database(getTheOneStudentQuery(mainObj))
        .then((p) => {
            if(!p.rows.length) {
                answer(response, 404, str({
                    message: mainObj.user,
                }));
            } else {
                insertForumOfStudentToDatabase(request, response, mainObj, p.rows[0].student_nickname);
            }
        });
}

function addStudentForumInDatabaseQuery(mainObj, student) {
    const buffer = [];
    buffer.push("INSERT INTO forum");
    buffer.push("(forum_posts, forum_slug, forum_threads, forum_title, forum_nickname)");
    buffer.push("VALUES (0, '" + mainObj.slug + "', 0, '" + mainObj.title + "', '" + student + "');");
    return buffer.join(" ");
}

function getObjOneForumOfStudentQuery(mainObj) {
    const buffer = [];
    buffer.push("SELECT * FROM forum");
    buffer.push("WHERE LOWER(forum_slug) = LOWER('" + mainObj.slug + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function insertForumOfStudentToDatabase(request, response, mainObj, student) {
    database(addStudentForumInDatabaseQuery(mainObj, student))
        .then((p) => {
            if(!p.err) {
                answer(response, 201, str({
                    posts: 0,
                    slug: mainObj.slug,
                    threads: 0,
                    title: mainObj.title,
                    user: student,

                }));
            } else {
                database(getObjOneForumOfStudentQuery(mainObj))
                    .then((p) => {
                        const data = p.rows[0];
                        answer(response, 409, str({
                           posts: data.forum_posts,
                           slug: data.forum_slug,
                           threads: data.forum_threads,
                           title: data.forum_title,
                           user: data.forum_nickname,
                        }));
                    });
            }
        })
}

function tryOneForumBySlugValue(part_3) {
    const buffer = [];
    buffer.push("SELECT * FROM forum");
    buffer.push("WHERE LOWER(forum_slug) = LOWER('" + part_3 + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function tryToGetForumInformation(request, response, part_3) {
    database(tryOneForumBySlugValue(part_3))
        .then((p) => {
            if(!p.rows.length) {
                answer(response, 404, str({
                    message: part_3,
                }));
            } else {
                const data = p.rows[0];
                answer(response, 200, str({
                    posts: data.forum_posts,
                    slug: data.forum_slug,
                    threads: data.forum_threads,
                    title: data.forum_title,
                    user: data.forum_nickname,
                }));
            }
        })
}