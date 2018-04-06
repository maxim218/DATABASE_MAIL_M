"use strict";

const U = "user";
const C = "create";
const P = "profile";
const F = "forum";
const D = "details";

application.get('/*', (request, response) => {
    log("\n\n");
    log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
    log("GET");
    log("Location: " + request.url);

    if(request.url === "/api") {
        send(databaseContentContentString, [], (arr) => {
            responseGet(response, 200, JSON.stringify({
                message: "Query /api OK"
            }));
        });
        return null;
    }

    const parts = request.url.split("/");

    if(parts[2] === U) {
        if(parts[4] === P) {
            studentInformation(response, parts[3]);
            return null;
        }
    }

    if(parts[2] === F) {
        if(parts[4] === D) {
            forumInformation(response, parts[3]);
            return null;
        }
    }

});

application.post('/*', (request, response) => {
    let body = "";
    request.on('data', (data) => {
        body += data;
    }).on('end', () => {
        const bodyObj = JSON.parse(body);

        log("\n\n");
        log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
        log("POST");
        log("Location: " + request.url);
        log("\nBody: " + body);

        const parts = request.url.split("/");

        if(request.url === "/api/forum/create") {
            createNewForum(response, bodyObj);
            return null;
        }

        if(parts[2] === U) {
            if(parts[4] === C) {
                registrateStudent(response, parts[3], bodyObj);
                return null;
            }
        }

        if(parts[2] === U) {
            if(parts[4] === P) {
                updateStudentInformation(response, parts[3], bodyObj);
                return null;
            }
        }

    });
});

