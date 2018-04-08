"use strict";

let thread_id_count = 1000;

const S_S_F = " SELECT * FROM  ";
const A_T_C = " AND thread_created ";
const O_B_T = " ORDER BY thread_created ";
const LL = " LIMIT ";
const LL_LITLE = "limit";
const S_I = "since";
const DD_EE = "desc";


function findInformationAboutOneThread(response, threadSLUGorID, second) {
    const threadIDorSLUG = threadSLUGorID;

    let t_id = null;
    let t_slug = null;

    if(onlyNumbers(threadIDorSLUG) === true) {
        t_id = parseInt(threadIDorSLUG);
    } else {
        t_slug = threadIDorSLUG.toString();
    }

    if(t_id !== null) {
        send("SELECT * FROM thread WHERE thread_id = $1 LIMIT 1;", [
            parseInt(t_id)
        ], (obj) => {
            log(obj);
            if(obj.find_thread_slug === "THREAD_SLUG_NOT_FOUND") {
                responsePost(response, 404, JSON.stringify({
                    message: "THREAD_NOT_FOUND"
                }));
            } else {
                const element = obj;
                const k = {
                    author: element.thread_author_nickname,
                    created: element.thread_created,
                    forum: element.thread_forum_slug,
                    id: element.thread_id,
                    message: element.thread_message,
                    title: element.thread_title,
                    votes: element.thread_votes
                };
                if(onlyNumbers(element.thread_slug) === false) {
                    k.slug = element.thread_slug;
                }
                responseGet(response, 200, JSON.stringify(k));
            }
        });
    }

    if(t_slug !== null) {
        send("SELECT * FROM thread WHERE LOWER(thread_slug) = LOWER($1) LIMIT 1;", [
            t_slug.toString()
        ], (obj) => {
            log(obj);
            if(parseInt(obj.find_thread_id) === NO) {
                responseGet(response, 404, JSON.stringify({
                    message: "THREAD_NOT_FOUND"
                }));
            } else {
                const element = obj;
                const k = {
                    author: element.thread_author_nickname,
                    created: element.thread_created,
                    forum: element.thread_forum_slug,
                    id: element.thread_id,
                    message: element.thread_message,
                    title: element.thread_title,
                    votes: element.thread_votes
                };
                if(onlyNumbers(element.thread_slug) === false) {
                    k.slug = element.thread_slug;
                }
                responseGet(response, 200, JSON.stringify(k));
            }
        })
    }
}



function findListOfThreads(response, forumSlug, second) {
    const params = wordsArray(second);

    send(S_S_F + " find_forum_id($1);", [
        forumSlug
    ], (obj) => {
       const forumId = parseInt(obj.find_forum_id);
       if(forumId === NO) {
           responseGet(response, 404, JSON.stringify({
               message: "FORUM_NOT_FOUND"
           }));
       } else {
            let v = S_S_F + " thread WHERE thread_forum_id = " + forumId + "  ";
            let sortingString = getParam(params[DD_EE] === "true", "DESC", "ASC");

            let sinceValue = undefined;
            if(good(params[S_I]) === true) {
                sinceValue = params[S_I];
            }

            if(good(sinceValue)) {
                if(sortingString === "ASC") v = v + A_T_C + " >= '" + sinceValue + "' ";
                if(sortingString === "DESC") v = v + A_T_C + " <= '" + sinceValue + "' ";
            }

            if(sortingString === "ASC") v = v + O_B_T + " ASC ";
            if(sortingString === "DESC") v = v + O_B_T + " DESC ";

            if(good(params[LL_LITLE])) {
                v = v + LL + params[LL_LITLE] + "  ";
            }

            v = v + " ; ";

           sendWithArr(v, [], (arr) => {
                log(arr);
                const q = [];
                arr.forEach((element) => {
                    const k = {
                        author: element.thread_author_nickname,
                        created: element.thread_created,
                        forum: element.thread_forum_slug,
                        id: element.thread_id,
                        message: element.thread_message,
                        title: element.thread_title,
                        votes: element.thread_votes
                    };
                    if(onlyNumbers(element.thread_slug) === false) {
                        k.slug = element.thread_slug;
                    }
                    q.push(k);
                });

               responseGet(response, 200, JSON.stringify(q));
           });
       }
    });
}

function createNewThread(response, forumSlug, bodyObj) {
    thread_id_count += 1;

    if(!bodyObj.created) {
        bodyObj.created = getNow();
    }

    if(!bodyObj.slug) {
        bodyObj.slug = thread_id_count.toString();
    }

    send("SELECT * FROM create_new_thread($1, $2, $3, $4, $5, $6, $7);", [
        bodyObj.author,
        bodyObj.created,
        bodyObj.message,
        bodyObj.title,
        forumSlug,
        (bodyObj.slug + ""),
        parseInt(thread_id_count)
    ], (obj) => {
        let body = obj.create_new_thread;
        log(body);

        if(body === "FORUM_NOT_FOUND") {
            responsePost(response, 404, JSON.stringify({
                message: "FORUM_NOT_FOUND"
            }));
        } else if(body === "STUDENT_NOT_FOUND") {
            responsePost(response, 404, JSON.stringify({
                message: "STUDENT_NOT_FOUND"
            }));
        } else {
            body = JSON.parse(body);

            if(Array.isArray(body) === true) {
                // OK
                body = body[0];
                const res = {
                    author: body.thread_author_nickname,
                    created: body.thread_created,
                    forum: body.thread_forum_slug,
                    id: body.thread_id,
                    message: body.thread_message,
                    title: body.thread_title,
                    votes: body.thread_votes,
                };
                if(onlyNumbers(body.thread_slug) === false) {
                    res.slug = body.thread_slug;
                }
                responsePost(response, 201, JSON.stringify(res));
            } else {
                // NOT OK
                const res = {
                    author: body.thread_author_nickname,
                    created: body.thread_created,
                    forum: body.thread_forum_slug,
                    id: body.thread_id,
                    message: body.thread_message,
                    title: body.thread_title,
                    votes: body.thread_votes,
                };
                if(onlyNumbers(body.thread_slug) === false) {
                    res.slug = body.thread_slug;
                }
                responsePost(response, 409, JSON.stringify(res));
            }
        }
    })
}