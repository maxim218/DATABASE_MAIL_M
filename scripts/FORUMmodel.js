"use strict";

function forumInformation(response, forumSlug) {

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
