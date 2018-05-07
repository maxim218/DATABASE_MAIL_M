"use strict";

// User actions service

function updateUserQuery(mainObj, part_3) {
    const buffer = [];
    buffer.push("UPDATE student SET student_id = student_id + 0");
    if(mainObj.about) {
        buffer.push("student_about = '" + mainObj.about + "'");
    }
    if(mainObj.email) {
        buffer.push("student_email = '" + mainObj.email + "'");
    }
    if(mainObj.fullname) {
        buffer.push("student_fullname = '" + mainObj.fullname + "'");
    }
    let part = buffer.join(" , ");
    part = part + " WHERE LOWER(student_nickname) = LOWER('" + part_3 + "');";
    return part;
}

function selectOneUserQuery(part_3) {
    const buffer = [];
    buffer.push("SELECT * FROM student");
    buffer.push("WHERE LOWER(student_nickname) = LOWER('" + part_3 + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function getOneStudentFromArr(p) {
    const arr = [];
    p.rows.forEach((element) => {
        arr.push({
            about: element.student_about,
            email: element.student_email,
            fullname: element.student_fullname,
            nickname: element.student_nickname,
        });
    });
    return arr[0];
}

function tryToUpdateInformationAboutUserAfterControlUserExists(request, response, mainObj, part_3) {
    const part = updateUserQuery(mainObj, part_3);
    database(part)
        .then((p) => {
            if(p.err) {
                answer(response, 409, str({
                    message: part_3,
                }));
            } else {
                database(selectOneUserQuery(part_3))
                    .then((p) => {
                        const data = getOneStudentFromArr(p);
                        answer(response, 200, str(data));
                    });
            }
        });
}

function getStudentCountFromArr(part_3) {
    const buffer = [];
    buffer.push("SELECT COUNT(*) FROM student WHERE");
    buffer.push("LOWER(student_nickname) = LOWER('" + part_3 + "');");
    return buffer.join(" ");
}

function tryToUpdateInformationAboutUser(request, response, mainObj, part_3) {
    database(getStudentCountFromArr(part_3))
        .then((p) => {
            const count = parseInt(p.rows[0].count);
            if(!count) {
                answer(response, 404, str({
                    message: part_3,
                }));
            } else {
                tryToUpdateInformationAboutUserAfterControlUserExists(request, response, mainObj, part_3);
            }
        });
}

function getOneStudentFromArray(part_3) {
    const buffer = [];
    buffer.push("SELECT * FROM student WHERE");
    buffer.push("LOWER(student_nickname) = LOWER('" + part_3 + "')");
    buffer.push("LIMIT 1;");
    return buffer.join(" ");
}

function getInfoOneStudentFromArr(p, response) {
    const arr = [];
    p.rows.forEach((element) => {
        arr.push({
            about: element.student_about,
            email: element.student_email,
            fullname: element.student_fullname,
            nickname: element.student_nickname,
        });
    });
    answer(response, 200, str(arr[0]));
}

function tryToGetInformationAboutUserInDatabase(request, response, part_3) {
    database(getOneStudentFromArray(part_3))
        .then((p) => {
           if(p.rows.length) {
               getInfoOneStudentFromArr(p, response);
           } else {
               answer(response, 404, str({
                   message: part_3,
               }))
           }
        });
}

function insertStudentQuery(mainObj, part_3) {
    const buffer = [];
    buffer.push("INSERT INTO student (student_about, student_email, ");
    buffer.push("student_fullname, student_nickname) VALUES (");
    let arr = [mainObj.about, mainObj.email, mainObj.fullname, part_3];
    arr = arr.map((value) => {
        return "'" + value + "'";
    });
    buffer.push(arr.join(","));
    buffer.push(");");
    return buffer.join("");
}

function getConflictStudentsQuery(mainObj, part_3) {
    const buffer = [];
    buffer.push("SELECT * FROM student WHERE ");
    buffer.push("LOWER(student_email) = LOWER('" + mainObj.email + "')");
    buffer.push("OR");
    buffer.push("LOWER(student_nickname) = LOWER('" + part_3 + "')");
    buffer.push("LIMIT 2;");
    return buffer.join(" ");
}

function sendConflictStudents(p, response) {
    const arr = [];
    p.rows.forEach((element) => {
        arr.push({
            about: element.student_about,
            email: element.student_email,
            fullname: element.student_fullname,
            nickname: element.student_nickname,
        });
    });
    answer(response, 409, str(arr));
}

function tryToAddUserToDatabase(request, response, mainObj, part_3) {
    database(insertStudentQuery(mainObj, part_3) )
        .then((p) => {
            if(p.err) {
                database(getConflictStudentsQuery(mainObj, part_3))
                    .then((p) => {
                        sendConflictStudents(p, response);
                    });
            } else {
                answer(response, 201, str({
                    about: mainObj.about,
                    email: mainObj.email,
                    fullname: mainObj.fullname,
                    nickname: part_3,
                }));
            }
        })
}
