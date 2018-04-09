"use strict";

function getNow() {
    return (new Date().toISOString() + "").toString();
}

const NUMBERS = "1234567890";

const NO = -1;

function getYes() {
    return true;
}

function getNo() {
    return false;
}

function getObj() {
    return {};
}

function onlyNumbers(stringContentParam) {
    for(let i = 0; i < stringContentParam.length; ++i) {
        const stringElement = stringContentParam.charAt(i);
        if(NUMBERS.indexOf(stringElement) === NO) {
            return getNo();
        }
    }
    return getYes();
}

const URL_SPLITTER = "&";
const EQUAL_CHAR = "=";

function wordsArray(stringContentParam) {
    if(stringContentParam) {
        const wordsObject = getObj();
        const a = stringContentParam.split(URL_SPLITTER);
        a.forEach((element) => {
            const q = element.toString().split(EQUAL_CHAR);
            const w1 = q[0];
            const w2 = q[1];
            wordsObject[w1] = decodeURIComponent(w2);
        });
        return wordsObject;
    } else {
        return getObj();
    }
}

function good(element) {
    if(element === null) {
        return false;
    }

    return element !== undefined;
}

function getParam(inputIf, trueParamOut, falseParamOut) {
    if(inputIf === true) {
        return trueParamOut;
    }
    return falseParamOut;
}

function emptyArray(arrayParam) {
    if(arrayParam.length === 0) {
        return getYes();
    } else {
        return getNo();
    }
}

function getEmptyArray() {
    return [];
}

function writeFirstArrayToSecondArray(arrayFirst, secondResultArray) {
    arrayFirst.forEach((value) => {
        secondResultArray.push(value);
    });
}

function tryToFindElementInArray(arr, stringParam) {
    return arr.indexOf(stringParam);
}
