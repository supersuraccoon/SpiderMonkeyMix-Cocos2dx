require("jsb.js");

function MyLogFunc() {
    js_addLogToCLI("[JS] MyLogFunc called ~", 2);
}

function DubleIntFunc(value) {
    js_addLogToCLI("[JS] DubleIntFunc called with int: " + value, 2);
    value *= 2;
    return value;
}
