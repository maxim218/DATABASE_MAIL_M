"use strict";

const ZERO = 0;
const ZAPITAY = ",";

let postIncrementValue = 1;

function findInfoAboutOnePost(response, postID, second) {
    send("SELECT * FROM is_post_exists($1);", [
        parseInt(postID),
    ], (obj) => {
        if(obj.is_post_exists === 'NO') {
            responseGet(response, 404, JSON.stringify({
                message: "POST_NOT_EXISTS"
            }));
        } else {
            // POST_EXISTS_NORMAL_OK

            send(" SELECT * FROM post WHERE post_id = " + postID + " LIMIT 1; ", getEmptyArray(), (ppppp) => {
                log('11111111111');

                let threadID = ppppp.post_thread_id;
                let studentID = ppppp.post_student_id;
                let forumID = ppppp.post_forum_id;

                log("T: " + threadID + "  S: " + studentID + "  F: " + forumID);

                let post = ppppp;

                send(" SELECT * FROM thread WHERE thread_id = " + threadID + " LIMIT 1; ", getEmptyArray(), (ttttt) => {
                    log('22222222222222');

                    let thread = ttttt;

                    send(" SELECT * FROM student WHERE student_id = " + studentID + " LIMIT 1; ", getEmptyArray(), (sssss) => {
                        log('3333333333333');

                        let student = sssss;

                        send(" SELECT * FROM forum WHERE forum_id = " + forumID + " LIMIT 1; ", getEmptyArray(), (fffff) => {
                            log('44444444444444');

                            let forum = fffff;

                            //////////////////////////////////////////////////////////////////////////

                            let studentRes = {
                                about: student.student_about,
                                email: student.student_email,
                                fullname: student.student_fullname,
                                nickname: student.student_nickname
                            };

                            let forumRes = {
                                posts: forum.forum_posts,
                                slug: forum.forum_slug,
                                threads: forum.forum_threads,
                                title: forum.forum_title,
                                user: forum.forum_user_nickname,
                            };

                            let threadRes = {
                                author: thread.thread_author_nickname,
                                created: thread.thread_created,
                                forum: thread.thread_forum_slug,
                                id: thread.thread_id,
                                message: thread.thread_message,
                                title: thread.thread_title,
                                votes: thread.thread_votes,
                            };

                            let postRes = {
                                author: post.post_student_nickname,
                                created: post.post_created,
                                forum: post.post_forum_slug,
                                id: post.post_id,
                                isEdited: post.post_is_edited,
                                message: post.post_message,
                                parent: post.post_parent,
                                thread: post.post_thread_id,
                                path: post.path,
                                root: post.root
                            };

                            //////////////////////////////////////////////////////////////////////////

                            const obj = wordsArray(second);

                            const resultMain = {};

                            if(good(obj["related"])) {
                                const arr = obj["related"].toString().split(ZAPITAY);

                                if(tryToFindElementInArray(arr, "forum") !== NO) resultMain.forum = forumRes;
                                if(tryToFindElementInArray(arr, "thread") !== NO) resultMain.thread = threadRes;
                                if(tryToFindElementInArray(arr, "user") !== NO) resultMain.author = studentRes;
                            }

                            resultMain.post = postRes;

                            responseGet(response, 200, JSON.stringify(resultMain));
                        });
                    });
                });
            });
        }
    });
}

const POSTS_MODEL_FLAT_TYPE = "flat";
const POSTS_MODEL_TREE_TYPE = "tree";
const POSTS_MODEL_PARENT_TREE_TYPE = "parent_tree";
const SORT_P = "sort";

function findPostsList(response, threadID, second) {
    const obj = wordsArray(second);

    let typePrinting = POSTS_MODEL_FLAT_TYPE;
    if(good(obj[SORT_P])) {
        typePrinting = obj[SORT_P].toString();
    }

    switch(typePrinting) {
        case POSTS_MODEL_FLAT_TYPE:
            useFlat(response, threadID, second, obj);
            break;
        case POSTS_MODEL_TREE_TYPE:
            useTree(response, threadID, second, obj);
            break;
        case POSTS_MODEL_PARENT_TREE_TYPE:
            useParentTree(response, threadID, second, obj);
            break;
    }
}

function useParentTree(response, threadID, second, obj) {
    let data = "  ";

    let typeOfSortingPosts = "ASC";
    if(good(obj["desc"])) {
        if(obj["desc"] === "true") typeOfSortingPosts = "DESC";
        if(obj["desc"] === "false") typeOfSortingPosts = "ASC";
    }

    let sinceParam = null;
    if(good(obj["since"])) {
        sinceParam = obj["since"];
    }

    data += " WITH roots AS ( ";
    data += " SELECT post_id FROM post ";
    data  = data + " WHERE post_thread_id = " + threadID + " AND post_parent = 0 ";

    if(sinceParam != null) {
        if(typeOfSortingPosts === "ASC") data = data + " AND post_starting_number > (SELECT post_starting_number FROM post WHERE post_id = " + sinceParam + ") ";
        if(typeOfSortingPosts === "DESC") data = data + " AND post_starting_number < (SELECT post_starting_number FROM post WHERE post_id = " + sinceParam + ") ";
    }

    if(typeOfSortingPosts === "ASC") data = data + "  ORDER BY post_id ASC   ";
    if(typeOfSortingPosts === "DESC") data = data + "  ORDER BY post_id DESC  ";

    if(good(obj["limit"]) === true) {
        data = data + " LIMIT " + obj["limit"] + "   ";
    }

    data += " ) ";

    data = data + " SELECT post.post_id AS id, post_student_nickname AS author, post_created AS created, post_forum_slug AS forum, post_is_edited AS isEdited, post_message AS message, post_parent AS parent, post_thread_id AS thread FROM post JOIN roots ON roots.post_id = post.post_starting_number ";

    if(typeOfSortingPosts === "ASC") data += " ORDER BY post.post_starting_number  ASC,  post.post_main_array  ";
    if(typeOfSortingPosts === "DESC") data += " ORDER BY post.post_starting_number  DESC,  post.post_main_array  ";

    data += " ; ";

    sendWithArr(data, [], (res) => {
        responseGet(response, 200, JSON.stringify(res));
    });
}

