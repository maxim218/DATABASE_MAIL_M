"use strict";

function findAllUsersInTheForum(response, forumSLUG, second) {
    send("SELECT * FROM find_forum_id($1); ", [
        forumSLUG.toString(),
    ], (obj) => {
        log(obj);
        const forumIdParam = obj.find_forum_id;

        if(obj.find_forum_id === NO) {
            responseGet(response, 404, JSON.stringify({
                message: "FORUM_IS_NOT_FOUND"
            }));
        } else {
            let data = "  ";

            data = data + "SELECT * FROM student INNER JOIN pair ON (pair_student_id = student_id) WHERE pair_forum_id = " + forumIdParam + "  ";

            const obj = wordsArray(second);

            let sortingTypeParam = "ASC";
            if(good(obj[DESC_CONST])) {
                if(obj[DESC_CONST] === "true") sortingTypeParam = "DESC";
                if(obj[DESC_CONST] === "false") sortingTypeParam = "ASC";
            }

            if(good(obj[SINCE_CONST])) {
                let sinceParam = obj[SINCE_CONST];
                if(sortingTypeParam === "ASC") data = data + "  AND LOWER(student_nickname) > LOWER('" + sinceParam + "')   ";
                if(sortingTypeParam === "DESC") data = data + "  AND LOWER(student_nickname) < LOWER('" + sinceParam + "')   ";
            }

            if(sortingTypeParam === "ASC") data = data + "  ORDER BY LOWER(student_nickname)  ASC    ";
            if(sortingTypeParam === "DESC") data = data + "  ORDER BY LOWER(student_nickname)  DESC  ";

            if(good(obj[LIMIT_CONST])) {
                data = data +  "  LIMIT " + obj[LIMIT_CONST] + "  ";
            }

            data += " ; ";

            sendWithArr(data, getEmptyArray(), (arr) => {
                const res = getEmptyArray();
                arr.forEach((body) => {
                    res.push({
                        about: body.student_about,
                        email: body.student_email,
                        fullname: body.student_fullname,
                        nickname: body.student_nickname
                    });
                });

                responseGet(response, 200, JSON.stringify(res));
            });
        }
    });
}

function forumInformation(response, forumSlug) {
    send("SELECT * FROM find_forum_information($1);", [
        forumSlug
    ], (obj) => {
        log(obj);
        let body = obj.find_forum_information;

        if(body === 'FORUM_NOT_FOUND') {
            responseGet(response, 404, JSON.stringify({
                message: "FORUM_NOT_FOUND"
            }));
        } else {
            const obj = JSON.parse(body);
            responseGet(response, 200, JSON.stringify({
                id: obj.forum_id,
                posts: obj.forum_posts,
                slug: obj.forum_slug,
                threads: obj.forum_threads,
                title: obj.forum_title,
                user: obj.forum_user_nickname,
                user_id: obj.forum_user_id
            }));
        }
    });
}

function createNewForum(response, bodyObj) {
    send("SELECT * FROM create_new_forum($1, $2, $3);", [
        bodyObj.slug,
        bodyObj.title,
        bodyObj.user,
    ], (obj) => {
        log(obj);

        let body = obj.create_new_forum;

        if(body === 'STUDENT_NOT_FOUND') {
            responsePost(response, 404, JSON.stringify({
                message: "STUDENT_NOT_FOUND"
            }));
        } else {
            try {
                const obj = JSON.parse(body);
                responsePost(response, 409, JSON.stringify({
                    id: obj.forum_id,
                    posts: obj.forum_posts,
                    slug: obj.forum_slug,
                    threads: obj.forum_threads,
                    title: obj.forum_title,
                    user: obj.forum_user_nickname,
                    user_id: obj.forum_user_id
                }));
            } catch (err) {
                responsePost(response, 201, JSON.stringify({
                    posts: 0,
                    slug: bodyObj.slug,
                    threads: 0,
                    title: bodyObj.title,
                    user: body
                }));
            }
        }
    });
}
