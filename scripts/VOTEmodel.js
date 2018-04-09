"use strict";

function createNewVote(response, threadIDorSLUG, bodyObj) {
    function createNewVoteFunction(response, threadID, bodyObj) {
        const nickname = bodyObj.nickname.toString();
        const voice = parseInt(bodyObj.voice);

        send("SELECT * FROM find_student_number($1)", [
            nickname
        ], (resObj) => {
            if(resObj.find_student_number === NO) {
                responsePost(response, 404, JSON.stringify({
                    message: "STUDENT_NOT_EXISTS"
                }));
            } else {
                send("SELECT * FROM create_new_vote($1, $2, $3);", [
                    nickname,
                    voice,
                    threadID
                ], (obj) => {
                    send("SELECT * FROM thread WHERE thread_id = $1;", [
                        threadID
                    ], (element) => {
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
                        responsePost(response, 200, JSON.stringify(k));
                    });
                });
            }
        });
    }

    let t_id = null;
    let t_slug = null;

    if(onlyNumbers(threadIDorSLUG) === true) {
        t_id = parseInt(threadIDorSLUG);
    } else {
        t_slug = threadIDorSLUG.toString();
    }

    if(t_id !== null) {
        send("SELECT * FROM find_thread_slug($1);", [
            parseInt(t_id)
        ], (obj) => {
            log(obj);
            if(obj.find_thread_slug === "THREAD_SLUG_NOT_FOUND") {
                responsePost(response, 404, JSON.stringify({
                    message: "THREAD_NOT_FOUND"
                }));
            } else {
                //thread exists normal
                const threadID = parseInt(t_id);
                createNewVoteFunction(response, threadID, bodyObj);
            }
        });
    }

    if(t_slug !== null) {
        send("SELECT * FROM find_thread_id($1);", [
            t_slug.toString()
        ], (obj) => {
            log(obj);
            if(parseInt(obj.find_thread_id) === NO) {
                responsePost(response, 404, JSON.stringify({
                    message: "THREAD_NOT_FOUND"
                }));
            } else {
                //thread exists normal
                const threadID = parseInt(obj.find_thread_id);
                createNewVoteFunction(response, threadID, bodyObj);
            }
        });
    }
}