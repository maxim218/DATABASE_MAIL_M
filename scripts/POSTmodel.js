"use strict";

const ZERO = 0;

let postIncrementValue = 1;

function createNewListOfPosts(response, threadIDorSLUG, bodyObj) {
    function createNewListOfPostsAfterThreadControl(response, threadIDParam, bodyObj) {
        const created = getNow();

        sendWithArr("SELECT forum_id, forum_slug FROM forum INNER JOIN thread ON (forum_id = thread_forum_id) WHERE thread_id = " + threadIDParam + " LIMIT 1;", [], (w) => {
            const FORUM_ID = w[0].forum_id;
            const FORUM_SLUG = w[0].forum_slug;

            const threadID = parseInt(threadIDParam);
            log("$$$$ ThreadID: " + threadID);
            const posts = bodyObj;
            if(emptyArray(posts) === true) {
                responsePost(response, 201, JSON.stringify(getEmptyArray()));
            } else {
                const parents = getEmptyArray();

                posts.forEach((post) => {
                    if(good(post.parent) === false) {
                        post.parent = ZERO;
                    }
                    parents.push(post.parent);
                });

                log("Parents: " + JSON.stringify(parents));

                const parentsString = " ARRAY " + "[" + parents.join(",") + "] ";

                send("SELECT * FROM are_all_parents_exists (" + parentsString + ", " + threadID + "); ", [], (obj) => {
                    if(obj.are_all_parents_exists === "NO") {
                        responsePost(response, 409, JSON.stringify({
                            message: "PARENT_NOT_EXISTS"
                        }));
                    } else {

                        const students = getEmptyArray();
                        posts.forEach((post) => {
                            students.push("'" + post.author + "'");
                        });
                        const studentsString = " ARRAY " + "[" + students.join(",") + "] ";

                        send("SELECT * FROM are_all_students_exists(" + studentsString + ");", [], (obj) => {
                            if(obj.are_all_students_exists === "NO") {
                                responsePost(response, 404, JSON.stringify({
                                    message: "ONE_OF_STUDENTS_NOT_EXISTS"
                                }));
                            } else {

                                const createdPostsData = getNow();

                                let parents_str = "(" + parents.join(",") + ")";

                                const partFirst = " SELECT post_id, post_parent, post_starting_number, post_main_array FROM post WHERE post_thread_id = " + threadID + " AND post_id IN " + parents_str + " ";
                                const partSecond = " SELECT post_id, post_parent, post_starting_number, post_main_array FROM post WHERE post_thread_id = " + threadID + " AND post_id IN " + parents_str + " ";
                                const resultPartQuery = partFirst + " UNION " + partSecond + ";";

                                sendWithArr(resultPartQuery, [], (arr) => {

                                    log("$$$ AAAA $$$$");


                                    let parentsDatabseArr = arr;

                                    ////////////////////////////////

                                    for(let i = 0; i < students.length; i++) {
                                        students[i] = " LOWER(" + students[i] + ") ";
                                    }

                                    const stud_str = "(" + students.join(",") + ")";
                                    sendWithArr("SELECT student_id, student_nickname FROM student WHERE LOWER(student_nickname) IN " + stud_str + ";", [], (arr) => {
                                        log("$$$ BBBB $$$$");
                                        log(arr);
                                        const studentsDatabase = arr;

                                        for(let i = 0; i < posts.length; ++i) {
                                            const nickname = posts[i].author.toLowerCase();

                                            for(let j = 0; j < studentsDatabase.length; j++) {
                                                log("studentsDatabase[j]");
                                                log(studentsDatabase[j]);
                                                const nicknameDB = studentsDatabase[j].student_nickname.toLowerCase();
                                                if(nickname === nicknameDB) {
                                                    posts[i].author_id = studentsDatabase[j].student_id;
                                                    posts[i].author = studentsDatabase[j].student_nickname;
                                                    break;
                                                }
                                            }
                                        }

                                        let hugeString = "  ";

                                        function copyArray(answer, arr) {
                                            for(let i = 0; i < arr.length; i++) {
                                                answer.push(arr[i]);
                                            }
                                        }

                                        for(let i = 0; i < posts.length; ++i) {

                                            postIncrementValue += 1;
                                            posts[i].id = postIncrementValue;
                                            log("ID: " + posts[i].id);

                                            let find = false;
                                            for(let j = 0; j < parentsDatabseArr.length; j++) {
                                                if(posts[i].parent === parentsDatabseArr[j].post_id) {
                                                    posts[i].root = 0;
                                                    const mmm = parentsDatabseArr[j].post_main_array;

                                                    posts[i].path = [];
                                                    // copy arrays
                                                    copyArray(posts[i].path, mmm);
                                                    posts[i].path.push(posts[i].id);

                                                    find = true;
                                                    break;
                                                }
                                            }

                                            if(find === false || posts[i].parent === 0) {
                                                posts[i].root = posts[i].id;
                                                posts[i].path = " ARRAY [ " + posts[i].id + " ] ";
                                            } else {
                                                posts[i].root = posts[i].path[0];
                                                posts[i].path = "ARRAY [ " +  posts[i].path.join(" , ") + " ] ";
                                            }

                                            posts[i].path = "" + posts[i].path;

                                            let xxx = "  INSERT INTO post (";
                                            xxx = xxx + " post_id, post_student_nickname, post_student_id, post_created, post_forum_slug, post_forum_id, ";
                                            xxx = xxx + " post_is_edited,post_message,post_parent,post_thread_id,post_starting_number,post_main_array) ";
                                            xxx = xxx + " VALUES ";

                                            const a1 = posts[i].id;
                                            const a2 = posts[i].author;
                                            const a3 = posts[i].author_id;
                                            const a4 = created.toString();
                                            const a5 = FORUM_SLUG;
                                            const a6 = FORUM_ID;
                                            const a7 = "False";
                                            const a8 = posts[i].message;
                                            const a9 = posts[i].parent;
                                            const a10 = threadID;
                                            const a11 = posts[i].root;
                                            const a12 = posts[i].path;

                                            xxx = xxx + "(" + a1 + ",'" + a2 + "'," + a3 + ",'" + a4 + "','" + a5 + "'," + a6 + "," + a7 + ",'" + a8 + "'," + a9 + "," + a10 + "," + a11 + "," + a12 + "); ";

                                            xxx = xxx + " SELECT * FROM create_new_pair(" + posts[i].author_id + ", " + FORUM_ID + ");";

                                            hugeString += xxx;
                                        }

                                        sendWithArr(hugeString, [], (arr) => {

                                            let res = [];

                                            posts.forEach((obj) => {
                                                res.push({
                                                    user_id: obj.author_id,
                                                    author: obj.author,
                                                    created: created,
                                                    forum: FORUM_SLUG,
                                                    id: obj.id,
                                                    isEdited: false,
                                                    message: obj.message,
                                                    parent: obj.parent,
                                                    thread: threadID,
                                                    path: obj.path,
                                                    root: obj.root
                                                })
                                            });

                                            responsePost(response, 201, JSON.stringify(res));
                                        });
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    /////////////////////////////////////
    /////////////////////////////////////

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
               //////////////////////
               //////////////////////
               const threadID = parseInt(t_id);
               createNewListOfPostsAfterThreadControl(response, threadID, bodyObj);
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
                //////////////////////
                //////////////////////
                const threadID = parseInt(obj.find_thread_id);
                createNewListOfPostsAfterThreadControl(response, threadID, bodyObj);
            }
        })
    }
}