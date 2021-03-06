"use strict";

/**
 *
 * @param request
 * @param response
 * @param part_3
 */
function tryToGetFullInformationAboutOneThread(request, response, part_3) {
    const buffer = [];
    buffer.push("SELECT * FROM thread");

    const threadSlugId = part_3;

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
                }))
            } else {
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
                answer(response, 200, str(threadResult));
            }
        });
}

/**
 *
 * @param threadSlugId
 * @param continueMethod
 */
function controlThreadParamsSlugAndIdParamForMakingVotes(threadSlugId, continueMethod) {
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
            let thread = null;
            if(p.rows.length) {
                thread = {
                    id: p.rows[0].thread_id
                }
            }
            continueMethod(thread);
        });
}

/**
 *
 * @param request
 * @param response
 * @param mainObj
 * @param part_3
 */
function tryToAddOrUpdateVoteOfUserToThread(request, response, mainObj, part_3) {
    controlThreadParamsSlugAndIdParamForMakingVotes(part_3, (thread) => {
        if(!thread) {
            answer(response, 404, str({
                message: part_3,
            }));
        } else {
            const threadID = thread.id;
            tryToAddOrUpdateVoteOfUserToThreadPartTwo(request, response, mainObj, part_3, threadID);
        }
    });
}

/**
 *
 * @param mainObj
 * @returns {string}
 */
function getStudetnIDforMakingVoteQuery(mainObj) {
    const buffer = [];
    buffer.push("SELECT student_id FROM student");
    buffer.push("WHERE LOWER(student_nickname) = LOWER('" + mainObj.nickname + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

/**
 *
 * @param request
 * @param response
 * @param mainObj
 * @param part_3
 * @param threadID
 */
function tryToAddOrUpdateVoteOfUserToThreadPartTwo(request, response, mainObj, part_3, threadID) {
    database(getStudetnIDforMakingVoteQuery(mainObj))
        .then((p) => {
           if(!p.rows.length) {
               answer(response, 404, str({
                   message: mainObj.nickname,
               }));
           } else {
               const studentID = p.rows[0].student_id;
               tryToAddOrUpdateVoteOfUserToThreadPartThree(request, response, mainObj, part_3, threadID, studentID);
           }
        });
}

/**
 *
 * @param studentID
 * @param mainObj
 * @param threadID
 * @returns {string}
 */
function generateInsertVoteQueryForVote(studentID, mainObj, threadID) {
    const buffer = [];
    buffer.push("INSERT INTO vote");
    buffer.push("(vote_student_id, vote_voice, vote_thread_id)");
    buffer.push("VALUES (" + studentID + "," + mainObj.voice + "," + threadID + ");");
    return buffer.join(" ");
}

/**
 *
 * @param request
 * @param response
 * @param mainObj
 * @param part_3
 * @param threadID
 * @param studentID
 */
function tryToAddOrUpdateVoteOfUserToThreadPartThree(request, response, mainObj, part_3, threadID, studentID) {
    database(generateInsertVoteQueryForVote(studentID, mainObj, threadID))
        .then((p) => {
            if(p.err) {
                info("Insert vote ERROR");
                info("Need to update");
                needToUpdateFunctryToAddOrUpdateVoteOfUserToThreadPartThree(request, response, mainObj, part_3, threadID, studentID);
            } else {
                info("INSERT vote OK");
                insertOKFunctryToAddOrUpdateVoteOfUserToThreadPartThree(request, response, mainObj, part_3, threadID, studentID);
            }
        });
}

/**
 *
 * @param studentID
 * @param threadID
 * @returns {string}
 */
function getVoiceVoteStudentValue(studentID, threadID) {
    const buffer = [];
    buffer.push("SELECT vote_voice FROM vote");
    buffer.push("WHERE vote_student_id = " + studentID + " AND vote_thread_id = " + threadID + " ");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

/**
 *
 * @param oldV
 * @param newV
 * @returns {number}
 */
function getDelta(oldV, newV) {
    if(oldV === newV) return 0;
    if(oldV === -1) return 2;
    return -2;
}

/**
 *
 * @param request
 * @param response
 * @param mainObj
 * @param part_3
 * @param threadID
 * @param studentID
 */
function needToUpdateFunctryToAddOrUpdateVoteOfUserToThreadPartThree(request, response, mainObj, part_3, threadID, studentID) {
    database(getVoiceVoteStudentValue(studentID, threadID))
        .then((p) => {
           const oldVoice = p.rows[0].vote_voice;
           const newVoice = mainObj.voice;
           info("************");

           const delta = getDelta(oldVoice, newVoice);

           const globalBuffer = [];

           if(delta !== 0) {
               const bufferTwo = [];
               bufferTwo.push("UPDATE vote SET");
               bufferTwo.push("vote_voice = " + newVoice + " ");
               bufferTwo.push("WHERE vote_thread_id = " + threadID + " AND vote_student_id = " + studentID + " ;");
               const updateBufferTwoStr = bufferTwo.join(" ");

               const buffer = [];
               buffer.push("UPDATE thread SET");
               if (delta === 2) {
                   buffer.push(" thread_votes = thread_votes + 2 ");
               }
               if (delta === -2) {
                   buffer.push(" thread_votes = thread_votes - 2 ");
               }
               buffer.push("WHERE thread_id = " + threadID + ";");
               const updateBufferStr = buffer.join(" ");

               globalBuffer.push(updateBufferStr);
               globalBuffer.push(updateBufferTwoStr);
           }

           const globalStr = globalBuffer.join(" ");

            database("  " + globalStr + "  " + getThreadByIdVoteGetQuery(threadID))
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
                    answer(response, 200, str(threadResult));
                });
        });
}

/**
 *
 * @param mainObj
 * @param threadID
 * @returns {string}
 */
function updateThreadPostMumberVote(mainObj, threadID) {
    const buffer = [];
    buffer.push("UPDATE thread SET");
    if(mainObj.voice === 1) {
        buffer.push("thread_votes = thread_votes + 1");
    } else {
        buffer.push("thread_votes = thread_votes - 1");
    }
    buffer.push("WHERE thread_id = " + threadID + ";");
    return buffer.join(" ");
}

/**
 *
 * @param threadID
 * @returns {string}
 */
function getThreadByIdVoteGetQuery(threadID) {
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
 * @param part_3
 * @param threadID
 * @param studentID
 */
function insertOKFunctryToAddOrUpdateVoteOfUserToThreadPartThree(request, response, mainObj, part_3, threadID, studentID) {
    database(updateThreadPostMumberVote(mainObj, threadID))
        .then((p1) => {
           database(getThreadByIdVoteGetQuery(threadID))
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
                   if(!onlyNumbers(thread.thread_slug)) {
                       threadResult.slug = thread.thread_slug;
                   }
                   answer(response, 200, str(threadResult));
               })
        });
}