function useTree(response, threadID, second, obj) {
    let data = "SELECT * FROM post WHERE post_thread_id = " + threadID + "  ";

    let typeOfSortingPosts = "ASC";
    if(good(obj["desc"])) {
        if(obj["desc"] === "true") typeOfSortingPosts = "DESC";
        if(obj["desc"] === "false") typeOfSortingPosts = "ASC";
    }

    let sinceParam = null;
    if(good(obj["since"])) {
        sinceParam = obj["since"];
    }

    if(sinceParam !== null) {
        if (typeOfSortingPosts === "ASC") data = data + " AND post.post_main_array > (SELECT post_main_array FROM post WHERE post_id = " + sinceParam + ") ";
        if (typeOfSortingPosts === "DESC") data = data + " AND post.post_main_array < (SELECT post_main_array FROM post WHERE post_id = " + sinceParam + ") ";
    }

    if(typeOfSortingPosts === "ASC") data = data + " ORDER BY post.post_main_array ASC    ";
    if(typeOfSortingPosts === "DESC") data = data + " ORDER BY post.post_main_array DESC   ";

    if(good(obj["limit"])) {
        data = data + " LIMIT " + obj["limit"] + " ";
    }

    data += " ; ";

    sendWithArr(data, [], (arr) => {
        const res = getEmptyArray();
        log(res);
        arr.forEach((element) => {
            const obj = element;
            res.push({
                author: obj.post_student_nickname,
                created: obj.post_created,
                forum: obj.post_forum_slug,
                id: obj.post_id,
                isEdited: obj.post_is_edited,
                message: obj.post_message,
                parent: obj.post_parent,
                thread: obj.post_thread_id,
                path: obj.path,
                root: obj.root
            });
        });

        responseGet(response, 200, JSON.stringify(res));
    });
}

function useFlat(response, threadID, second, obj) {
    let data = "SELECT * FROM post WHERE post_thread_id = " + threadID + "  ";

    let typeOfSortingPosts = "ASC";
    if(good(obj["desc"])) {
        if(obj["desc"] === "true") typeOfSortingPosts = "DESC";
        if(obj["desc"] === "false") typeOfSortingPosts = "ASC";
    }

    if(good(obj["since"])) {
        if(typeOfSortingPosts === "ASC") data = data + "  AND post_id > " + obj["since"] + "  ";
        if(typeOfSortingPosts === "DESC") data = data + "  AND post_id < " + obj["since"] + "  ";
    }

    if(typeOfSortingPosts === "ASC") data = data + "  ORDER BY post_id ASC    ";
    if(typeOfSortingPosts === "DESC") data = data + "  ORDER BY post_id DESC   ";

    if(good(obj["limit"]) === true) {
        data = data + " LIMIT " +  obj["limit"] + " ";
    }

    data += " ; ";

    sendWithArr(data, [], (arr) => {
        const res = getEmptyArray();
        log(res);
        arr.forEach((element) => {
            const obj = element;
            res.push({
                author: obj.post_student_nickname,
                created: obj.post_created,
                forum: obj.post_forum_slug,
                id: obj.post_id,
                isEdited: obj.post_is_edited,
                message: obj.post_message,
                parent: obj.post_parent,
                thread: obj.post_thread_id,
                path: obj.path,
                root: obj.root
            });
        });

        responseGet(response, 200, JSON.stringify(res));
    });
}

function findInformationAboutListOfPosts(response, threadIDorSLUG, second) {
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
                responseGet(response, 404, JSON.stringify({
                    message: "THREAD_NOT_FOUND"
                }));
            } else {
                //thread exists normal
                const threadID = parseInt(t_id);
                findPostsList(response, threadID, second);
            }
        });
    }

    if(t_slug !== null) {
        send("SELECT * FROM find_thread_id($1);", [
            t_slug.toString()
        ], (obj) => {
            log(obj);
            if(parseInt(obj.find_thread_id) === NO) {
                responseGet(response, 404, JSON.stringify({
                    message: "THREAD_NOT_FOUND"
                }));
            } else {
                //thread exists normal
                const threadID = parseInt(obj.find_thread_id);
                findPostsList(response, threadID, second);
            }
        })
    }
}

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

                                sendWithArr(resultPartQuery, getEmptyArray(), (arr) => {

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

                                        for(let i = 0; i < posts.length; ++i) {

                                            postIncrementValue += 1;
                                            posts[i].id = postIncrementValue;

                                            let find = false;
                                            for(let j = 0; j < parentsDatabseArr.length; j++) {
                                                if(posts[i].parent === parentsDatabseArr[j].post_id) {
                                                    posts[i].root = 0;
                                                    const helping_array = parentsDatabseArr[j].post_main_array;
                                                    posts[i].path = getEmptyArray();
                                                    writeFirstArrayToSecondArray(helping_array, posts[i].path);
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
                                            xxx = xxx + " SELECT * FROM inc_number_of_posts_in_forum(" + FORUM_ID + "); ";

                                            hugeString += xxx;
                                        }

                                        sendWithArr(hugeString, getEmptyArray(), (arr) => {

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
                                                });
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
        });
    }
}