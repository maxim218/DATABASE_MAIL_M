"use strict";

const NOT_CHANGE = "@@@_NOT_CHANGE";

function updateStudentInformation(response, nickname, bodyObj) {
    let about = NOT_CHANGE;
    if(bodyObj.about) {
        about = bodyObj.about;
    }

    let email = NOT_CHANGE;
    if(bodyObj.email) {
        email = bodyObj.email;
    }

    let fullname = NOT_CHANGE;
    if(bodyObj.fullname) {
        fullname = bodyObj.fullname;
    }

    send("SELECT * FROM update_student_information($1, $2, $3, $4);", [
        about,
        email,
        fullname,
        nickname
    ], (obj) => {
        let body = obj.update_student_information;
        log(body);

        if(body === "STUDENT_NOT_EXISTS") {
            responsePost(response, 404, JSON.stringify({
                message: "STUDENT_NOT_EXISTS"
            }));
        } else if(body === "STUDENT_CONFLICT_EMAIL") {
            responsePost(response, 409, JSON.stringify({
                message: "STUDENT_CONFLICT_EMAIL"
            }));
        } else {
            body = JSON.parse(body);
            body = body[0];
            responsePost(response, 200, JSON.stringify({
                about: body.student_about,
                email: body.student_email,
                fullname: body.student_fullname,
                nickname: body.student_nickname
            }));
        }
    });
}

function studentInformation(response, nickname) {
    send("SELECT * FROM information_student($1);", [
        nickname
    ], (obj) => {
       let body = obj.information_student;
       log(body);
       if(body === 'STUDENT_NOT_FOUND') {
           responseGet(response, 404, JSON.stringify({
               message: "STUDENT_NOT_FOUND"
           }));
       } else {
           body = JSON.parse(body);
           body = body[0];
           responseGet(response, 200, JSON.stringify({
               about: body.student_about,
               email: body.student_email,
               fullname: body.student_fullname,
               nickname: body.student_nickname
           }));
       }
    });
}

function registrateStudent(response, nickname, body) {
    send("SELECT * FROM registrate_student($1, $2, $3, $4);", [
        body.about,
        body.email,
        body.fullname,
        nickname
    ], (obj) => {
       log(obj);
       if(obj.registrate_student === 'INSERT_STUDENT_OK') {
           responsePost(response, 201, JSON.stringify({
               about: body.about,
               email: body.email,
               fullname: body.fullname,
               nickname: nickname
           }));
       } else {
            const arr = JSON.parse(obj.registrate_student);
            const res = [];
            arr.forEach((student) => {
                res.push({
                    about: student.student_about,
                    email: student.student_email,
                    fullname: student.student_fullname,
                    nickname: student.student_nickname
                });
            });

            responsePost(response, 409, JSON.stringify(res));
       }
    });
}