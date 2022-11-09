var html = "<div><p>testing</p><p>ceshi</p></div>";
// const html = "<p>testing</p>"
var State;
(function (State) {
    State[State["START"] = 0] = "START";
    State[State["OPEN_TAG"] = 1] = "OPEN_TAG";
    State[State["CLOSE_TAG"] = 2] = "CLOSE_TAG";
    State[State["TEXT"] = 3] = "TEXT";
})(State || (State = {}));
var MyNode = /** @class */ (function () {
    function MyNode(tagName, children) {
        if (children === void 0) { children = []; }
        this.tagName = tagName;
        this.children = children;
    }
    MyNode.prototype.print = function (indent) {
        if (indent === void 0) { indent = 0; }
        console.log("".concat(" ".repeat(indent)).concat(this.tagName));
        this.children.forEach(function (child) {
            if (typeof child === "string") {
                console.log("".concat(" ".repeat(indent + 2)).concat(child));
            }
            else {
                child.print(indent + 2);
            }
        });
    };
    return MyNode;
}());
function compileHtml(html) {
    var currentState = State.START;
    var stack = [];
    var res = [];
    var curText = "";
    for (var i = 0, len = html.length; i < len; i++) {
        switch (currentState) {
            case State.START:
                if (html[i] === "<") {
                    currentState = State.OPEN_TAG;
                }
                else {
                    currentState = State.TEXT;
                    curText += html[i];
                }
                break;
            case State.OPEN_TAG:
                if (html[i] === ">") {
                    currentState = State.START;
                    var node = new MyNode(curText);
                    if (stack.length === 0) {
                        res.push(node);
                    }
                    stack.push(node);
                    curText = "";
                }
                else if (html[i] === "/") {
                    currentState = State.CLOSE_TAG;
                }
                else {
                    curText += html[i];
                }
                break;
            case State.TEXT:
                if (html[i] === "<") {
                    currentState = State.OPEN_TAG;
                    stack[stack.length - 1].children.push(curText);
                    curText = "";
                }
                else {
                    curText += html[i];
                }
                break;
            case State.CLOSE_TAG:
                if (html[i] === ">") {
                    if (curText !== stack[stack.length - 1].tagName) {
                        throw "Closing tag does not match opening tag";
                    }
                    currentState = State.START;
                    curText = "";
                    var popped = stack.pop();
                    if (stack.length) {
                        stack[stack.length - 1].children.push(popped);
                    }
                }
                else {
                    curText += html[i];
                }
                break;
        }
    }
    return res;
}
var res = compileHtml(html);
res.forEach(function (root) { return root.print(); });
