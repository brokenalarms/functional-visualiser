(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\Users\\pitch\\functional-visualiser\\node_modules\\brace\\mode\\javascript.js":[function(require,module,exports){
ace.define("ace/mode/doc_comment_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(acequire, exports, module) {
"use strict";

var oop = acequire("../lib/oop");
var TextHighlightRules = acequire("./text_highlight_rules").TextHighlightRules;

var DocCommentHighlightRules = function() {
    this.$rules = {
        "start" : [ {
            token : "comment.doc.tag",
            regex : "@[\\w\\d_]+" // TODO: fix email addresses
        },
        DocCommentHighlightRules.getTagRule(),
        {
            defaultToken : "comment.doc",
            caseInsensitive: true
        }]
    };
};

oop.inherits(DocCommentHighlightRules, TextHighlightRules);

DocCommentHighlightRules.getTagRule = function(start) {
    return {
        token : "comment.doc.tag.storage.type",
        regex : "\\b(?:TODO|FIXME|XXX|HACK)\\b"
    };
}

DocCommentHighlightRules.getStartRule = function(start) {
    return {
        token : "comment.doc", // doc comment
        regex : "\\/\\*(?=\\*)",
        next  : start
    };
};

DocCommentHighlightRules.getEndRule = function (start) {
    return {
        token : "comment.doc", // closing comment
        regex : "\\*\\/",
        next  : start
    };
};


exports.DocCommentHighlightRules = DocCommentHighlightRules;

});

ace.define("ace/mode/javascript_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/doc_comment_highlight_rules","ace/mode/text_highlight_rules"], function(acequire, exports, module) {
"use strict";

var oop = acequire("../lib/oop");
var DocCommentHighlightRules = acequire("./doc_comment_highlight_rules").DocCommentHighlightRules;
var TextHighlightRules = acequire("./text_highlight_rules").TextHighlightRules;

var JavaScriptHighlightRules = function(options) {
    var keywordMapper = this.createKeywordMapper({
        "variable.language":
            "Array|Boolean|Date|Function|Iterator|Number|Object|RegExp|String|Proxy|"  + // Constructors
            "Namespace|QName|XML|XMLList|"                                             + // E4X
            "ArrayBuffer|Float32Array|Float64Array|Int16Array|Int32Array|Int8Array|"   +
            "Uint16Array|Uint32Array|Uint8Array|Uint8ClampedArray|"                    +
            "Error|EvalError|InternalError|RangeError|ReferenceError|StopIteration|"   + // Errors
            "SyntaxError|TypeError|URIError|"                                          +
            "decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|eval|isFinite|" + // Non-constructor functions
            "isNaN|parseFloat|parseInt|"                                               +
            "JSON|Math|"                                                               + // Other
            "this|arguments|prototype|window|document"                                 , // Pseudo
        "keyword":
            "const|yield|import|get|set|" +
            "break|case|catch|continue|default|delete|do|else|finally|for|function|" +
            "if|in|instanceof|new|return|switch|throw|try|typeof|let|var|while|with|debugger|" +
            "__parent__|__count__|escape|unescape|with|__proto__|" +
            "class|enum|extends|super|export|implements|private|public|interface|package|protected|static",
        "storage.type":
            "const|let|var|function",
        "constant.language":
            "null|Infinity|NaN|undefined",
        "support.function":
            "alert",
        "constant.language.boolean": "true|false"
    }, "identifier");
    var kwBeforeRe = "case|do|else|finally|in|instanceof|return|throw|try|typeof|yield|void";
    var identifierRe = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*\\b";

    var escapedRe = "\\\\(?:x[0-9a-fA-F]{2}|" + // hex
        "u[0-9a-fA-F]{4}|" + // unicode
        "[0-2][0-7]{0,2}|" + // oct
        "3[0-6][0-7]?|" + // oct
        "37[0-7]?|" + // oct
        "[4-7][0-7]?|" + //oct
        ".)";

    this.$rules = {
        "no_regex" : [
            {
                token : "comment",
                regex : "\\/\\/",
                next : "line_comment"
            },
            DocCommentHighlightRules.getStartRule("doc-start"),
            {
                token : "comment", // multi line comment
                regex : /\/\*/,
                next : "comment"
            }, {
                token : "string",
                regex : "'(?=.)",
                next  : "qstring"
            }, {
                token : "string",
                regex : '"(?=.)',
                next  : "qqstring"
            }, {
                token : "constant.numeric", // hex
                regex : /0[xX][0-9a-fA-F]+\b/
            }, {
                token : "constant.numeric", // float
                regex : /[+-]?\d+(?:(?:\.\d*)?(?:[eE][+-]?\d+)?)?\b/
            }, {
                token : [
                    "storage.type", "punctuation.operator", "support.function",
                    "punctuation.operator", "entity.name.function", "text","keyword.operator"
                ],
                regex : "(" + identifierRe + ")(\\.)(prototype)(\\.)(" + identifierRe +")(\\s*)(=)",
                next: "function_arguments"
            }, {
                token : [
                    "storage.type", "punctuation.operator", "entity.name.function", "text",
                    "keyword.operator", "text", "storage.type", "text", "paren.lparen"
                ],
                regex : "(" + identifierRe + ")(\\.)(" + identifierRe +")(\\s*)(=)(\\s*)(function)(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : [
                    "entity.name.function", "text", "keyword.operator", "text", "storage.type",
                    "text", "paren.lparen"
                ],
                regex : "(" + identifierRe +")(\\s*)(=)(\\s*)(function)(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : [
                    "storage.type", "punctuation.operator", "entity.name.function", "text",
                    "keyword.operator", "text",
                    "storage.type", "text", "entity.name.function", "text", "paren.lparen"
                ],
                regex : "(" + identifierRe + ")(\\.)(" + identifierRe +")(\\s*)(=)(\\s*)(function)(\\s+)(\\w+)(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : [
                    "storage.type", "text", "entity.name.function", "text", "paren.lparen"
                ],
                regex : "(function)(\\s+)(" + identifierRe + ")(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : [
                    "entity.name.function", "text", "punctuation.operator",
                    "text", "storage.type", "text", "paren.lparen"
                ],
                regex : "(" + identifierRe + ")(\\s*)(:)(\\s*)(function)(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : [
                    "text", "text", "storage.type", "text", "paren.lparen"
                ],
                regex : "(:)(\\s*)(function)(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : "keyword",
                regex : "(?:" + kwBeforeRe + ")\\b",
                next : "start"
            }, {
                token : ["punctuation.operator", "support.function"],
                regex : /(\.)(s(?:h(?:ift|ow(?:Mod(?:elessDialog|alDialog)|Help))|croll(?:X|By(?:Pages|Lines)?|Y|To)?|t(?:op|rike)|i(?:n|zeToContent|debar|gnText)|ort|u(?:p|b(?:str(?:ing)?)?)|pli(?:ce|t)|e(?:nd|t(?:Re(?:sizable|questHeader)|M(?:i(?:nutes|lliseconds)|onth)|Seconds|Ho(?:tKeys|urs)|Year|Cursor|Time(?:out)?|Interval|ZOptions|Date|UTC(?:M(?:i(?:nutes|lliseconds)|onth)|Seconds|Hours|Date|FullYear)|FullYear|Active)|arch)|qrt|lice|avePreferences|mall)|h(?:ome|andleEvent)|navigate|c(?:har(?:CodeAt|At)|o(?:s|n(?:cat|textual|firm)|mpile)|eil|lear(?:Timeout|Interval)?|a(?:ptureEvents|ll)|reate(?:StyleSheet|Popup|EventObject))|t(?:o(?:GMTString|S(?:tring|ource)|U(?:TCString|pperCase)|Lo(?:caleString|werCase))|est|a(?:n|int(?:Enabled)?))|i(?:s(?:NaN|Finite)|ndexOf|talics)|d(?:isableExternalCapture|ump|etachEvent)|u(?:n(?:shift|taint|escape|watch)|pdateCommands)|j(?:oin|avaEnabled)|p(?:o(?:p|w)|ush|lugins.refresh|a(?:ddings|rse(?:Int|Float)?)|r(?:int|ompt|eference))|e(?:scape|nableExternalCapture|val|lementFromPoint|x(?:p|ec(?:Script|Command)?))|valueOf|UTC|queryCommand(?:State|Indeterm|Enabled|Value)|f(?:i(?:nd|le(?:ModifiedDate|Size|CreatedDate|UpdatedDate)|xed)|o(?:nt(?:size|color)|rward)|loor|romCharCode)|watch|l(?:ink|o(?:ad|g)|astIndexOf)|a(?:sin|nchor|cos|t(?:tachEvent|ob|an(?:2)?)|pply|lert|b(?:s|ort))|r(?:ou(?:nd|teEvents)|e(?:size(?:By|To)|calc|turnValue|place|verse|l(?:oad|ease(?:Capture|Events)))|andom)|g(?:o|et(?:ResponseHeader|M(?:i(?:nutes|lliseconds)|onth)|Se(?:conds|lection)|Hours|Year|Time(?:zoneOffset)?|Da(?:y|te)|UTC(?:M(?:i(?:nutes|lliseconds)|onth)|Seconds|Hours|Da(?:y|te)|FullYear)|FullYear|A(?:ttention|llResponseHeaders)))|m(?:in|ove(?:B(?:y|elow)|To(?:Absolute)?|Above)|ergeAttributes|a(?:tch|rgins|x))|b(?:toa|ig|o(?:ld|rderWidths)|link|ack))\b(?=\()/
            }, {
                token : ["punctuation.operator", "support.function.dom"],
                regex : /(\.)(s(?:ub(?:stringData|mit)|plitText|e(?:t(?:NamedItem|Attribute(?:Node)?)|lect))|has(?:ChildNodes|Feature)|namedItem|c(?:l(?:ick|o(?:se|neNode))|reate(?:C(?:omment|DATASection|aption)|T(?:Head|extNode|Foot)|DocumentFragment|ProcessingInstruction|E(?:ntityReference|lement)|Attribute))|tabIndex|i(?:nsert(?:Row|Before|Cell|Data)|tem)|open|delete(?:Row|C(?:ell|aption)|T(?:Head|Foot)|Data)|focus|write(?:ln)?|a(?:dd|ppend(?:Child|Data))|re(?:set|place(?:Child|Data)|move(?:NamedItem|Child|Attribute(?:Node)?)?)|get(?:NamedItem|Element(?:sBy(?:Name|TagName|ClassName)|ById)|Attribute(?:Node)?)|blur)\b(?=\()/
            }, {
                token : ["punctuation.operator", "support.constant"],
                regex : /(\.)(s(?:ystemLanguage|cr(?:ipts|ollbars|een(?:X|Y|Top|Left))|t(?:yle(?:Sheets)?|atus(?:Text|bar)?)|ibling(?:Below|Above)|ource|uffixes|e(?:curity(?:Policy)?|l(?:ection|f)))|h(?:istory|ost(?:name)?|as(?:h|Focus))|y|X(?:MLDocument|SLDocument)|n(?:ext|ame(?:space(?:s|URI)|Prop))|M(?:IN_VALUE|AX_VALUE)|c(?:haracterSet|o(?:n(?:structor|trollers)|okieEnabled|lorDepth|mp(?:onents|lete))|urrent|puClass|l(?:i(?:p(?:boardData)?|entInformation)|osed|asses)|alle(?:e|r)|rypto)|t(?:o(?:olbar|p)|ext(?:Transform|Indent|Decoration|Align)|ags)|SQRT(?:1_2|2)|i(?:n(?:ner(?:Height|Width)|put)|ds|gnoreCase)|zIndex|o(?:scpu|n(?:readystatechange|Line)|uter(?:Height|Width)|p(?:sProfile|ener)|ffscreenBuffering)|NEGATIVE_INFINITY|d(?:i(?:splay|alog(?:Height|Top|Width|Left|Arguments)|rectories)|e(?:scription|fault(?:Status|Ch(?:ecked|arset)|View)))|u(?:ser(?:Profile|Language|Agent)|n(?:iqueID|defined)|pdateInterval)|_content|p(?:ixelDepth|ort|ersonalbar|kcs11|l(?:ugins|atform)|a(?:thname|dding(?:Right|Bottom|Top|Left)|rent(?:Window|Layer)?|ge(?:X(?:Offset)?|Y(?:Offset)?))|r(?:o(?:to(?:col|type)|duct(?:Sub)?|mpter)|e(?:vious|fix)))|e(?:n(?:coding|abledPlugin)|x(?:ternal|pando)|mbeds)|v(?:isibility|endor(?:Sub)?|Linkcolor)|URLUnencoded|P(?:I|OSITIVE_INFINITY)|f(?:ilename|o(?:nt(?:Size|Family|Weight)|rmName)|rame(?:s|Element)|gColor)|E|whiteSpace|l(?:i(?:stStyleType|n(?:eHeight|kColor))|o(?:ca(?:tion(?:bar)?|lName)|wsrc)|e(?:ngth|ft(?:Context)?)|a(?:st(?:M(?:odified|atch)|Index|Paren)|yer(?:s|X)|nguage))|a(?:pp(?:MinorVersion|Name|Co(?:deName|re)|Version)|vail(?:Height|Top|Width|Left)|ll|r(?:ity|guments)|Linkcolor|bove)|r(?:ight(?:Context)?|e(?:sponse(?:XML|Text)|adyState))|global|x|m(?:imeTypes|ultiline|enubar|argin(?:Right|Bottom|Top|Left))|L(?:N(?:10|2)|OG(?:10E|2E))|b(?:o(?:ttom|rder(?:Width|RightWidth|BottomWidth|Style|Color|TopWidth|LeftWidth))|ufferDepth|elow|ackground(?:Color|Image)))\b/
            }, {
                token : ["support.constant"],
                regex : /that\b/
            }, {
                token : ["storage.type", "punctuation.operator", "support.function.firebug"],
                regex : /(console)(\.)(warn|info|log|error|time|trace|timeEnd|assert)\b/
            }, {
                token : keywordMapper,
                regex : identifierRe
            }, {
                token : "keyword.operator",
                regex : /--|\+\+|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\|\||\?\:|[!$%&*+\-~\/^]=?/,
                next  : "start"
            }, {
                token : "punctuation.operator",
                regex : /[?:,;.]/,
                next  : "start"
            }, {
                token : "paren.lparen",
                regex : /[\[({]/,
                next  : "start"
            }, {
                token : "paren.rparen",
                regex : /[\])}]/
            }, {
                token: "comment",
                regex: /^#!.*$/
            }
        ],
        "start": [
            DocCommentHighlightRules.getStartRule("doc-start"),
            {
                token : "comment", // multi line comment
                regex : "\\/\\*",
                next : "comment_regex_allowed"
            }, {
                token : "comment",
                regex : "\\/\\/",
                next : "line_comment_regex_allowed"
            }, {
                token: "string.regexp",
                regex: "\\/",
                next: "regex"
            }, {
                token : "text",
                regex : "\\s+|^$",
                next : "start"
            }, {
                token: "empty",
                regex: "",
                next: "no_regex"
            }
        ],
        "regex": [
            {
                token: "regexp.keyword.operator",
                regex: "\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)"
            }, {
                token: "string.regexp",
                regex: "/[sxngimy]*",
                next: "no_regex"
            }, {
                token : "invalid",
                regex: /\{\d+\b,?\d*\}[+*]|[+*$^?][+*]|[$^][?]|\?{3,}/
            }, {
                token : "constant.language.escape",
                regex: /\(\?[:=!]|\)|\{\d+\b,?\d*\}|[+*]\?|[()$^+*?.]/
            }, {
                token : "constant.language.delimiter",
                regex: /\|/
            }, {
                token: "constant.language.escape",
                regex: /\[\^?/,
                next: "regex_character_class"
            }, {
                token: "empty",
                regex: "$",
                next: "no_regex"
            }, {
                defaultToken: "string.regexp"
            }
        ],
        "regex_character_class": [
            {
                token: "regexp.charclass.keyword.operator",
                regex: "\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)"
            }, {
                token: "constant.language.escape",
                regex: "]",
                next: "regex"
            }, {
                token: "constant.language.escape",
                regex: "-"
            }, {
                token: "empty",
                regex: "$",
                next: "no_regex"
            }, {
                defaultToken: "string.regexp.charachterclass"
            }
        ],
        "function_arguments": [
            {
                token: "variable.parameter",
                regex: identifierRe
            }, {
                token: "punctuation.operator",
                regex: "[, ]+"
            }, {
                token: "punctuation.operator",
                regex: "$"
            }, {
                token: "empty",
                regex: "",
                next: "no_regex"
            }
        ],
        "comment_regex_allowed" : [
            DocCommentHighlightRules.getTagRule(),
            {token : "comment", regex : "\\*\\/", next : "start"},
            {defaultToken : "comment", caseInsensitive: true}
        ],
        "comment" : [
            DocCommentHighlightRules.getTagRule(),
            {token : "comment", regex : "\\*\\/", next : "no_regex"},
            {defaultToken : "comment", caseInsensitive: true}
        ],
        "line_comment_regex_allowed" : [
            DocCommentHighlightRules.getTagRule(),
            {token : "comment", regex : "$|^", next : "start"},
            {defaultToken : "comment", caseInsensitive: true}
        ],
        "line_comment" : [
            DocCommentHighlightRules.getTagRule(),
            {token : "comment", regex : "$|^", next : "no_regex"},
            {defaultToken : "comment", caseInsensitive: true}
        ],
        "qqstring" : [
            {
                token : "constant.language.escape",
                regex : escapedRe
            }, {
                token : "string",
                regex : "\\\\$",
                next  : "qqstring"
            }, {
                token : "string",
                regex : '"|$',
                next  : "no_regex"
            }, {
                defaultToken: "string"
            }
        ],
        "qstring" : [
            {
                token : "constant.language.escape",
                regex : escapedRe
            }, {
                token : "string",
                regex : "\\\\$",
                next  : "qstring"
            }, {
                token : "string",
                regex : "'|$",
                next  : "no_regex"
            }, {
                defaultToken: "string"
            }
        ]
    };
    
    
    if (!options || !options.noES6) {
        this.$rules.no_regex.unshift({
            regex: "[{}]", onMatch: function(val, state, stack) {
                this.next = val == "{" ? this.nextState : "";
                if (val == "{" && stack.length) {
                    stack.unshift("start", state);
                    return "paren";
                }
                if (val == "}" && stack.length) {
                    stack.shift();
                    this.next = stack.shift();
                    if (this.next.indexOf("string") != -1)
                        return "paren.quasi.end";
                }
                return val == "{" ? "paren.lparen" : "paren.rparen";
            },
            nextState: "start"
        }, {
            token : "string.quasi.start",
            regex : /`/,
            push  : [{
                token : "constant.language.escape",
                regex : escapedRe
            }, {
                token : "paren.quasi.start",
                regex : /\${/,
                push  : "start"
            }, {
                token : "string.quasi.end",
                regex : /`/,
                next  : "pop"
            }, {
                defaultToken: "string.quasi"
            }]
        });
    }
    
    this.embedRules(DocCommentHighlightRules, "doc-",
        [ DocCommentHighlightRules.getEndRule("no_regex") ]);
    
    this.normalizeRules();
};

oop.inherits(JavaScriptHighlightRules, TextHighlightRules);

exports.JavaScriptHighlightRules = JavaScriptHighlightRules;
});

ace.define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"], function(acequire, exports, module) {
"use strict";

var Range = acequire("../range").Range;

var MatchingBraceOutdent = function() {};

(function() {

    this.checkOutdent = function(line, input) {
        if (! /^\s+$/.test(line))
            return false;

        return /^\s*\}/.test(input);
    };

    this.autoOutdent = function(doc, row) {
        var line = doc.getLine(row);
        var match = line.match(/^(\s*\})/);

        if (!match) return 0;

        var column = match[1].length;
        var openBracePos = doc.findMatchingBracket({row: row, column: column});

        if (!openBracePos || openBracePos.row == row) return 0;

        var indent = this.$getIndent(doc.getLine(openBracePos.row));
        doc.replace(new Range(row, 0, row, column-1), indent);
    };

    this.$getIndent = function(line) {
        return line.match(/^\s*/)[0];
    };

}).call(MatchingBraceOutdent.prototype);

exports.MatchingBraceOutdent = MatchingBraceOutdent;
});

ace.define("ace/mode/behaviour/cstyle",["require","exports","module","ace/lib/oop","ace/mode/behaviour","ace/token_iterator","ace/lib/lang"], function(acequire, exports, module) {
"use strict";

var oop = acequire("../../lib/oop");
var Behaviour = acequire("../behaviour").Behaviour;
var TokenIterator = acequire("../../token_iterator").TokenIterator;
var lang = acequire("../../lib/lang");

var SAFE_INSERT_IN_TOKENS =
    ["text", "paren.rparen", "punctuation.operator"];
var SAFE_INSERT_BEFORE_TOKENS =
    ["text", "paren.rparen", "punctuation.operator", "comment"];

var context;
var contextCache = {};
var initContext = function(editor) {
    var id = -1;
    if (editor.multiSelect) {
        id = editor.selection.index;
        if (contextCache.rangeCount != editor.multiSelect.rangeCount)
            contextCache = {rangeCount: editor.multiSelect.rangeCount};
    }
    if (contextCache[id])
        return context = contextCache[id];
    context = contextCache[id] = {
        autoInsertedBrackets: 0,
        autoInsertedRow: -1,
        autoInsertedLineEnd: "",
        maybeInsertedBrackets: 0,
        maybeInsertedRow: -1,
        maybeInsertedLineStart: "",
        maybeInsertedLineEnd: ""
    };
};

var getWrapped = function(selection, selected, opening, closing) {
    var rowDiff = selection.end.row - selection.start.row;
    return {
        text: opening + selected + closing,
        selection: [
                0,
                selection.start.column + 1,
                rowDiff,
                selection.end.column + (rowDiff ? 0 : 1)
            ]
    };
};

var CstyleBehaviour = function() {
    this.add("braces", "insertion", function(state, action, editor, session, text) {
        var cursor = editor.getCursorPosition();
        var line = session.doc.getLine(cursor.row);
        if (text == '{') {
            initContext(editor);
            var selection = editor.getSelectionRange();
            var selected = session.doc.getTextRange(selection);
            if (selected !== "" && selected !== "{" && editor.getWrapBehavioursEnabled()) {
                return getWrapped(selection, selected, '{', '}');
            } else if (CstyleBehaviour.isSaneInsertion(editor, session)) {
                if (/[\]\}\)]/.test(line[cursor.column]) || editor.inMultiSelectMode) {
                    CstyleBehaviour.recordAutoInsert(editor, session, "}");
                    return {
                        text: '{}',
                        selection: [1, 1]
                    };
                } else {
                    CstyleBehaviour.recordMaybeInsert(editor, session, "{");
                    return {
                        text: '{',
                        selection: [1, 1]
                    };
                }
            }
        } else if (text == '}') {
            initContext(editor);
            var rightChar = line.substring(cursor.column, cursor.column + 1);
            if (rightChar == '}') {
                var matching = session.$findOpeningBracket('}', {column: cursor.column + 1, row: cursor.row});
                if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                    CstyleBehaviour.popAutoInsertedClosing();
                    return {
                        text: '',
                        selection: [1, 1]
                    };
                }
            }
        } else if (text == "\n" || text == "\r\n") {
            initContext(editor);
            var closing = "";
            if (CstyleBehaviour.isMaybeInsertedClosing(cursor, line)) {
                closing = lang.stringRepeat("}", context.maybeInsertedBrackets);
                CstyleBehaviour.clearMaybeInsertedClosing();
            }
            var rightChar = line.substring(cursor.column, cursor.column + 1);
            if (rightChar === '}') {
                var openBracePos = session.findMatchingBracket({row: cursor.row, column: cursor.column+1}, '}');
                if (!openBracePos)
                     return null;
                var next_indent = this.$getIndent(session.getLine(openBracePos.row));
            } else if (closing) {
                var next_indent = this.$getIndent(line);
            } else {
                CstyleBehaviour.clearMaybeInsertedClosing();
                return;
            }
            var indent = next_indent + session.getTabString();

            return {
                text: '\n' + indent + '\n' + next_indent + closing,
                selection: [1, indent.length, 1, indent.length]
            };
        } else {
            CstyleBehaviour.clearMaybeInsertedClosing();
        }
    });

    this.add("braces", "deletion", function(state, action, editor, session, range) {
        var selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && selected == '{') {
            initContext(editor);
            var line = session.doc.getLine(range.start.row);
            var rightChar = line.substring(range.end.column, range.end.column + 1);
            if (rightChar == '}') {
                range.end.column++;
                return range;
            } else {
                context.maybeInsertedBrackets--;
            }
        }
    });

    this.add("parens", "insertion", function(state, action, editor, session, text) {
        if (text == '(') {
            initContext(editor);
            var selection = editor.getSelectionRange();
            var selected = session.doc.getTextRange(selection);
            if (selected !== "" && editor.getWrapBehavioursEnabled()) {
                return getWrapped(selection, selected, '(', ')');
            } else if (CstyleBehaviour.isSaneInsertion(editor, session)) {
                CstyleBehaviour.recordAutoInsert(editor, session, ")");
                return {
                    text: '()',
                    selection: [1, 1]
                };
            }
        } else if (text == ')') {
            initContext(editor);
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            var rightChar = line.substring(cursor.column, cursor.column + 1);
            if (rightChar == ')') {
                var matching = session.$findOpeningBracket(')', {column: cursor.column + 1, row: cursor.row});
                if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                    CstyleBehaviour.popAutoInsertedClosing();
                    return {
                        text: '',
                        selection: [1, 1]
                    };
                }
            }
        }
    });

    this.add("parens", "deletion", function(state, action, editor, session, range) {
        var selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && selected == '(') {
            initContext(editor);
            var line = session.doc.getLine(range.start.row);
            var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
            if (rightChar == ')') {
                range.end.column++;
                return range;
            }
        }
    });

    this.add("brackets", "insertion", function(state, action, editor, session, text) {
        if (text == '[') {
            initContext(editor);
            var selection = editor.getSelectionRange();
            var selected = session.doc.getTextRange(selection);
            if (selected !== "" && editor.getWrapBehavioursEnabled()) {
                return getWrapped(selection, selected, '[', ']');
            } else if (CstyleBehaviour.isSaneInsertion(editor, session)) {
                CstyleBehaviour.recordAutoInsert(editor, session, "]");
                return {
                    text: '[]',
                    selection: [1, 1]
                };
            }
        } else if (text == ']') {
            initContext(editor);
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            var rightChar = line.substring(cursor.column, cursor.column + 1);
            if (rightChar == ']') {
                var matching = session.$findOpeningBracket(']', {column: cursor.column + 1, row: cursor.row});
                if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                    CstyleBehaviour.popAutoInsertedClosing();
                    return {
                        text: '',
                        selection: [1, 1]
                    };
                }
            }
        }
    });

    this.add("brackets", "deletion", function(state, action, editor, session, range) {
        var selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && selected == '[') {
            initContext(editor);
            var line = session.doc.getLine(range.start.row);
            var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
            if (rightChar == ']') {
                range.end.column++;
                return range;
            }
        }
    });

    this.add("string_dquotes", "insertion", function(state, action, editor, session, text) {
        if (text == '"' || text == "'") {
            initContext(editor);
            var quote = text;
            var selection = editor.getSelectionRange();
            var selected = session.doc.getTextRange(selection);
            if (selected !== "" && selected !== "'" && selected != '"' && editor.getWrapBehavioursEnabled()) {
                return getWrapped(selection, selected, quote, quote);
            } else if (!selected) {
                var cursor = editor.getCursorPosition();
                var line = session.doc.getLine(cursor.row);
                var leftChar = line.substring(cursor.column-1, cursor.column);
                var rightChar = line.substring(cursor.column, cursor.column + 1);

                var token = session.getTokenAt(cursor.row, cursor.column);
                var rightToken = session.getTokenAt(cursor.row, cursor.column + 1);
                if (leftChar == "\\" && token && /escape/.test(token.type))
                    return null;

                var stringBefore = token && /string/.test(token.type);
                var stringAfter = !rightToken || /string/.test(rightToken.type);

                var pair;
                if (rightChar == quote) {
                    pair = stringBefore !== stringAfter;
                } else {
                    if (stringBefore && !stringAfter)
                        return null; // wrap string with different quote
                    if (stringBefore && stringAfter)
                        return null; // do not pair quotes inside strings
                    var wordRe = session.$mode.tokenRe;
                    wordRe.lastIndex = 0;
                    var isWordBefore = wordRe.test(leftChar);
                    wordRe.lastIndex = 0;
                    var isWordAfter = wordRe.test(leftChar);
                    if (isWordBefore || isWordAfter)
                        return null; // before or after alphanumeric
                    if (rightChar && !/[\s;,.})\]\\]/.test(rightChar))
                        return null; // there is rightChar and it isn't closing
                    pair = true;
                }
                return {
                    text: pair ? quote + quote : "",
                    selection: [1,1]
                };
            }
        }
    });

    this.add("string_dquotes", "deletion", function(state, action, editor, session, range) {
        var selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && (selected == '"' || selected == "'")) {
            initContext(editor);
            var line = session.doc.getLine(range.start.row);
            var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
            if (rightChar == selected) {
                range.end.column++;
                return range;
            }
        }
    });

};

    
CstyleBehaviour.isSaneInsertion = function(editor, session) {
    var cursor = editor.getCursorPosition();
    var iterator = new TokenIterator(session, cursor.row, cursor.column);
    if (!this.$matchTokenType(iterator.getCurrentToken() || "text", SAFE_INSERT_IN_TOKENS)) {
        var iterator2 = new TokenIterator(session, cursor.row, cursor.column + 1);
        if (!this.$matchTokenType(iterator2.getCurrentToken() || "text", SAFE_INSERT_IN_TOKENS))
            return false;
    }
    iterator.stepForward();
    return iterator.getCurrentTokenRow() !== cursor.row ||
        this.$matchTokenType(iterator.getCurrentToken() || "text", SAFE_INSERT_BEFORE_TOKENS);
};

CstyleBehaviour.$matchTokenType = function(token, types) {
    return types.indexOf(token.type || token) > -1;
};

CstyleBehaviour.recordAutoInsert = function(editor, session, bracket) {
    var cursor = editor.getCursorPosition();
    var line = session.doc.getLine(cursor.row);
    if (!this.isAutoInsertedClosing(cursor, line, context.autoInsertedLineEnd[0]))
        context.autoInsertedBrackets = 0;
    context.autoInsertedRow = cursor.row;
    context.autoInsertedLineEnd = bracket + line.substr(cursor.column);
    context.autoInsertedBrackets++;
};

CstyleBehaviour.recordMaybeInsert = function(editor, session, bracket) {
    var cursor = editor.getCursorPosition();
    var line = session.doc.getLine(cursor.row);
    if (!this.isMaybeInsertedClosing(cursor, line))
        context.maybeInsertedBrackets = 0;
    context.maybeInsertedRow = cursor.row;
    context.maybeInsertedLineStart = line.substr(0, cursor.column) + bracket;
    context.maybeInsertedLineEnd = line.substr(cursor.column);
    context.maybeInsertedBrackets++;
};

CstyleBehaviour.isAutoInsertedClosing = function(cursor, line, bracket) {
    return context.autoInsertedBrackets > 0 &&
        cursor.row === context.autoInsertedRow &&
        bracket === context.autoInsertedLineEnd[0] &&
        line.substr(cursor.column) === context.autoInsertedLineEnd;
};

CstyleBehaviour.isMaybeInsertedClosing = function(cursor, line) {
    return context.maybeInsertedBrackets > 0 &&
        cursor.row === context.maybeInsertedRow &&
        line.substr(cursor.column) === context.maybeInsertedLineEnd &&
        line.substr(0, cursor.column) == context.maybeInsertedLineStart;
};

CstyleBehaviour.popAutoInsertedClosing = function() {
    context.autoInsertedLineEnd = context.autoInsertedLineEnd.substr(1);
    context.autoInsertedBrackets--;
};

CstyleBehaviour.clearMaybeInsertedClosing = function() {
    if (context) {
        context.maybeInsertedBrackets = 0;
        context.maybeInsertedRow = -1;
    }
};



oop.inherits(CstyleBehaviour, Behaviour);

exports.CstyleBehaviour = CstyleBehaviour;
});

ace.define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"], function(acequire, exports, module) {
"use strict";

var oop = acequire("../../lib/oop");
var Range = acequire("../../range").Range;
var BaseFoldMode = acequire("./fold_mode").FoldMode;

var FoldMode = exports.FoldMode = function(commentRegex) {
    if (commentRegex) {
        this.foldingStartMarker = new RegExp(
            this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.start)
        );
        this.foldingStopMarker = new RegExp(
            this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.end)
        );
    }
};
oop.inherits(FoldMode, BaseFoldMode);

(function() {

    this.foldingStartMarker = /(\{|\[)[^\}\]]*$|^\s*(\/\*)/;
    this.foldingStopMarker = /^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/;
    this.singleLineBlockCommentRe= /^\s*(\/\*).*\*\/\s*$/;
    this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/;
    this.startRegionRe = /^\s*(\/\*|\/\/)#region\b/;
    this._getFoldWidgetBase = this.getFoldWidget;
    this.getFoldWidget = function(session, foldStyle, row) {
        var line = session.getLine(row);

        if (this.singleLineBlockCommentRe.test(line)) {
            if (!this.startRegionRe.test(line) && !this.tripleStarBlockCommentRe.test(line))
                return "";
        }

        var fw = this._getFoldWidgetBase(session, foldStyle, row);

        if (!fw && this.startRegionRe.test(line))
            return "start"; // lineCommentRegionStart

        return fw;
    };

    this.getFoldWidgetRange = function(session, foldStyle, row, forceMultiline) {
        var line = session.getLine(row);

        if (this.startRegionRe.test(line))
            return this.getCommentRegionBlock(session, line, row);

        var match = line.match(this.foldingStartMarker);
        if (match) {
            var i = match.index;

            if (match[1])
                return this.openingBracketBlock(session, match[1], row, i);
                
            var range = session.getCommentFoldRange(row, i + match[0].length, 1);
            
            if (range && !range.isMultiLine()) {
                if (forceMultiline) {
                    range = this.getSectionRange(session, row);
                } else if (foldStyle != "all")
                    range = null;
            }
            
            return range;
        }

        if (foldStyle === "markbegin")
            return;

        var match = line.match(this.foldingStopMarker);
        if (match) {
            var i = match.index + match[0].length;

            if (match[1])
                return this.closingBracketBlock(session, match[1], row, i);

            return session.getCommentFoldRange(row, i, -1);
        }
    };
    
    this.getSectionRange = function(session, row) {
        var line = session.getLine(row);
        var startIndent = line.search(/\S/);
        var startRow = row;
        var startColumn = line.length;
        row = row + 1;
        var endRow = row;
        var maxRow = session.getLength();
        while (++row < maxRow) {
            line = session.getLine(row);
            var indent = line.search(/\S/);
            if (indent === -1)
                continue;
            if  (startIndent > indent)
                break;
            var subRange = this.getFoldWidgetRange(session, "all", row);
            
            if (subRange) {
                if (subRange.start.row <= startRow) {
                    break;
                } else if (subRange.isMultiLine()) {
                    row = subRange.end.row;
                } else if (startIndent == indent) {
                    break;
                }
            }
            endRow = row;
        }
        
        return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
    };

    this.getCommentRegionBlock = function(session, line, row) {
        var startColumn = line.search(/\s*$/);
        var maxRow = session.getLength();
        var startRow = row;

        var re = /^\s*(?:\/\*|\/\/)#(end)?region\b/;
        var depth = 1;
        while (++row < maxRow) {
            line = session.getLine(row);
            var m = re.exec(line);
            if (!m) continue;
            if (m[1]) depth--;
            else depth++;

            if (!depth) break;
        }

        var endRow = row;
        if (endRow > startRow) {
            return new Range(startRow, startColumn, endRow, line.length);
        }
    };

}).call(FoldMode.prototype);

});

ace.define("ace/mode/javascript",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/javascript_highlight_rules","ace/mode/matching_brace_outdent","ace/range","ace/worker/worker_client","ace/mode/behaviour/cstyle","ace/mode/folding/cstyle"], function(acequire, exports, module) {
"use strict";

var oop = acequire("../lib/oop");
var TextMode = acequire("./text").Mode;
var JavaScriptHighlightRules = acequire("./javascript_highlight_rules").JavaScriptHighlightRules;
var MatchingBraceOutdent = acequire("./matching_brace_outdent").MatchingBraceOutdent;
var Range = acequire("../range").Range;
var WorkerClient = acequire("../worker/worker_client").WorkerClient;
var CstyleBehaviour = acequire("./behaviour/cstyle").CstyleBehaviour;
var CStyleFoldMode = acequire("./folding/cstyle").FoldMode;

var Mode = function() {
    this.HighlightRules = JavaScriptHighlightRules;
    
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "//";
    this.blockComment = {start: "/*", end: "*/"};

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;
        var endState = tokenizedLine.state;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        if (state == "start" || state == "no_regex") {
            var match = line.match(/^.*(?:\bcase\b.*\:|[\{\(\[])\s*$/);
            if (match) {
                indent += tab;
            }
        } else if (state == "doc-start") {
            if (endState == "start" || endState == "no_regex") {
                return "";
            }
            var match = line.match(/^\s*(\/?)\*/);
            if (match) {
                if (match[1]) {
                    indent += " ";
                }
                indent += "* ";
            }
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

    this.createWorker = function(session) {
        var worker = new WorkerClient(["ace"], require("../worker/javascript"), "JavaScriptWorker");
        worker.attachToDocument(session.getDocument());

        worker.on("annotate", function(results) {
            session.setAnnotations(results.data);
        });

        worker.on("terminate", function() {
            session.clearAnnotations();
        });

        return worker;
    };

    this.$id = "ace/mode/javascript";
}).call(Mode.prototype);

exports.Mode = Mode;
});

},{"../worker/javascript":"C:\\Users\\pitch\\functional-visualiser\\node_modules\\brace\\worker\\javascript.js"}],"C:\\Users\\pitch\\functional-visualiser\\node_modules\\brace\\theme\\solarized_dark.js":[function(require,module,exports){
ace.define("ace/theme/solarized_dark",["require","exports","module","ace/lib/dom"], function(acequire, exports, module) {

exports.isDark = true;
exports.cssClass = "ace-solarized-dark";
exports.cssText = ".ace-solarized-dark .ace_gutter {\
background: #01313f;\
color: #d0edf7\
}\
.ace-solarized-dark .ace_print-margin {\
width: 1px;\
background: #33555E\
}\
.ace-solarized-dark {\
background-color: #002B36;\
color: #93A1A1\
}\
.ace-solarized-dark .ace_entity.ace_other.ace_attribute-name,\
.ace-solarized-dark .ace_storage {\
color: #93A1A1\
}\
.ace-solarized-dark .ace_cursor,\
.ace-solarized-dark .ace_string.ace_regexp {\
color: #D30102\
}\
.ace-solarized-dark .ace_marker-layer .ace_active-line,\
.ace-solarized-dark .ace_marker-layer .ace_selection {\
background: rgba(255, 255, 255, 0.1)\
}\
.ace-solarized-dark.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #002B36;\
border-radius: 2px\
}\
.ace-solarized-dark .ace_marker-layer .ace_step {\
background: rgb(102, 82, 0)\
}\
.ace-solarized-dark .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid rgba(147, 161, 161, 0.50)\
}\
.ace-solarized-dark .ace_gutter-active-line {\
background-color: #0d3440\
}\
.ace-solarized-dark .ace_marker-layer .ace_selected-word {\
border: 1px solid #073642\
}\
.ace-solarized-dark .ace_invisible {\
color: rgba(147, 161, 161, 0.50)\
}\
.ace-solarized-dark .ace_keyword,\
.ace-solarized-dark .ace_meta,\
.ace-solarized-dark .ace_support.ace_class,\
.ace-solarized-dark .ace_support.ace_type {\
color: #859900\
}\
.ace-solarized-dark .ace_constant.ace_character,\
.ace-solarized-dark .ace_constant.ace_other {\
color: #CB4B16\
}\
.ace-solarized-dark .ace_constant.ace_language {\
color: #B58900\
}\
.ace-solarized-dark .ace_constant.ace_numeric {\
color: #D33682\
}\
.ace-solarized-dark .ace_fold {\
background-color: #268BD2;\
border-color: #93A1A1\
}\
.ace-solarized-dark .ace_entity.ace_name.ace_function,\
.ace-solarized-dark .ace_entity.ace_name.ace_tag,\
.ace-solarized-dark .ace_support.ace_function,\
.ace-solarized-dark .ace_variable,\
.ace-solarized-dark .ace_variable.ace_language {\
color: #268BD2\
}\
.ace-solarized-dark .ace_string {\
color: #2AA198\
}\
.ace-solarized-dark .ace_comment {\
font-style: italic;\
color: #657B83\
}\
.ace-solarized-dark .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWNg0Db1ZVCxc/sPAAd4AlUHlLenAAAAAElFTkSuQmCC) right repeat-y\
}";

var dom = acequire("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});

},{}],"C:\\Users\\pitch\\functional-visualiser\\node_modules\\brace\\worker\\javascript.js":[function(require,module,exports){
module.exports.id = 'ace/mode/javascript_worker';
module.exports.src = "\"no use strict\";(function(window){if(void 0===window.window||!window.document){window.console=function(){var msgs=Array.prototype.slice.call(arguments,0);postMessage({type:\"log\",data:msgs})},window.console.error=window.console.warn=window.console.log=window.console.trace=window.console,window.window=window,window.ace=window,window.onerror=function(message,file,line,col,err){postMessage({type:\"error\",data:{message:message,file:file,line:line,col:col,stack:err.stack}})},window.normalizeModule=function(parentId,moduleName){if(-1!==moduleName.indexOf(\"!\")){var chunks=moduleName.split(\"!\");return window.normalizeModule(parentId,chunks[0])+\"!\"+window.normalizeModule(parentId,chunks[1])}if(\".\"==moduleName.charAt(0)){var base=parentId.split(\"/\").slice(0,-1).join(\"/\");for(moduleName=(base?base+\"/\":\"\")+moduleName;-1!==moduleName.indexOf(\".\")&&previous!=moduleName;){var previous=moduleName;moduleName=moduleName.replace(/^\\.\\//,\"\").replace(/\\/\\.\\//,\"/\").replace(/[^\\/]+\\/\\.\\.\\//,\"\")}}return moduleName},window.acequire=function(parentId,id){if(id||(id=parentId,parentId=null),!id.charAt)throw Error(\"worker.js acequire() accepts only (parentId, id) as arguments\");id=window.normalizeModule(parentId,id);var module=window.acequire.modules[id];if(module)return module.initialized||(module.initialized=!0,module.exports=module.factory().exports),module.exports;var chunks=id.split(\"/\");if(!window.acequire.tlns)return console.log(\"unable to load \"+id);chunks[0]=window.acequire.tlns[chunks[0]]||chunks[0];var path=chunks.join(\"/\")+\".js\";return window.acequire.id=id,importScripts(path),window.acequire(parentId,id)},window.acequire.modules={},window.acequire.tlns={},window.define=function(id,deps,factory){if(2==arguments.length?(factory=deps,\"string\"!=typeof id&&(deps=id,id=window.acequire.id)):1==arguments.length&&(factory=id,deps=[],id=window.acequire.id),\"function\"!=typeof factory)return window.acequire.modules[id]={exports:factory,initialized:!0},void 0;deps.length||(deps=[\"require\",\"exports\",\"module\"]);var req=function(childId){return window.acequire(id,childId)};window.acequire.modules[id]={exports:{},factory:function(){var module=this,returnExports=factory.apply(this,deps.map(function(dep){switch(dep){case\"require\":return req;case\"exports\":return module.exports;case\"module\":return module;default:return req(dep)}}));return returnExports&&(module.exports=returnExports),module}}},window.define.amd={},window.initBaseUrls=function initBaseUrls(topLevelNamespaces){acequire.tlns=topLevelNamespaces},window.initSender=function initSender(){var EventEmitter=window.acequire(\"ace/lib/event_emitter\").EventEmitter,oop=window.acequire(\"ace/lib/oop\"),Sender=function(){};return function(){oop.implement(this,EventEmitter),this.callback=function(data,callbackId){postMessage({type:\"call\",id:callbackId,data:data})},this.emit=function(name,data){postMessage({type:\"event\",name:name,data:data})}}.call(Sender.prototype),new Sender};var main=window.main=null,sender=window.sender=null;window.onmessage=function(e){var msg=e.data;if(msg.command){if(!main[msg.command])throw Error(\"Unknown command:\"+msg.command);main[msg.command].apply(main,msg.args)}else if(msg.init){initBaseUrls(msg.tlns),acequire(\"ace/lib/es5-shim\"),sender=window.sender=initSender();var clazz=acequire(msg.module)[msg.classname];main=window.main=new clazz(sender)}else msg.event&&sender&&sender._signal(msg.event,msg.data)}}})(this),ace.define(\"ace/lib/oop\",[\"require\",\"exports\",\"module\"],function(acequire,exports){\"use strict\";exports.inherits=function(ctor,superCtor){ctor.super_=superCtor,ctor.prototype=Object.create(superCtor.prototype,{constructor:{value:ctor,enumerable:!1,writable:!0,configurable:!0}})},exports.mixin=function(obj,mixin){for(var key in mixin)obj[key]=mixin[key];return obj},exports.implement=function(proto,mixin){exports.mixin(proto,mixin)}}),ace.define(\"ace/lib/event_emitter\",[\"require\",\"exports\",\"module\"],function(acequire,exports){\"use strict\";var EventEmitter={},stopPropagation=function(){this.propagationStopped=!0},preventDefault=function(){this.defaultPrevented=!0};EventEmitter._emit=EventEmitter._dispatchEvent=function(eventName,e){this._eventRegistry||(this._eventRegistry={}),this._defaultHandlers||(this._defaultHandlers={});var listeners=this._eventRegistry[eventName]||[],defaultHandler=this._defaultHandlers[eventName];if(listeners.length||defaultHandler){\"object\"==typeof e&&e||(e={}),e.type||(e.type=eventName),e.stopPropagation||(e.stopPropagation=stopPropagation),e.preventDefault||(e.preventDefault=preventDefault),listeners=listeners.slice();for(var i=0;listeners.length>i&&(listeners[i](e,this),!e.propagationStopped);i++);return defaultHandler&&!e.defaultPrevented?defaultHandler(e,this):void 0}},EventEmitter._signal=function(eventName,e){var listeners=(this._eventRegistry||{})[eventName];if(listeners){listeners=listeners.slice();for(var i=0;listeners.length>i;i++)listeners[i](e,this)}},EventEmitter.once=function(eventName,callback){var _self=this;callback&&this.addEventListener(eventName,function newCallback(){_self.removeEventListener(eventName,newCallback),callback.apply(null,arguments)})},EventEmitter.setDefaultHandler=function(eventName,callback){var handlers=this._defaultHandlers;if(handlers||(handlers=this._defaultHandlers={_disabled_:{}}),handlers[eventName]){var old=handlers[eventName],disabled=handlers._disabled_[eventName];disabled||(handlers._disabled_[eventName]=disabled=[]),disabled.push(old);var i=disabled.indexOf(callback);-1!=i&&disabled.splice(i,1)}handlers[eventName]=callback},EventEmitter.removeDefaultHandler=function(eventName,callback){var handlers=this._defaultHandlers;if(handlers){var disabled=handlers._disabled_[eventName];if(handlers[eventName]==callback)handlers[eventName],disabled&&this.setDefaultHandler(eventName,disabled.pop());else if(disabled){var i=disabled.indexOf(callback);-1!=i&&disabled.splice(i,1)}}},EventEmitter.on=EventEmitter.addEventListener=function(eventName,callback,capturing){this._eventRegistry=this._eventRegistry||{};var listeners=this._eventRegistry[eventName];return listeners||(listeners=this._eventRegistry[eventName]=[]),-1==listeners.indexOf(callback)&&listeners[capturing?\"unshift\":\"push\"](callback),callback},EventEmitter.off=EventEmitter.removeListener=EventEmitter.removeEventListener=function(eventName,callback){this._eventRegistry=this._eventRegistry||{};var listeners=this._eventRegistry[eventName];if(listeners){var index=listeners.indexOf(callback);-1!==index&&listeners.splice(index,1)}},EventEmitter.removeAllListeners=function(eventName){this._eventRegistry&&(this._eventRegistry[eventName]=[])},exports.EventEmitter=EventEmitter}),ace.define(\"ace/range\",[\"require\",\"exports\",\"module\"],function(acequire,exports){\"use strict\";var comparePoints=function(p1,p2){return p1.row-p2.row||p1.column-p2.column},Range=function(startRow,startColumn,endRow,endColumn){this.start={row:startRow,column:startColumn},this.end={row:endRow,column:endColumn}};(function(){this.isEqual=function(range){return this.start.row===range.start.row&&this.end.row===range.end.row&&this.start.column===range.start.column&&this.end.column===range.end.column},this.toString=function(){return\"Range: [\"+this.start.row+\"/\"+this.start.column+\"] -> [\"+this.end.row+\"/\"+this.end.column+\"]\"},this.contains=function(row,column){return 0==this.compare(row,column)},this.compareRange=function(range){var cmp,end=range.end,start=range.start;return cmp=this.compare(end.row,end.column),1==cmp?(cmp=this.compare(start.row,start.column),1==cmp?2:0==cmp?1:0):-1==cmp?-2:(cmp=this.compare(start.row,start.column),-1==cmp?-1:1==cmp?42:0)},this.comparePoint=function(p){return this.compare(p.row,p.column)},this.containsRange=function(range){return 0==this.comparePoint(range.start)&&0==this.comparePoint(range.end)},this.intersects=function(range){var cmp=this.compareRange(range);return-1==cmp||0==cmp||1==cmp},this.isEnd=function(row,column){return this.end.row==row&&this.end.column==column},this.isStart=function(row,column){return this.start.row==row&&this.start.column==column},this.setStart=function(row,column){\"object\"==typeof row?(this.start.column=row.column,this.start.row=row.row):(this.start.row=row,this.start.column=column)},this.setEnd=function(row,column){\"object\"==typeof row?(this.end.column=row.column,this.end.row=row.row):(this.end.row=row,this.end.column=column)},this.inside=function(row,column){return 0==this.compare(row,column)?this.isEnd(row,column)||this.isStart(row,column)?!1:!0:!1},this.insideStart=function(row,column){return 0==this.compare(row,column)?this.isEnd(row,column)?!1:!0:!1},this.insideEnd=function(row,column){return 0==this.compare(row,column)?this.isStart(row,column)?!1:!0:!1},this.compare=function(row,column){return this.isMultiLine()||row!==this.start.row?this.start.row>row?-1:row>this.end.row?1:this.start.row===row?column>=this.start.column?0:-1:this.end.row===row?this.end.column>=column?0:1:0:this.start.column>column?-1:column>this.end.column?1:0},this.compareStart=function(row,column){return this.start.row==row&&this.start.column==column?-1:this.compare(row,column)},this.compareEnd=function(row,column){return this.end.row==row&&this.end.column==column?1:this.compare(row,column)},this.compareInside=function(row,column){return this.end.row==row&&this.end.column==column?1:this.start.row==row&&this.start.column==column?-1:this.compare(row,column)},this.clipRows=function(firstRow,lastRow){if(this.end.row>lastRow)var end={row:lastRow+1,column:0};else if(firstRow>this.end.row)var end={row:firstRow,column:0};if(this.start.row>lastRow)var start={row:lastRow+1,column:0};else if(firstRow>this.start.row)var start={row:firstRow,column:0};return Range.fromPoints(start||this.start,end||this.end)},this.extend=function(row,column){var cmp=this.compare(row,column);if(0==cmp)return this;if(-1==cmp)var start={row:row,column:column};else var end={row:row,column:column};return Range.fromPoints(start||this.start,end||this.end)},this.isEmpty=function(){return this.start.row===this.end.row&&this.start.column===this.end.column},this.isMultiLine=function(){return this.start.row!==this.end.row},this.clone=function(){return Range.fromPoints(this.start,this.end)},this.collapseRows=function(){return 0==this.end.column?new Range(this.start.row,0,Math.max(this.start.row,this.end.row-1),0):new Range(this.start.row,0,this.end.row,0)},this.toScreenRange=function(session){var screenPosStart=session.documentToScreenPosition(this.start),screenPosEnd=session.documentToScreenPosition(this.end);return new Range(screenPosStart.row,screenPosStart.column,screenPosEnd.row,screenPosEnd.column)},this.moveBy=function(row,column){this.start.row+=row,this.start.column+=column,this.end.row+=row,this.end.column+=column}}).call(Range.prototype),Range.fromPoints=function(start,end){return new Range(start.row,start.column,end.row,end.column)},Range.comparePoints=comparePoints,Range.comparePoints=function(p1,p2){return p1.row-p2.row||p1.column-p2.column},exports.Range=Range}),ace.define(\"ace/anchor\",[\"require\",\"exports\",\"module\",\"ace/lib/oop\",\"ace/lib/event_emitter\"],function(acequire,exports){\"use strict\";var oop=acequire(\"./lib/oop\"),EventEmitter=acequire(\"./lib/event_emitter\").EventEmitter,Anchor=exports.Anchor=function(doc,row,column){this.$onChange=this.onChange.bind(this),this.attach(doc),column===void 0?this.setPosition(row.row,row.column):this.setPosition(row,column)};(function(){oop.implement(this,EventEmitter),this.getPosition=function(){return this.$clipPositionToDocument(this.row,this.column)},this.getDocument=function(){return this.document},this.$insertRight=!1,this.onChange=function(e){var delta=e.data,range=delta.range;if(!(range.start.row==range.end.row&&range.start.row!=this.row||range.start.row>this.row||range.start.row==this.row&&range.start.column>this.column)){var row=this.row,column=this.column,start=range.start,end=range.end;\"insertText\"===delta.action?start.row===row&&column>=start.column?start.column===column&&this.$insertRight||(start.row===end.row?column+=end.column-start.column:(column-=start.column,row+=end.row-start.row)):start.row!==end.row&&row>start.row&&(row+=end.row-start.row):\"insertLines\"===delta.action?start.row===row&&0===column&&this.$insertRight||row>=start.row&&(row+=end.row-start.row):\"removeText\"===delta.action?start.row===row&&column>start.column?column=end.column>=column?start.column:Math.max(0,column-(end.column-start.column)):start.row!==end.row&&row>start.row?(end.row===row&&(column=Math.max(0,column-end.column)+start.column),row-=end.row-start.row):end.row===row&&(row-=end.row-start.row,column=Math.max(0,column-end.column)+start.column):\"removeLines\"==delta.action&&row>=start.row&&(row>=end.row?row-=end.row-start.row:(row=start.row,column=0)),this.setPosition(row,column,!0)}},this.setPosition=function(row,column,noClip){var pos;if(pos=noClip?{row:row,column:column}:this.$clipPositionToDocument(row,column),this.row!=pos.row||this.column!=pos.column){var old={row:this.row,column:this.column};this.row=pos.row,this.column=pos.column,this._signal(\"change\",{old:old,value:pos})}},this.detach=function(){this.document.removeEventListener(\"change\",this.$onChange)},this.attach=function(doc){this.document=doc||this.document,this.document.on(\"change\",this.$onChange)},this.$clipPositionToDocument=function(row,column){var pos={};return row>=this.document.getLength()?(pos.row=Math.max(0,this.document.getLength()-1),pos.column=this.document.getLine(pos.row).length):0>row?(pos.row=0,pos.column=0):(pos.row=row,pos.column=Math.min(this.document.getLine(pos.row).length,Math.max(0,column))),0>column&&(pos.column=0),pos}}).call(Anchor.prototype)}),ace.define(\"ace/document\",[\"require\",\"exports\",\"module\",\"ace/lib/oop\",\"ace/lib/event_emitter\",\"ace/range\",\"ace/anchor\"],function(acequire,exports){\"use strict\";var oop=acequire(\"./lib/oop\"),EventEmitter=acequire(\"./lib/event_emitter\").EventEmitter,Range=acequire(\"./range\").Range,Anchor=acequire(\"./anchor\").Anchor,Document=function(text){this.$lines=[],0===text.length?this.$lines=[\"\"]:Array.isArray(text)?this._insertLines(0,text):this.insert({row:0,column:0},text)};(function(){oop.implement(this,EventEmitter),this.setValue=function(text){var len=this.getLength();this.remove(new Range(0,0,len,this.getLine(len-1).length)),this.insert({row:0,column:0},text)},this.getValue=function(){return this.getAllLines().join(this.getNewLineCharacter())},this.createAnchor=function(row,column){return new Anchor(this,row,column)},this.$split=0===\"aaa\".split(/a/).length?function(text){return text.replace(/\\r\\n|\\r/g,\"\\n\").split(\"\\n\")}:function(text){return text.split(/\\r\\n|\\r|\\n/)},this.$detectNewLine=function(text){var match=text.match(/^.*?(\\r\\n|\\r|\\n)/m);this.$autoNewLine=match?match[1]:\"\\n\",this._signal(\"changeNewLineMode\")},this.getNewLineCharacter=function(){switch(this.$newLineMode){case\"windows\":return\"\\r\\n\";case\"unix\":return\"\\n\";default:return this.$autoNewLine||\"\\n\"}},this.$autoNewLine=\"\",this.$newLineMode=\"auto\",this.setNewLineMode=function(newLineMode){this.$newLineMode!==newLineMode&&(this.$newLineMode=newLineMode,this._signal(\"changeNewLineMode\"))},this.getNewLineMode=function(){return this.$newLineMode},this.isNewLine=function(text){return\"\\r\\n\"==text||\"\\r\"==text||\"\\n\"==text},this.getLine=function(row){return this.$lines[row]||\"\"},this.getLines=function(firstRow,lastRow){return this.$lines.slice(firstRow,lastRow+1)},this.getAllLines=function(){return this.getLines(0,this.getLength())},this.getLength=function(){return this.$lines.length},this.getTextRange=function(range){if(range.start.row==range.end.row)return this.getLine(range.start.row).substring(range.start.column,range.end.column);var lines=this.getLines(range.start.row,range.end.row);lines[0]=(lines[0]||\"\").substring(range.start.column);var l=lines.length-1;return range.end.row-range.start.row==l&&(lines[l]=lines[l].substring(0,range.end.column)),lines.join(this.getNewLineCharacter())},this.$clipPosition=function(position){var length=this.getLength();return position.row>=length?(position.row=Math.max(0,length-1),position.column=this.getLine(length-1).length):0>position.row&&(position.row=0),position},this.insert=function(position,text){if(!text||0===text.length)return position;position=this.$clipPosition(position),1>=this.getLength()&&this.$detectNewLine(text);var lines=this.$split(text),firstLine=lines.splice(0,1)[0],lastLine=0==lines.length?null:lines.splice(lines.length-1,1)[0];return position=this.insertInLine(position,firstLine),null!==lastLine&&(position=this.insertNewLine(position),position=this._insertLines(position.row,lines),position=this.insertInLine(position,lastLine||\"\")),position},this.insertLines=function(row,lines){return row>=this.getLength()?this.insert({row:row,column:0},\"\\n\"+lines.join(\"\\n\")):this._insertLines(Math.max(row,0),lines)},this._insertLines=function(row,lines){if(0==lines.length)return{row:row,column:0};for(;lines.length>2e4;){var end=this._insertLines(row,lines.slice(0,2e4));lines=lines.slice(2e4),row=end.row}var args=[row,0];args.push.apply(args,lines),this.$lines.splice.apply(this.$lines,args);var range=new Range(row,0,row+lines.length,0),delta={action:\"insertLines\",range:range,lines:lines};return this._signal(\"change\",{data:delta}),range.end},this.insertNewLine=function(position){position=this.$clipPosition(position);var line=this.$lines[position.row]||\"\";this.$lines[position.row]=line.substring(0,position.column),this.$lines.splice(position.row+1,0,line.substring(position.column,line.length));var end={row:position.row+1,column:0},delta={action:\"insertText\",range:Range.fromPoints(position,end),text:this.getNewLineCharacter()};return this._signal(\"change\",{data:delta}),end},this.insertInLine=function(position,text){if(0==text.length)return position;var line=this.$lines[position.row]||\"\";this.$lines[position.row]=line.substring(0,position.column)+text+line.substring(position.column);var end={row:position.row,column:position.column+text.length},delta={action:\"insertText\",range:Range.fromPoints(position,end),text:text};return this._signal(\"change\",{data:delta}),end},this.remove=function(range){if(range instanceof Range||(range=Range.fromPoints(range.start,range.end)),range.start=this.$clipPosition(range.start),range.end=this.$clipPosition(range.end),range.isEmpty())return range.start;var firstRow=range.start.row,lastRow=range.end.row;if(range.isMultiLine()){var firstFullRow=0==range.start.column?firstRow:firstRow+1,lastFullRow=lastRow-1;range.end.column>0&&this.removeInLine(lastRow,0,range.end.column),lastFullRow>=firstFullRow&&this._removeLines(firstFullRow,lastFullRow),firstFullRow!=firstRow&&(this.removeInLine(firstRow,range.start.column,this.getLine(firstRow).length),this.removeNewLine(range.start.row))}else this.removeInLine(firstRow,range.start.column,range.end.column);return range.start},this.removeInLine=function(row,startColumn,endColumn){if(startColumn!=endColumn){var range=new Range(row,startColumn,row,endColumn),line=this.getLine(row),removed=line.substring(startColumn,endColumn),newLine=line.substring(0,startColumn)+line.substring(endColumn,line.length);this.$lines.splice(row,1,newLine);var delta={action:\"removeText\",range:range,text:removed};return this._signal(\"change\",{data:delta}),range.start}},this.removeLines=function(firstRow,lastRow){return 0>firstRow||lastRow>=this.getLength()?this.remove(new Range(firstRow,0,lastRow+1,0)):this._removeLines(firstRow,lastRow)},this._removeLines=function(firstRow,lastRow){var range=new Range(firstRow,0,lastRow+1,0),removed=this.$lines.splice(firstRow,lastRow-firstRow+1),delta={action:\"removeLines\",range:range,nl:this.getNewLineCharacter(),lines:removed};return this._signal(\"change\",{data:delta}),removed},this.removeNewLine=function(row){var firstLine=this.getLine(row),secondLine=this.getLine(row+1),range=new Range(row,firstLine.length,row+1,0),line=firstLine+secondLine;this.$lines.splice(row,2,line);var delta={action:\"removeText\",range:range,text:this.getNewLineCharacter()};this._signal(\"change\",{data:delta})},this.replace=function(range,text){if(range instanceof Range||(range=Range.fromPoints(range.start,range.end)),0==text.length&&range.isEmpty())return range.start;if(text==this.getTextRange(range))return range.end;if(this.remove(range),text)var end=this.insert(range.start,text);else end=range.start;return end},this.applyDeltas=function(deltas){for(var i=0;deltas.length>i;i++){var delta=deltas[i],range=Range.fromPoints(delta.range.start,delta.range.end);\"insertLines\"==delta.action?this.insertLines(range.start.row,delta.lines):\"insertText\"==delta.action?this.insert(range.start,delta.text):\"removeLines\"==delta.action?this._removeLines(range.start.row,range.end.row-1):\"removeText\"==delta.action&&this.remove(range)}},this.revertDeltas=function(deltas){for(var i=deltas.length-1;i>=0;i--){var delta=deltas[i],range=Range.fromPoints(delta.range.start,delta.range.end);\"insertLines\"==delta.action?this._removeLines(range.start.row,range.end.row-1):\"insertText\"==delta.action?this.remove(range):\"removeLines\"==delta.action?this._insertLines(range.start.row,delta.lines):\"removeText\"==delta.action&&this.insert(range.start,delta.text)}},this.indexToPosition=function(index,startRow){for(var lines=this.$lines||this.getAllLines(),newlineLength=this.getNewLineCharacter().length,i=startRow||0,l=lines.length;l>i;i++)if(index-=lines[i].length+newlineLength,0>index)return{row:i,column:index+lines[i].length+newlineLength};return{row:l-1,column:lines[l-1].length}},this.positionToIndex=function(pos,startRow){for(var lines=this.$lines||this.getAllLines(),newlineLength=this.getNewLineCharacter().length,index=0,row=Math.min(pos.row,lines.length),i=startRow||0;row>i;++i)index+=lines[i].length+newlineLength;return index+pos.column}}).call(Document.prototype),exports.Document=Document}),ace.define(\"ace/lib/lang\",[\"require\",\"exports\",\"module\"],function(acequire,exports){\"use strict\";exports.last=function(a){return a[a.length-1]},exports.stringReverse=function(string){return string.split(\"\").reverse().join(\"\")},exports.stringRepeat=function(string,count){for(var result=\"\";count>0;)1&count&&(result+=string),(count>>=1)&&(string+=string);return result};var trimBeginRegexp=/^\\s\\s*/,trimEndRegexp=/\\s\\s*$/;exports.stringTrimLeft=function(string){return string.replace(trimBeginRegexp,\"\")},exports.stringTrimRight=function(string){return string.replace(trimEndRegexp,\"\")},exports.copyObject=function(obj){var copy={};for(var key in obj)copy[key]=obj[key];return copy},exports.copyArray=function(array){for(var copy=[],i=0,l=array.length;l>i;i++)copy[i]=array[i]&&\"object\"==typeof array[i]?this.copyObject(array[i]):array[i];return copy},exports.deepCopy=function(obj){if(\"object\"!=typeof obj||!obj)return obj;var cons=obj.constructor;if(cons===RegExp)return obj;var copy=cons();for(var key in obj)copy[key]=\"object\"==typeof obj[key]?exports.deepCopy(obj[key]):obj[key];return copy},exports.arrayToMap=function(arr){for(var map={},i=0;arr.length>i;i++)map[arr[i]]=1;return map},exports.createMap=function(props){var map=Object.create(null);for(var i in props)map[i]=props[i];return map},exports.arrayRemove=function(array,value){for(var i=0;array.length>=i;i++)value===array[i]&&array.splice(i,1)},exports.escapeRegExp=function(str){return str.replace(/([.*+?^${}()|[\\]\\/\\\\])/g,\"\\\\$1\")},exports.escapeHTML=function(str){return str.replace(/&/g,\"&#38;\").replace(/\"/g,\"&#34;\").replace(/'/g,\"&#39;\").replace(/</g,\"&#60;\")},exports.getMatchOffsets=function(string,regExp){var matches=[];return string.replace(regExp,function(str){matches.push({offset:arguments[arguments.length-2],length:str.length})}),matches},exports.deferredCall=function(fcn){var timer=null,callback=function(){timer=null,fcn()},deferred=function(timeout){return deferred.cancel(),timer=setTimeout(callback,timeout||0),deferred};return deferred.schedule=deferred,deferred.call=function(){return this.cancel(),fcn(),deferred},deferred.cancel=function(){return clearTimeout(timer),timer=null,deferred},deferred.isPending=function(){return timer},deferred},exports.delayedCall=function(fcn,defaultTimeout){var timer=null,callback=function(){timer=null,fcn()},_self=function(timeout){null==timer&&(timer=setTimeout(callback,timeout||defaultTimeout))};return _self.delay=function(timeout){timer&&clearTimeout(timer),timer=setTimeout(callback,timeout||defaultTimeout)},_self.schedule=_self,_self.call=function(){this.cancel(),fcn()},_self.cancel=function(){timer&&clearTimeout(timer),timer=null},_self.isPending=function(){return timer},_self}}),ace.define(\"ace/worker/mirror\",[\"require\",\"exports\",\"module\",\"ace/document\",\"ace/lib/lang\"],function(acequire,exports){\"use strict\";var Document=acequire(\"../document\").Document,lang=acequire(\"../lib/lang\"),Mirror=exports.Mirror=function(sender){this.sender=sender;var doc=this.doc=new Document(\"\"),deferredUpdate=this.deferredUpdate=lang.delayedCall(this.onUpdate.bind(this)),_self=this;sender.on(\"change\",function(e){return doc.applyDeltas(e.data),_self.$timeout?deferredUpdate.schedule(_self.$timeout):(_self.onUpdate(),void 0)})};(function(){this.$timeout=500,this.setTimeout=function(timeout){this.$timeout=timeout},this.setValue=function(value){this.doc.setValue(value),this.deferredUpdate.schedule(this.$timeout)},this.getValue=function(callbackId){this.sender.callback(this.doc.getValue(),callbackId)},this.onUpdate=function(){},this.isPending=function(){return this.deferredUpdate.isPending()}}).call(Mirror.prototype)}),ace.define(\"ace/mode/javascript/jshint\",[\"require\",\"exports\",\"module\"],function(acequire,exports,module){module.exports=function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=\"function\"==typeof acequire&&acequire;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw Error(\"Cannot find module '\"+o+\"'\")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}for(var i=\"function\"==typeof acequire&&acequire,o=0;r.length>o;o++)s(r[o]);return s}({1:[function(_dereq_,module){for(var identifierStartTable=[],i=0;128>i;i++)identifierStartTable[i]=36===i||i>=65&&90>=i||95===i||i>=97&&122>=i;for(var identifierPartTable=[],i=0;128>i;i++)identifierPartTable[i]=identifierStartTable[i]||i>=48&&57>=i;module.exports={asciiIdentifierStartTable:identifierStartTable,asciiIdentifierPartTable:identifierPartTable}},{}],2:[function(_dereq_,module,exports){(function(){function createReduce(dir){function iterator(obj,iteratee,memo,keys,index,length){for(;index>=0&&length>index;index+=dir){var currentKey=keys?keys[index]:index;memo=iteratee(memo,obj[currentKey],currentKey,obj)}return memo}return function(obj,iteratee,memo,context){iteratee=optimizeCb(iteratee,context,4);var keys=!isArrayLike(obj)&&_.keys(obj),length=(keys||obj).length,index=dir>0?0:length-1;return 3>arguments.length&&(memo=obj[keys?keys[index]:index],index+=dir),iterator(obj,iteratee,memo,keys,index,length)}}function createIndexFinder(dir){return function(array,predicate,context){predicate=cb(predicate,context);for(var length=null!=array&&array.length,index=dir>0?0:length-1;index>=0&&length>index;index+=dir)if(predicate(array[index],index,array))return index;return-1}}function collectNonEnumProps(obj,keys){var nonEnumIdx=nonEnumerableProps.length,constructor=obj.constructor,proto=_.isFunction(constructor)&&constructor.prototype||ObjProto,prop=\"constructor\";for(_.has(obj,prop)&&!_.contains(keys,prop)&&keys.push(prop);nonEnumIdx--;)prop=nonEnumerableProps[nonEnumIdx],prop in obj&&obj[prop]!==proto[prop]&&!_.contains(keys,prop)&&keys.push(prop)}var root=this,previousUnderscore=root._,ArrayProto=Array.prototype,ObjProto=Object.prototype,FuncProto=Function.prototype,push=ArrayProto.push,slice=ArrayProto.slice,toString=ObjProto.toString,hasOwnProperty=ObjProto.hasOwnProperty,nativeIsArray=Array.isArray,nativeKeys=Object.keys,nativeBind=FuncProto.bind,nativeCreate=Object.create,Ctor=function(){},_=function(obj){return obj instanceof _?obj:this instanceof _?(this._wrapped=obj,void 0):new _(obj)};exports!==void 0?(module!==void 0&&module.exports&&(exports=module.exports=_),exports._=_):root._=_,_.VERSION=\"1.8.2\";var optimizeCb=function(func,context,argCount){if(void 0===context)return func;switch(null==argCount?3:argCount){case 1:return function(value){return func.call(context,value)};case 2:return function(value,other){return func.call(context,value,other)};case 3:return function(value,index,collection){return func.call(context,value,index,collection)};case 4:return function(accumulator,value,index,collection){return func.call(context,accumulator,value,index,collection)}}return function(){return func.apply(context,arguments)}},cb=function(value,context,argCount){return null==value?_.identity:_.isFunction(value)?optimizeCb(value,context,argCount):_.isObject(value)?_.matcher(value):_.property(value)};_.iteratee=function(value,context){return cb(value,context,1/0)};var createAssigner=function(keysFunc,undefinedOnly){return function(obj){var length=arguments.length;if(2>length||null==obj)return obj;for(var index=1;length>index;index++)for(var source=arguments[index],keys=keysFunc(source),l=keys.length,i=0;l>i;i++){var key=keys[i];undefinedOnly&&void 0!==obj[key]||(obj[key]=source[key])}return obj}},baseCreate=function(prototype){if(!_.isObject(prototype))return{};if(nativeCreate)return nativeCreate(prototype);Ctor.prototype=prototype;var result=new Ctor;return Ctor.prototype=null,result},MAX_ARRAY_INDEX=Math.pow(2,53)-1,isArrayLike=function(collection){var length=collection&&collection.length;return\"number\"==typeof length&&length>=0&&MAX_ARRAY_INDEX>=length};_.each=_.forEach=function(obj,iteratee,context){iteratee=optimizeCb(iteratee,context);var i,length;if(isArrayLike(obj))for(i=0,length=obj.length;length>i;i++)iteratee(obj[i],i,obj);else{var keys=_.keys(obj);for(i=0,length=keys.length;length>i;i++)iteratee(obj[keys[i]],keys[i],obj)}return obj},_.map=_.collect=function(obj,iteratee,context){iteratee=cb(iteratee,context);for(var keys=!isArrayLike(obj)&&_.keys(obj),length=(keys||obj).length,results=Array(length),index=0;length>index;index++){var currentKey=keys?keys[index]:index;results[index]=iteratee(obj[currentKey],currentKey,obj)}return results},_.reduce=_.foldl=_.inject=createReduce(1),_.reduceRight=_.foldr=createReduce(-1),_.find=_.detect=function(obj,predicate,context){var key;return key=isArrayLike(obj)?_.findIndex(obj,predicate,context):_.findKey(obj,predicate,context),void 0!==key&&-1!==key?obj[key]:void 0},_.filter=_.select=function(obj,predicate,context){var results=[];return predicate=cb(predicate,context),_.each(obj,function(value,index,list){predicate(value,index,list)&&results.push(value)}),results},_.reject=function(obj,predicate,context){return _.filter(obj,_.negate(cb(predicate)),context)},_.every=_.all=function(obj,predicate,context){predicate=cb(predicate,context);for(var keys=!isArrayLike(obj)&&_.keys(obj),length=(keys||obj).length,index=0;length>index;index++){var currentKey=keys?keys[index]:index;if(!predicate(obj[currentKey],currentKey,obj))return!1}return!0},_.some=_.any=function(obj,predicate,context){predicate=cb(predicate,context);for(var keys=!isArrayLike(obj)&&_.keys(obj),length=(keys||obj).length,index=0;length>index;index++){var currentKey=keys?keys[index]:index;if(predicate(obj[currentKey],currentKey,obj))return!0}return!1},_.contains=_.includes=_.include=function(obj,target,fromIndex){return isArrayLike(obj)||(obj=_.values(obj)),_.indexOf(obj,target,\"number\"==typeof fromIndex&&fromIndex)>=0},_.invoke=function(obj,method){var args=slice.call(arguments,2),isFunc=_.isFunction(method);return _.map(obj,function(value){var func=isFunc?method:value[method];return null==func?func:func.apply(value,args)})},_.pluck=function(obj,key){return _.map(obj,_.property(key))},_.where=function(obj,attrs){return _.filter(obj,_.matcher(attrs))},_.findWhere=function(obj,attrs){return _.find(obj,_.matcher(attrs))},_.max=function(obj,iteratee,context){var value,computed,result=-1/0,lastComputed=-1/0;if(null==iteratee&&null!=obj){obj=isArrayLike(obj)?obj:_.values(obj);\nfor(var i=0,length=obj.length;length>i;i++)value=obj[i],value>result&&(result=value)}else iteratee=cb(iteratee,context),_.each(obj,function(value,index,list){computed=iteratee(value,index,list),(computed>lastComputed||computed===-1/0&&result===-1/0)&&(result=value,lastComputed=computed)});return result},_.min=function(obj,iteratee,context){var value,computed,result=1/0,lastComputed=1/0;if(null==iteratee&&null!=obj){obj=isArrayLike(obj)?obj:_.values(obj);for(var i=0,length=obj.length;length>i;i++)value=obj[i],result>value&&(result=value)}else iteratee=cb(iteratee,context),_.each(obj,function(value,index,list){computed=iteratee(value,index,list),(lastComputed>computed||1/0===computed&&1/0===result)&&(result=value,lastComputed=computed)});return result},_.shuffle=function(obj){for(var rand,set=isArrayLike(obj)?obj:_.values(obj),length=set.length,shuffled=Array(length),index=0;length>index;index++)rand=_.random(0,index),rand!==index&&(shuffled[index]=shuffled[rand]),shuffled[rand]=set[index];return shuffled},_.sample=function(obj,n,guard){return null==n||guard?(isArrayLike(obj)||(obj=_.values(obj)),obj[_.random(obj.length-1)]):_.shuffle(obj).slice(0,Math.max(0,n))},_.sortBy=function(obj,iteratee,context){return iteratee=cb(iteratee,context),_.pluck(_.map(obj,function(value,index,list){return{value:value,index:index,criteria:iteratee(value,index,list)}}).sort(function(left,right){var a=left.criteria,b=right.criteria;if(a!==b){if(a>b||void 0===a)return 1;if(b>a||void 0===b)return-1}return left.index-right.index}),\"value\")};var group=function(behavior){return function(obj,iteratee,context){var result={};return iteratee=cb(iteratee,context),_.each(obj,function(value,index){var key=iteratee(value,index,obj);behavior(result,value,key)}),result}};_.groupBy=group(function(result,value,key){_.has(result,key)?result[key].push(value):result[key]=[value]}),_.indexBy=group(function(result,value,key){result[key]=value}),_.countBy=group(function(result,value,key){_.has(result,key)?result[key]++:result[key]=1}),_.toArray=function(obj){return obj?_.isArray(obj)?slice.call(obj):isArrayLike(obj)?_.map(obj,_.identity):_.values(obj):[]},_.size=function(obj){return null==obj?0:isArrayLike(obj)?obj.length:_.keys(obj).length},_.partition=function(obj,predicate,context){predicate=cb(predicate,context);var pass=[],fail=[];return _.each(obj,function(value,key,obj){(predicate(value,key,obj)?pass:fail).push(value)}),[pass,fail]},_.first=_.head=_.take=function(array,n,guard){return null==array?void 0:null==n||guard?array[0]:_.initial(array,array.length-n)},_.initial=function(array,n,guard){return slice.call(array,0,Math.max(0,array.length-(null==n||guard?1:n)))},_.last=function(array,n,guard){return null==array?void 0:null==n||guard?array[array.length-1]:_.rest(array,Math.max(0,array.length-n))},_.rest=_.tail=_.drop=function(array,n,guard){return slice.call(array,null==n||guard?1:n)},_.compact=function(array){return _.filter(array,_.identity)};var flatten=function(input,shallow,strict,startIndex){for(var output=[],idx=0,i=startIndex||0,length=input&&input.length;length>i;i++){var value=input[i];if(isArrayLike(value)&&(_.isArray(value)||_.isArguments(value))){shallow||(value=flatten(value,shallow,strict));var j=0,len=value.length;for(output.length+=len;len>j;)output[idx++]=value[j++]}else strict||(output[idx++]=value)}return output};_.flatten=function(array,shallow){return flatten(array,shallow,!1)},_.without=function(array){return _.difference(array,slice.call(arguments,1))},_.uniq=_.unique=function(array,isSorted,iteratee,context){if(null==array)return[];_.isBoolean(isSorted)||(context=iteratee,iteratee=isSorted,isSorted=!1),null!=iteratee&&(iteratee=cb(iteratee,context));for(var result=[],seen=[],i=0,length=array.length;length>i;i++){var value=array[i],computed=iteratee?iteratee(value,i,array):value;isSorted?(i&&seen===computed||result.push(value),seen=computed):iteratee?_.contains(seen,computed)||(seen.push(computed),result.push(value)):_.contains(result,value)||result.push(value)}return result},_.union=function(){return _.uniq(flatten(arguments,!0,!0))},_.intersection=function(array){if(null==array)return[];for(var result=[],argsLength=arguments.length,i=0,length=array.length;length>i;i++){var item=array[i];if(!_.contains(result,item)){for(var j=1;argsLength>j&&_.contains(arguments[j],item);j++);j===argsLength&&result.push(item)}}return result},_.difference=function(array){var rest=flatten(arguments,!0,!0,1);return _.filter(array,function(value){return!_.contains(rest,value)})},_.zip=function(){return _.unzip(arguments)},_.unzip=function(array){for(var length=array&&_.max(array,\"length\").length||0,result=Array(length),index=0;length>index;index++)result[index]=_.pluck(array,index);return result},_.object=function(list,values){for(var result={},i=0,length=list&&list.length;length>i;i++)values?result[list[i]]=values[i]:result[list[i][0]]=list[i][1];return result},_.indexOf=function(array,item,isSorted){var i=0,length=array&&array.length;if(\"number\"==typeof isSorted)i=0>isSorted?Math.max(0,length+isSorted):isSorted;else if(isSorted&&length)return i=_.sortedIndex(array,item),array[i]===item?i:-1;if(item!==item)return _.findIndex(slice.call(array,i),_.isNaN);for(;length>i;i++)if(array[i]===item)return i;return-1},_.lastIndexOf=function(array,item,from){var idx=array?array.length:0;if(\"number\"==typeof from&&(idx=0>from?idx+from+1:Math.min(idx,from+1)),item!==item)return _.findLastIndex(slice.call(array,0,idx),_.isNaN);for(;--idx>=0;)if(array[idx]===item)return idx;return-1},_.findIndex=createIndexFinder(1),_.findLastIndex=createIndexFinder(-1),_.sortedIndex=function(array,obj,iteratee,context){iteratee=cb(iteratee,context,1);for(var value=iteratee(obj),low=0,high=array.length;high>low;){var mid=Math.floor((low+high)/2);value>iteratee(array[mid])?low=mid+1:high=mid}return low},_.range=function(start,stop,step){1>=arguments.length&&(stop=start||0,start=0),step=step||1;for(var length=Math.max(Math.ceil((stop-start)/step),0),range=Array(length),idx=0;length>idx;idx++,start+=step)range[idx]=start;return range};var executeBound=function(sourceFunc,boundFunc,context,callingContext,args){if(!(callingContext instanceof boundFunc))return sourceFunc.apply(context,args);var self=baseCreate(sourceFunc.prototype),result=sourceFunc.apply(self,args);return _.isObject(result)?result:self};_.bind=function(func,context){if(nativeBind&&func.bind===nativeBind)return nativeBind.apply(func,slice.call(arguments,1));if(!_.isFunction(func))throw new TypeError(\"Bind must be called on a function\");var args=slice.call(arguments,2),bound=function(){return executeBound(func,bound,context,this,args.concat(slice.call(arguments)))};return bound},_.partial=function(func){var boundArgs=slice.call(arguments,1),bound=function(){for(var position=0,length=boundArgs.length,args=Array(length),i=0;length>i;i++)args[i]=boundArgs[i]===_?arguments[position++]:boundArgs[i];for(;arguments.length>position;)args.push(arguments[position++]);return executeBound(func,bound,this,this,args)};return bound},_.bindAll=function(obj){var i,key,length=arguments.length;if(1>=length)throw Error(\"bindAll must be passed function names\");for(i=1;length>i;i++)key=arguments[i],obj[key]=_.bind(obj[key],obj);return obj},_.memoize=function(func,hasher){var memoize=function(key){var cache=memoize.cache,address=\"\"+(hasher?hasher.apply(this,arguments):key);return _.has(cache,address)||(cache[address]=func.apply(this,arguments)),cache[address]};return memoize.cache={},memoize},_.delay=function(func,wait){var args=slice.call(arguments,2);return setTimeout(function(){return func.apply(null,args)},wait)},_.defer=_.partial(_.delay,_,1),_.throttle=function(func,wait,options){var context,args,result,timeout=null,previous=0;options||(options={});var later=function(){previous=options.leading===!1?0:_.now(),timeout=null,result=func.apply(context,args),timeout||(context=args=null)};return function(){var now=_.now();previous||options.leading!==!1||(previous=now);var remaining=wait-(now-previous);return context=this,args=arguments,0>=remaining||remaining>wait?(timeout&&(clearTimeout(timeout),timeout=null),previous=now,result=func.apply(context,args),timeout||(context=args=null)):timeout||options.trailing===!1||(timeout=setTimeout(later,remaining)),result}},_.debounce=function(func,wait,immediate){var timeout,args,context,timestamp,result,later=function(){var last=_.now()-timestamp;wait>last&&last>=0?timeout=setTimeout(later,wait-last):(timeout=null,immediate||(result=func.apply(context,args),timeout||(context=args=null)))};return function(){context=this,args=arguments,timestamp=_.now();var callNow=immediate&&!timeout;return timeout||(timeout=setTimeout(later,wait)),callNow&&(result=func.apply(context,args),context=args=null),result}},_.wrap=function(func,wrapper){return _.partial(wrapper,func)},_.negate=function(predicate){return function(){return!predicate.apply(this,arguments)}},_.compose=function(){var args=arguments,start=args.length-1;return function(){for(var i=start,result=args[start].apply(this,arguments);i--;)result=args[i].call(this,result);return result}},_.after=function(times,func){return function(){return 1>--times?func.apply(this,arguments):void 0}},_.before=function(times,func){var memo;return function(){return--times>0&&(memo=func.apply(this,arguments)),1>=times&&(func=null),memo}},_.once=_.partial(_.before,2);var hasEnumBug=!{toString:null}.propertyIsEnumerable(\"toString\"),nonEnumerableProps=[\"valueOf\",\"isPrototypeOf\",\"toString\",\"propertyIsEnumerable\",\"hasOwnProperty\",\"toLocaleString\"];_.keys=function(obj){if(!_.isObject(obj))return[];if(nativeKeys)return nativeKeys(obj);var keys=[];for(var key in obj)_.has(obj,key)&&keys.push(key);return hasEnumBug&&collectNonEnumProps(obj,keys),keys},_.allKeys=function(obj){if(!_.isObject(obj))return[];var keys=[];for(var key in obj)keys.push(key);return hasEnumBug&&collectNonEnumProps(obj,keys),keys},_.values=function(obj){for(var keys=_.keys(obj),length=keys.length,values=Array(length),i=0;length>i;i++)values[i]=obj[keys[i]];return values},_.mapObject=function(obj,iteratee,context){iteratee=cb(iteratee,context);for(var currentKey,keys=_.keys(obj),length=keys.length,results={},index=0;length>index;index++)currentKey=keys[index],results[currentKey]=iteratee(obj[currentKey],currentKey,obj);return results},_.pairs=function(obj){for(var keys=_.keys(obj),length=keys.length,pairs=Array(length),i=0;length>i;i++)pairs[i]=[keys[i],obj[keys[i]]];return pairs},_.invert=function(obj){for(var result={},keys=_.keys(obj),i=0,length=keys.length;length>i;i++)result[obj[keys[i]]]=keys[i];return result},_.functions=_.methods=function(obj){var names=[];for(var key in obj)_.isFunction(obj[key])&&names.push(key);return names.sort()},_.extend=createAssigner(_.allKeys),_.extendOwn=_.assign=createAssigner(_.keys),_.findKey=function(obj,predicate,context){predicate=cb(predicate,context);for(var key,keys=_.keys(obj),i=0,length=keys.length;length>i;i++)if(key=keys[i],predicate(obj[key],key,obj))return key},_.pick=function(object,oiteratee,context){var iteratee,keys,result={},obj=object;if(null==obj)return result;_.isFunction(oiteratee)?(keys=_.allKeys(obj),iteratee=optimizeCb(oiteratee,context)):(keys=flatten(arguments,!1,!1,1),iteratee=function(value,key,obj){return key in obj},obj=Object(obj));for(var i=0,length=keys.length;length>i;i++){var key=keys[i],value=obj[key];iteratee(value,key,obj)&&(result[key]=value)}return result},_.omit=function(obj,iteratee,context){if(_.isFunction(iteratee))iteratee=_.negate(iteratee);else{var keys=_.map(flatten(arguments,!1,!1,1),String);iteratee=function(value,key){return!_.contains(keys,key)}}return _.pick(obj,iteratee,context)},_.defaults=createAssigner(_.allKeys,!0),_.clone=function(obj){return _.isObject(obj)?_.isArray(obj)?obj.slice():_.extend({},obj):obj},_.tap=function(obj,interceptor){return interceptor(obj),obj},_.isMatch=function(object,attrs){var keys=_.keys(attrs),length=keys.length;if(null==object)return!length;for(var obj=Object(object),i=0;length>i;i++){var key=keys[i];if(attrs[key]!==obj[key]||!(key in obj))return!1}return!0};var eq=function(a,b,aStack,bStack){if(a===b)return 0!==a||1/a===1/b;if(null==a||null==b)return a===b;a instanceof _&&(a=a._wrapped),b instanceof _&&(b=b._wrapped);var className=toString.call(a);if(className!==toString.call(b))return!1;switch(className){case\"[object RegExp]\":case\"[object String]\":return\"\"+a==\"\"+b;case\"[object Number]\":return+a!==+a?+b!==+b:0===+a?1/+a===1/b:+a===+b;case\"[object Date]\":case\"[object Boolean]\":return+a===+b}var areArrays=\"[object Array]\"===className;if(!areArrays){if(\"object\"!=typeof a||\"object\"!=typeof b)return!1;var aCtor=a.constructor,bCtor=b.constructor;if(aCtor!==bCtor&&!(_.isFunction(aCtor)&&aCtor instanceof aCtor&&_.isFunction(bCtor)&&bCtor instanceof bCtor)&&\"constructor\"in a&&\"constructor\"in b)return!1}aStack=aStack||[],bStack=bStack||[];for(var length=aStack.length;length--;)if(aStack[length]===a)return bStack[length]===b;if(aStack.push(a),bStack.push(b),areArrays){if(length=a.length,length!==b.length)return!1;for(;length--;)if(!eq(a[length],b[length],aStack,bStack))return!1}else{var key,keys=_.keys(a);if(length=keys.length,_.keys(b).length!==length)return!1;for(;length--;)if(key=keys[length],!_.has(b,key)||!eq(a[key],b[key],aStack,bStack))return!1}return aStack.pop(),bStack.pop(),!0};_.isEqual=function(a,b){return eq(a,b)},_.isEmpty=function(obj){return null==obj?!0:isArrayLike(obj)&&(_.isArray(obj)||_.isString(obj)||_.isArguments(obj))?0===obj.length:0===_.keys(obj).length},_.isElement=function(obj){return!(!obj||1!==obj.nodeType)},_.isArray=nativeIsArray||function(obj){return\"[object Array]\"===toString.call(obj)},_.isObject=function(obj){var type=typeof obj;return\"function\"===type||\"object\"===type&&!!obj},_.each([\"Arguments\",\"Function\",\"String\",\"Number\",\"Date\",\"RegExp\",\"Error\"],function(name){_[\"is\"+name]=function(obj){return toString.call(obj)===\"[object \"+name+\"]\"}}),_.isArguments(arguments)||(_.isArguments=function(obj){return _.has(obj,\"callee\")}),\"object\"!=typeof Int8Array&&(_.isFunction=function(obj){return\"function\"==typeof obj||!1}),_.isFinite=function(obj){return isFinite(obj)&&!isNaN(parseFloat(obj))},_.isNaN=function(obj){return _.isNumber(obj)&&obj!==+obj},_.isBoolean=function(obj){return obj===!0||obj===!1||\"[object Boolean]\"===toString.call(obj)},_.isNull=function(obj){return null===obj},_.isUndefined=function(obj){return void 0===obj},_.has=function(obj,key){return null!=obj&&hasOwnProperty.call(obj,key)},_.noConflict=function(){return root._=previousUnderscore,this},_.identity=function(value){return value},_.constant=function(value){return function(){return value}},_.noop=function(){},_.property=function(key){return function(obj){return null==obj?void 0:obj[key]}},_.propertyOf=function(obj){return null==obj?function(){}:function(key){return obj[key]}},_.matcher=_.matches=function(attrs){return attrs=_.extendOwn({},attrs),function(obj){return _.isMatch(obj,attrs)}},_.times=function(n,iteratee,context){var accum=Array(Math.max(0,n));iteratee=optimizeCb(iteratee,context,1);for(var i=0;n>i;i++)accum[i]=iteratee(i);return accum},_.random=function(min,max){return null==max&&(max=min,min=0),min+Math.floor(Math.random()*(max-min+1))},_.now=Date.now||function(){return(new Date).getTime()};var escapeMap={\"&\":\"&amp;\",\"<\":\"&lt;\",\">\":\"&gt;\",'\"':\"&quot;\",\"'\":\"&#x27;\",\"`\":\"&#x60;\"},unescapeMap=_.invert(escapeMap),createEscaper=function(map){var escaper=function(match){return map[match]},source=\"(?:\"+_.keys(map).join(\"|\")+\")\",testRegexp=RegExp(source),replaceRegexp=RegExp(source,\"g\");return function(string){return string=null==string?\"\":\"\"+string,testRegexp.test(string)?string.replace(replaceRegexp,escaper):string}};_.escape=createEscaper(escapeMap),_.unescape=createEscaper(unescapeMap),_.result=function(object,property,fallback){var value=null==object?void 0:object[property];return void 0===value&&(value=fallback),_.isFunction(value)?value.call(object):value};var idCounter=0;_.uniqueId=function(prefix){var id=++idCounter+\"\";return prefix?prefix+id:id},_.templateSettings={evaluate:/<%([\\s\\S]+?)%>/g,interpolate:/<%=([\\s\\S]+?)%>/g,escape:/<%-([\\s\\S]+?)%>/g};var noMatch=/(.)^/,escapes={\"'\":\"'\",\"\\\\\":\"\\\\\",\"\\r\":\"r\",\"\\n\":\"n\",\"\\u2028\":\"u2028\",\"\\u2029\":\"u2029\"},escaper=/\\\\|'|\\r|\\n|\\u2028|\\u2029/g,escapeChar=function(match){return\"\\\\\"+escapes[match]};_.template=function(text,settings,oldSettings){!settings&&oldSettings&&(settings=oldSettings),settings=_.defaults({},settings,_.templateSettings);var matcher=RegExp([(settings.escape||noMatch).source,(settings.interpolate||noMatch).source,(settings.evaluate||noMatch).source].join(\"|\")+\"|$\",\"g\"),index=0,source=\"__p+='\";text.replace(matcher,function(match,escape,interpolate,evaluate,offset){return source+=text.slice(index,offset).replace(escaper,escapeChar),index=offset+match.length,escape?source+=\"'+\\n((__t=(\"+escape+\"))==null?'':_.escape(__t))+\\n'\":interpolate?source+=\"'+\\n((__t=(\"+interpolate+\"))==null?'':__t)+\\n'\":evaluate&&(source+=\"';\\n\"+evaluate+\"\\n__p+='\"),match}),source+=\"';\\n\",settings.variable||(source=\"with(obj||{}){\\n\"+source+\"}\\n\"),source=\"var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\\n\"+source+\"return __p;\\n\";try{var render=Function(settings.variable||\"obj\",\"_\",source)}catch(e){throw e.source=source,e}var template=function(data){return render.call(this,data,_)},argument=settings.variable||\"obj\";return template.source=\"function(\"+argument+\"){\\n\"+source+\"}\",template},_.chain=function(obj){var instance=_(obj);return instance._chain=!0,instance};var result=function(instance,obj){return instance._chain?_(obj).chain():obj};_.mixin=function(obj){_.each(_.functions(obj),function(name){var func=_[name]=obj[name];_.prototype[name]=function(){var args=[this._wrapped];return push.apply(args,arguments),result(this,func.apply(_,args))}})},_.mixin(_),_.each([\"pop\",\"push\",\"reverse\",\"shift\",\"sort\",\"splice\",\"unshift\"],function(name){var method=ArrayProto[name];_.prototype[name]=function(){var obj=this._wrapped;return method.apply(obj,arguments),\"shift\"!==name&&\"splice\"!==name||0!==obj.length||delete obj[0],result(this,obj)}}),_.each([\"concat\",\"join\",\"slice\"],function(name){var method=ArrayProto[name];_.prototype[name]=function(){return result(this,method.apply(this._wrapped,arguments))}}),_.prototype.value=function(){return this._wrapped},_.prototype.valueOf=_.prototype.toJSON=_.prototype.value,_.prototype.toString=function(){return\"\"+this._wrapped},\"function\"==typeof define&&define.amd&&ace.define(\"underscore\",[],function(){return _})}).call(this)},{}],3:[function(_dereq_,module,exports){var _=_dereq_(\"underscore\"),events=_dereq_(\"events\"),vars=_dereq_(\"./vars.js\"),messages=_dereq_(\"./messages.js\"),Lexer=_dereq_(\"./lex.js\").Lexer,reg=_dereq_(\"./reg.js\"),state=_dereq_(\"./state.js\").state,style=_dereq_(\"./style.js\"),options=_dereq_(\"./options.js\"),JSHINT=function(){\"use strict\";function checkOption(name,t){return name=name.trim(),/^[+-]W\\d{3}$/g.test(name)?!0:-1!==options.validNames.indexOf(name)||\"jslint\"===t.type||_.has(options.removed,name)?!0:(error(\"E001\",t,name),!1)}function isString(obj){return\"[object String]\"===Object.prototype.toString.call(obj)}function isIdentifier(tkn,value){return tkn?tkn.identifier&&tkn.value===value?!0:!1:!1}function isReserved(token){if(!token.reserved)return!1;var meta=token.meta;if(meta&&meta.isFutureReservedWord&&state.option.inES5()){if(!meta.es5)return!1;if(meta.strictOnly&&!state.option.strict&&!state.directive[\"use strict\"])return!1;if(token.isProperty)return!1}return!0}function supplant(str,data){return str.replace(/\\{([^{}]*)\\}/g,function(a,b){var r=data[b];return\"string\"==typeof r||\"number\"==typeof r?r:a})}function combine(dest,src){Object.keys(src).forEach(function(name){_.has(JSHINT.blacklist,name)||(dest[name]=src[name])})}function processenforceall(){if(state.option.enforceall){for(var enforceopt in options.bool.enforcing)void 0===state.option[enforceopt]&&(state.option[enforceopt]=!0);for(var relaxopt in options.bool.relaxing)void 0===state.option[relaxopt]&&(state.option[relaxopt]=!1)}}function assume(){processenforceall(),state.option.es3||combine(predefined,vars.ecmaIdentifiers[5]),state.option.esnext&&combine(predefined,vars.ecmaIdentifiers[6]),state.option.couch&&combine(predefined,vars.couch),state.option.qunit&&combine(predefined,vars.qunit),state.option.rhino&&combine(predefined,vars.rhino),state.option.shelljs&&(combine(predefined,vars.shelljs),combine(predefined,vars.node)),state.option.typed&&combine(predefined,vars.typed),state.option.phantom&&combine(predefined,vars.phantom),state.option.prototypejs&&combine(predefined,vars.prototypejs),state.option.node&&(combine(predefined,vars.node),combine(predefined,vars.typed)),state.option.devel&&combine(predefined,vars.devel),state.option.dojo&&combine(predefined,vars.dojo),state.option.browser&&(combine(predefined,vars.browser),combine(predefined,vars.typed)),state.option.browserify&&(combine(predefined,vars.browser),combine(predefined,vars.typed),combine(predefined,vars.browserify)),state.option.nonstandard&&combine(predefined,vars.nonstandard),state.option.jasmine&&combine(predefined,vars.jasmine),state.option.jquery&&combine(predefined,vars.jquery),state.option.mootools&&combine(predefined,vars.mootools),state.option.worker&&combine(predefined,vars.worker),state.option.wsh&&combine(predefined,vars.wsh),state.option.globalstrict&&state.option.strict!==!1&&(state.option.strict=!0),state.option.yui&&combine(predefined,vars.yui),state.option.mocha&&combine(predefined,vars.mocha),state.option.inMoz=function(){return state.option.moz},state.option.inESNext=function(){return state.option.moz||state.option.esnext},state.option.inES5=function(){return!state.option.es3},state.option.inES3=function(strict){return strict?!state.option.moz&&!state.option.esnext&&state.option.es3:state.option.es3}}function quit(code,line,chr){var percentage=Math.floor(100*(line/state.lines.length)),message=messages.errors[code].desc;throw{name:\"JSHintError\",line:line,character:chr,message:message+\" (\"+percentage+\"% scanned).\",raw:message,code:code}}function isundef(scope,code,token,a){state.ignored[code]||state.option.undef===!1||JSHINT.undefs.push([scope,code,token,a])}function removeIgnoredMessages(){var ignored=state.ignoredLines;_.isEmpty(ignored)||(JSHINT.errors=_.reject(JSHINT.errors,function(err){return ignored[err.line]}))}function warning(code,t,a,b,c,d){var ch,l,w,msg;if(/^W\\d{3}$/.test(code)){if(state.ignored[code])return;msg=messages.warnings[code]}else/E\\d{3}/.test(code)?msg=messages.errors[code]:/I\\d{3}/.test(code)&&(msg=messages.info[code]);return t=t||state.tokens.next,\"(end)\"===t.id&&(t=state.tokens.curr),l=t.line||0,ch=t.from||0,w={id:\"(error)\",raw:msg.desc,code:msg.code,evidence:state.lines[l-1]||\"\",line:l,character:ch,scope:JSHINT.scope,a:a,b:b,c:c,d:d},w.reason=supplant(msg.desc,w),JSHINT.errors.push(w),removeIgnoredMessages(),JSHINT.errors.length>=state.option.maxerr&&quit(\"E043\",l,ch),w}function warningAt(m,l,ch,a,b,c,d){return warning(m,{line:l,from:ch},a,b,c,d)}function error(m,t,a,b,c,d){warning(m,t,a,b,c,d)}function errorAt(m,l,ch,a,b,c,d){return error(m,{line:l,from:ch},a,b,c,d)}function addInternalSrc(elem,src){var i;return i={id:\"(internal)\",elem:elem,value:src},JSHINT.internals.push(i),i}function addlabel(name,opts){opts=opts||{};var type=opts.type,token=opts.token,islet=opts.islet;\"exception\"===type&&_.has(funct[\"(context)\"],name)&&(funct[name]===!0||state.option.node||warning(\"W002\",state.tokens.next,name)),_.has(funct,name)&&!funct[\"(global)\"]&&(funct[name]===!0?state.option.latedef&&(state.option.latedef===!0&&_.contains([funct[name],type],\"unction\")||!_.contains([funct[name],type],\"unction\"))&&warning(\"W003\",state.tokens.next,name):((!state.option.shadow||_.contains([\"inner\",\"outer\"],state.option.shadow))&&\"exception\"!==type||funct[\"(blockscope)\"].getlabel(name))&&warning(\"W004\",state.tokens.next,name)),funct[\"(context)\"]&&_.has(funct[\"(context)\"],name)&&\"function\"!==type&&\"outer\"===state.option.shadow&&warning(\"W123\",state.tokens.next,name),islet?(funct[\"(blockscope)\"].current.add(name,type,state.tokens.curr),funct[\"(blockscope)\"].atTop()&&exported[name]&&(state.tokens.curr.exported=!0)):(funct[\"(blockscope)\"].shadow(name),funct[name]=type,token&&(funct[\"(tokens)\"][name]=token),setprop(funct,name,{unused:opts.unused||!1}),funct[\"(global)\"]?(global[name]=funct,_.has(implied,name)&&(state.option.latedef&&(state.option.latedef===!0&&_.contains([funct[name],type],\"unction\")||!_.contains([funct[name],type],\"unction\"))&&warning(\"W003\",state.tokens.next,name),delete implied[name])):scope[name]=funct)}function doOption(){var nt=state.tokens.next,body=nt.body.match(/(-\\s+)?[^\\s,:]+(?:\\s*:\\s*(-\\s+)?[^\\s,]+)?/g)||[],predef={};if(\"globals\"===nt.type){body.forEach(function(g){g=g.split(\":\");var key=(g[0]||\"\").trim(),val=(g[1]||\"\").trim();\"-\"===key.charAt(0)?(key=key.slice(1),val=!1,JSHINT.blacklist[key]=key,delete predefined[key]):predef[key]=\"true\"===val}),combine(predefined,predef);for(var key in predef)_.has(predef,key)&&(declared[key]=nt)}\"exported\"===nt.type&&body.forEach(function(e){exported[e]=!0}),\"members\"===nt.type&&(membersOnly=membersOnly||{},body.forEach(function(m){var ch1=m.charAt(0),ch2=m.charAt(m.length-1);ch1!==ch2||'\"'!==ch1&&\"'\"!==ch1||(m=m.substr(1,m.length-2).replace('\\\\\"','\"')),membersOnly[m]=!1}));var numvals=[\"maxstatements\",\"maxparams\",\"maxdepth\",\"maxcomplexity\",\"maxerr\",\"maxlen\",\"indent\"];(\"jshint\"===nt.type||\"jslint\"===nt.type)&&(body.forEach(function(g){g=g.split(\":\");var key=(g[0]||\"\").trim(),val=(g[1]||\"\").trim();if(checkOption(key,nt))if(numvals.indexOf(key)>=0)if(\"false\"!==val){if(val=+val,\"number\"!=typeof val||!isFinite(val)||0>=val||Math.floor(val)!==val)return error(\"E032\",nt,g[1].trim()),void 0;state.option[key]=val}else state.option[key]=\"indent\"===key?4:!1;else{if(\"validthis\"===key)return funct[\"(global)\"]?void error(\"E009\"):\"true\"!==val&&\"false\"!==val?void error(\"E002\",nt):(state.option.validthis=\"true\"===val,void 0);if(\"quotmark\"!==key)if(\"shadow\"!==key)if(\"unused\"!==key)if(\"latedef\"!==key){if(\"ignore\"!==key){var match=/^([+-])(W\\d{3})$/g.exec(key);if(match)return state.ignored[match[2]]=\"-\"===match[1],void 0;var tn;return\"true\"===val||\"false\"===val?(\"jslint\"===nt.type?(tn=options.renamed[key]||key,state.option[tn]=\"true\"===val,void 0!==options.inverted[tn]&&(state.option[tn]=!state.option[tn])):state.option[key]=\"true\"===val,\"newcap\"===key&&(state.option[\"(explicitNewcap)\"]=!0),void 0):(error(\"E002\",nt),void 0)}switch(val){case\"start\":state.ignoreLinterErrors=!0;break;case\"end\":state.ignoreLinterErrors=!1;break;case\"line\":state.ignoredLines[nt.line]=!0,removeIgnoredMessages();break;default:error(\"E002\",nt)}}else switch(val){case\"true\":state.option.latedef=!0;break;case\"false\":state.option.latedef=!1;break;case\"nofunc\":state.option.latedef=\"nofunc\";break;default:error(\"E002\",nt)}else switch(val){case\"true\":state.option.unused=!0;break;case\"false\":state.option.unused=!1;break;case\"vars\":case\"strict\":state.option.unused=val;break;default:error(\"E002\",nt)}else switch(val){case\"true\":state.option.shadow=!0;break;case\"outer\":state.option.shadow=\"outer\";break;case\"false\":case\"inner\":state.option.shadow=\"inner\";break;default:error(\"E002\",nt)}else switch(val){case\"true\":case\"false\":state.option.quotmark=\"true\"===val;break;case\"double\":case\"single\":state.option.quotmark=val;break;default:error(\"E002\",nt)}}}),assume())}function peek(p){for(var t,i=p||0,j=0;i>=j;)t=lookahead[j],t||(t=lookahead[j]=lex.token()),j+=1;return t}function peekIgnoreEOL(){var t,i=0;do t=peek(i++);while(\"(endline)\"===t.id);return t}function advance(id,t){switch(state.tokens.curr.id){case\"(number)\":\".\"===state.tokens.next.id&&warning(\"W005\",state.tokens.curr);break;case\"-\":(\"-\"===state.tokens.next.id||\"--\"===state.tokens.next.id)&&warning(\"W006\");break;case\"+\":(\"+\"===state.tokens.next.id||\"++\"===state.tokens.next.id)&&warning(\"W007\")}for(id&&state.tokens.next.id!==id&&(t?\"(end)\"===state.tokens.next.id?error(\"E019\",t,t.id):error(\"E020\",state.tokens.next,id,t.id,t.line,state.tokens.next.value):(\"(identifier)\"!==state.tokens.next.type||state.tokens.next.value!==id)&&warning(\"W116\",state.tokens.next,id,state.tokens.next.value)),state.tokens.prev=state.tokens.curr,state.tokens.curr=state.tokens.next;;){if(state.tokens.next=lookahead.shift()||lex.token(),state.tokens.next||quit(\"E041\",state.tokens.curr.line),\"(end)\"===state.tokens.next.id||\"(error)\"===state.tokens.next.id)return;if(state.tokens.next.check&&state.tokens.next.check(),state.tokens.next.isSpecial)doOption();else if(\"(endline)\"!==state.tokens.next.id)break}}function isInfix(token){return token.infix||!token.identifier&&!token.template&&!!token.led}function isEndOfExpr(){var curr=state.tokens.curr,next=state.tokens.next;return\";\"===next.id||\"}\"===next.id||\":\"===next.id?!0:isInfix(next)===isInfix(curr)||\"yield\"===curr.id&&state.option.inMoz(!0)?curr.line!==startLine(next):!1}function isBeginOfExpr(prev){return!prev.left&&\"unary\"!==prev.arity}function expression(rbp,initial){var left,isArray=!1,isObject=!1,isLetExpr=!1;state.nameStack.push(),initial||\"let\"!==state.tokens.next.value||\"(\"!==peek(0).value||(state.option.inMoz(!0)||warning(\"W118\",state.tokens.next,\"let expressions\"),isLetExpr=!0,funct[\"(blockscope)\"].stack(),advance(\"let\"),advance(\"(\"),state.tokens.prev.fud(),advance(\")\")),\"(end)\"===state.tokens.next.id&&error(\"E006\",state.tokens.curr);var isDangerous=state.option.asi&&state.tokens.prev.line!==startLine(state.tokens.curr)&&_.contains([\"]\",\")\"],state.tokens.prev.id)&&_.contains([\"[\",\"(\"],state.tokens.curr.id);if(isDangerous&&warning(\"W014\",state.tokens.curr,state.tokens.curr.id),advance(),initial&&(funct[\"(verb)\"]=state.tokens.curr.value,state.tokens.curr.beginsStmt=!0),initial===!0&&state.tokens.curr.fud)left=state.tokens.curr.fud();else for(state.tokens.curr.nud?left=state.tokens.curr.nud():error(\"E030\",state.tokens.curr,state.tokens.curr.id);(state.tokens.next.lbp>rbp||\"(template)\"===state.tokens.next.type)&&!isEndOfExpr();)isArray=\"Array\"===state.tokens.curr.value,isObject=\"Object\"===state.tokens.curr.value,left&&(left.value||left.first&&left.first.value)&&(\"new\"!==left.value||left.first&&left.first.value&&\".\"===left.first.value)&&(isArray=!1,left.value!==state.tokens.curr.value&&(isObject=!1)),advance(),isArray&&\"(\"===state.tokens.curr.id&&\")\"===state.tokens.next.id&&warning(\"W009\",state.tokens.curr),isObject&&\"(\"===state.tokens.curr.id&&\")\"===state.tokens.next.id&&warning(\"W010\",state.tokens.curr),left&&state.tokens.curr.led?left=state.tokens.curr.led(left):error(\"E033\",state.tokens.curr,state.tokens.curr.id);return isLetExpr&&funct[\"(blockscope)\"].unstack(),state.nameStack.pop(),left}function startLine(token){return token.startLine||token.line}function nobreaknonadjacent(left,right){left=left||state.tokens.curr,right=right||state.tokens.next,state.option.laxbreak||left.line===startLine(right)||warning(\"W014\",right,right.value)}function nolinebreak(t){t=t||state.tokens.curr,t.line!==startLine(state.tokens.next)&&warning(\"E022\",t,t.value)}function nobreakcomma(left,right){left.line!==startLine(right)&&(state.option.laxcomma||(comma.first&&(warning(\"I001\"),comma.first=!1),warning(\"W014\",left,right.value)))}function comma(opts){if(opts=opts||{},opts.peek?nobreakcomma(state.tokens.prev,state.tokens.curr):(nobreakcomma(state.tokens.curr,state.tokens.next),advance(\",\")),state.tokens.next.identifier&&(!opts.property||!state.option.inES5()))switch(state.tokens.next.value){case\"break\":case\"case\":case\"catch\":case\"continue\":case\"default\":case\"do\":case\"else\":case\"finally\":case\"for\":case\"if\":case\"in\":case\"instanceof\":case\"return\":case\"switch\":case\"throw\":case\"try\":case\"var\":case\"let\":case\"while\":case\"with\":return error(\"E024\",state.tokens.next,state.tokens.next.value),!1}if(\"(punctuator)\"===state.tokens.next.type)switch(state.tokens.next.value){case\"}\":case\"]\":case\",\":if(opts.allowTrailing)return!0;case\")\":return error(\"E024\",state.tokens.next,state.tokens.next.value),!1\n}return!0}function symbol(s,p){var x=state.syntax[s];return x&&\"object\"==typeof x||(state.syntax[s]=x={id:s,lbp:p,value:s}),x}function delim(s){var x=symbol(s,0);return x.delim=!0,x}function stmt(s,f){var x=delim(s);return x.identifier=x.reserved=!0,x.fud=f,x}function blockstmt(s,f){var x=stmt(s,f);return x.block=!0,x}function reserveName(x){var c=x.id.charAt(0);return(c>=\"a\"&&\"z\">=c||c>=\"A\"&&\"Z\">=c)&&(x.identifier=x.reserved=!0),x}function prefix(s,f){var x=symbol(s,150);return reserveName(x),x.nud=\"function\"==typeof f?f:function(){return this.arity=\"unary\",this.right=expression(150),(\"++\"===this.id||\"--\"===this.id)&&(state.option.plusplus?warning(\"W016\",this,this.id):!this.right||this.right.identifier&&!isReserved(this.right)||\".\"===this.right.id||\"[\"===this.right.id||warning(\"W017\",this)),this},x}function type(s,f){var x=delim(s);return x.type=s,x.nud=f,x}function reserve(name,func){var x=type(name,func);return x.identifier=!0,x.reserved=!0,x}function FutureReservedWord(name,meta){var x=type(name,meta&&meta.nud||function(){return this});return meta=meta||{},meta.isFutureReservedWord=!0,x.value=name,x.identifier=!0,x.reserved=!0,x.meta=meta,x}function reservevar(s,v){return reserve(s,function(){return\"function\"==typeof v&&v(this),this})}function infix(s,f,p,w){var x=symbol(s,p);return reserveName(x),x.infix=!0,x.led=function(left){return w||nobreaknonadjacent(state.tokens.prev,state.tokens.curr),\"in\"===s&&\"!\"===left.id&&warning(\"W018\",left,\"!\"),\"function\"==typeof f?f(left,this):(this.left=left,this.right=expression(p),this)},x}function application(s){var x=symbol(s,42);return x.led=function(left){return nobreaknonadjacent(state.tokens.prev,state.tokens.curr),this.left=left,this.right=doFunction({type:\"arrow\",loneArg:left}),this},x}function relation(s,f){var x=symbol(s,100);return x.led=function(left){nobreaknonadjacent(state.tokens.prev,state.tokens.curr);var right=expression(100);return isIdentifier(left,\"NaN\")||isIdentifier(right,\"NaN\")?warning(\"W019\",this):f&&f.apply(this,[left,right]),left&&right||quit(\"E041\",state.tokens.curr.line),\"!\"===left.id&&warning(\"W018\",left,\"!\"),\"!\"===right.id&&warning(\"W018\",right,\"!\"),this.left=left,this.right=right,this},x}function isPoorRelation(node){return node&&(\"(number)\"===node.type&&0===+node.value||\"(string)\"===node.type&&\"\"===node.value||\"null\"===node.type&&!state.option.eqnull||\"true\"===node.type||\"false\"===node.type||\"undefined\"===node.type)}function isTypoTypeof(left,right){if(state.option.notypeof)return!1;if(!left||!right)return!1;var values=[\"undefined\",\"object\",\"boolean\",\"number\",\"string\",\"function\",\"xml\",\"object\",\"unknown\",\"symbol\"];return\"(identifier)\"===right.type&&\"typeof\"===right.value&&\"(string)\"===left.type?!_.contains(values,left.value):!1}function isGlobalEval(left,state,funct){var isGlobal=!1;return\"this\"===left.type&&null===funct[\"(context)\"]?isGlobal=!0:\"(identifier)\"===left.type&&(state.option.node&&\"global\"===left.value?isGlobal=!0:!state.option.browser||\"window\"!==left.value&&\"document\"!==left.value||(isGlobal=!0)),isGlobal}function findNativePrototype(left){function walkPrototype(obj){return\"object\"==typeof obj?\"prototype\"===obj.right?obj:walkPrototype(obj.left):void 0}function walkNative(obj){for(;!obj.identifier&&\"object\"==typeof obj.left;)obj=obj.left;return obj.identifier&&natives.indexOf(obj.value)>=0?obj.value:void 0}var natives=[\"Array\",\"ArrayBuffer\",\"Boolean\",\"Collator\",\"DataView\",\"Date\",\"DateTimeFormat\",\"Error\",\"EvalError\",\"Float32Array\",\"Float64Array\",\"Function\",\"Infinity\",\"Intl\",\"Int16Array\",\"Int32Array\",\"Int8Array\",\"Iterator\",\"Number\",\"NumberFormat\",\"Object\",\"RangeError\",\"ReferenceError\",\"RegExp\",\"StopIteration\",\"String\",\"SyntaxError\",\"TypeError\",\"Uint16Array\",\"Uint32Array\",\"Uint8Array\",\"Uint8ClampedArray\",\"URIError\"],prototype=walkPrototype(left);return prototype?walkNative(prototype):void 0}function assignop(s,f,p){var x=infix(s,\"function\"==typeof f?f:function(left,that){if(that.left=left,left){if(state.option.freeze){var nativeObject=findNativePrototype(left);nativeObject&&warning(\"W121\",left,nativeObject)}if(predefined[left.value]===!1&&scope[left.value][\"(global)\"]===!0?warning(\"W020\",left):left[\"function\"]&&warning(\"W021\",left,left.value),\"const\"===funct[left.value]&&error(\"E013\",left,left.value),\".\"===left.id)return left.left?\"arguments\"!==left.left.value||state.directive[\"use strict\"]||warning(\"E031\",that):warning(\"E031\",that),state.nameStack.set(state.tokens.prev),that.right=expression(10),that;if(\"[\"===left.id)return state.tokens.curr.left.first?state.tokens.curr.left.first.forEach(function(t){t&&\"const\"===funct[t.value]&&error(\"E013\",t,t.value)}):left.left?\"arguments\"!==left.left.value||state.directive[\"use strict\"]||warning(\"E031\",that):warning(\"E031\",that),state.nameStack.set(left.right),that.right=expression(10),that;if(left.identifier&&!isReserved(left))return\"exception\"===funct[left.value]&&warning(\"W022\",left),state.nameStack.set(left),that.right=expression(10),that;left===state.syntax[\"function\"]&&warning(\"W023\",state.tokens.curr)}error(\"E031\",that)},p);return x.exps=!0,x.assign=!0,x}function bitwise(s,f,p){var x=symbol(s,p);return reserveName(x),x.led=\"function\"==typeof f?f:function(left){return state.option.bitwise&&warning(\"W016\",this,this.id),this.left=left,this.right=expression(p),this},x}function bitwiseassignop(s){return assignop(s,function(left,that){return state.option.bitwise&&warning(\"W016\",that,that.id),left?\".\"===left.id||\"[\"===left.id||left.identifier&&!isReserved(left)?(expression(10),that):(left===state.syntax[\"function\"]&&warning(\"W023\",state.tokens.curr),that):(error(\"E031\",that),void 0)},20)}function suffix(s){var x=symbol(s,150);return x.led=function(left){return state.option.plusplus?warning(\"W016\",this,this.id):left.identifier&&!isReserved(left)||\".\"===left.id||\"[\"===left.id||warning(\"W017\",this),this.left=left,this},x}function optionalidentifier(fnparam,prop,preserve){if(state.tokens.next.identifier){preserve||advance();var curr=state.tokens.curr,val=state.tokens.curr.value;return isReserved(curr)?prop&&state.option.inES5()?val:fnparam&&\"undefined\"===val?val:(warning(\"W024\",state.tokens.curr,state.tokens.curr.id),val):val}}function identifier(fnparam,prop){var i=optionalidentifier(fnparam,prop,!1);if(i)return i;if(\"...\"===state.tokens.next.value){if(state.option.esnext||warning(\"W119\",state.tokens.next,\"spread/rest operator\"),advance(),checkPunctuators(state.tokens.next,[\"...\"]))for(warning(\"E024\",state.tokens.next,\"...\");checkPunctuators(state.tokens.next,[\"...\"]);)advance();return state.tokens.next.identifier?identifier(fnparam,prop):(warning(\"E024\",state.tokens.curr,\"...\"),void 0)}error(\"E030\",state.tokens.next,state.tokens.next.value),\";\"!==state.tokens.next.id&&advance()}function reachable(controlToken){var t,i=0;if(\";\"===state.tokens.next.id&&!controlToken.inBracelessBlock)for(;;){do t=peek(i),i+=1;while(\"(end)\"!=t.id&&\"(comment)\"===t.id);if(t.reach)return;if(\"(endline)\"!==t.id){if(\"function\"===t.id){state.option.latedef===!0&&warning(\"W026\",t);break}warning(\"W027\",t,t.value,controlToken.value);break}}}function parseFinalSemicolon(){if(\";\"!==state.tokens.next.id){if(state.tokens.next.isUnclosed)return advance();state.option.asi||state.option.lastsemic&&\"}\"===state.tokens.next.id&&startLine(state.tokens.next)===state.tokens.curr.line||warningAt(\"W033\",state.tokens.curr.line,state.tokens.curr.character)}else advance(\";\")}function statement(){var r,i=indent,s=scope,t=state.tokens.next;if(\";\"===t.id)return advance(\";\"),void 0;var res=isReserved(t);if(res&&t.meta&&t.meta.isFutureReservedWord&&\":\"===peek().id&&(warning(\"W024\",t,t.id),res=!1),\"module\"===t.value&&\"(identifier)\"===t.type&&\"(identifier)\"===peek().type){state.option.inESNext()||warning(\"W119\",state.tokens.curr,\"module\"),advance(\"module\");var name=identifier();return addlabel(name,{type:\"unused\",token:state.tokens.curr}),advance(\"from\"),advance(\"(string)\"),parseFinalSemicolon(),void 0}if(t.identifier&&!res&&\":\"===peek().id&&(advance(),advance(\":\"),scope=Object.create(s),addlabel(t.value,{type:\"label\"}),state.tokens.next.labelled||\"{\"===state.tokens.next.value||warning(\"W028\",state.tokens.next,t.value,state.tokens.next.value),state.tokens.next.label=t.value,t=state.tokens.next),\"{\"===t.id){var iscase=\"case\"===funct[\"(verb)\"]&&\":\"===state.tokens.curr.value;return block(!0,!0,!1,!1,iscase),void 0}return r=expression(0,!0),!r||r.identifier&&\"function\"===r.value||\"(punctuator)\"===r.type||!state.directive[\"use strict\"]&&state.option.globalstrict&&state.option.strict&&warning(\"E007\"),t.block||(state.option.expr||r&&r.exps?state.option.nonew&&r&&r.left&&\"(\"===r.id&&\"new\"===r.left.id&&warning(\"W031\",t):warning(\"W030\",state.tokens.curr),parseFinalSemicolon()),indent=i,scope=s,r}function statements(){for(var p,a=[];!state.tokens.next.reach&&\"(end)\"!==state.tokens.next.id;)\";\"===state.tokens.next.id?(p=peek(),(!p||\"(\"!==p.id&&\"[\"!==p.id)&&warning(\"W032\"),advance(\";\")):a.push(statement());return a}function directives(){for(var i,p,pn;\"(string)\"===state.tokens.next.id;){if(p=peek(0),\"(endline)\"===p.id){i=1;do pn=peek(i++);while(\"(endline)\"===pn.id);if(\";\"===pn.id)p=pn;else{if(\"[\"===pn.value||\".\"===pn.value)return;state.option.asi&&\"(\"!==pn.value||warning(\"W033\",state.tokens.next)}}else{if(\".\"===p.id||\"[\"===p.id)return;\";\"!==p.id&&warning(\"W033\",p)}advance(),state.directive[state.tokens.curr.value]&&warning(\"W034\",state.tokens.curr,state.tokens.curr.value),\"use strict\"===state.tokens.curr.value&&(state.option[\"(explicitNewcap)\"]||(state.option.newcap=!0),state.option.undef=!0),state.directive[state.tokens.curr.value]=!0,\";\"===p.id&&advance(\";\")}}function block(ordinary,stmt,isfunc,isfatarrow,iscase){var a,m,t,line,d,b=inblock,old_indent=indent,s=scope;inblock=ordinary,ordinary&&state.option.funcscope||(scope=Object.create(scope)),t=state.tokens.next;var metrics=funct[\"(metrics)\"];if(metrics.nestedBlockDepth+=1,metrics.verifyMaxNestedBlockDepthPerFunction(),\"{\"===state.tokens.next.id){if(advance(\"{\"),funct[\"(blockscope)\"].stack(),line=state.tokens.curr.line,\"}\"!==state.tokens.next.id){for(indent+=state.option.indent;!ordinary&&state.tokens.next.from>indent;)indent+=state.option.indent;if(isfunc){m={};for(d in state.directive)_.has(state.directive,d)&&(m[d]=state.directive[d]);directives(),state.option.strict&&funct[\"(context)\"][\"(global)\"]&&(m[\"use strict\"]||state.directive[\"use strict\"]||warning(\"E007\"))}a=statements(),metrics.statementCount+=a.length,isfunc&&(state.directive=m),indent-=state.option.indent}advance(\"}\",t),funct[\"(blockscope)\"].unstack(),indent=old_indent}else if(ordinary)funct[\"(nolet)\"]=!0,(!stmt||state.option.curly)&&warning(\"W116\",state.tokens.next,\"{\",state.tokens.next.value),state.tokens.next.inBracelessBlock=!0,indent+=state.option.indent,a=[statement()],indent-=state.option.indent,delete funct[\"(nolet)\"];else if(isfunc){if(m={},!stmt||isfatarrow||state.option.inMoz(!0)||error(\"W118\",state.tokens.curr,\"function closure expressions\"),!stmt)for(d in state.directive)_.has(state.directive,d)&&(m[d]=state.directive[d]);expression(10),state.option.strict&&funct[\"(context)\"][\"(global)\"]&&(m[\"use strict\"]||state.directive[\"use strict\"]||warning(\"E007\"))}else error(\"E021\",state.tokens.next,\"{\",state.tokens.next.value);switch(funct[\"(verb)\"]){case\"break\":case\"continue\":case\"return\":case\"throw\":if(iscase)break;default:funct[\"(verb)\"]=null}return ordinary&&state.option.funcscope||(scope=s),inblock=b,!ordinary||!state.option.noempty||a&&0!==a.length||warning(\"W035\",state.tokens.prev),metrics.nestedBlockDepth-=1,a}function countMember(m){membersOnly&&\"boolean\"!=typeof membersOnly[m]&&warning(\"W036\",state.tokens.curr,m),\"number\"==typeof member[m]?member[m]+=1:member[m]=1}function note_implied(tkn){var name=tkn.value,desc=Object.getOwnPropertyDescriptor(implied,name);desc?desc.value.push(tkn.line):implied[name]=[tkn.line]}function comprehensiveArrayExpression(){var res={};res.exps=!0,funct[\"(comparray)\"].stack();var reversed=!1;return\"for\"!==state.tokens.next.value&&(reversed=!0,state.option.inMoz(!0)||warning(\"W116\",state.tokens.next,\"for\",state.tokens.next.value),funct[\"(comparray)\"].setState(\"use\"),res.right=expression(10)),advance(\"for\"),\"each\"===state.tokens.next.value&&(advance(\"each\"),state.option.inMoz(!0)||warning(\"W118\",state.tokens.curr,\"for each\")),advance(\"(\"),funct[\"(comparray)\"].setState(\"define\"),res.left=expression(130),_.contains([\"in\",\"of\"],state.tokens.next.value)?advance():error(\"E045\",state.tokens.curr),funct[\"(comparray)\"].setState(\"generate\"),expression(10),advance(\")\"),\"if\"===state.tokens.next.value&&(advance(\"if\"),advance(\"(\"),funct[\"(comparray)\"].setState(\"filter\"),res.filter=expression(10),advance(\")\")),reversed||(funct[\"(comparray)\"].setState(\"use\"),res.right=expression(10)),advance(\"]\"),funct[\"(comparray)\"].unstack(),res}function isMethod(){return funct[\"(statement)\"]&&\"class\"===funct[\"(statement)\"].type||funct[\"(context)\"]&&\"class\"===funct[\"(context)\"][\"(verb)\"]}function isPropertyName(token){return token.identifier||\"(string)\"===token.id||\"(number)\"===token.id}function propertyName(preserveOrToken){var id,preserve=!0;return\"object\"==typeof preserveOrToken?id=preserveOrToken:(preserve=preserveOrToken,id=optionalidentifier(!1,!0,preserve)),id?\"object\"==typeof id&&(\"(string)\"===id.id||\"(identifier)\"===id.id?id=id.value:\"(number)\"===id.id&&(id=\"\"+id.value)):\"(string)\"===state.tokens.next.id?(id=state.tokens.next.value,preserve||advance()):\"(number)\"===state.tokens.next.id&&(id=\"\"+state.tokens.next.value,preserve||advance()),\"hasOwnProperty\"===id&&warning(\"W001\"),id}function functionparams(options){var next,ident,t,params=[],tokens=[],pastDefault=!1,pastRest=!1,loneArg=options&&options.loneArg;if(loneArg&&loneArg.identifier===!0)return addlabel(loneArg.value,{type:\"unused\",token:loneArg}),[loneArg];if(next=state.tokens.next,options&&options.parsedOpening||advance(\"(\"),\")\"===state.tokens.next.id)return advance(\")\"),void 0;for(;;){if(_.contains([\"{\",\"[\"],state.tokens.next.id)){tokens=destructuringExpression();for(t in tokens)t=tokens[t],t.id&&(params.push(t.id),addlabel(t.id,{type:\"unused\",token:t.token}))}else if(checkPunctuators(state.tokens.next,[\"...\"])&&(pastRest=!0),ident=identifier(!0))params.push(ident),addlabel(ident,{type:\"unused\",token:state.tokens.curr});else for(;!checkPunctuators(state.tokens.next,[\",\",\")\"]);)advance();if(pastDefault&&\"=\"!==state.tokens.next.id&&error(\"E051\",state.tokens.current),\"=\"===state.tokens.next.id&&(state.option.inESNext()||warning(\"W119\",state.tokens.next,\"default parameters\"),advance(\"=\"),pastDefault=!0,expression(10)),\",\"!==state.tokens.next.id)return advance(\")\",next),params;pastRest&&warning(\"W131\",state.tokens.next),comma()}}function setprop(funct,name,values){funct[\"(properties)\"][name]||(funct[\"(properties)\"][name]={unused:!1}),_.extend(funct[\"(properties)\"][name],values)}function getprop(funct,name,prop){return funct[\"(properties)\"][name]?funct[\"(properties)\"][name][prop]||null:null}function functor(name,token,scope,overwrites){var funct={\"(name)\":name,\"(breakage)\":0,\"(loopage)\":0,\"(scope)\":scope,\"(tokens)\":{},\"(properties)\":{},\"(catch)\":!1,\"(global)\":!1,\"(line)\":null,\"(character)\":null,\"(metrics)\":null,\"(statement)\":null,\"(context)\":null,\"(blockscope)\":null,\"(comparray)\":null,\"(generator)\":null,\"(params)\":null};return token&&_.extend(funct,{\"(line)\":token.line,\"(character)\":token.character,\"(metrics)\":createMetrics(token)}),_.extend(funct,overwrites),funct[\"(context)\"]&&(funct[\"(blockscope)\"]=funct[\"(context)\"][\"(blockscope)\"],funct[\"(comparray)\"]=funct[\"(context)\"][\"(comparray)\"]),funct}function isFunctor(token){return\"(scope)\"in token}function doTemplateLiteral(left){function end(){if(state.tokens.curr.template&&state.tokens.curr.tail&&state.tokens.curr.context===ctx)return!0;var complete=state.tokens.next.template&&state.tokens.next.tail&&state.tokens.next.context===ctx;return complete&&advance(),complete||state.tokens.next.isUnclosed}var ctx=this.context,noSubst=this.noSubst,depth=this.depth;if(!noSubst)for(;!end()&&\"(end)\"!==state.tokens.next.id;)!state.tokens.next.template||state.tokens.next.depth>depth?expression(0):advance();return{id:\"(template)\",type:\"(template)\",tag:left}}function doFunction(options){var f,name,statement,classExprBinding,isGenerator,isArrow,oldOption=state.option,oldIgnored=state.ignored,oldScope=scope;return options&&(name=options.name,statement=options.statement,classExprBinding=options.classExprBinding,isGenerator=\"generator\"===options.type,isArrow=\"arrow\"===options.type),state.option=Object.create(state.option),state.ignored=Object.create(state.ignored),scope=Object.create(scope),funct=functor(name||state.nameStack.infer(),state.tokens.next,scope,{\"(statement)\":statement,\"(context)\":funct,\"(generator)\":isGenerator}),f=funct,state.tokens.curr.funct=funct,functions.push(funct),name&&addlabel(name,{type:\"function\"}),classExprBinding&&addlabel(classExprBinding,{type:\"function\"}),funct[\"(params)\"]=functionparams(options),funct[\"(metrics)\"].verifyMaxParametersPerFunction(funct[\"(params)\"]),isArrow&&(state.option.esnext||warning(\"W119\",state.tokens.curr,\"arrow function syntax (=>)\"),options.loneArg||advance(\"=>\")),block(!1,!0,!0,isArrow),!state.option.noyield&&isGenerator&&\"yielded\"!==funct[\"(generator)\"]&&warning(\"W124\",state.tokens.curr),funct[\"(metrics)\"].verifyMaxStatementsPerFunction(),funct[\"(metrics)\"].verifyMaxComplexityPerFunction(),funct[\"(unusedOption)\"]=state.option.unused,scope=oldScope,state.option=oldOption,state.ignored=oldIgnored,funct[\"(last)\"]=state.tokens.curr.line,funct[\"(lastcharacter)\"]=state.tokens.curr.character,_.map(Object.keys(funct),function(key){\"(\"!==key[0]&&funct[\"(blockscope)\"].unshadow(key)}),funct=funct[\"(context)\"],f}function createMetrics(functionStartToken){return{statementCount:0,nestedBlockDepth:-1,ComplexityCount:1,verifyMaxStatementsPerFunction:function(){state.option.maxstatements&&this.statementCount>state.option.maxstatements&&warning(\"W071\",functionStartToken,this.statementCount)},verifyMaxParametersPerFunction:function(params){params=params||[],state.option.maxparams&&params.length>state.option.maxparams&&warning(\"W072\",functionStartToken,params.length)},verifyMaxNestedBlockDepthPerFunction:function(){state.option.maxdepth&&this.nestedBlockDepth>0&&this.nestedBlockDepth===state.option.maxdepth+1&&warning(\"W073\",null,this.nestedBlockDepth)},verifyMaxComplexityPerFunction:function(){var max=state.option.maxcomplexity,cc=this.ComplexityCount;max&&cc>max&&warning(\"W074\",functionStartToken,cc)}}}function increaseComplexityCount(){funct[\"(metrics)\"].ComplexityCount+=1}function checkCondAssignment(expr){var id,paren;switch(expr&&(id=expr.id,paren=expr.paren,\",\"===id&&(expr=expr.exprs[expr.exprs.length-1])&&(id=expr.id,paren=paren||expr.paren)),id){case\"=\":case\"+=\":case\"-=\":case\"*=\":case\"%=\":case\"&=\":case\"|=\":case\"^=\":case\"/=\":paren||state.option.boss||warning(\"W084\")}}function checkProperties(props){if(state.option.inES5())for(var name in props)_.has(props,name)&&props[name].setterToken&&!props[name].getterToken&&warning(\"W078\",props[name].setterToken)}function destructuringExpression(){var id,ids,identifiers=[];state.option.inESNext()||warning(\"W104\",state.tokens.curr,\"destructuring expression\");var nextInnerDE=function(){var ident;if(checkPunctuators(state.tokens.next,[\"[\",\"{\"])){ids=destructuringExpression();for(var id in ids)id=ids[id],identifiers.push({id:id.id,token:id.token})}else if(checkPunctuators(state.tokens.next,[\",\"]))identifiers.push({id:null,token:state.tokens.curr});else{if(!checkPunctuators(state.tokens.next,[\"(\"])){var is_rest=checkPunctuators(state.tokens.next,[\"...\"]);return ident=identifier(),ident&&identifiers.push({id:ident,token:state.tokens.curr}),is_rest}advance(\"(\"),nextInnerDE(),advance(\")\")}return!1};if(checkPunctuators(state.tokens.next,[\"[\"])){advance(\"[\");var element_after_rest=!1;for(nextInnerDE()&&checkPunctuators(state.tokens.next,[\",\"])&&!element_after_rest&&(warning(\"W130\",state.tokens.next),element_after_rest=!0);!checkPunctuators(state.tokens.next,[\"]\"])&&(advance(\",\"),!checkPunctuators(state.tokens.next,[\"]\"]));)nextInnerDE()&&checkPunctuators(state.tokens.next,[\",\"])&&!element_after_rest&&(warning(\"W130\",state.tokens.next),element_after_rest=!0);advance(\"]\")}else if(checkPunctuators(state.tokens.next,[\"{\"])){for(advance(\"{\"),id=identifier(),checkPunctuators(state.tokens.next,[\":\"])?(advance(\":\"),nextInnerDE()):identifiers.push({id:id,token:state.tokens.curr});!checkPunctuators(state.tokens.next,[\"}\"])&&(advance(\",\"),!checkPunctuators(state.tokens.next,[\"}\"]));)id=identifier(),checkPunctuators(state.tokens.next,[\":\"])?(advance(\":\"),nextInnerDE()):identifiers.push({id:id,token:state.tokens.curr});advance(\"}\")}return identifiers}function destructuringExpressionMatch(tokens,value){var first=value.first;first&&_.zip(tokens,Array.isArray(first)?first:[first]).forEach(function(val){var token=val[0],value=val[1];token&&value?token.first=value:token&&token.first&&!value&&warning(\"W080\",token.first,token.first.value)})}function classdef(isStatement){return state.option.inESNext()||warning(\"W104\",state.tokens.curr,\"class\"),isStatement?(this.name=identifier(),addlabel(this.name,{type:\"unused\",token:state.tokens.curr})):state.tokens.next.identifier&&\"extends\"!==state.tokens.next.value?(this.name=identifier(),this.namedExpr=!0):this.name=state.nameStack.infer(),classtail(this),this}function classtail(c){var strictness=state.directive[\"use strict\"];\"extends\"===state.tokens.next.value&&(advance(\"extends\"),c.heritage=expression(10)),state.directive[\"use strict\"]=!0,advance(\"{\"),c.body=classbody(c),advance(\"}\"),state.directive[\"use strict\"]=strictness}function classbody(c){for(var name,isStatic,isGenerator,getset,computed,props={},staticProps={},i=0;\"}\"!==state.tokens.next.id;++i){if(name=state.tokens.next,isStatic=!1,isGenerator=!1,getset=null,\"*\"===name.id&&(isGenerator=!0,advance(\"*\"),name=state.tokens.next),\"[\"===name.id)name=computedPropertyName();else{if(!isPropertyName(name)){warning(\"W052\",state.tokens.next,state.tokens.next.value||state.tokens.next.type),advance();continue}advance(),computed=!1,name.identifier&&\"static\"===name.value&&(checkPunctuators(state.tokens.next,[\"*\"])&&(isGenerator=!0,advance(\"*\")),(isPropertyName(state.tokens.next)||\"[\"===state.tokens.next.id)&&(computed=\"[\"===state.tokens.next.id,isStatic=!0,name=state.tokens.next,\"[\"===state.tokens.next.id?name=computedPropertyName():advance())),!name.identifier||\"get\"!==name.value&&\"set\"!==name.value||(isPropertyName(state.tokens.next)||\"[\"===state.tokens.next.id)&&(computed=\"[\"===state.tokens.next.id,getset=name,name=state.tokens.next,\"[\"===state.tokens.next.id?name=computedPropertyName():advance())}if(!checkPunctuators(state.tokens.next,[\"(\"])){for(error(\"E054\",state.tokens.next,state.tokens.next.value);\"}\"!==state.tokens.next.id&&!checkPunctuators(state.tokens.next,[\"(\"]);)advance();\"(\"!==state.tokens.next.value&&doFunction({statement:c})}if(computed||(getset?saveAccessor(getset.value,isStatic?staticProps:props,name.value,name,!0,isStatic):(\"constructor\"===name.value?state.nameStack.set(c):state.nameStack.set(name),saveProperty(isStatic?staticProps:props,name.value,name,!0,isStatic))),getset&&\"constructor\"===name.value){var propDesc=\"get\"===getset.value?\"class getter method\":\"class setter method\";error(\"E049\",name,propDesc,\"constructor\")}else\"prototype\"===name.value&&error(\"E049\",name,\"class method\",\"prototype\");propertyName(name),doFunction({statement:c,type:isGenerator?\"generator\":null,classExprBinding:c.namedExpr?c.name:null})}checkProperties(props)}function saveProperty(props,name,tkn,isClass,isStatic){var msg=[\"key\",\"class method\",\"static class method\"];msg=msg[(isClass||!1)+(isStatic||!1)],tkn.identifier&&(name=tkn.value),props[name]&&_.has(props,name)?warning(\"W075\",state.tokens.next,msg,name):props[name]={},props[name].basic=!0,props[name].basictkn=tkn}function saveAccessor(accessorType,props,name,tkn,isClass,isStatic){var flagName=\"get\"===accessorType?\"getterToken\":\"setterToken\",msg=\"\";isClass?(isStatic&&(msg+=\"static \"),msg+=accessorType+\"ter method\"):msg=\"key\",state.tokens.curr.accessorType=accessorType,state.nameStack.set(tkn),props[name]&&_.has(props,name)?(props[name].basic||props[name][flagName])&&warning(\"W075\",state.tokens.next,msg,name):props[name]={},props[name][flagName]=tkn}function computedPropertyName(){advance(\"[\"),state.option.esnext||warning(\"W119\",state.tokens.curr,\"computed property names\");var value=expression(10);return advance(\"]\"),value}function checkPunctuators(token,values){return\"(punctuator)\"===token.type&&_.contains(values,token.value)}function destructuringAssignOrJsonValue(){var block=lookupBlockType();block.notJson?(!state.option.inESNext()&&block.isDestAssign&&warning(\"W104\",state.tokens.curr,\"destructuring assignment\"),statements()):(state.option.laxbreak=!0,state.jsonMode=!0,jsonValue())}function jsonValue(){function jsonObject(){var o={},t=state.tokens.next;if(advance(\"{\"),\"}\"!==state.tokens.next.id)for(;;){if(\"(end)\"===state.tokens.next.id)error(\"E026\",state.tokens.next,t.line);else{if(\"}\"===state.tokens.next.id){warning(\"W094\",state.tokens.curr);break}\",\"===state.tokens.next.id?error(\"E028\",state.tokens.next):\"(string)\"!==state.tokens.next.id&&warning(\"W095\",state.tokens.next,state.tokens.next.value)}if(o[state.tokens.next.value]===!0?warning(\"W075\",state.tokens.next,\"key\",state.tokens.next.value):\"__proto__\"===state.tokens.next.value&&!state.option.proto||\"__iterator__\"===state.tokens.next.value&&!state.option.iterator?warning(\"W096\",state.tokens.next,state.tokens.next.value):o[state.tokens.next.value]=!0,advance(),advance(\":\"),jsonValue(),\",\"!==state.tokens.next.id)break;advance(\",\")}advance(\"}\")}function jsonArray(){var t=state.tokens.next;if(advance(\"[\"),\"]\"!==state.tokens.next.id)for(;;){if(\"(end)\"===state.tokens.next.id)error(\"E027\",state.tokens.next,t.line);else{if(\"]\"===state.tokens.next.id){warning(\"W094\",state.tokens.curr);break}\",\"===state.tokens.next.id&&error(\"E028\",state.tokens.next)}if(jsonValue(),\",\"!==state.tokens.next.id)break;advance(\",\")}advance(\"]\")}switch(state.tokens.next.id){case\"{\":jsonObject();break;case\"[\":jsonArray();break;case\"true\":case\"false\":case\"null\":case\"(number)\":case\"(string)\":advance();break;case\"-\":advance(\"-\"),advance(\"(number)\");break;default:error(\"E003\",state.tokens.next)}}var api,declared,exported,funct,functions,global,implied,inblock,indent,lookahead,lex,member,membersOnly,predefined,scope,stack,unuseds,urls,bang={\"<\":!0,\"<=\":!0,\"==\":!0,\"===\":!0,\"!==\":!0,\"!=\":!0,\">\":!0,\">=\":!0,\"+\":!0,\"-\":!0,\"*\":!0,\"/\":!0,\"%\":!0},functionicity=[\"closure\",\"exception\",\"global\",\"label\",\"outer\",\"unused\",\"var\"],extraModules=[],emitter=new events.EventEmitter;type(\"(number)\",function(){return this}),type(\"(string)\",function(){return this}),state.syntax[\"(identifier)\"]={type:\"(identifier)\",lbp:0,identifier:!0,nud:function(){var f,block,v=this.value,s=scope[v];if(\"=>\"===state.tokens.next.id)return this;if(\"function\"==typeof s?s=void 0:funct[\"(blockscope)\"].current.has(v)||\"boolean\"!=typeof s||(f=funct,funct=functions[0],addlabel(v,{type:\"var\"}),s=funct,funct=f),block=funct[\"(blockscope)\"].getlabel(v),funct===s||block)switch(block?block[v][\"(type)\"]:funct[v]){case\"unused\":block?block[v][\"(type)\"]=\"var\":funct[v]=\"var\";break;case\"unction\":block?block[v][\"(type)\"]=\"function\":funct[v]=\"function\",this[\"function\"]=!0;break;case\"const\":setprop(funct,v,{unused:!1});break;case\"function\":this[\"function\"]=!0;break;case\"label\":warning(\"W037\",state.tokens.curr,v)}else switch(funct[v]){case\"closure\":case\"function\":case\"var\":case\"unused\":warning(\"W038\",state.tokens.curr,v);break;case\"label\":warning(\"W037\",state.tokens.curr,v);break;case\"outer\":case\"global\":break;default:if(s===!0)funct[v]=!0;else if(null===s)warning(\"W039\",state.tokens.curr,v),note_implied(state.tokens.curr);else if(\"object\"!=typeof s)funct[\"(comparray)\"].check(v)||isundef(funct,\"W117\",state.tokens.curr,v),funct[\"(global)\"]||(funct[v]=!0),note_implied(state.tokens.curr);else switch(s[v]){case\"function\":case\"unction\":this[\"function\"]=!0,s[v]=\"closure\",funct[v]=s[\"(global)\"]?\"global\":\"outer\";break;case\"var\":case\"unused\":s[v]=\"closure\",funct[v]=s[\"(global)\"]?\"global\":\"outer\";break;case\"const\":setprop(s,v,{unused:!1});break;case\"closure\":funct[v]=s[\"(global)\"]?\"global\":\"outer\";break;case\"label\":warning(\"W037\",state.tokens.curr,v)}}return this},led:function(){error(\"E033\",state.tokens.next,state.tokens.next.value)}};var baseTemplateSyntax={lbp:0,identifier:!1,template:!0};state.syntax[\"(template)\"]=_.extend({type:\"(template)\",nud:doTemplateLiteral,led:doTemplateLiteral,noSubst:!1},baseTemplateSyntax),state.syntax[\"(template middle)\"]=_.extend({type:\"(template middle)\",middle:!0,noSubst:!1},baseTemplateSyntax),state.syntax[\"(template tail)\"]=_.extend({type:\"(template tail)\",tail:!0,noSubst:!1},baseTemplateSyntax),state.syntax[\"(no subst template)\"]=_.extend({type:\"(template)\",nud:doTemplateLiteral,led:doTemplateLiteral,noSubst:!0,tail:!0},baseTemplateSyntax),type(\"(regexp)\",function(){return this}),delim(\"(endline)\"),delim(\"(begin)\"),delim(\"(end)\").reach=!0,delim(\"(error)\").reach=!0,delim(\"}\").reach=!0,delim(\")\"),delim(\"]\"),delim('\"').reach=!0,delim(\"'\").reach=!0,delim(\";\"),delim(\":\").reach=!0,delim(\"#\"),reserve(\"else\"),reserve(\"case\").reach=!0,reserve(\"catch\"),reserve(\"default\").reach=!0,reserve(\"finally\"),reservevar(\"arguments\",function(x){state.directive[\"use strict\"]&&funct[\"(global)\"]&&warning(\"E008\",x)}),reservevar(\"eval\"),reservevar(\"false\"),reservevar(\"Infinity\"),reservevar(\"null\"),reservevar(\"this\",function(x){state.directive[\"use strict\"]&&!isMethod()&&!state.option.validthis&&(funct[\"(statement)\"]&&funct[\"(name)\"].charAt(0)>\"Z\"||funct[\"(global)\"])&&warning(\"W040\",x)}),reservevar(\"true\"),reservevar(\"undefined\"),assignop(\"=\",\"assign\",20),assignop(\"+=\",\"assignadd\",20),assignop(\"-=\",\"assignsub\",20),assignop(\"*=\",\"assignmult\",20),assignop(\"/=\",\"assigndiv\",20).nud=function(){error(\"E014\")},assignop(\"%=\",\"assignmod\",20),bitwiseassignop(\"&=\"),bitwiseassignop(\"|=\"),bitwiseassignop(\"^=\"),bitwiseassignop(\"<<=\"),bitwiseassignop(\">>=\"),bitwiseassignop(\">>>=\"),infix(\",\",function(left,that){var expr;if(that.exprs=[left],state.option.nocomma&&warning(\"W127\"),!comma({peek:!0}))return that;for(;;){if(!(expr=expression(10)))break;if(that.exprs.push(expr),\",\"!==state.tokens.next.value||!comma())break}return that},10,!0),infix(\"?\",function(left,that){return increaseComplexityCount(),that.left=left,that.right=expression(10),advance(\":\"),that[\"else\"]=expression(10),that},30);var orPrecendence=40;infix(\"||\",function(left,that){return increaseComplexityCount(),that.left=left,that.right=expression(orPrecendence),that},orPrecendence),infix(\"&&\",\"and\",50),bitwise(\"|\",\"bitor\",70),bitwise(\"^\",\"bitxor\",80),bitwise(\"&\",\"bitand\",90),relation(\"==\",function(left,right){var eqnull=state.option.eqnull&&(\"null\"===left.value||\"null\"===right.value);switch(!0){case!eqnull&&state.option.eqeqeq:this.from=this.character,warning(\"W116\",this,\"===\",\"==\");break;case isPoorRelation(left):warning(\"W041\",this,\"===\",left.value);break;case isPoorRelation(right):warning(\"W041\",this,\"===\",right.value);break;case isTypoTypeof(right,left):warning(\"W122\",this,right.value);break;case isTypoTypeof(left,right):warning(\"W122\",this,left.value)}return this}),relation(\"===\",function(left,right){return isTypoTypeof(right,left)?warning(\"W122\",this,right.value):isTypoTypeof(left,right)&&warning(\"W122\",this,left.value),this}),relation(\"!=\",function(left,right){var eqnull=state.option.eqnull&&(\"null\"===left.value||\"null\"===right.value);return!eqnull&&state.option.eqeqeq?(this.from=this.character,warning(\"W116\",this,\"!==\",\"!=\")):isPoorRelation(left)?warning(\"W041\",this,\"!==\",left.value):isPoorRelation(right)?warning(\"W041\",this,\"!==\",right.value):isTypoTypeof(right,left)?warning(\"W122\",this,right.value):isTypoTypeof(left,right)&&warning(\"W122\",this,left.value),this}),relation(\"!==\",function(left,right){return isTypoTypeof(right,left)?warning(\"W122\",this,right.value):isTypoTypeof(left,right)&&warning(\"W122\",this,left.value),this\n}),relation(\"<\"),relation(\">\"),relation(\"<=\"),relation(\">=\"),bitwise(\"<<\",\"shiftleft\",120),bitwise(\">>\",\"shiftright\",120),bitwise(\">>>\",\"shiftrightunsigned\",120),infix(\"in\",\"in\",120),infix(\"instanceof\",\"instanceof\",120),infix(\"+\",function(left,that){var right;return that.left=left,that.right=right=expression(130),left&&right&&\"(string)\"===left.id&&\"(string)\"===right.id?(left.value+=right.value,left.character=right.character,!state.option.scripturl&&reg.javascriptURL.test(left.value)&&warning(\"W050\",left),left):that},130),prefix(\"+\",\"num\"),prefix(\"+++\",function(){return warning(\"W007\"),this.arity=\"unary\",this.right=expression(150),this}),infix(\"+++\",function(left){return warning(\"W007\"),this.left=left,this.right=expression(130),this},130),infix(\"-\",\"sub\",130),prefix(\"-\",\"neg\"),prefix(\"---\",function(){return warning(\"W006\"),this.arity=\"unary\",this.right=expression(150),this}),infix(\"---\",function(left){return warning(\"W006\"),this.left=left,this.right=expression(130),this},130),infix(\"*\",\"mult\",140),infix(\"/\",\"div\",140),infix(\"%\",\"mod\",140),suffix(\"++\"),prefix(\"++\",\"preinc\"),state.syntax[\"++\"].exps=!0,suffix(\"--\"),prefix(\"--\",\"predec\"),state.syntax[\"--\"].exps=!0,prefix(\"delete\",function(){var p=expression(10);return p?(\".\"!==p.id&&\"[\"!==p.id&&warning(\"W051\"),this.first=p,p.identifier&&!state.directive[\"use strict\"]&&(p.forgiveUndef=!0),this):this}).exps=!0,prefix(\"~\",function(){return state.option.bitwise&&warning(\"W016\",this,\"~\"),this.arity=\"unary\",expression(150),this}),prefix(\"...\",function(){return state.option.esnext||warning(\"W119\",this,\"spread/rest operator\"),state.tokens.next.identifier||\"(string)\"===state.tokens.next.type||checkPunctuators(state.tokens.next,[\"[\",\"(\"])||error(\"E030\",state.tokens.next,state.tokens.next.value),expression(150),this}),prefix(\"!\",function(){return this.arity=\"unary\",this.right=expression(150),this.right||quit(\"E041\",this.line||0),bang[this.right.id]===!0&&warning(\"W018\",this,\"!\"),this}),prefix(\"typeof\",function(){var p=expression(150);return this.first=p,p.identifier&&(p.forgiveUndef=!0),this}),prefix(\"new\",function(){var i,c=expression(155);if(c&&\"function\"!==c.id)if(c.identifier)switch(c[\"new\"]=!0,c.value){case\"Number\":case\"String\":case\"Boolean\":case\"Math\":case\"JSON\":warning(\"W053\",state.tokens.prev,c.value);break;case\"Symbol\":state.option.esnext&&warning(\"W053\",state.tokens.prev,c.value);break;case\"Function\":state.option.evil||warning(\"W054\");break;case\"Date\":case\"RegExp\":case\"this\":break;default:\"function\"!==c.id&&(i=c.value.substr(0,1),state.option.newcap&&(\"A\">i||i>\"Z\")&&!_.has(global,c.value)&&warning(\"W055\",state.tokens.curr))}else\".\"!==c.id&&\"[\"!==c.id&&\"(\"!==c.id&&warning(\"W056\",state.tokens.curr);else state.option.supernew||warning(\"W057\",this);return\"(\"===state.tokens.next.id||state.option.supernew||warning(\"W058\",state.tokens.curr,state.tokens.curr.value),this.first=c,this}),state.syntax[\"new\"].exps=!0,prefix(\"void\").exps=!0,infix(\".\",function(left,that){var m=identifier(!1,!0);return\"string\"==typeof m&&countMember(m),that.left=left,that.right=m,m&&\"hasOwnProperty\"===m&&\"=\"===state.tokens.next.value&&warning(\"W001\"),!left||\"arguments\"!==left.value||\"callee\"!==m&&\"caller\"!==m?state.option.evil||!left||\"document\"!==left.value||\"write\"!==m&&\"writeln\"!==m||warning(\"W060\",left):state.option.noarg?warning(\"W059\",left,m):state.directive[\"use strict\"]&&error(\"E008\"),state.option.evil||\"eval\"!==m&&\"execScript\"!==m||isGlobalEval(left,state,funct)&&warning(\"W061\"),that},160,!0),infix(\"(\",function(left,that){state.option.immed&&left&&!left.immed&&\"function\"===left.id&&warning(\"W062\");var n=0,p=[];if(left&&\"(identifier)\"===left.type&&left.value.match(/^[A-Z]([A-Z0-9_$]*[a-z][A-Za-z0-9_$]*)?$/)&&-1===\"Number String Boolean Date Object Error Symbol\".indexOf(left.value)&&(\"Math\"===left.value?warning(\"W063\",left):state.option.newcap&&warning(\"W064\",left)),\")\"!==state.tokens.next.id)for(;p[p.length]=expression(10),n+=1,\",\"===state.tokens.next.id;)comma();return advance(\")\"),\"object\"==typeof left&&(state.option.inES3()&&\"parseInt\"===left.value&&1===n&&warning(\"W065\",state.tokens.curr),state.option.evil||(\"eval\"===left.value||\"Function\"===left.value||\"execScript\"===left.value?(warning(\"W061\",left),p[0]&&\"(string)\"===[0].id&&addInternalSrc(left,p[0].value)):!p[0]||\"(string)\"!==p[0].id||\"setTimeout\"!==left.value&&\"setInterval\"!==left.value?!p[0]||\"(string)\"!==p[0].id||\".\"!==left.value||\"window\"!==left.left.value||\"setTimeout\"!==left.right&&\"setInterval\"!==left.right||(warning(\"W066\",left),addInternalSrc(left,p[0].value)):(warning(\"W066\",left),addInternalSrc(left,p[0].value))),left.identifier||\".\"===left.id||\"[\"===left.id||\"(\"===left.id||\"&&\"===left.id||\"||\"===left.id||\"?\"===left.id||state.option.esnext&&left[\"(name)\"]||warning(\"W067\",that)),that.left=left,that},155,!0).exps=!0,prefix(\"(\",function(){var pn1,ret,triggerFnExpr,first,last,pn=state.tokens.next,i=-1,parens=1,opening=state.tokens.curr,preceeding=state.tokens.prev,isNecessary=!state.option.singleGroups;do\"(\"===pn.value?parens+=1:\")\"===pn.value&&(parens-=1),i+=1,pn1=pn,pn=peek(i);while((0!==parens||\")\"!==pn1.value)&&\";\"!==pn.value&&\"(end)\"!==pn.type);if(\"function\"===state.tokens.next.id&&(triggerFnExpr=state.tokens.next.immed=!0),\"=>\"===pn.value)return doFunction({type:\"arrow\",parsedOpening:!0});var exprs=[];if(\")\"!==state.tokens.next.id)for(;exprs.push(expression(10)),\",\"===state.tokens.next.id;)state.option.nocomma&&warning(\"W127\"),comma();return advance(\")\",this),state.option.immed&&exprs[0]&&\"function\"===exprs[0].id&&\"(\"!==state.tokens.next.id&&\".\"!==state.tokens.next.id&&\"[\"!==state.tokens.next.id&&warning(\"W068\",this),exprs.length?(exprs.length>1?(ret=Object.create(state.syntax[\",\"]),ret.exprs=exprs,first=exprs[0],last=exprs[exprs.length-1],isNecessary||(isNecessary=preceeding.assign||preceeding.delim)):(ret=first=last=exprs[0],isNecessary||(isNecessary=opening.beginsStmt&&(\"{\"===ret.id||triggerFnExpr||isFunctor(ret))||\"{\"===ret.id&&\"=>\"===preceeding.id||\"+\"===first.id&&\"+\"===preceeding.id)),ret&&(isNecessary||!first.left&&!ret.exprs||(isNecessary=!isBeginOfExpr(preceeding)&&first.lbp<preceeding.lbp||!isEndOfExpr()&&last.lbp<state.tokens.next.lbp),isNecessary||warning(\"W126\",opening),ret.paren=!0),ret):void 0}),application(\"=>\"),infix(\"[\",function(left,that){var s,e=expression(10);return e&&\"(string)\"===e.type&&(state.option.evil||\"eval\"!==e.value&&\"execScript\"!==e.value||isGlobalEval(left,state,funct)&&warning(\"W061\"),countMember(e.value),!state.option.sub&&reg.identifier.test(e.value)&&(s=state.syntax[e.value],s&&isReserved(s)||warning(\"W069\",state.tokens.prev,e.value))),advance(\"]\",that),e&&\"hasOwnProperty\"===e.value&&\"=\"===state.tokens.next.value&&warning(\"W001\"),that.left=left,that.right=e,that},160,!0),prefix(\"[\",function(){var blocktype=lookupBlockType();if(blocktype.isCompArray)return state.option.inESNext()||warning(\"W119\",state.tokens.curr,\"array comprehension\"),comprehensiveArrayExpression();blocktype.isDestAssign&&!state.option.inESNext()&&warning(\"W104\",state.tokens.curr,\"destructuring assignment\");var b=state.tokens.curr.line!==startLine(state.tokens.next);for(this.first=[],b&&(indent+=state.option.indent,state.tokens.next.from===indent+state.option.indent&&(indent+=state.option.indent));\"(end)\"!==state.tokens.next.id;){for(;\",\"===state.tokens.next.id;){if(!state.option.elision){if(state.option.inES5()){warning(\"W128\");do advance(\",\");while(\",\"===state.tokens.next.id);continue}warning(\"W070\")}advance(\",\")}if(\"]\"===state.tokens.next.id)break;if(this.first.push(expression(10)),\",\"!==state.tokens.next.id)break;if(comma({allowTrailing:!0}),\"]\"===state.tokens.next.id&&!state.option.inES5(!0)){warning(\"W070\",state.tokens.curr);break}}return b&&(indent-=state.option.indent),advance(\"]\",this),this}),function(x){x.nud=function(){var b,f,i,p,t,g,nextVal,props={};for(b=state.tokens.curr.line!==startLine(state.tokens.next),b&&(indent+=state.option.indent,state.tokens.next.from===indent+state.option.indent&&(indent+=state.option.indent));\"}\"!==state.tokens.next.id;){if(nextVal=state.tokens.next.value,\":\"===peek().id||\"get\"!==nextVal&&\"set\"!==nextVal)if(\"*\"===state.tokens.next.value&&\"(punctuator)\"===state.tokens.next.type&&(state.option.inESNext()||warning(\"W104\",state.tokens.next,\"generator functions\"),advance(\"*\"),g=!0),!state.tokens.next.identifier||\",\"!==peekIgnoreEOL().id&&\"}\"!==peekIgnoreEOL().id){if(\"[\"===state.tokens.next.id)i=computedPropertyName(),state.nameStack.set(i);else if(state.nameStack.set(state.tokens.next),i=propertyName(),saveProperty(props,i,state.tokens.next),\"string\"!=typeof i)break;\"(\"===state.tokens.next.value?(state.option.inESNext()||warning(\"W104\",state.tokens.curr,\"concise methods\"),doFunction({type:g?\"generator\":null})):(advance(\":\"),expression(10))}else state.option.inESNext()||warning(\"W104\",state.tokens.next,\"object short notation\"),i=propertyName(!0),saveProperty(props,i,state.tokens.next),expression(10);else advance(nextVal),state.option.inES5()||error(\"E034\"),i=propertyName(),i||state.option.inESNext()||error(\"E035\"),i&&saveAccessor(nextVal,props,i,state.tokens.curr),t=state.tokens.next,f=doFunction(),p=f[\"(params)\"],\"get\"===nextVal&&i&&p?warning(\"W076\",t,p[0],i):\"set\"!==nextVal||!i||p&&1===p.length||warning(\"W077\",t,i);if(countMember(i),\",\"!==state.tokens.next.id)break;comma({allowTrailing:!0,property:!0}),\",\"===state.tokens.next.id?warning(\"W070\",state.tokens.curr):\"}\"!==state.tokens.next.id||state.option.inES5(!0)||warning(\"W070\",state.tokens.curr)}return b&&(indent-=state.option.indent),advance(\"}\",this),checkProperties(props),this},x.fud=function(){error(\"E036\",state.tokens.curr)}}(delim(\"{\"));var conststatement=stmt(\"const\",function(context){var tokens,value,lone,prefix=context&&context.prefix,inexport=context&&context.inexport;for(state.option.inESNext()||warning(\"W104\",state.tokens.curr,\"const\"),this.first=[];;){var names=[];_.contains([\"{\",\"[\"],state.tokens.next.value)?(tokens=destructuringExpression(),lone=!1):(tokens=[{id:identifier(),token:state.tokens.curr}],lone=!0,inexport&&(exported[state.tokens.curr.value]=!0,state.tokens.curr.exported=!0));for(var t in tokens)tokens.hasOwnProperty(t)&&(t=tokens[t],\"const\"===funct[t.id]&&warning(\"E011\",null,t.id),funct[\"(global)\"]&&predefined[t.id]===!1&&warning(\"W079\",t.token,t.id),t.id&&(addlabel(t.id,{token:t.token,type:\"const\",unused:!0}),names.push(t.token)));if(prefix)break;if(this.first=this.first.concat(names),\"=\"!==state.tokens.next.id&&warning(\"E012\",state.tokens.curr,state.tokens.curr.value),\"=\"===state.tokens.next.id&&(advance(\"=\"),\"undefined\"===state.tokens.next.id&&warning(\"W080\",state.tokens.prev,state.tokens.prev.value),\"=\"===peek(0).id&&state.tokens.next.identifier&&warning(\"W120\",state.tokens.next,state.tokens.next.value),value=expression(10),lone?tokens[0].first=value:destructuringExpressionMatch(names,value)),\",\"!==state.tokens.next.id)break;comma()}return this});conststatement.exps=!0;var varstatement=stmt(\"var\",function(context){var tokens,lone,value,prefix=context&&context.prefix,inexport=context&&context.inexport;for(this.first=[];;){var names=[];_.contains([\"{\",\"[\"],state.tokens.next.value)?(tokens=destructuringExpression(),lone=!1):(tokens=[{id:identifier(),token:state.tokens.curr}],lone=!0,inexport&&(exported[state.tokens.curr.value]=!0,state.tokens.curr.exported=!0));for(var t in tokens)tokens.hasOwnProperty(t)&&(t=tokens[t],state.option.inESNext()&&\"const\"===funct[t.id]&&warning(\"E011\",null,t.id),funct[\"(global)\"]&&(predefined[t.id]===!1?warning(\"W079\",t.token,t.id):state.option.futurehostile===!1&&(!state.option.inES5()&&vars.ecmaIdentifiers[5][t.id]===!1||!state.option.inESNext()&&vars.ecmaIdentifiers[6][t.id]===!1)&&warning(\"W129\",t.token,t.id)),t.id&&(addlabel(t.id,{type:\"unused\",token:t.token}),names.push(t.token)));if(prefix)break;if(this.first=this.first.concat(names),\"=\"===state.tokens.next.id&&(state.nameStack.set(state.tokens.curr),advance(\"=\"),\"undefined\"===state.tokens.next.id&&warning(\"W080\",state.tokens.prev,state.tokens.prev.value),\"=\"===peek(0).id&&state.tokens.next.identifier&&(funct[\"(params)\"]&&-1!==funct[\"(params)\"].indexOf(state.tokens.next.value)||warning(\"W120\",state.tokens.next,state.tokens.next.value)),value=expression(10),lone?tokens[0].first=value:destructuringExpressionMatch(names,value)),\",\"!==state.tokens.next.id)break;comma()}return this});varstatement.exps=!0;var letstatement=stmt(\"let\",function(context){var tokens,lone,value,letblock,prefix=context&&context.prefix,inexport=context&&context.inexport;for(state.option.inESNext()||warning(\"W104\",state.tokens.curr,\"let\"),\"(\"===state.tokens.next.value?(state.option.inMoz(!0)||warning(\"W118\",state.tokens.next,\"let block\"),advance(\"(\"),funct[\"(blockscope)\"].stack(),letblock=!0):funct[\"(nolet)\"]&&error(\"E048\",state.tokens.curr),this.first=[];;){var names=[];_.contains([\"{\",\"[\"],state.tokens.next.value)?(tokens=destructuringExpression(),lone=!1):(tokens=[{id:identifier(),token:state.tokens.curr.value}],lone=!0,inexport&&(exported[state.tokens.curr.value]=!0,state.tokens.curr.exported=!0));for(var t in tokens)tokens.hasOwnProperty(t)&&(t=tokens[t],state.option.inESNext()&&\"const\"===funct[t.id]&&warning(\"E011\",null,t.id),funct[\"(global)\"]&&predefined[t.id]===!1&&warning(\"W079\",t.token,t.id),t.id&&!funct[\"(nolet)\"]&&(addlabel(t.id,{type:\"unused\",token:t.token,islet:!0}),names.push(t.token)));if(prefix)break;if(this.first=this.first.concat(names),\"=\"===state.tokens.next.id&&(advance(\"=\"),\"undefined\"===state.tokens.next.id&&warning(\"W080\",state.tokens.prev,state.tokens.prev.value),\"=\"===peek(0).id&&state.tokens.next.identifier&&warning(\"W120\",state.tokens.next,state.tokens.next.value),value=expression(10),lone?tokens[0].first=value:destructuringExpressionMatch(names,value)),\",\"!==state.tokens.next.id)break;comma()}return letblock&&(advance(\")\"),block(!0,!0),this.block=!0,funct[\"(blockscope)\"].unstack()),this});letstatement.exps=!0,blockstmt(\"class\",function(){return classdef.call(this,!0)}),blockstmt(\"function\",function(){var generator=!1;\"*\"===state.tokens.next.value&&(advance(\"*\"),state.option.inESNext(!0)?generator=!0:warning(\"W119\",state.tokens.curr,\"function*\")),inblock&&warning(\"W082\",state.tokens.curr);var i=optionalidentifier();return void 0===i&&warning(\"W025\"),\"const\"===funct[i]&&warning(\"E011\",null,i),addlabel(i,{type:\"unction\",token:state.tokens.curr}),doFunction({name:i,statement:this,type:generator?\"generator\":null}),\"(\"===state.tokens.next.id&&state.tokens.next.line===state.tokens.curr.line&&error(\"E039\"),this}),prefix(\"function\",function(){function isVariable(name){return\"(\"!==name[0]}function isLocal(name){return\"var\"===fn[name]}var generator=!1;\"*\"===state.tokens.next.value&&(state.option.inESNext()||warning(\"W119\",state.tokens.curr,\"function*\"),advance(\"*\"),generator=!0);var i=optionalidentifier(),fn=doFunction({name:i,type:generator?\"generator\":null});return!state.option.loopfunc&&funct[\"(loopage)\"]&&_.some(fn,function(val,name){return isVariable(name)&&!isLocal(name)})&&warning(\"W083\"),this}),blockstmt(\"if\",function(){var t=state.tokens.next;increaseComplexityCount(),state.condition=!0,advance(\"(\");var expr=expression(0);checkCondAssignment(expr);var forinifcheck=null;state.option.forin&&state.forinifcheckneeded&&(state.forinifcheckneeded=!1,forinifcheck=state.forinifchecks[state.forinifchecks.length-1],forinifcheck.type=\"(punctuator)\"===expr.type&&\"!\"===expr.value?\"(negative)\":\"(positive)\"),advance(\")\",t),state.condition=!1;var s=block(!0,!0);return forinifcheck&&\"(negative)\"===forinifcheck.type&&s&&1===s.length&&\"(identifier)\"===s[0].type&&\"continue\"===s[0].value&&(forinifcheck.type=\"(negative-with-continue)\"),\"else\"===state.tokens.next.id&&(advance(\"else\"),\"if\"===state.tokens.next.id||\"switch\"===state.tokens.next.id?statement():block(!0,!0)),this}),blockstmt(\"try\",function(){function doCatch(){var e,oldScope=scope;advance(\"catch\"),advance(\"(\"),scope=Object.create(oldScope),e=state.tokens.next.value,\"(identifier)\"!==state.tokens.next.type&&(e=null,warning(\"E030\",state.tokens.next,e)),advance(),funct=functor(\"(catch)\",state.tokens.next,scope,{\"(context)\":funct,\"(breakage)\":funct[\"(breakage)\"],\"(loopage)\":funct[\"(loopage)\"],\"(statement)\":!1,\"(catch)\":!0}),e&&addlabel(e,{type:\"exception\"}),\"if\"===state.tokens.next.value&&(state.option.inMoz(!0)||warning(\"W118\",state.tokens.curr,\"catch filter\"),advance(\"if\"),expression(0)),advance(\")\"),state.tokens.curr.funct=funct,functions.push(funct),block(!1),scope=oldScope,funct[\"(last)\"]=state.tokens.curr.line,funct[\"(lastcharacter)\"]=state.tokens.curr.character,funct=funct[\"(context)\"]}var b;for(block(!0);\"catch\"===state.tokens.next.id;)increaseComplexityCount(),b&&!state.option.inMoz(!0)&&warning(\"W118\",state.tokens.next,\"multiple catch blocks\"),doCatch(),b=!0;return\"finally\"===state.tokens.next.id?(advance(\"finally\"),block(!0),void 0):(b||error(\"E021\",state.tokens.next,\"catch\",state.tokens.next.value),this)}),blockstmt(\"while\",function(){var t=state.tokens.next;return funct[\"(breakage)\"]+=1,funct[\"(loopage)\"]+=1,increaseComplexityCount(),advance(\"(\"),checkCondAssignment(expression(0)),advance(\")\",t),block(!0,!0),funct[\"(breakage)\"]-=1,funct[\"(loopage)\"]-=1,this}).labelled=!0,blockstmt(\"with\",function(){var t=state.tokens.next;return state.directive[\"use strict\"]?error(\"E010\",state.tokens.curr):state.option.withstmt||warning(\"W085\",state.tokens.curr),advance(\"(\"),expression(0),advance(\")\",t),block(!0,!0),this}),blockstmt(\"switch\",function(){var t=state.tokens.next,g=!1,noindent=!1;for(funct[\"(breakage)\"]+=1,advance(\"(\"),checkCondAssignment(expression(0)),advance(\")\",t),t=state.tokens.next,advance(\"{\"),state.tokens.next.from===indent&&(noindent=!0),noindent||(indent+=state.option.indent),this.cases=[];;)switch(state.tokens.next.id){case\"case\":switch(funct[\"(verb)\"]){case\"yield\":case\"break\":case\"case\":case\"continue\":case\"return\":case\"switch\":case\"throw\":break;default:reg.fallsThrough.test(state.lines[state.tokens.next.line-2])||warning(\"W086\",state.tokens.curr,\"case\")}advance(\"case\"),this.cases.push(expression(0)),increaseComplexityCount(),g=!0,advance(\":\"),funct[\"(verb)\"]=\"case\";break;case\"default\":switch(funct[\"(verb)\"]){case\"yield\":case\"break\":case\"continue\":case\"return\":case\"throw\":break;default:this.cases.length&&(reg.fallsThrough.test(state.lines[state.tokens.next.line-2])||warning(\"W086\",state.tokens.curr,\"default\"))}advance(\"default\"),g=!0,advance(\":\");break;case\"}\":return noindent||(indent-=state.option.indent),advance(\"}\",t),funct[\"(breakage)\"]-=1,funct[\"(verb)\"]=void 0,void 0;case\"(end)\":return error(\"E023\",state.tokens.next,\"}\"),void 0;default:if(indent+=state.option.indent,g)switch(state.tokens.curr.id){case\",\":return error(\"E040\"),void 0;case\":\":g=!1,statements();break;default:return error(\"E025\",state.tokens.curr),void 0}else{if(\":\"!==state.tokens.curr.id)return error(\"E021\",state.tokens.next,\"case\",state.tokens.next.value),void 0;advance(\":\"),error(\"E024\",state.tokens.curr,\":\"),statements()}indent-=state.option.indent}}).labelled=!0,stmt(\"debugger\",function(){return state.option.debug||warning(\"W087\",this),this}).exps=!0,function(){var x=stmt(\"do\",function(){funct[\"(breakage)\"]+=1,funct[\"(loopage)\"]+=1,increaseComplexityCount(),this.first=block(!0,!0),advance(\"while\");var t=state.tokens.next;return advance(\"(\"),checkCondAssignment(expression(0)),advance(\")\",t),funct[\"(breakage)\"]-=1,funct[\"(loopage)\"]-=1,this});x.labelled=!0,x.exps=!0}(),blockstmt(\"for\",function(){var s,t=state.tokens.next,letscope=!1,foreachtok=null;\"each\"===t.value&&(foreachtok=t,advance(\"each\"),state.option.inMoz(!0)||warning(\"W118\",state.tokens.curr,\"for each\")),funct[\"(breakage)\"]+=1,funct[\"(loopage)\"]+=1,increaseComplexityCount(),advance(\"(\");var nextop,i=0,inof=[\"in\",\"of\"];do nextop=peek(i),++i;while(!_.contains(inof,nextop.value)&&\";\"!==nextop.value&&\"(end)\"!==nextop.type);if(_.contains(inof,nextop.value)){if(state.option.inESNext()||\"of\"!==nextop.value||error(\"W104\",nextop,\"for of\"),\"var\"===state.tokens.next.id)advance(\"var\"),state.tokens.curr.fud({prefix:!0});else if(\"let\"===state.tokens.next.id)advance(\"let\"),letscope=!0,funct[\"(blockscope)\"].stack(),state.tokens.curr.fud({prefix:!0});else if(state.tokens.next.identifier){switch(funct[state.tokens.next.value]){case\"unused\":funct[state.tokens.next.value]=\"var\";break;case\"var\":break;default:var ident=state.tokens.next.value;funct[\"(blockscope)\"].getlabel(ident)||(scope[ident]||{})[ident]||warning(\"W088\",state.tokens.next,state.tokens.next.value)}advance()}else error(\"E030\",state.tokens.next,state.tokens.next.type),advance();if(advance(nextop.value),expression(20),advance(\")\",t),\"in\"===nextop.value&&state.option.forin&&(state.forinifcheckneeded=!0,void 0===state.forinifchecks&&(state.forinifchecks=[]),state.forinifchecks.push({type:\"(none)\"})),s=block(!0,!0),\"in\"===nextop.value&&state.option.forin){if(state.forinifchecks&&state.forinifchecks.length>0){var check=state.forinifchecks.pop();(s&&s.length>0&&(\"object\"!=typeof s[0]||\"if\"!==s[0].value)||\"(positive)\"===check.type&&s.length>1||\"(negative)\"===check.type)&&warning(\"W089\",this)}state.forinifcheckneeded=!1}funct[\"(breakage)\"]-=1,funct[\"(loopage)\"]-=1}else{if(foreachtok&&error(\"E045\",foreachtok),\";\"!==state.tokens.next.id)if(\"var\"===state.tokens.next.id)advance(\"var\"),state.tokens.curr.fud();else if(\"let\"===state.tokens.next.id)advance(\"let\"),letscope=!0,funct[\"(blockscope)\"].stack(),state.tokens.curr.fud();else for(;expression(0,\"for\"),\",\"===state.tokens.next.id;)comma();if(nolinebreak(state.tokens.curr),advance(\";\"),\";\"!==state.tokens.next.id&&checkCondAssignment(expression(0)),nolinebreak(state.tokens.curr),advance(\";\"),\";\"===state.tokens.next.id&&error(\"E021\",state.tokens.next,\")\",\";\"),\")\"!==state.tokens.next.id)for(;expression(0,\"for\"),\",\"===state.tokens.next.id;)comma();advance(\")\",t),block(!0,!0),funct[\"(breakage)\"]-=1,funct[\"(loopage)\"]-=1}return letscope&&funct[\"(blockscope)\"].unstack(),this}).labelled=!0,stmt(\"break\",function(){var v=state.tokens.next.value;return 0===funct[\"(breakage)\"]&&warning(\"W052\",state.tokens.next,this.value),state.option.asi||nolinebreak(this),\";\"===state.tokens.next.id||state.tokens.next.reach||state.tokens.curr.line===startLine(state.tokens.next)&&(\"label\"!==funct[v]?warning(\"W090\",state.tokens.next,v):scope[v]!==funct&&warning(\"W091\",state.tokens.next,v),this.first=state.tokens.next,advance()),reachable(this),this}).exps=!0,stmt(\"continue\",function(){var v=state.tokens.next.value;return 0===funct[\"(breakage)\"]&&warning(\"W052\",state.tokens.next,this.value),state.option.asi||nolinebreak(this),\";\"===state.tokens.next.id||state.tokens.next.reach?funct[\"(loopage)\"]||warning(\"W052\",state.tokens.next,this.value):state.tokens.curr.line===startLine(state.tokens.next)&&(\"label\"!==funct[v]?warning(\"W090\",state.tokens.next,v):scope[v]!==funct&&warning(\"W091\",state.tokens.next,v),this.first=state.tokens.next,advance()),reachable(this),this}).exps=!0,stmt(\"return\",function(){return this.line===startLine(state.tokens.next)?\";\"===state.tokens.next.id||state.tokens.next.reach||(this.first=expression(0),!this.first||\"(punctuator)\"!==this.first.type||\"=\"!==this.first.value||this.first.paren||state.option.boss||warningAt(\"W093\",this.first.line,this.first.character)):\"(punctuator)\"===state.tokens.next.type&&[\"[\",\"{\",\"+\",\"-\"].indexOf(state.tokens.next.value)>-1&&nolinebreak(this),reachable(this),this}).exps=!0,function(x){x.exps=!0,x.lbp=25}(prefix(\"yield\",function(){var prev=state.tokens.prev;state.option.inESNext(!0)&&!funct[\"(generator)\"]?\"(catch)\"===funct[\"(name)\"]&&funct[\"(context)\"][\"(generator)\"]||error(\"E046\",state.tokens.curr,\"yield\"):state.option.inESNext()||warning(\"W104\",state.tokens.curr,\"yield\"),funct[\"(generator)\"]=\"yielded\";var delegatingYield=!1;return\"*\"===state.tokens.next.value&&(delegatingYield=!0,advance(\"*\")),this.line!==startLine(state.tokens.next)&&state.option.inMoz(!0)?state.option.asi||nolinebreak(this):((delegatingYield||\";\"!==state.tokens.next.id&&!state.tokens.next.reach&&state.tokens.next.nud)&&(nobreaknonadjacent(state.tokens.curr,state.tokens.next),this.first=expression(10),\"(punctuator)\"!==this.first.type||\"=\"!==this.first.value||this.first.paren||state.option.boss||warningAt(\"W093\",this.first.line,this.first.character)),state.option.inMoz(!0)&&\")\"!==state.tokens.next.id&&(prev.lbp>30||!prev.assign&&!isEndOfExpr()||\"yield\"===prev.id)&&error(\"E050\",this)),this})),stmt(\"throw\",function(){return nolinebreak(this),this.first=expression(20),reachable(this),this}).exps=!0,stmt(\"import\",function(){if(state.option.inESNext()||warning(\"W119\",state.tokens.curr,\"import\"),\"(string)\"===state.tokens.next.type)return advance(\"(string)\"),this;if(state.tokens.next.identifier){if(this.name=identifier(),addlabel(this.name,{type:\"unused\",token:state.tokens.curr}),\",\"!==state.tokens.next.value)return advance(\"from\"),advance(\"(string)\"),this;advance(\",\")}if(\"*\"===state.tokens.next.id)advance(\"*\"),advance(\"as\"),state.tokens.next.identifier&&(this.name=identifier(),addlabel(this.name,{type:\"unused\",token:state.tokens.curr}));else for(advance(\"{\");;){if(\"}\"===state.tokens.next.value){advance(\"}\");break}var importName;if(\"default\"===state.tokens.next.type?(importName=\"default\",advance(\"default\")):importName=identifier(),\"as\"===state.tokens.next.value&&(advance(\"as\"),importName=identifier()),addlabel(importName,{type:\"unused\",token:state.tokens.curr}),\",\"!==state.tokens.next.value){if(\"}\"===state.tokens.next.value){advance(\"}\");break}error(\"E024\",state.tokens.next,state.tokens.next.value);break}advance(\",\")}return advance(\"from\"),advance(\"(string)\"),this}).exps=!0,stmt(\"export\",function(){var token,identifier,ok=!0;if(state.option.inESNext()||(warning(\"W119\",state.tokens.curr,\"export\"),ok=!1),funct[\"(global)\"]&&funct[\"(blockscope)\"].atTop()||(error(\"E053\",state.tokens.curr),ok=!1),\"*\"===state.tokens.next.value)return advance(\"*\"),advance(\"from\"),advance(\"(string)\"),this;if(\"default\"===state.tokens.next.type)return state.nameStack.set(state.tokens.next),advance(\"default\"),(\"function\"===state.tokens.next.id||\"class\"===state.tokens.next.id)&&(this.block=!0),token=peek(),expression(10),identifier=\"class\"===state.tokens.next.id?token.name:token.value,addlabel(identifier,{type:\"function\",token:token}),this;if(\"{\"===state.tokens.next.value){advance(\"{\");for(var exportedTokens=[];;){if(state.tokens.next.identifier||error(\"E030\",state.tokens.next,state.tokens.next.value),advance(),state.tokens.curr.exported=ok,exportedTokens.push(state.tokens.curr),\"as\"===state.tokens.next.value&&(advance(\"as\"),state.tokens.next.identifier||error(\"E030\",state.tokens.next,state.tokens.next.value),advance()),\",\"!==state.tokens.next.value){if(\"}\"===state.tokens.next.value){advance(\"}\");break}error(\"E024\",state.tokens.next,state.tokens.next.value);break}advance(\",\")}return\"from\"===state.tokens.next.value?(advance(\"from\"),advance(\"(string)\")):ok&&exportedTokens.forEach(function(token){funct[token.value]||isundef(funct,\"W117\",token,token.value),exported[token.value]=!0,funct[\"(blockscope)\"].setExported(token.value)}),this}return\"var\"===state.tokens.next.id?(advance(\"var\"),state.tokens.curr.fud({inexport:!0})):\"let\"===state.tokens.next.id?(advance(\"let\"),state.tokens.curr.fud({inexport:!0})):\"const\"===state.tokens.next.id?(advance(\"const\"),state.tokens.curr.fud({inexport:!0})):\"function\"===state.tokens.next.id?(this.block=!0,advance(\"function\"),exported[state.tokens.next.value]=ok,state.tokens.next.exported=!0,state.syntax[\"function\"].fud()):\"class\"===state.tokens.next.id?(this.block=!0,advance(\"class\"),exported[state.tokens.next.value]=ok,state.tokens.next.exported=!0,state.syntax[\"class\"].fud()):error(\"E024\",state.tokens.next,state.tokens.next.value),this}).exps=!0,FutureReservedWord(\"abstract\"),FutureReservedWord(\"boolean\"),FutureReservedWord(\"byte\"),FutureReservedWord(\"char\"),FutureReservedWord(\"class\",{es5:!0,nud:classdef}),FutureReservedWord(\"double\"),FutureReservedWord(\"enum\",{es5:!0}),FutureReservedWord(\"export\",{es5:!0}),FutureReservedWord(\"extends\",{es5:!0}),FutureReservedWord(\"final\"),FutureReservedWord(\"float\"),FutureReservedWord(\"goto\"),FutureReservedWord(\"implements\",{es5:!0,strictOnly:!0}),FutureReservedWord(\"import\",{es5:!0}),FutureReservedWord(\"int\"),FutureReservedWord(\"interface\",{es5:!0,strictOnly:!0}),FutureReservedWord(\"long\"),FutureReservedWord(\"native\"),FutureReservedWord(\"package\",{es5:!0,strictOnly:!0}),FutureReservedWord(\"private\",{es5:!0,strictOnly:!0}),FutureReservedWord(\"protected\",{es5:!0,strictOnly:!0}),FutureReservedWord(\"public\",{es5:!0,strictOnly:!0}),FutureReservedWord(\"short\"),FutureReservedWord(\"static\",{es5:!0,strictOnly:!0}),FutureReservedWord(\"super\",{es5:!0}),FutureReservedWord(\"synchronized\"),FutureReservedWord(\"transient\"),FutureReservedWord(\"volatile\");var lookupBlockType=function(){var pn,pn1,i=-1,bracketStack=0,ret={};checkPunctuators(state.tokens.curr,[\"[\",\"{\"])&&(bracketStack+=1);do{if(pn=-1===i?state.tokens.next:peek(i),pn1=peek(i+1),i+=1,checkPunctuators(pn,[\"[\",\"{\"])?bracketStack+=1:checkPunctuators(pn,[\"]\",\"}\"])&&(bracketStack-=1),pn.identifier&&\"for\"===pn.value&&1===bracketStack){ret.isCompArray=!0,ret.notJson=!0;break}if(checkPunctuators(pn,[\"}\",\"]\"])&&0===bracketStack){if(\"=\"===pn1.value){ret.isDestAssign=!0,ret.notJson=!0;break}if(\".\"===pn1.value){ret.notJson=!0;break}}\";\"===pn.value&&(ret.isBlock=!0,ret.notJson=!0)}while(bracketStack>0&&\"(end)\"!==pn.id);return ret},arrayComprehension=function(){function declare(v){var l=_current.variables.filter(function(elt){return elt.value===v?(elt.undef=!1,v):void 0}).length;return 0!==l}function use(v){var l=_current.variables.filter(function(elt){return elt.value!==v||elt.undef?void 0:(elt.unused===!0&&(elt.unused=!1),v)}).length;return 0===l}var _current,CompArray=function(){this.mode=\"use\",this.variables=[]},_carrays=[];return{stack:function(){_current=new CompArray,_carrays.push(_current)},unstack:function(){_current.variables.filter(function(v){v.unused&&warning(\"W098\",v.token,v.raw_text||v.value),v.undef&&isundef(v.funct,\"W117\",v.token,v.value)}),_carrays.splice(-1,1),_current=_carrays[_carrays.length-1]},setState:function(s){_.contains([\"use\",\"define\",\"generate\",\"filter\"],s)&&(_current.mode=s)},check:function(v){return _current?_current&&\"use\"===_current.mode?(use(v)&&_current.variables.push({funct:funct,token:state.tokens.curr,value:v,undef:!0,unused:!1}),!0):_current&&\"define\"===_current.mode?(declare(v)||_current.variables.push({funct:funct,token:state.tokens.curr,value:v,undef:!1,unused:!0}),!0):_current&&\"generate\"===_current.mode?(isundef(funct,\"W117\",state.tokens.curr,v),!0):_current&&\"filter\"===_current.mode?(use(v)&&isundef(funct,\"W117\",state.tokens.curr,v),!0):!1:void 0}}},blockScope=function(){function _checkBlockLabels(){for(var t in _current)if(\"unused\"===_current[t][\"(type)\"]&&state.option.unused){var tkn=_current[t][\"(token)\"];if(tkn.exported)continue;var line=tkn.line,chr=tkn.character;warningAt(\"W098\",line,chr,t)}}var _current={},_variables=[_current];return{stack:function(){_current={},_variables.push(_current)},unstack:function(){_checkBlockLabels(),_variables.splice(_variables.length-1,1),_current=_.last(_variables)},getlabel:function(l){for(var i=_variables.length-1;i>=0;--i)if(_.has(_variables[i],l)&&!_variables[i][l][\"(shadowed)\"])return _variables[i]},shadow:function(name){for(var i=_variables.length-1;i>=0;i--)_.has(_variables[i],name)&&(_variables[i][name][\"(shadowed)\"]=!0)},unshadow:function(name){for(var i=_variables.length-1;i>=0;i--)_.has(_variables[i],name)&&(_variables[i][name][\"(shadowed)\"]=!1)},atTop:function(){return 1===_variables.length},setExported:function(id){if(funct[\"(blockscope)\"].atTop()){var item=_current[id];item&&item[\"(token)\"]&&(item[\"(token)\"].exported=!0)}},current:{has:function(t){return _.has(_current,t)},add:function(t,type,tok){_current[t]={\"(type)\":type,\"(token)\":tok,\"(shadowed)\":!1}}}}},escapeRegex=function(str){return str.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g,\"\\\\$&\")},itself=function(s,o,g){function each(obj,cb){obj&&(Array.isArray(obj)||\"object\"!=typeof obj||(obj=Object.keys(obj)),obj.forEach(cb))}var i,k,x,reIgnoreStr,reIgnore,optionKeys,newOptionObj={},newIgnoredObj={};\nif(o=_.clone(o),state.reset(),o&&o.scope?JSHINT.scope=o.scope:(JSHINT.errors=[],JSHINT.undefs=[],JSHINT.internals=[],JSHINT.blacklist={},JSHINT.scope=\"(main)\"),predefined=Object.create(null),combine(predefined,vars.ecmaIdentifiers[3]),combine(predefined,vars.reservedVars),combine(predefined,g||{}),declared=Object.create(null),exported=Object.create(null),o)for(each(o.predef||null,function(item){var slice,prop;\"-\"===item[0]?(slice=item.slice(1),JSHINT.blacklist[slice]=slice,delete predefined[slice]):(prop=Object.getOwnPropertyDescriptor(o.predef,item),predefined[item]=prop?prop.value:!1)}),each(o.exported||null,function(item){exported[item]=!0}),delete o.predef,delete o.exported,optionKeys=Object.keys(o),x=0;optionKeys.length>x;x++)/^-W\\d{3}$/g.test(optionKeys[x])?newIgnoredObj[optionKeys[x].slice(1)]=!0:(newOptionObj[optionKeys[x]]=o[optionKeys[x]],\"newcap\"===optionKeys[x]&&o[optionKeys[x]]===!1&&(newOptionObj[\"(explicitNewcap)\"]=!0));if(state.option=newOptionObj,state.ignored=newIgnoredObj,state.option.indent=state.option.indent||4,state.option.maxerr=state.option.maxerr||50,indent=1,global=Object.create(predefined),scope=global,funct=functor(\"(global)\",null,scope,{\"(global)\":!0,\"(blockscope)\":blockScope(),\"(comparray)\":arrayComprehension(),\"(metrics)\":createMetrics(state.tokens.next)}),functions=[funct],urls=[],stack=null,member={},membersOnly=null,implied={},inblock=!1,lookahead=[],unuseds=[],!isString(s)&&!Array.isArray(s))return errorAt(\"E004\",0),!1;api={get isJSON(){return state.jsonMode},getOption:function(name){return state.option[name]||null},getCache:function(name){return state.cache[name]},setCache:function(name,value){state.cache[name]=value},warn:function(code,data){warningAt.apply(null,[code,data.line,data.char].concat(data.data))},on:function(names,listener){names.split(\" \").forEach(function(name){emitter.on(name,listener)}.bind(this))}},emitter.removeAllListeners(),(extraModules||[]).forEach(function(func){func(api)}),state.tokens.prev=state.tokens.curr=state.tokens.next=state.syntax[\"(begin)\"],o&&o.ignoreDelimiters&&(Array.isArray(o.ignoreDelimiters)||(o.ignoreDelimiters=[o.ignoreDelimiters]),o.ignoreDelimiters.forEach(function(delimiterPair){delimiterPair.start&&delimiterPair.end&&(reIgnoreStr=escapeRegex(delimiterPair.start)+\"[\\\\s\\\\S]*?\"+escapeRegex(delimiterPair.end),reIgnore=RegExp(reIgnoreStr,\"ig\"),s=s.replace(reIgnore,function(match){return match.replace(/./g,\" \")}))})),lex=new Lexer(s),lex.on(\"warning\",function(ev){warningAt.apply(null,[ev.code,ev.line,ev.character].concat(ev.data))}),lex.on(\"error\",function(ev){errorAt.apply(null,[ev.code,ev.line,ev.character].concat(ev.data))}),lex.on(\"fatal\",function(ev){quit(\"E041\",ev.line,ev.from)}),lex.on(\"Identifier\",function(ev){emitter.emit(\"Identifier\",ev)}),lex.on(\"String\",function(ev){emitter.emit(\"String\",ev)}),lex.on(\"Number\",function(ev){emitter.emit(\"Number\",ev)}),lex.start();for(var name in o)_.has(o,name)&&checkOption(name,state.tokens.curr);assume(),combine(predefined,g||{}),comma.first=!0;try{switch(advance(),state.tokens.next.id){case\"{\":case\"[\":destructuringAssignOrJsonValue();break;default:directives(),state.directive[\"use strict\"]&&(state.option.globalstrict||state.option.node||state.option.phantom||state.option.browserify||warning(\"W097\",state.tokens.prev)),statements()}advance(state.tokens.next&&\".\"!==state.tokens.next.value?\"(end)\":void 0),funct[\"(blockscope)\"].unstack();var markDefined=function(name,context){do{if(\"string\"==typeof context[name])return\"unused\"===context[name]?context[name]=\"var\":\"unction\"===context[name]&&(context[name]=\"closure\"),!0;context=context[\"(context)\"]}while(context);return!1},clearImplied=function(name,line){if(implied[name]){for(var newImplied=[],i=0;implied[name].length>i;i+=1)implied[name][i]!==line&&newImplied.push(implied[name][i]);0===newImplied.length?delete implied[name]:implied[name]=newImplied}},warnUnused=function(name,tkn,type,unused_opt){var line=tkn.line,chr=tkn.from,raw_name=tkn.raw_text||name;void 0===unused_opt&&(unused_opt=state.option.unused),unused_opt===!0&&(unused_opt=\"last-param\");var warnable_types={vars:[\"var\"],\"last-param\":[\"var\",\"param\"],strict:[\"var\",\"param\",\"last-param\"]};unused_opt&&warnable_types[unused_opt]&&-1!==warnable_types[unused_opt].indexOf(type)&&(tkn.exported||warningAt(\"W098\",line,chr,raw_name)),unuseds.push({name:name,line:line,character:chr})},checkUnused=function(func,key){var type=func[key],tkn=func[\"(tokens)\"][key];\"(\"!==key.charAt(0)&&(\"unused\"===type||\"unction\"===type||\"const\"===type)&&(func[\"(params)\"]&&-1!==func[\"(params)\"].indexOf(key)||func[\"(global)\"]&&_.has(exported,key)||(\"const\"!==type||getprop(func,key,\"unused\"))&&warnUnused(key,tkn,\"var\"))};for(i=0;JSHINT.undefs.length>i;i+=1)k=JSHINT.undefs[i].slice(0),markDefined(k[2].value,k[0])||k[2].forgiveUndef?clearImplied(k[2].value,k[2].line):state.option.undef&&warning.apply(warning,k.slice(1));functions.forEach(function(func){if(func[\"(unusedOption)\"]!==!1){for(var key in func)_.has(func,key)&&checkUnused(func,key);if(func[\"(params)\"])for(var type,unused_opt,params=func[\"(params)\"].slice(),param=params.pop();param;){if(type=func[param],unused_opt=func[\"(unusedOption)\"]||state.option.unused,unused_opt=unused_opt===!0?\"last-param\":unused_opt,\"undefined\"===param)return;if(\"unused\"===type||\"unction\"===type)warnUnused(param,func[\"(tokens)\"][param],\"param\",func[\"(unusedOption)\"]);else if(\"last-param\"===unused_opt)return;param=params.pop()}}});for(var key in declared)!_.has(declared,key)||_.has(global,key)||_.has(exported,key)||warnUnused(key,declared[key],\"var\")}catch(err){if(!err||\"JSHintError\"!==err.name)throw err;var nt=state.tokens.next||{};JSHINT.errors.push({scope:\"(main)\",raw:err.raw,code:err.code,reason:err.message,line:err.line||nt.line,character:err.character||nt.from},null)}if(\"(main)\"===JSHINT.scope)for(o=o||{},i=0;JSHINT.internals.length>i;i+=1)k=JSHINT.internals[i],o.scope=k.elem,itself(k.value,o,g);return 0===JSHINT.errors.length};return itself.addModule=function(func){extraModules.push(func)},itself.addModule(style.register),itself.data=function(){var fu,f,i,j,n,globals,data={functions:[],options:state.option},implieds=[],members=[];itself.errors.length&&(data.errors=itself.errors),state.jsonMode&&(data.json=!0);for(n in implied)_.has(implied,n)&&implieds.push({name:n,line:implied[n]});for(implieds.length>0&&(data.implieds=implieds),urls.length>0&&(data.urls=urls),globals=Object.keys(scope),globals.length>0&&(data.globals=globals),i=1;functions.length>i;i+=1){for(f=functions[i],fu={},j=0;functionicity.length>j;j+=1)fu[functionicity[j]]=[];for(j=0;functionicity.length>j;j+=1)0===fu[functionicity[j]].length&&delete fu[functionicity[j]];fu.name=f[\"(name)\"],fu.param=f[\"(params)\"],fu.line=f[\"(line)\"],fu.character=f[\"(character)\"],fu.last=f[\"(last)\"],fu.lastcharacter=f[\"(lastcharacter)\"],fu.metrics={complexity:f[\"(metrics)\"].ComplexityCount,parameters:(f[\"(params)\"]||[]).length,statements:f[\"(metrics)\"].statementCount},data.functions.push(fu)}unuseds.length>0&&(data.unused=unuseds),members=[];for(n in member)if(\"number\"==typeof member[n]){data.member=member;break}return data},itself.jshint=itself,itself}();\"object\"==typeof exports&&exports&&(exports.JSHINT=JSHINT)},{\"./lex.js\":4,\"./messages.js\":5,\"./options.js\":7,\"./reg.js\":8,\"./state.js\":9,\"./style.js\":10,\"./vars.js\":11,events:12,underscore:2}],4:[function(_dereq_,module,exports){\"use strict\";function asyncTrigger(){var _checks=[];return{push:function(fn){_checks.push(fn)},check:function(){for(var check=0;_checks.length>check;++check)_checks[check]();_checks.splice(0,_checks.length)}}}function Lexer(source){var lines=source;\"string\"==typeof lines&&(lines=lines.replace(/\\r\\n/g,\"\\n\").replace(/\\r/g,\"\\n\").split(\"\\n\")),lines[0]&&\"#!\"===lines[0].substr(0,2)&&(-1!==lines[0].indexOf(\"node\")&&(state.option.node=!0),lines[0]=\"\"),this.emitter=new events.EventEmitter,this.source=source,this.setLines(lines),this.prereg=!0,this.line=0,this.char=1,this.from=1,this.input=\"\",this.inComment=!1,this.context=[],this.templateStarts=[];for(var i=0;state.option.indent>i;i+=1)state.tab+=\" \"}var _=_dereq_(\"underscore\"),events=_dereq_(\"events\"),reg=_dereq_(\"./reg.js\"),state=_dereq_(\"./state.js\").state,unicodeData=_dereq_(\"../data/ascii-identifier-data.js\"),asciiIdentifierStartTable=unicodeData.asciiIdentifierStartTable,asciiIdentifierPartTable=unicodeData.asciiIdentifierPartTable,Token={Identifier:1,Punctuator:2,NumericLiteral:3,StringLiteral:4,Comment:5,Keyword:6,NullLiteral:7,BooleanLiteral:8,RegExp:9,TemplateHead:10,TemplateMiddle:11,TemplateTail:12,NoSubstTemplate:13},Context={Block:1,Template:2};Lexer.prototype={_lines:[],inContext:function(ctxType){return this.context.length>0&&this.context[this.context.length-1].type===ctxType},pushContext:function(ctxType){this.context.push({type:ctxType})},popContext:function(){return this.context.pop()},isContext:function(context){return this.context.length>0&&this.context[this.context.length-1]===context},currentContext:function(){return this.context.length>0&&this.context[this.context.length-1]},getLines:function(){return this._lines=state.lines,this._lines},setLines:function(val){this._lines=val,state.lines=this._lines},peek:function(i){return this.input.charAt(i||0)},skip:function(i){i=i||1,this.char+=i,this.input=this.input.slice(i)},on:function(names,listener){names.split(\" \").forEach(function(name){this.emitter.on(name,listener)}.bind(this))},trigger:function(){this.emitter.emit.apply(this.emitter,Array.prototype.slice.call(arguments))},triggerAsync:function(type,args,checks,fn){checks.push(function(){fn()&&this.trigger(type,args)}.bind(this))},scanPunctuator:function(){var ch2,ch3,ch4,ch1=this.peek();switch(ch1){case\".\":if(/^[0-9]$/.test(this.peek(1)))return null;if(\".\"===this.peek(1)&&\".\"===this.peek(2))return{type:Token.Punctuator,value:\"...\"};case\"(\":case\")\":case\";\":case\",\":case\"[\":case\"]\":case\":\":case\"~\":case\"?\":return{type:Token.Punctuator,value:ch1};case\"{\":return this.pushContext(Context.Block),{type:Token.Punctuator,value:ch1};case\"}\":return this.inContext(Context.Block)&&this.popContext(),{type:Token.Punctuator,value:ch1};case\"#\":return{type:Token.Punctuator,value:ch1};case\"\":return null}return ch2=this.peek(1),ch3=this.peek(2),ch4=this.peek(3),\">\"===ch1&&\">\"===ch2&&\">\"===ch3&&\"=\"===ch4?{type:Token.Punctuator,value:\">>>=\"}:\"=\"===ch1&&\"=\"===ch2&&\"=\"===ch3?{type:Token.Punctuator,value:\"===\"}:\"!\"===ch1&&\"=\"===ch2&&\"=\"===ch3?{type:Token.Punctuator,value:\"!==\"}:\">\"===ch1&&\">\"===ch2&&\">\"===ch3?{type:Token.Punctuator,value:\">>>\"}:\"<\"===ch1&&\"<\"===ch2&&\"=\"===ch3?{type:Token.Punctuator,value:\"<<=\"}:\">\"===ch1&&\">\"===ch2&&\"=\"===ch3?{type:Token.Punctuator,value:\">>=\"}:\"=\"===ch1&&\">\"===ch2?{type:Token.Punctuator,value:ch1+ch2}:ch1===ch2&&\"+-<>&|\".indexOf(ch1)>=0?{type:Token.Punctuator,value:ch1+ch2}:\"<>=!+-*%&|^\".indexOf(ch1)>=0?\"=\"===ch2?{type:Token.Punctuator,value:ch1+ch2}:{type:Token.Punctuator,value:ch1}:\"/\"===ch1?\"=\"===ch2?{type:Token.Punctuator,value:\"/=\"}:{type:Token.Punctuator,value:\"/\"}:null},scanComments:function(){function commentToken(label,body,opt){var special=[\"jshint\",\"jslint\",\"members\",\"member\",\"globals\",\"global\",\"exported\"],isSpecial=!1,value=label+body,commentType=\"plain\";return opt=opt||{},opt.isMultiline&&(value+=\"*/\"),body=body.replace(/\\n/g,\" \"),special.forEach(function(str){if(!isSpecial&&(\"//\"!==label||\"jshint\"===str)&&(\" \"===body.charAt(str.length)&&body.substr(0,str.length)===str&&(isSpecial=!0,label+=str,body=body.substr(str.length)),isSpecial||\" \"!==body.charAt(0)||\" \"!==body.charAt(str.length+1)||body.substr(1,str.length)!==str||(isSpecial=!0,label=label+\" \"+str,body=body.substr(str.length+1)),isSpecial))switch(str){case\"member\":commentType=\"members\";break;case\"global\":commentType=\"globals\";break;default:commentType=str}}),{type:Token.Comment,commentType:commentType,value:value,body:body,isSpecial:isSpecial,isMultiline:opt.isMultiline||!1,isMalformed:opt.isMalformed||!1}}var ch1=this.peek(),ch2=this.peek(1),rest=this.input.substr(2),startLine=this.line,startChar=this.char;if(\"*\"===ch1&&\"/\"===ch2)return this.trigger(\"error\",{code:\"E018\",line:startLine,character:startChar}),this.skip(2),null;if(\"/\"!==ch1||\"*\"!==ch2&&\"/\"!==ch2)return null;if(\"/\"===ch2)return this.skip(this.input.length),commentToken(\"//\",rest);var body=\"\";if(\"*\"===ch2){for(this.inComment=!0,this.skip(2);\"*\"!==this.peek()||\"/\"!==this.peek(1);)if(\"\"===this.peek()){if(body+=\"\\n\",!this.nextLine())return this.trigger(\"error\",{code:\"E017\",line:startLine,character:startChar}),this.inComment=!1,commentToken(\"/*\",body,{isMultiline:!0,isMalformed:!0})}else body+=this.peek(),this.skip();return this.skip(2),this.inComment=!1,commentToken(\"/*\",body,{isMultiline:!0})}},scanKeyword:function(){var result=/^[a-zA-Z_$][a-zA-Z0-9_$]*/.exec(this.input),keywords=[\"if\",\"in\",\"do\",\"var\",\"for\",\"new\",\"try\",\"let\",\"this\",\"else\",\"case\",\"void\",\"with\",\"enum\",\"while\",\"break\",\"catch\",\"throw\",\"const\",\"yield\",\"class\",\"super\",\"return\",\"typeof\",\"delete\",\"switch\",\"export\",\"import\",\"default\",\"finally\",\"extends\",\"function\",\"continue\",\"debugger\",\"instanceof\"];return result&&keywords.indexOf(result[0])>=0?{type:Token.Keyword,value:result[0]}:null},scanIdentifier:function(){function isNonAsciiIdentifierStart(code){return code>256}function isNonAsciiIdentifierPart(code){return code>256}function isHexDigit(str){return/^[0-9a-fA-F]$/.test(str)}function removeEscapeSequences(id){return id.replace(/\\\\u([0-9a-fA-F]{4})/g,function(m0,codepoint){return String.fromCharCode(parseInt(codepoint,16))})}var type,char,id=\"\",index=0,readUnicodeEscapeSequence=function(){if(index+=1,\"u\"!==this.peek(index))return null;var code,ch1=this.peek(index+1),ch2=this.peek(index+2),ch3=this.peek(index+3),ch4=this.peek(index+4);return isHexDigit(ch1)&&isHexDigit(ch2)&&isHexDigit(ch3)&&isHexDigit(ch4)?(code=parseInt(ch1+ch2+ch3+ch4,16),asciiIdentifierPartTable[code]||isNonAsciiIdentifierPart(code)?(index+=5,\"\\\\u\"+ch1+ch2+ch3+ch4):null):null}.bind(this),getIdentifierStart=function(){var chr=this.peek(index),code=chr.charCodeAt(0);return 92===code?readUnicodeEscapeSequence():128>code?asciiIdentifierStartTable[code]?(index+=1,chr):null:isNonAsciiIdentifierStart(code)?(index+=1,chr):null}.bind(this),getIdentifierPart=function(){var chr=this.peek(index),code=chr.charCodeAt(0);return 92===code?readUnicodeEscapeSequence():128>code?asciiIdentifierPartTable[code]?(index+=1,chr):null:isNonAsciiIdentifierPart(code)?(index+=1,chr):null}.bind(this);if(char=getIdentifierStart(),null===char)return null;for(id=char;char=getIdentifierPart(),null!==char;)id+=char;switch(id){case\"true\":case\"false\":type=Token.BooleanLiteral;break;case\"null\":type=Token.NullLiteral;break;default:type=Token.Identifier}return{type:type,value:removeEscapeSequences(id),text:id,tokenLength:id.length}},scanNumericLiteral:function(){function isDecimalDigit(str){return/^[0-9]$/.test(str)}function isOctalDigit(str){return/^[0-7]$/.test(str)}function isBinaryDigit(str){return/^[01]$/.test(str)}function isHexDigit(str){return/^[0-9a-fA-F]$/.test(str)}function isIdentifierStart(ch){return\"$\"===ch||\"_\"===ch||\"\\\\\"===ch||ch>=\"a\"&&\"z\">=ch||ch>=\"A\"&&\"Z\">=ch}var bad,index=0,value=\"\",length=this.input.length,char=this.peek(index),isAllowedDigit=isDecimalDigit,base=10,isLegacy=!1;if(\".\"!==char&&!isDecimalDigit(char))return null;if(\".\"!==char){for(value=this.peek(index),index+=1,char=this.peek(index),\"0\"===value&&((\"x\"===char||\"X\"===char)&&(isAllowedDigit=isHexDigit,base=16,index+=1,value+=char),(\"o\"===char||\"O\"===char)&&(isAllowedDigit=isOctalDigit,base=8,state.option.esnext||this.trigger(\"warning\",{code:\"W119\",line:this.line,character:this.char,data:[\"Octal integer literal\"]}),index+=1,value+=char),(\"b\"===char||\"B\"===char)&&(isAllowedDigit=isBinaryDigit,base=2,state.option.esnext||this.trigger(\"warning\",{code:\"W119\",line:this.line,character:this.char,data:[\"Binary integer literal\"]}),index+=1,value+=char),isOctalDigit(char)&&(isAllowedDigit=isOctalDigit,base=8,isLegacy=!0,bad=!1,index+=1,value+=char),!isOctalDigit(char)&&isDecimalDigit(char)&&(index+=1,value+=char));length>index;){if(char=this.peek(index),isLegacy&&isDecimalDigit(char))bad=!0;else if(!isAllowedDigit(char))break;value+=char,index+=1}if(isAllowedDigit!==isDecimalDigit)return!isLegacy&&2>=value.length?{type:Token.NumericLiteral,value:value,isMalformed:!0}:length>index&&(char=this.peek(index),isIdentifierStart(char))?null:{type:Token.NumericLiteral,value:value,base:base,isLegacy:isLegacy,isMalformed:!1}}if(\".\"===char)for(value+=char,index+=1;length>index&&(char=this.peek(index),isDecimalDigit(char));)value+=char,index+=1;if(\"e\"===char||\"E\"===char){if(value+=char,index+=1,char=this.peek(index),(\"+\"===char||\"-\"===char)&&(value+=this.peek(index),index+=1),char=this.peek(index),!isDecimalDigit(char))return null;for(value+=char,index+=1;length>index&&(char=this.peek(index),isDecimalDigit(char));)value+=char,index+=1}return length>index&&(char=this.peek(index),isIdentifierStart(char))?null:{type:Token.NumericLiteral,value:value,base:base,isMalformed:!isFinite(value)}},scanEscapeSequence:function(checks){var allowNewLine=!1,jump=1;this.skip();var char=this.peek();switch(char){case\"'\":this.triggerAsync(\"warning\",{code:\"W114\",line:this.line,character:this.char,data:[\"\\\\'\"]},checks,function(){return state.jsonMode});break;case\"b\":char=\"\\\\b\";break;case\"f\":char=\"\\\\f\";break;case\"n\":char=\"\\\\n\";break;case\"r\":char=\"\\\\r\";break;case\"t\":char=\"\\\\t\";break;case\"0\":char=\"\\\\0\";var n=parseInt(this.peek(1),10);this.triggerAsync(\"warning\",{code:\"W115\",line:this.line,character:this.char},checks,function(){return n>=0&&7>=n&&state.directive[\"use strict\"]});break;case\"u\":var hexCode=this.input.substr(1,4),code=parseInt(hexCode,16);isNaN(code)&&this.trigger(\"warning\",{code:\"W052\",line:this.line,character:this.char,data:[\"u\"+hexCode]}),char=String.fromCharCode(code),jump=5;break;case\"v\":this.triggerAsync(\"warning\",{code:\"W114\",line:this.line,character:this.char,data:[\"\\\\v\"]},checks,function(){return state.jsonMode}),char=\"\u000b\";break;case\"x\":var x=parseInt(this.input.substr(1,2),16);this.triggerAsync(\"warning\",{code:\"W114\",line:this.line,character:this.char,data:[\"\\\\x-\"]},checks,function(){return state.jsonMode}),char=String.fromCharCode(x),jump=3;break;case\"\\\\\":char=\"\\\\\\\\\";break;case'\"':char='\\\\\"';break;case\"/\":break;case\"\":allowNewLine=!0,char=\"\"}return{\"char\":char,jump:jump,allowNewLine:allowNewLine}},scanTemplateLiteral:function(checks){var tokenType,ch,value=\"\",startLine=this.line,startChar=this.char,depth=this.templateStarts.length;if(!state.option.esnext)return null;if(\"`\"===this.peek())tokenType=Token.TemplateHead,this.templateStarts.push({line:this.line,\"char\":this.char}),depth=this.templateStarts.length,this.skip(1),this.pushContext(Context.Template);else{if(!this.inContext(Context.Template)||\"}\"!==this.peek())return null;tokenType=Token.TemplateMiddle}for(;\"`\"!==this.peek();){for(;\"\"===(ch=this.peek());)if(value+=\"\\n\",!this.nextLine()){var startPos=this.templateStarts.pop();return this.trigger(\"error\",{code:\"E052\",line:startPos.line,character:startPos.char}),{type:tokenType,value:value,startLine:startLine,startChar:startChar,isUnclosed:!0,depth:depth,context:this.popContext()}}if(\"$\"===ch&&\"{\"===this.peek(1))return value+=\"${\",this.skip(2),{type:tokenType,value:value,startLine:startLine,startChar:startChar,isUnclosed:!1,depth:depth,context:this.currentContext()};if(\"\\\\\"===ch){var escape=this.scanEscapeSequence(checks);value+=escape.char,this.skip(escape.jump)}else\"`\"!==ch&&(value+=ch,this.skip(1))}return tokenType=tokenType===Token.TemplateHead?Token.NoSubstTemplate:Token.TemplateTail,this.skip(1),this.templateStarts.pop(),{type:tokenType,value:value,startLine:startLine,startChar:startChar,isUnclosed:!1,depth:depth,context:this.popContext()}},scanStringLiteral:function(checks){var quote=this.peek();if('\"'!==quote&&\"'\"!==quote)return null;this.triggerAsync(\"warning\",{code:\"W108\",line:this.line,character:this.char},checks,function(){return state.jsonMode&&'\"'!==quote});var value=\"\",startLine=this.line,startChar=this.char,allowNewLine=!1;this.skip();outer:for(;this.peek()!==quote;){for(;\"\"===this.peek();){if(allowNewLine?(allowNewLine=!1,this.triggerAsync(\"warning\",{code:\"W043\",line:this.line,character:this.char},checks,function(){return!state.option.multistr}),this.triggerAsync(\"warning\",{code:\"W042\",line:this.line,character:this.char},checks,function(){return state.jsonMode&&state.option.multistr})):this.trigger(\"warning\",{code:\"W112\",line:this.line,character:this.char}),!this.nextLine())return this.trigger(\"error\",{code:\"E029\",line:startLine,character:startChar}),{type:Token.StringLiteral,value:value,startLine:startLine,startChar:startChar,isUnclosed:!0,quote:quote};if(this.peek()==quote)break outer}allowNewLine=!1;var char=this.peek(),jump=1;if(\" \">char&&this.trigger(\"warning\",{code:\"W113\",line:this.line,character:this.char,data:[\"<non-printable>\"]}),\"\\\\\"===char){var parsed=this.scanEscapeSequence(checks);char=parsed.char,jump=parsed.jump,allowNewLine=parsed.allowNewLine}value+=char,this.skip(jump)}return this.skip(),{type:Token.StringLiteral,value:value,startLine:startLine,startChar:startChar,isUnclosed:!1,quote:quote}},scanRegExp:function(){var terminated,index=0,length=this.input.length,char=this.peek(),value=char,body=\"\",flags=[],malformed=!1,isCharSet=!1,scanUnexpectedChars=function(){\" \">char&&(malformed=!0,this.trigger(\"warning\",{code:\"W048\",line:this.line,character:this.char})),\"<\"===char&&(malformed=!0,this.trigger(\"warning\",{code:\"W049\",line:this.line,character:this.char,data:[char]}))}.bind(this);if(!this.prereg||\"/\"!==char)return null;for(index+=1,terminated=!1;length>index;)if(char=this.peek(index),value+=char,body+=char,isCharSet)\"]\"===char&&(\"\\\\\"!==this.peek(index-1)||\"\\\\\"===this.peek(index-2))&&(isCharSet=!1),\"\\\\\"===char&&(index+=1,char=this.peek(index),body+=char,value+=char,scanUnexpectedChars()),index+=1;else{if(\"\\\\\"===char){if(index+=1,char=this.peek(index),body+=char,value+=char,scanUnexpectedChars(),\"/\"===char){index+=1;continue}if(\"[\"===char){index+=1;continue}}if(\"[\"!==char){if(\"/\"===char){body=body.substr(0,body.length-1),terminated=!0,index+=1;break}index+=1}else isCharSet=!0,index+=1}if(!terminated)return this.trigger(\"error\",{code:\"E015\",line:this.line,character:this.from}),void this.trigger(\"fatal\",{line:this.line,from:this.from});for(;length>index&&(char=this.peek(index),/[gim]/.test(char));)flags.push(char),value+=char,index+=1;try{RegExp(body,flags.join(\"\"))}catch(err){malformed=!0,this.trigger(\"error\",{code:\"E016\",line:this.line,character:this.char,data:[err.message]})}return{type:Token.RegExp,value:value,flags:flags,isMalformed:malformed}},scanNonBreakingSpaces:function(){return state.option.nonbsp?this.input.search(/(\\u00A0)/):-1},scanUnsafeChars:function(){return this.input.search(reg.unsafeChars)},next:function(checks){this.from=this.char;var start;if(/\\s/.test(this.peek()))for(start=this.char;/\\s/.test(this.peek());)this.from+=1,this.skip();var match=this.scanComments()||this.scanStringLiteral(checks)||this.scanTemplateLiteral(checks);return match?match:(match=this.scanRegExp()||this.scanPunctuator()||this.scanKeyword()||this.scanIdentifier()||this.scanNumericLiteral(),match?(this.skip(match.tokenLength||match.value.length),match):null)},nextLine:function(){var char;if(this.line>=this.getLines().length)return!1;this.input=this.getLines()[this.line],this.line+=1,this.char=1,this.from=1;var inputTrimmed=this.input.trim(),startsWith=function(){return _.some(arguments,function(prefix){return 0===inputTrimmed.indexOf(prefix)})},endsWith=function(){return _.some(arguments,function(suffix){return-1!==inputTrimmed.indexOf(suffix,inputTrimmed.length-suffix.length)})};if(state.ignoreLinterErrors===!0&&(startsWith(\"/*\",\"//\")||this.inComment&&endsWith(\"*/\")||(this.input=\"\")),char=this.scanNonBreakingSpaces(),char>=0&&this.trigger(\"warning\",{code:\"W125\",line:this.line,character:char+1}),this.input=this.input.replace(/\\t/g,state.tab),char=this.scanUnsafeChars(),char>=0&&this.trigger(\"warning\",{code:\"W100\",line:this.line,character:char}),state.option.maxlen&&state.option.maxlen<this.input.length){var inComment=this.inComment||startsWith.call(inputTrimmed,\"//\")||startsWith.call(inputTrimmed,\"/*\"),shouldTriggerError=!inComment||!reg.maxlenException.test(inputTrimmed);shouldTriggerError&&this.trigger(\"warning\",{code:\"W101\",line:this.line,character:this.input.length})}return!0},start:function(){this.nextLine()},token:function(){function isReserved(token,isProperty){if(!token.reserved)return!1;var meta=token.meta;if(meta&&meta.isFutureReservedWord&&state.option.inES5()){if(!meta.es5)return!1;if(meta.strictOnly&&!state.option.strict&&!state.directive[\"use strict\"])return!1;if(isProperty)return!1}return!0}for(var token,checks=asyncTrigger(),create=function(type,value,isProperty,token){var obj;if(\"(endline)\"!==type&&\"(end)\"!==type&&(this.prereg=!1),\"(punctuator)\"===type){switch(value){case\".\":case\")\":case\"~\":case\"#\":case\"]\":case\"++\":case\"--\":this.prereg=!1;break;default:this.prereg=!0}obj=Object.create(state.syntax[value]||state.syntax[\"(error)\"])}return\"(identifier)\"===type&&((\"return\"===value||\"case\"===value||\"typeof\"===value)&&(this.prereg=!0),_.has(state.syntax,value)&&(obj=Object.create(state.syntax[value]||state.syntax[\"(error)\"]),isReserved(obj,isProperty&&\"(identifier)\"===type)||(obj=null))),obj||(obj=Object.create(state.syntax[type])),obj.identifier=\"(identifier)\"===type,obj.type=obj.type||type,obj.value=value,obj.line=this.line,obj.character=this.char,obj.from=this.from,obj.identifier&&token&&(obj.raw_text=token.text||token.value),token&&token.startLine&&token.startLine!==this.line&&(obj.startLine=token.startLine),token&&token.context&&(obj.context=token.context),token&&token.depth&&(obj.depth=token.depth),token&&token.isUnclosed&&(obj.isUnclosed=token.isUnclosed),isProperty&&obj.identifier&&(obj.isProperty=isProperty),obj.check=checks.check,obj}.bind(this);;){if(!this.input.length)return create(this.nextLine()?\"(endline)\":\"(end)\",\"\");if(token=this.next(checks))switch(token.type){case Token.StringLiteral:return this.triggerAsync(\"String\",{line:this.line,\"char\":this.char,from:this.from,startLine:token.startLine,startChar:token.startChar,value:token.value,quote:token.quote},checks,function(){return!0}),create(\"(string)\",token.value,null,token);case Token.TemplateHead:return this.trigger(\"TemplateHead\",{line:this.line,\"char\":this.char,from:this.from,startLine:token.startLine,startChar:token.startChar,value:token.value}),create(\"(template)\",token.value,null,token);case Token.TemplateMiddle:return this.trigger(\"TemplateMiddle\",{line:this.line,\"char\":this.char,from:this.from,startLine:token.startLine,startChar:token.startChar,value:token.value}),create(\"(template middle)\",token.value,null,token);case Token.TemplateTail:return this.trigger(\"TemplateTail\",{line:this.line,\"char\":this.char,from:this.from,startLine:token.startLine,startChar:token.startChar,value:token.value}),create(\"(template tail)\",token.value,null,token);case Token.NoSubstTemplate:return this.trigger(\"NoSubstTemplate\",{line:this.line,\"char\":this.char,from:this.from,startLine:token.startLine,startChar:token.startChar,value:token.value}),create(\"(no subst template)\",token.value,null,token);case Token.Identifier:this.trigger(\"Identifier\",{line:this.line,\"char\":this.char,from:this.form,name:token.value,raw_name:token.text,isProperty:\".\"===state.tokens.curr.id});case Token.Keyword:case Token.NullLiteral:case Token.BooleanLiteral:return create(\"(identifier)\",token.value,\".\"===state.tokens.curr.id,token);case Token.NumericLiteral:return token.isMalformed&&this.trigger(\"warning\",{code:\"W045\",line:this.line,character:this.char,data:[token.value]}),this.triggerAsync(\"warning\",{code:\"W114\",line:this.line,character:this.char,data:[\"0x-\"]},checks,function(){return 16===token.base&&state.jsonMode}),this.triggerAsync(\"warning\",{code:\"W115\",line:this.line,character:this.char},checks,function(){return state.directive[\"use strict\"]&&8===token.base&&token.isLegacy}),this.trigger(\"Number\",{line:this.line,\"char\":this.char,from:this.from,value:token.value,base:token.base,isMalformed:token.malformed}),create(\"(number)\",token.value);case Token.RegExp:return create(\"(regexp)\",token.value);case Token.Comment:if(state.tokens.curr.comment=!0,token.isSpecial)return{id:\"(comment)\",value:token.value,body:token.body,type:token.commentType,isSpecial:token.isSpecial,line:this.line,character:this.char,from:this.from};break;case\"\":break;default:return create(\"(punctuator)\",token.value)}else this.input.length&&(this.trigger(\"error\",{code:\"E024\",line:this.line,character:this.char,data:[this.peek()]}),this.input=\"\")}}},exports.Lexer=Lexer,exports.Context=Context},{\"../data/ascii-identifier-data.js\":1,\"./reg.js\":8,\"./state.js\":9,events:12,underscore:2}],5:[function(_dereq_,module,exports){\"use strict\";var _=_dereq_(\"underscore\"),errors={E001:\"Bad option: '{a}'.\",E002:\"Bad option value.\",E003:\"Expected a JSON value.\",E004:\"Input is neither a string nor an array of strings.\",E005:\"Input is empty.\",E006:\"Unexpected early end of program.\",E007:'Missing \"use strict\" statement.',E008:\"Strict violation.\",E009:\"Option 'validthis' can't be used in a global scope.\",E010:\"'with' is not allowed in strict mode.\",E011:\"const '{a}' has already been declared.\",E012:\"const '{a}' is initialized to 'undefined'.\",E013:\"Attempting to override '{a}' which is a constant.\",E014:\"A regular expression literal can be confused with '/='.\",E015:\"Unclosed regular expression.\",E016:\"Invalid regular expression.\",E017:\"Unclosed comment.\",E018:\"Unbegun comment.\",E019:\"Unmatched '{a}'.\",E020:\"Expected '{a}' to match '{b}' from line {c} and instead saw '{d}'.\",E021:\"Expected '{a}' and instead saw '{b}'.\",E022:\"Line breaking error '{a}'.\",E023:\"Missing '{a}'.\",E024:\"Unexpected '{a}'.\",E025:\"Missing ':' on a case clause.\",E026:\"Missing '}' to match '{' from line {a}.\",E027:\"Missing ']' to match '[' from line {a}.\",E028:\"Illegal comma.\",E029:\"Unclosed string.\",E030:\"Expected an identifier and instead saw '{a}'.\",E031:\"Bad assignment.\",E032:\"Expected a small integer or 'false' and instead saw '{a}'.\",E033:\"Expected an operator and instead saw '{a}'.\",E034:\"get/set are ES5 features.\",E035:\"Missing property name.\",E036:\"Expected to see a statement and instead saw a block.\",E037:null,E038:null,E039:\"Function declarations are not invocable. Wrap the whole function invocation in parens.\",E040:\"Each value should have its own case label.\",E041:\"Unrecoverable syntax error.\",E042:\"Stopping.\",E043:\"Too many errors.\",E044:null,E045:\"Invalid for each loop.\",E046:\"A yield statement shall be within a generator function (with syntax: `function*`)\",E047:null,E048:\"Let declaration not directly within block.\",E049:\"A {a} cannot be named '{b}'.\",E050:\"Mozilla acequires the yield expression to be parenthesized here.\",E051:\"Regular parameters cannot come after default parameters.\",E052:\"Unclosed template literal.\",E053:\"Export declaration must be in global scope.\",E054:\"Class properties must be methods. Expected '(' but instead saw '{a}'.\"},warnings={W001:\"'hasOwnProperty' is a really bad name.\",W002:\"Value of '{a}' may be overwritten in IE 8 and earlier.\",W003:\"'{a}' was used before it was defined.\",W004:\"'{a}' is already defined.\",W005:\"A dot following a number can be confused with a decimal point.\",W006:\"Confusing minuses.\",W007:\"Confusing plusses.\",W008:\"A leading decimal point can be confused with a dot: '{a}'.\",W009:\"The array literal notation [] is preferable.\",W010:\"The object literal notation {} is preferable.\",W011:null,W012:null,W013:null,W014:\"Bad line breaking before '{a}'.\",W015:null,W016:\"Unexpected use of '{a}'.\",W017:\"Bad operand.\",W018:\"Confusing use of '{a}'.\",W019:\"Use the isNaN function to compare with NaN.\",W020:\"Read only.\",W021:\"'{a}' is a function.\",W022:\"Do not assign to the exception parameter.\",W023:\"Expected an identifier in an assignment and instead saw a function invocation.\",W024:\"Expected an identifier and instead saw '{a}' (a reserved word).\",W025:\"Missing name in function declaration.\",W026:\"Inner functions should be listed at the top of the outer function.\",W027:\"Unreachable '{a}' after '{b}'.\",W028:\"Label '{a}' on {b} statement.\",W030:\"Expected an assignment or function call and instead saw an expression.\",W031:\"Do not use 'new' for side effects.\",W032:\"Unnecessary semicolon.\",W033:\"Missing semicolon.\",W034:'Unnecessary directive \"{a}\".',W035:\"Empty block.\",W036:\"Unexpected /*member '{a}'.\",W037:\"'{a}' is a statement label.\",W038:\"'{a}' used out of scope.\",W039:\"'{a}' is not allowed.\",W040:\"Possible strict violation.\",W041:\"Use '{a}' to compare with '{b}'.\",W042:\"Avoid EOL escaping.\",W043:\"Bad escaping of EOL. Use option multistr if needed.\",W044:\"Bad or unnecessary escaping.\",W045:\"Bad number '{a}'.\",W046:\"Don't use extra leading zeros '{a}'.\",W047:\"A trailing decimal point can be confused with a dot: '{a}'.\",W048:\"Unexpected control character in regular expression.\",W049:\"Unexpected escaped character '{a}' in regular expression.\",W050:\"JavaScript URL.\",W051:\"Variables should not be deleted.\",W052:\"Unexpected '{a}'.\",W053:\"Do not use {a} as a constructor.\",W054:\"The Function constructor is a form of eval.\",W055:\"A constructor name should start with an uppercase letter.\",W056:\"Bad constructor.\",W057:\"Weird construction. Is 'new' necessary?\",W058:\"Missing '()' invoking a constructor.\",W059:\"Avoid arguments.{a}.\",W060:\"document.write can be a form of eval.\",W061:\"eval can be harmful.\",W062:\"Wrap an immediate function invocation in parens to assist the reader in understanding that the expression is the result of a function, and not the function itself.\",W063:\"Math is not a function.\",W064:\"Missing 'new' prefix when invoking a constructor.\",W065:\"Missing radix parameter.\",W066:\"Implied eval. Consider passing a function instead of a string.\",W067:\"Bad invocation.\",W068:\"Wrapping non-IIFE function literals in parens is unnecessary.\",W069:\"['{a}'] is better written in dot notation.\",W070:\"Extra comma. (it breaks older versions of IE)\",W071:\"This function has too many statements. ({a})\",W072:\"This function has too many parameters. ({a})\",W073:\"Blocks are nested too deeply. ({a})\",W074:\"This function's cyclomatic complexity is too high. ({a})\",W075:\"Duplicate {a} '{b}'.\",W076:\"Unexpected parameter '{a}' in get {b} function.\",W077:\"Expected a single parameter in set {a} function.\",W078:\"Setter is defined without getter.\",W079:\"Redefinition of '{a}'.\",W080:\"It's not necessary to initialize '{a}' to 'undefined'.\",W081:null,W082:\"Function declarations should not be placed in blocks. Use a function expression or move the statement to the top of the outer function.\",W083:\"Don't make functions within a loop.\",W084:\"Assignment in conditional expression\",W085:\"Don't use 'with'.\",W086:\"Expected a 'break' statement before '{a}'.\",W087:\"Forgotten 'debugger' statement?\",W088:\"Creating global 'for' variable. Should be 'for (var {a} ...'.\",W089:\"The body of a for in should be wrapped in an if statement to filter unwanted properties from the prototype.\",W090:\"'{a}' is not a statement label.\",W091:\"'{a}' is out of scope.\",W093:\"Did you mean to return a conditional instead of an assignment?\",W094:\"Unexpected comma.\",W095:\"Expected a string and instead saw {a}.\",W096:\"The '{a}' key may produce unexpected results.\",W097:'Use the function form of \"use strict\".',W098:\"'{a}' is defined but never used.\",W099:null,W100:\"This character may get silently deleted by one or more browsers.\",W101:\"Line is too long.\",W102:null,W103:\"The '{a}' property is deprecated.\",W104:\"'{a}' is available in ES6 (use esnext option) or Mozilla JS extensions (use moz).\",W105:\"Unexpected {a} in '{b}'.\",W106:\"Identifier '{a}' is not in camel case.\",W107:\"Script URL.\",W108:\"Strings must use doublequote.\",W109:\"Strings must use singlequote.\",W110:\"Mixed double and single quotes.\",W112:\"Unclosed string.\",W113:\"Control character in string: {a}.\",W114:\"Avoid {a}.\",W115:\"Octal literals are not allowed in strict mode.\",W116:\"Expected '{a}' and instead saw '{b}'.\",W117:\"'{a}' is not defined.\",W118:\"'{a}' is only available in Mozilla JavaScript extensions (use moz option).\",W119:\"'{a}' is only available in ES6 (use esnext option).\",W120:\"You might be leaking a variable ({a}) here.\",W121:\"Extending prototype of native object: '{a}'.\",W122:\"Invalid typeof value '{a}'\",W123:\"'{a}' is already defined in outer scope.\",W124:\"A generator function shall contain a yield statement.\",W125:\"This line contains non-breaking spaces: http://jshint.com/doc/options/#nonbsp\",W126:\"Unnecessary grouping operator.\",W127:\"Unexpected use of a comma operator.\",W128:\"Empty array elements acequire elision=true.\",W129:\"'{a}' is defined in a future version of JavaScript. Use a different variable name to avoid migration issues.\",W130:\"Invalid element after rest element.\",W131:\"Invalid parameter after rest parameter.\"},info={I001:\"Comma warnings can be turned off with 'laxcomma'.\",I002:null,I003:\"ES5 option is now set per default\"};\nexports.errors={},exports.warnings={},exports.info={},_.each(errors,function(desc,code){exports.errors[code]={code:code,desc:desc}}),_.each(warnings,function(desc,code){exports.warnings[code]={code:code,desc:desc}}),_.each(info,function(desc,code){exports.info[code]={code:code,desc:desc}})},{underscore:2}],6:[function(_dereq_,module){\"use strict\";function NameStack(){this._stack=[]}Object.defineProperty(NameStack.prototype,\"length\",{get:function(){return this._stack.length}}),NameStack.prototype.push=function(){this._stack.push(null)},NameStack.prototype.pop=function(){this._stack.pop()},NameStack.prototype.set=function(token){this._stack[this.length-1]=token},NameStack.prototype.infer=function(){var type,nameToken=this._stack[this.length-1],prefix=\"\";return nameToken&&\"class\"!==nameToken.type||(nameToken=this._stack[this.length-2]),nameToken?(type=nameToken.type,\"(string)\"!==type&&\"(number)\"!==type&&\"(identifier)\"!==type&&\"default\"!==type?\"(expression)\":(nameToken.accessorType&&(prefix=nameToken.accessorType+\" \"),prefix+nameToken.value)):\"(empty)\"},module.exports=NameStack},{}],7:[function(_dereq_,module,exports){\"use strict\";exports.bool={enforcing:{bitwise:!0,freeze:!0,camelcase:!0,curly:!0,eqeqeq:!0,futurehostile:!0,notypeof:!0,es3:!0,es5:!0,forin:!0,funcscope:!0,globalstrict:!0,immed:!0,iterator:!0,newcap:!0,noarg:!0,nocomma:!0,noempty:!0,nonbsp:!0,nonew:!0,undef:!0,singleGroups:!1,enforceall:!1},relaxing:{asi:!0,multistr:!0,debug:!0,boss:!0,phantom:!0,evil:!0,plusplus:!0,proto:!0,scripturl:!0,strict:!0,sub:!0,supernew:!0,laxbreak:!0,laxcomma:!0,validthis:!0,withstmt:!0,moz:!0,noyield:!0,eqnull:!0,lastsemic:!0,loopfunc:!0,expr:!0,esnext:!0,elision:!0},environments:{mootools:!0,couch:!0,jasmine:!0,jquery:!0,node:!0,qunit:!0,rhino:!0,shelljs:!0,prototypejs:!0,yui:!0,mocha:!0,wsh:!0,worker:!0,nonstandard:!0,browser:!0,browserify:!0,devel:!0,dojo:!0,typed:!0},obsolete:{onecase:!0,regexp:!0,regexdash:!0}},exports.val={maxlen:!1,indent:!1,maxerr:!1,predef:!1,globals:!1,quotmark:!1,scope:!1,maxstatements:!1,maxdepth:!1,maxparams:!1,maxcomplexity:!1,shadow:!1,unused:!0,latedef:!1,ignore:!1,ignoreDelimiters:!1},exports.inverted={bitwise:!0,forin:!0,newcap:!0,plusplus:!0,regexp:!0,undef:!0,eqeqeq:!0,strict:!0},exports.validNames=Object.keys(exports.val).concat(Object.keys(exports.bool.relaxing)).concat(Object.keys(exports.bool.enforcing)).concat(Object.keys(exports.bool.obsolete)).concat(Object.keys(exports.bool.environments)),exports.renamed={eqeq:\"eqeqeq\",windows:\"wsh\",sloppy:\"strict\"},exports.removed={nomen:!0,onevar:!0,passfail:!0,white:!0,gcl:!0,smarttabs:!0,trailing:!0}},{}],8:[function(_dereq_,module,exports){\"use strict\";exports.unsafeString=/@cc|<\\/?|script|\\]\\s*\\]|<\\s*!|&lt/i,exports.unsafeChars=/[\\u0000-\\u001f\\u007f-\\u009f\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]/,exports.needEsc=/[\\u0000-\\u001f&<\"\\/\\\\\\u007f-\\u009f\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]/,exports.needEscGlobal=/[\\u0000-\\u001f&<\"\\/\\\\\\u007f-\\u009f\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]/g,exports.starSlash=/\\*\\//,exports.identifier=/^([a-zA-Z_$][a-zA-Z0-9_$]*)$/,exports.javascriptURL=/^(?:javascript|jscript|ecmascript|vbscript|livescript)\\s*:/i,exports.fallsThrough=/^\\s*\\/\\*\\s*falls?\\sthrough\\s*\\*\\/\\s*$/,exports.maxlenException=/^(?:(?:\\/\\/|\\/\\*|\\*) ?)?[^ ]+$/},{}],9:[function(_dereq_,module,exports){\"use strict\";var NameStack=_dereq_(\"./name-stack.js\"),state={syntax:{},reset:function(){this.tokens={prev:null,next:null,curr:null},this.option={},this.ignored={},this.directive={},this.jsonMode=!1,this.jsonWarnings=[],this.lines=[],this.tab=\"\",this.cache={},this.ignoredLines={},this.forinifcheckneeded=!1,this.nameStack=new NameStack,this.ignoreLinterErrors=!1}};exports.state=state},{\"./name-stack.js\":6}],10:[function(_dereq_,module,exports){\"use strict\";exports.register=function(linter){linter.on(\"Identifier\",function(data){linter.getOption(\"proto\")||\"__proto__\"===data.name&&linter.warn(\"W103\",{line:data.line,\"char\":data.char,data:[data.name]})}),linter.on(\"Identifier\",function(data){linter.getOption(\"iterator\")||\"__iterator__\"===data.name&&linter.warn(\"W104\",{line:data.line,\"char\":data.char,data:[data.name]})}),linter.on(\"Identifier\",function(data){linter.getOption(\"camelcase\")&&data.name.replace(/^_+|_+$/g,\"\").indexOf(\"_\")>-1&&!data.name.match(/^[A-Z0-9_]*$/)&&linter.warn(\"W106\",{line:data.line,\"char\":data.from,data:[data.name]})}),linter.on(\"String\",function(data){var code,quotmark=linter.getOption(\"quotmark\");quotmark&&(\"single\"===quotmark&&\"'\"!==data.quote&&(code=\"W109\"),\"double\"===quotmark&&'\"'!==data.quote&&(code=\"W108\"),quotmark===!0&&(linter.getCache(\"quotmark\")||linter.setCache(\"quotmark\",data.quote),linter.getCache(\"quotmark\")!==data.quote&&(code=\"W110\")),code&&linter.warn(code,{line:data.line,\"char\":data.char}))}),linter.on(\"Number\",function(data){\".\"===data.value.charAt(0)&&linter.warn(\"W008\",{line:data.line,\"char\":data.char,data:[data.value]}),\".\"===data.value.substr(data.value.length-1)&&linter.warn(\"W047\",{line:data.line,\"char\":data.char,data:[data.value]}),/^00+/.test(data.value)&&linter.warn(\"W046\",{line:data.line,\"char\":data.char,data:[data.value]})}),linter.on(\"String\",function(data){var re=/^(?:javascript|jscript|ecmascript|vbscript|livescript)\\s*:/i;linter.getOption(\"scripturl\")||re.test(data.value)&&linter.warn(\"W107\",{line:data.line,\"char\":data.char})})}},{}],11:[function(_dereq_,module,exports){\"use strict\";exports.reservedVars={arguments:!1,NaN:!1},exports.ecmaIdentifiers={3:{Array:!1,Boolean:!1,Date:!1,decodeURI:!1,decodeURIComponent:!1,encodeURI:!1,encodeURIComponent:!1,Error:!1,eval:!1,EvalError:!1,Function:!1,hasOwnProperty:!1,isFinite:!1,isNaN:!1,Math:!1,Number:!1,Object:!1,parseInt:!1,parseFloat:!1,RangeError:!1,ReferenceError:!1,RegExp:!1,String:!1,SyntaxError:!1,TypeError:!1,URIError:!1},5:{JSON:!1},6:{Map:!1,Promise:!1,Proxy:!1,Reflect:!1,Set:!1,Symbol:!1,WeakMap:!1,WeakSet:!1}},exports.browser={Audio:!1,Blob:!1,addEventListener:!1,applicationCache:!1,atob:!1,blur:!1,btoa:!1,cancelAnimationFrame:!1,CanvasGradient:!1,CanvasPattern:!1,CanvasRenderingContext2D:!1,CSS:!1,clearInterval:!1,clearTimeout:!1,close:!1,closed:!1,Comment:!1,CustomEvent:!1,DOMParser:!1,defaultStatus:!1,Document:!1,document:!1,DocumentFragment:!1,Element:!1,ElementTimeControl:!1,Event:!1,event:!1,FileReader:!1,FormData:!1,focus:!1,frames:!1,getComputedStyle:!1,HTMLElement:!1,HTMLAnchorElement:!1,HTMLBaseElement:!1,HTMLBlockquoteElement:!1,HTMLBodyElement:!1,HTMLBRElement:!1,HTMLButtonElement:!1,HTMLCanvasElement:!1,HTMLDirectoryElement:!1,HTMLDivElement:!1,HTMLDListElement:!1,HTMLFieldSetElement:!1,HTMLFontElement:!1,HTMLFormElement:!1,HTMLFrameElement:!1,HTMLFrameSetElement:!1,HTMLHeadElement:!1,HTMLHeadingElement:!1,HTMLHRElement:!1,HTMLHtmlElement:!1,HTMLIFrameElement:!1,HTMLImageElement:!1,HTMLInputElement:!1,HTMLIsIndexElement:!1,HTMLLabelElement:!1,HTMLLayerElement:!1,HTMLLegendElement:!1,HTMLLIElement:!1,HTMLLinkElement:!1,HTMLMapElement:!1,HTMLMenuElement:!1,HTMLMetaElement:!1,HTMLModElement:!1,HTMLObjectElement:!1,HTMLOListElement:!1,HTMLOptGroupElement:!1,HTMLOptionElement:!1,HTMLParagraphElement:!1,HTMLParamElement:!1,HTMLPreElement:!1,HTMLQuoteElement:!1,HTMLScriptElement:!1,HTMLSelectElement:!1,HTMLStyleElement:!1,HTMLTableCaptionElement:!1,HTMLTableCellElement:!1,HTMLTableColElement:!1,HTMLTableElement:!1,HTMLTableRowElement:!1,HTMLTableSectionElement:!1,HTMLTemplateElement:!1,HTMLTextAreaElement:!1,HTMLTitleElement:!1,HTMLUListElement:!1,HTMLVideoElement:!1,history:!1,Image:!1,Intl:!1,length:!1,localStorage:!1,location:!1,matchMedia:!1,MessageChannel:!1,MessageEvent:!1,MessagePort:!1,MouseEvent:!1,moveBy:!1,moveTo:!1,MutationObserver:!1,name:!1,Node:!1,NodeFilter:!1,NodeList:!1,Notification:!1,navigator:!1,onbeforeunload:!0,onblur:!0,onerror:!0,onfocus:!0,onload:!0,onresize:!0,onunload:!0,open:!1,openDatabase:!1,opener:!1,Option:!1,parent:!1,print:!1,Range:!1,requestAnimationFrame:!1,removeEventListener:!1,resizeBy:!1,resizeTo:!1,screen:!1,scroll:!1,scrollBy:!1,scrollTo:!1,sessionStorage:!1,setInterval:!1,setTimeout:!1,SharedWorker:!1,status:!1,SVGAElement:!1,SVGAltGlyphDefElement:!1,SVGAltGlyphElement:!1,SVGAltGlyphItemElement:!1,SVGAngle:!1,SVGAnimateColorElement:!1,SVGAnimateElement:!1,SVGAnimateMotionElement:!1,SVGAnimateTransformElement:!1,SVGAnimatedAngle:!1,SVGAnimatedBoolean:!1,SVGAnimatedEnumeration:!1,SVGAnimatedInteger:!1,SVGAnimatedLength:!1,SVGAnimatedLengthList:!1,SVGAnimatedNumber:!1,SVGAnimatedNumberList:!1,SVGAnimatedPathData:!1,SVGAnimatedPoints:!1,SVGAnimatedPreserveAspectRatio:!1,SVGAnimatedRect:!1,SVGAnimatedString:!1,SVGAnimatedTransformList:!1,SVGAnimationElement:!1,SVGCSSRule:!1,SVGCircleElement:!1,SVGClipPathElement:!1,SVGColor:!1,SVGColorProfileElement:!1,SVGColorProfileRule:!1,SVGComponentTransferFunctionElement:!1,SVGCursorElement:!1,SVGDefsElement:!1,SVGDescElement:!1,SVGDocument:!1,SVGElement:!1,SVGElementInstance:!1,SVGElementInstanceList:!1,SVGEllipseElement:!1,SVGExternalResourcesRequired:!1,SVGFEBlendElement:!1,SVGFEColorMatrixElement:!1,SVGFEComponentTransferElement:!1,SVGFECompositeElement:!1,SVGFEConvolveMatrixElement:!1,SVGFEDiffuseLightingElement:!1,SVGFEDisplacementMapElement:!1,SVGFEDistantLightElement:!1,SVGFEFloodElement:!1,SVGFEFuncAElement:!1,SVGFEFuncBElement:!1,SVGFEFuncGElement:!1,SVGFEFuncRElement:!1,SVGFEGaussianBlurElement:!1,SVGFEImageElement:!1,SVGFEMergeElement:!1,SVGFEMergeNodeElement:!1,SVGFEMorphologyElement:!1,SVGFEOffsetElement:!1,SVGFEPointLightElement:!1,SVGFESpecularLightingElement:!1,SVGFESpotLightElement:!1,SVGFETileElement:!1,SVGFETurbulenceElement:!1,SVGFilterElement:!1,SVGFilterPrimitiveStandardAttributes:!1,SVGFitToViewBox:!1,SVGFontElement:!1,SVGFontFaceElement:!1,SVGFontFaceFormatElement:!1,SVGFontFaceNameElement:!1,SVGFontFaceSrcElement:!1,SVGFontFaceUriElement:!1,SVGForeignObjectElement:!1,SVGGElement:!1,SVGGlyphElement:!1,SVGGlyphRefElement:!1,SVGGradientElement:!1,SVGHKernElement:!1,SVGICCColor:!1,SVGImageElement:!1,SVGLangSpace:!1,SVGLength:!1,SVGLengthList:!1,SVGLineElement:!1,SVGLinearGradientElement:!1,SVGLocatable:!1,SVGMPathElement:!1,SVGMarkerElement:!1,SVGMaskElement:!1,SVGMatrix:!1,SVGMetadataElement:!1,SVGMissingGlyphElement:!1,SVGNumber:!1,SVGNumberList:!1,SVGPaint:!1,SVGPathElement:!1,SVGPathSeg:!1,SVGPathSegArcAbs:!1,SVGPathSegArcRel:!1,SVGPathSegClosePath:!1,SVGPathSegCurvetoCubicAbs:!1,SVGPathSegCurvetoCubicRel:!1,SVGPathSegCurvetoCubicSmoothAbs:!1,SVGPathSegCurvetoCubicSmoothRel:!1,SVGPathSegCurvetoQuadraticAbs:!1,SVGPathSegCurvetoQuadraticRel:!1,SVGPathSegCurvetoQuadraticSmoothAbs:!1,SVGPathSegCurvetoQuadraticSmoothRel:!1,SVGPathSegLinetoAbs:!1,SVGPathSegLinetoHorizontalAbs:!1,SVGPathSegLinetoHorizontalRel:!1,SVGPathSegLinetoRel:!1,SVGPathSegLinetoVerticalAbs:!1,SVGPathSegLinetoVerticalRel:!1,SVGPathSegList:!1,SVGPathSegMovetoAbs:!1,SVGPathSegMovetoRel:!1,SVGPatternElement:!1,SVGPoint:!1,SVGPointList:!1,SVGPolygonElement:!1,SVGPolylineElement:!1,SVGPreserveAspectRatio:!1,SVGRadialGradientElement:!1,SVGRect:!1,SVGRectElement:!1,SVGRenderingIntent:!1,SVGSVGElement:!1,SVGScriptElement:!1,SVGSetElement:!1,SVGStopElement:!1,SVGStringList:!1,SVGStylable:!1,SVGStyleElement:!1,SVGSwitchElement:!1,SVGSymbolElement:!1,SVGTRefElement:!1,SVGTSpanElement:!1,SVGTests:!1,SVGTextContentElement:!1,SVGTextElement:!1,SVGTextPathElement:!1,SVGTextPositioningElement:!1,SVGTitleElement:!1,SVGTransform:!1,SVGTransformList:!1,SVGTransformable:!1,SVGURIReference:!1,SVGUnitTypes:!1,SVGUseElement:!1,SVGVKernElement:!1,SVGViewElement:!1,SVGViewSpec:!1,SVGZoomAndPan:!1,Text:!1,TextDecoder:!1,TextEncoder:!1,TimeEvent:!1,top:!1,URL:!1,WebGLActiveInfo:!1,WebGLBuffer:!1,WebGLContextEvent:!1,WebGLFramebuffer:!1,WebGLProgram:!1,WebGLRenderbuffer:!1,WebGLRenderingContext:!1,WebGLShader:!1,WebGLShaderPrecisionFormat:!1,WebGLTexture:!1,WebGLUniformLocation:!1,WebSocket:!1,window:!1,Worker:!1,XDomainRequest:!1,XMLHttpRequest:!1,XMLSerializer:!1,XPathEvaluator:!1,XPathException:!1,XPathExpression:!1,XPathNamespace:!1,XPathNSResolver:!1,XPathResult:!1},exports.devel={alert:!1,confirm:!1,console:!1,Debug:!1,opera:!1,prompt:!1},exports.worker={importScripts:!0,postMessage:!0,self:!0,FileReaderSync:!0},exports.nonstandard={escape:!1,unescape:!1},exports.couch={require:!1,respond:!1,getRow:!1,emit:!1,send:!1,start:!1,sum:!1,log:!1,exports:!1,module:!1,provides:!1},exports.node={__filename:!1,__dirname:!1,GLOBAL:!1,global:!1,module:!1,acequire:!1,Buffer:!0,console:!0,exports:!0,process:!0,setTimeout:!0,clearTimeout:!0,setInterval:!0,clearInterval:!0,setImmediate:!0,clearImmediate:!0},exports.browserify={__filename:!1,__dirname:!1,global:!1,module:!1,acequire:!1,Buffer:!0,exports:!0,process:!0},exports.phantom={phantom:!0,acequire:!0,WebPage:!0,console:!0,exports:!0},exports.qunit={asyncTest:!1,deepEqual:!1,equal:!1,expect:!1,module:!1,notDeepEqual:!1,notEqual:!1,notPropEqual:!1,notStrictEqual:!1,ok:!1,propEqual:!1,QUnit:!1,raises:!1,start:!1,stop:!1,strictEqual:!1,test:!1,\"throws\":!1},exports.rhino={defineClass:!1,deserialize:!1,gc:!1,help:!1,importClass:!1,importPackage:!1,java:!1,load:!1,loadClass:!1,Packages:!1,print:!1,quit:!1,readFile:!1,readUrl:!1,runCommand:!1,seal:!1,serialize:!1,spawn:!1,sync:!1,toint32:!1,version:!1},exports.shelljs={target:!1,echo:!1,exit:!1,cd:!1,pwd:!1,ls:!1,find:!1,cp:!1,rm:!1,mv:!1,mkdir:!1,test:!1,cat:!1,sed:!1,grep:!1,which:!1,dirs:!1,pushd:!1,popd:!1,env:!1,exec:!1,chmod:!1,config:!1,error:!1,tempdir:!1},exports.typed={ArrayBuffer:!1,ArrayBufferView:!1,DataView:!1,Float32Array:!1,Float64Array:!1,Int16Array:!1,Int32Array:!1,Int8Array:!1,Uint16Array:!1,Uint32Array:!1,Uint8Array:!1,Uint8ClampedArray:!1},exports.wsh={ActiveXObject:!0,Enumerator:!0,GetObject:!0,ScriptEngine:!0,ScriptEngineBuildVersion:!0,ScriptEngineMajorVersion:!0,ScriptEngineMinorVersion:!0,VBArray:!0,WSH:!0,WScript:!0,XDomainRequest:!0},exports.dojo={dojo:!1,dijit:!1,dojox:!1,define:!1,require:!1},exports.jquery={$:!1,jQuery:!1},exports.mootools={$:!1,$$:!1,Asset:!1,Browser:!1,Chain:!1,Class:!1,Color:!1,Cookie:!1,Core:!1,Document:!1,DomReady:!1,DOMEvent:!1,DOMReady:!1,Drag:!1,Element:!1,Elements:!1,Event:!1,Events:!1,Fx:!1,Group:!1,Hash:!1,HtmlTable:!1,IFrame:!1,IframeShim:!1,InputValidator:!1,instanceOf:!1,Keyboard:!1,Locale:!1,Mask:!1,MooTools:!1,Native:!1,Options:!1,OverText:!1,Request:!1,Scroller:!1,Slick:!1,Slider:!1,Sortables:!1,Spinner:!1,Swiff:!1,Tips:!1,Type:!1,typeOf:!1,URI:!1,Window:!1},exports.prototypejs={$:!1,$$:!1,$A:!1,$F:!1,$H:!1,$R:!1,$break:!1,$continue:!1,$w:!1,Abstract:!1,Ajax:!1,Class:!1,Enumerable:!1,Element:!1,Event:!1,Field:!1,Form:!1,Hash:!1,Insertion:!1,ObjectRange:!1,PeriodicalExecuter:!1,Position:!1,Prototype:!1,Selector:!1,Template:!1,Toggle:!1,Try:!1,Autocompleter:!1,Builder:!1,Control:!1,Draggable:!1,Draggables:!1,Droppables:!1,Effect:!1,Sortable:!1,SortableObserver:!1,Sound:!1,Scriptaculous:!1},exports.yui={YUI:!1,Y:!1,YUI_config:!1},exports.mocha={describe:!1,xdescribe:!1,it:!1,xit:!1,context:!1,xcontext:!1,before:!1,after:!1,beforeEach:!1,afterEach:!1,suite:!1,test:!1,setup:!1,teardown:!1,suiteSetup:!1,suiteTeardown:!1},exports.jasmine={jasmine:!1,describe:!1,it:!1,xit:!1,beforeEach:!1,afterEach:!1,setFixtures:!1,loadFixtures:!1,spyOn:!1,expect:!1,runs:!1,waitsFor:!1,waits:!1,beforeAll:!1,afterAll:!1,fail:!1,fdescribe:!1,fit:!1}},{}],12:[function(_dereq_,module){function EventEmitter(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0}function isFunction(arg){return\"function\"==typeof arg}function isNumber(arg){return\"number\"==typeof arg}function isObject(arg){return\"object\"==typeof arg&&null!==arg}function isUndefined(arg){return void 0===arg}module.exports=EventEmitter,EventEmitter.EventEmitter=EventEmitter,EventEmitter.prototype._events=void 0,EventEmitter.prototype._maxListeners=void 0,EventEmitter.defaultMaxListeners=10,EventEmitter.prototype.setMaxListeners=function(n){if(!isNumber(n)||0>n||isNaN(n))throw TypeError(\"n must be a positive number\");return this._maxListeners=n,this},EventEmitter.prototype.emit=function(type){var er,handler,len,args,i,listeners;if(this._events||(this._events={}),\"error\"===type&&(!this._events.error||isObject(this._events.error)&&!this._events.error.length))throw er=arguments[1],er instanceof Error?er:TypeError('Uncaught, unspecified \"error\" event.');if(handler=this._events[type],isUndefined(handler))return!1;if(isFunction(handler))switch(arguments.length){case 1:handler.call(this);break;case 2:handler.call(this,arguments[1]);break;case 3:handler.call(this,arguments[1],arguments[2]);break;default:for(len=arguments.length,args=Array(len-1),i=1;len>i;i++)args[i-1]=arguments[i];handler.apply(this,args)}else if(isObject(handler)){for(len=arguments.length,args=Array(len-1),i=1;len>i;i++)args[i-1]=arguments[i];for(listeners=handler.slice(),len=listeners.length,i=0;len>i;i++)listeners[i].apply(this,args)}return!0},EventEmitter.prototype.addListener=function(type,listener){var m;if(!isFunction(listener))throw TypeError(\"listener must be a function\");if(this._events||(this._events={}),this._events.newListener&&this.emit(\"newListener\",type,isFunction(listener.listener)?listener.listener:listener),this._events[type]?isObject(this._events[type])?this._events[type].push(listener):this._events[type]=[this._events[type],listener]:this._events[type]=listener,isObject(this._events[type])&&!this._events[type].warned){var m;m=isUndefined(this._maxListeners)?EventEmitter.defaultMaxListeners:this._maxListeners,m&&m>0&&this._events[type].length>m&&(this._events[type].warned=!0,console.error(\"(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.\",this._events[type].length),\"function\"==typeof console.trace&&console.trace())}return this},EventEmitter.prototype.on=EventEmitter.prototype.addListener,EventEmitter.prototype.once=function(type,listener){function g(){this.removeListener(type,g),fired||(fired=!0,listener.apply(this,arguments))}if(!isFunction(listener))throw TypeError(\"listener must be a function\");var fired=!1;return g.listener=listener,this.on(type,g),this},EventEmitter.prototype.removeListener=function(type,listener){var list,position,length,i;if(!isFunction(listener))throw TypeError(\"listener must be a function\");if(!this._events||!this._events[type])return this;if(list=this._events[type],length=list.length,position=-1,list===listener||isFunction(list.listener)&&list.listener===listener)delete this._events[type],this._events.removeListener&&this.emit(\"removeListener\",type,listener);else if(isObject(list)){for(i=length;i-->0;)if(list[i]===listener||list[i].listener&&list[i].listener===listener){position=i;break}if(0>position)return this;1===list.length?(list.length=0,delete this._events[type]):list.splice(position,1),this._events.removeListener&&this.emit(\"removeListener\",type,listener)}return this},EventEmitter.prototype.removeAllListeners=function(type){var key,listeners;if(!this._events)return this;if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[type]&&delete this._events[type],this;if(0===arguments.length){for(key in this._events)\"removeListener\"!==key&&this.removeAllListeners(key);return this.removeAllListeners(\"removeListener\"),this._events={},this}if(listeners=this._events[type],isFunction(listeners))this.removeListener(type,listeners);else for(;listeners.length;)this.removeListener(type,listeners[listeners.length-1]);return delete this._events[type],this},EventEmitter.prototype.listeners=function(type){var ret;return ret=this._events&&this._events[type]?isFunction(this._events[type])?[this._events[type]]:this._events[type].slice():[]},EventEmitter.listenerCount=function(emitter,type){var ret;return ret=emitter._events&&emitter._events[type]?isFunction(emitter._events[type])?1:emitter._events[type].length:0}},{}]},{},[3])(3)}),ace.define(\"ace/mode/javascript_worker\",[\"require\",\"exports\",\"module\",\"ace/lib/oop\",\"ace/worker/mirror\",\"ace/mode/javascript/jshint\"],function(acequire,exports,module){\"use strict\";function startRegex(arr){return RegExp(\"^(\"+arr.join(\"|\")+\")\")}var oop=acequire(\"../lib/oop\"),Mirror=acequire(\"../worker/mirror\").Mirror,lint=acequire(\"./javascript/jshint\").JSHINT,disabledWarningsRe=startRegex([\"Bad for in variable '(.+)'.\",'Missing \"use strict\"']),errorsRe=startRegex([\"Unexpected\",\"Expected \",\"Confusing (plus|minus)\",\"\\\\{a\\\\} unterminated regular expression\",\"Unclosed \",\"Unmatched \",\"Unbegun comment\",\"Bad invocation\",\"Missing space after\",\"Missing operator at\"]),infoRe=startRegex([\"Expected an assignment\",\"Bad escapement of EOL\",\"Unexpected comma\",\"Unexpected space\",\"Missing radix parameter.\",\"A leading decimal point can\",\"\\\\['{a}'\\\\] is better written in dot notation.\",\"'{a}' used out of scope\"]),JavaScriptWorker=exports.JavaScriptWorker=function(sender){Mirror.call(this,sender),this.setTimeout(500),this.setOptions()};oop.inherits(JavaScriptWorker,Mirror),function(){this.setOptions=function(options){this.options=options||{esnext:!0,moz:!0,devel:!0,browser:!0,node:!0,laxcomma:!0,laxbreak:!0,lastsemic:!0,onevar:!1,passfail:!1,maxerr:100,expr:!0,multistr:!0,globalstrict:!0},this.doc.getValue()&&this.deferredUpdate.schedule(100)},this.changeOptions=function(newOptions){oop.mixin(this.options,newOptions),this.doc.getValue()&&this.deferredUpdate.schedule(100)},this.isValidJS=function(str){try{eval(\"throw 0;\"+str)}catch(e){if(0===e)return!0}return!1},this.onUpdate=function(){var value=this.doc.getValue();if(value=value.replace(/^#!.*\\n/,\"\\n\"),!value)return this.sender.emit(\"annotate\",[]);var errors=[],maxErrorLevel=this.isValidJS(value)?\"warning\":\"error\";lint(value,this.options);for(var results=lint.errors,errorAdded=!1,i=0;results.length>i;i++){var error=results[i];if(error){var raw=error.raw,type=\"warning\";if(\"Missing semicolon.\"==raw){var str=error.evidence.substr(error.character);str=str.charAt(str.search(/\\S/)),\"error\"==maxErrorLevel&&str&&/[\\w\\d{(['\"]/.test(str)?(error.reason='Missing \";\" before statement',type=\"error\"):type=\"info\"}else{if(disabledWarningsRe.test(raw))continue;infoRe.test(raw)?type=\"info\":errorsRe.test(raw)?(errorAdded=!0,type=maxErrorLevel):\"'{a}' is not defined.\"==raw?type=\"warning\":\"'{a}' is defined but never used.\"==raw&&(type=\"info\")}errors.push({row:error.line-1,column:error.character-1,text:error.reason,type:type,raw:raw})}}this.sender.emit(\"annotate\",errors)}}.call(JavaScriptWorker.prototype)}),ace.define(\"ace/lib/es5-shim\",[\"require\",\"exports\",\"module\"],function(){function Empty(){}function doesDefinePropertyWork(object){try{return Object.defineProperty(object,\"sentinel\",{}),\"sentinel\"in object}catch(exception){}}function toInteger(n){return n=+n,n!==n?n=0:0!==n&&n!==1/0&&n!==-(1/0)&&(n=(n>0||-1)*Math.floor(Math.abs(n))),n}Function.prototype.bind||(Function.prototype.bind=function(that){var target=this;if(\"function\"!=typeof target)throw new TypeError(\"Function.prototype.bind called on incompatible \"+target);var args=slice.call(arguments,1),bound=function(){if(this instanceof bound){var result=target.apply(this,args.concat(slice.call(arguments)));return Object(result)===result?result:this}return target.apply(that,args.concat(slice.call(arguments)))};return target.prototype&&(Empty.prototype=target.prototype,bound.prototype=new Empty,Empty.prototype=null),bound});var defineGetter,defineSetter,lookupGetter,lookupSetter,supportsAccessors,call=Function.prototype.call,prototypeOfArray=Array.prototype,prototypeOfObject=Object.prototype,slice=prototypeOfArray.slice,_toString=call.bind(prototypeOfObject.toString),owns=call.bind(prototypeOfObject.hasOwnProperty);if((supportsAccessors=owns(prototypeOfObject,\"__defineGetter__\"))&&(defineGetter=call.bind(prototypeOfObject.__defineGetter__),defineSetter=call.bind(prototypeOfObject.__defineSetter__),lookupGetter=call.bind(prototypeOfObject.__lookupGetter__),lookupSetter=call.bind(prototypeOfObject.__lookupSetter__)),2!=[1,2].splice(0).length)if(function(){function makeArray(l){var a=Array(l+2);return a[0]=a[1]=0,a}var lengthBefore,array=[];return array.splice.apply(array,makeArray(20)),array.splice.apply(array,makeArray(26)),lengthBefore=array.length,array.splice(5,0,\"XXX\"),lengthBefore+1==array.length,lengthBefore+1==array.length?!0:void 0}()){var array_splice=Array.prototype.splice;Array.prototype.splice=function(start,deleteCount){return arguments.length?array_splice.apply(this,[void 0===start?0:start,void 0===deleteCount?this.length-start:deleteCount].concat(slice.call(arguments,2))):[]}}else Array.prototype.splice=function(pos,removeCount){var length=this.length;pos>0?pos>length&&(pos=length):void 0==pos?pos=0:0>pos&&(pos=Math.max(length+pos,0)),length>pos+removeCount||(removeCount=length-pos);var removed=this.slice(pos,pos+removeCount),insert=slice.call(arguments,2),add=insert.length;if(pos===length)add&&this.push.apply(this,insert);else{var remove=Math.min(removeCount,length-pos),tailOldPos=pos+remove,tailNewPos=tailOldPos+add-remove,tailCount=length-tailOldPos,lengthAfterRemove=length-remove;if(tailOldPos>tailNewPos)for(var i=0;tailCount>i;++i)this[tailNewPos+i]=this[tailOldPos+i];else if(tailNewPos>tailOldPos)for(i=tailCount;i--;)this[tailNewPos+i]=this[tailOldPos+i];if(add&&pos===lengthAfterRemove)this.length=lengthAfterRemove,this.push.apply(this,insert);else for(this.length=lengthAfterRemove+add,i=0;add>i;++i)this[pos+i]=insert[i]}return removed};Array.isArray||(Array.isArray=function(obj){return\"[object Array]\"==_toString(obj)});var boxedString=Object(\"a\"),splitString=\"a\"!=boxedString[0]||!(0 in boxedString);if(Array.prototype.forEach||(Array.prototype.forEach=function(fun){var object=toObject(this),self=splitString&&\"[object String]\"==_toString(this)?this.split(\"\"):object,thisp=arguments[1],i=-1,length=self.length>>>0;if(\"[object Function]\"!=_toString(fun))throw new TypeError;for(;length>++i;)i in self&&fun.call(thisp,self[i],i,object)}),Array.prototype.map||(Array.prototype.map=function(fun){var object=toObject(this),self=splitString&&\"[object String]\"==_toString(this)?this.split(\"\"):object,length=self.length>>>0,result=Array(length),thisp=arguments[1];if(\"[object Function]\"!=_toString(fun))throw new TypeError(fun+\" is not a function\");for(var i=0;length>i;i++)i in self&&(result[i]=fun.call(thisp,self[i],i,object));return result}),Array.prototype.filter||(Array.prototype.filter=function(fun){var value,object=toObject(this),self=splitString&&\"[object String]\"==_toString(this)?this.split(\"\"):object,length=self.length>>>0,result=[],thisp=arguments[1];if(\"[object Function]\"!=_toString(fun))throw new TypeError(fun+\" is not a function\");for(var i=0;length>i;i++)i in self&&(value=self[i],fun.call(thisp,value,i,object)&&result.push(value));return result}),Array.prototype.every||(Array.prototype.every=function(fun){var object=toObject(this),self=splitString&&\"[object String]\"==_toString(this)?this.split(\"\"):object,length=self.length>>>0,thisp=arguments[1];if(\"[object Function]\"!=_toString(fun))throw new TypeError(fun+\" is not a function\");for(var i=0;length>i;i++)if(i in self&&!fun.call(thisp,self[i],i,object))return!1;return!0}),Array.prototype.some||(Array.prototype.some=function(fun){var object=toObject(this),self=splitString&&\"[object String]\"==_toString(this)?this.split(\"\"):object,length=self.length>>>0,thisp=arguments[1];if(\"[object Function]\"!=_toString(fun))throw new TypeError(fun+\" is not a function\");for(var i=0;length>i;i++)if(i in self&&fun.call(thisp,self[i],i,object))return!0;return!1}),Array.prototype.reduce||(Array.prototype.reduce=function(fun){var object=toObject(this),self=splitString&&\"[object String]\"==_toString(this)?this.split(\"\"):object,length=self.length>>>0;if(\"[object Function]\"!=_toString(fun))throw new TypeError(fun+\" is not a function\");if(!length&&1==arguments.length)throw new TypeError(\"reduce of empty array with no initial value\");var result,i=0;if(arguments.length>=2)result=arguments[1];else for(;;){if(i in self){result=self[i++];break}if(++i>=length)throw new TypeError(\"reduce of empty array with no initial value\")}for(;length>i;i++)i in self&&(result=fun.call(void 0,result,self[i],i,object));return result}),Array.prototype.reduceRight||(Array.prototype.reduceRight=function(fun){var object=toObject(this),self=splitString&&\"[object String]\"==_toString(this)?this.split(\"\"):object,length=self.length>>>0;if(\"[object Function]\"!=_toString(fun))throw new TypeError(fun+\" is not a function\");if(!length&&1==arguments.length)throw new TypeError(\"reduceRight of empty array with no initial value\");var result,i=length-1;if(arguments.length>=2)result=arguments[1];else for(;;){if(i in self){result=self[i--];break}if(0>--i)throw new TypeError(\"reduceRight of empty array with no initial value\")}do i in this&&(result=fun.call(void 0,result,self[i],i,object));while(i--);return result}),Array.prototype.indexOf&&-1==[0,1].indexOf(1,2)||(Array.prototype.indexOf=function(sought){var self=splitString&&\"[object String]\"==_toString(this)?this.split(\"\"):toObject(this),length=self.length>>>0;if(!length)return-1;var i=0;for(arguments.length>1&&(i=toInteger(arguments[1])),i=i>=0?i:Math.max(0,length+i);length>i;i++)if(i in self&&self[i]===sought)return i;return-1}),Array.prototype.lastIndexOf&&-1==[0,1].lastIndexOf(0,-3)||(Array.prototype.lastIndexOf=function(sought){var self=splitString&&\"[object String]\"==_toString(this)?this.split(\"\"):toObject(this),length=self.length>>>0;if(!length)return-1;var i=length-1;for(arguments.length>1&&(i=Math.min(i,toInteger(arguments[1]))),i=i>=0?i:length-Math.abs(i);i>=0;i--)if(i in self&&sought===self[i])return i;return-1}),Object.getPrototypeOf||(Object.getPrototypeOf=function(object){return object.__proto__||(object.constructor?object.constructor.prototype:prototypeOfObject)}),!Object.getOwnPropertyDescriptor){var ERR_NON_OBJECT=\"Object.getOwnPropertyDescriptor called on a non-object: \";Object.getOwnPropertyDescriptor=function(object,property){if(\"object\"!=typeof object&&\"function\"!=typeof object||null===object)throw new TypeError(ERR_NON_OBJECT+object);if(owns(object,property)){var descriptor,getter,setter;if(descriptor={enumerable:!0,configurable:!0},supportsAccessors){var prototype=object.__proto__;object.__proto__=prototypeOfObject;var getter=lookupGetter(object,property),setter=lookupSetter(object,property);if(object.__proto__=prototype,getter||setter)return getter&&(descriptor.get=getter),setter&&(descriptor.set=setter),descriptor}return descriptor.value=object[property],descriptor}}}if(Object.getOwnPropertyNames||(Object.getOwnPropertyNames=function(object){return Object.keys(object)}),!Object.create){var createEmpty;createEmpty=null===Object.prototype.__proto__?function(){return{__proto__:null}}:function(){var empty={};for(var i in empty)empty[i]=null;return empty.constructor=empty.hasOwnProperty=empty.propertyIsEnumerable=empty.isPrototypeOf=empty.toLocaleString=empty.toString=empty.valueOf=empty.__proto__=null,empty},Object.create=function(prototype,properties){var object;if(null===prototype)object=createEmpty();else{if(\"object\"!=typeof prototype)throw new TypeError(\"typeof prototype[\"+typeof prototype+\"] != 'object'\");var Type=function(){};Type.prototype=prototype,object=new Type,object.__proto__=prototype}return void 0!==properties&&Object.defineProperties(object,properties),object}}if(Object.defineProperty){var definePropertyWorksOnObject=doesDefinePropertyWork({}),definePropertyWorksOnDom=\"undefined\"==typeof document||doesDefinePropertyWork(document.createElement(\"div\"));if(!definePropertyWorksOnObject||!definePropertyWorksOnDom)var definePropertyFallback=Object.defineProperty}if(!Object.defineProperty||definePropertyFallback){var ERR_NON_OBJECT_DESCRIPTOR=\"Property description must be an object: \",ERR_NON_OBJECT_TARGET=\"Object.defineProperty called on non-object: \",ERR_ACCESSORS_NOT_SUPPORTED=\"getters & setters can not be defined on this javascript engine\";\nObject.defineProperty=function(object,property,descriptor){if(\"object\"!=typeof object&&\"function\"!=typeof object||null===object)throw new TypeError(ERR_NON_OBJECT_TARGET+object);if(\"object\"!=typeof descriptor&&\"function\"!=typeof descriptor||null===descriptor)throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR+descriptor);if(definePropertyFallback)try{return definePropertyFallback.call(Object,object,property,descriptor)}catch(exception){}if(owns(descriptor,\"value\"))if(supportsAccessors&&(lookupGetter(object,property)||lookupSetter(object,property))){var prototype=object.__proto__;object.__proto__=prototypeOfObject,delete object[property],object[property]=descriptor.value,object.__proto__=prototype}else object[property]=descriptor.value;else{if(!supportsAccessors)throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);owns(descriptor,\"get\")&&defineGetter(object,property,descriptor.get),owns(descriptor,\"set\")&&defineSetter(object,property,descriptor.set)}return object}}Object.defineProperties||(Object.defineProperties=function(object,properties){for(var property in properties)owns(properties,property)&&Object.defineProperty(object,property,properties[property]);return object}),Object.seal||(Object.seal=function(object){return object}),Object.freeze||(Object.freeze=function(object){return object});try{Object.freeze(function(){})}catch(exception){Object.freeze=function(freezeObject){return function(object){return\"function\"==typeof object?object:freezeObject(object)}}(Object.freeze)}if(Object.preventExtensions||(Object.preventExtensions=function(object){return object}),Object.isSealed||(Object.isSealed=function(){return!1}),Object.isFrozen||(Object.isFrozen=function(){return!1}),Object.isExtensible||(Object.isExtensible=function(object){if(Object(object)===object)throw new TypeError;for(var name=\"\";owns(object,name);)name+=\"?\";object[name]=!0;var returnValue=owns(object,name);return delete object[name],returnValue}),!Object.keys){var hasDontEnumBug=!0,dontEnums=[\"toString\",\"toLocaleString\",\"valueOf\",\"hasOwnProperty\",\"isPrototypeOf\",\"propertyIsEnumerable\",\"constructor\"],dontEnumsLength=dontEnums.length;for(var key in{toString:null})hasDontEnumBug=!1;Object.keys=function(object){if(\"object\"!=typeof object&&\"function\"!=typeof object||null===object)throw new TypeError(\"Object.keys called on a non-object\");var keys=[];for(var name in object)owns(object,name)&&keys.push(name);if(hasDontEnumBug)for(var i=0,ii=dontEnumsLength;ii>i;i++){var dontEnum=dontEnums[i];owns(object,dontEnum)&&keys.push(dontEnum)}return keys}}Date.now||(Date.now=function(){return(new Date).getTime()});var ws=\"\t\\n\u000b\\f\\r   ᠎             　\\u2028\\u2029﻿\";if(!String.prototype.trim||ws.trim()){ws=\"[\"+ws+\"]\";var trimBeginRegexp=RegExp(\"^\"+ws+ws+\"*\"),trimEndRegexp=RegExp(ws+ws+\"*$\");String.prototype.trim=function(){return(this+\"\").replace(trimBeginRegexp,\"\").replace(trimEndRegexp,\"\")}}var toObject=function(o){if(null==o)throw new TypeError(\"can't convert \"+o+\" to object\");return Object(o)}});";
},{}],"C:\\Users\\pitch\\functional-visualiser\\node_modules\\browserify\\node_modules\\events\\events.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],"C:\\Users\\pitch\\functional-visualiser\\public\\docs\\earlyDeliverable.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var earlyDeliverable = {

	title: 'Early Deliverable',
	body: '\n\nAny references I make to folders or files in the code base can be followed through in my work-in-progress GitHub repository here:\n\n[https://github.com/breakingco/functional-visualiser](https://github.com/breakingco/functional-visualiser)\n\n#Problem analysis\nIn order to successfully implement this prototypal visual representation and comparison of functional versus imperative programs, through my initial research I have broken down the problem into what I believe are the individual components which all **must** be separately addressed in order to achieve minimum functionality. These are written here outside of technology considerations needed for actual implementation, and can be broken down into three areas:\n\n##Infrastructure\n- writing a simple back-end server to serve the initial webpage of the single-page application (SPA); \n- creating a build system / workflow for development:\n\t- on the back-end, server simulation for development and automatic restarting of the server simulator when server code changes; and\n\t- on the front-end, automatic transpilation of code that is not browser native, and refreshing of the browser, on code change; \n\n##Parsing and data creation for visual content generation\n- choosing a language and parser library to create an abstract syntax tree (AST) of the functional/imperative code samples which are to be displayed, and then:\n- deciding whether to use the resulting syntax tree as-is on the front end and plucking certain values from the structure to dictate what visual components display, or evaluating each step and then transforming each into a simpler subset that creates a data structure with a more direct description of visual components, if necessary;\n\t-  determining how to traverse the resulting data structure in a sequential order;\n\t-  determining how to dynamically evaluate the code at each step in a flexible manner to create the representations for visual display (i.e., if possible not have to separately code a process for every type of instruction in the code, which would still break as soon as new features were added to the code\'s language);\n-  the security concerns of evaluating this code: deciding whether outside code beyond the simple written examples should be loadable, and whether this parsing should be implemented on the frontend or backend; and\n- writing sample code in both functional and imperative styles for the purpose of providing content to the parser.\n\n##Visual display of data\n - Designing a skeleton interface for the app;\n - Designing the visualization and deciding how each step of a program should be shown in a layout that best represents the flow of data, and also in a way that highlights the difference between functionally and imperatively \'guided\' data flow\n - Creating an engine for displaying the elements of the program (e.g., a function, a variable, an \'if\' statement, the passing of a parameter from one function to another), in a way that creates a base whereby each new element can be added one by one as a \'building block\' component to gradually build up the functionality of the visualization;\n - Creating and styling a component and animation for each \'building block\';\n - Deciding whether any other features should be present (e.g., giving the ability for a user to upload their own code for evaluation, changing the speed of the code stepping through, changing ways in which the code could be viewed).\n\n#Technology survey\nAt this stage, my time has been mainly spent investigating, evaluating and learning the various technologies that I have decided to use for this project, and completing the build system aspect. I have spent the past year working exclusively using the AngularJS framework daily for my year-long internship working in front-end development, but did not want to use this framework for the project. Rather, I wanted to take this opportunity away from work to learn new tools and frameworks that could expose me to a greater range of workflows, with the possibility to then recommend and eventually use these back in my professional work.\n\n##Language choice\nMy plan has been quite ambitious, with my scope of new learning needing to have been reduced somewhat given the time allowed. I have decided to switch from using Clojure on the backend to JavaScript. Although I would like to learn to code in a purely functional style using Clojure, it is not technically necessary for this task, so long as the language used gives me the ability to create code samples in a functional style so that it can be compared to the same code written in an imperative style.\n\nJavaScript still has higher-order functions and  has many powerful built-in functional features, so is suitable for this task. The first prototypal example of a functional/imperative example can be found [here](https://github.com/breakingco/functional-visualiser/tree/master/modules/examples).\n\nThis is just a sum function and very basic, but I think ultimately these will need to be fairly simple as the limiting factor will be how well the UI can express the differences between the two kinds of functions - in this work I potentially don\'t anticipate writing more complex functions, rather just piping some array through a series of these simple transformations and then spending more time working on the interface to actually display these.\n\n##Stack\nI have chosen to use an isomorphic JavaScript setup, whereby the frontend and backend share the same codebase and are written in the same language. Using NodeJS on the backend and Browserify on the frontend to compile library and written JavaScript into a single file for serving to the browser, I can use Node\'s included and popular package manager, npm, to manage a single set of library dependencies usable by both the frontend and backend.\n\nI have also chosen to use the newest version of Javascript, ES6, on both the frontend and backend.  This is mainly to take advantage of its new module system. Although it has added more time to my initial research stage getting to grips with it, the idea was that it should give me a clean way to organise and package the code for each new visual \'building block\' as mentioned above as I create and add them to the project.\n\n##Other choices\nBesides these major choices, below is a summary of the technologies I have researched and chosen, along with notes on how completely they are investigated or integrated into my project.\n\n- SASS, a CSS pre-processor which enables me to more neatly package the related style class information up with each component as I create them.\n- BrowserSync, for live-reloading of the browser;\n- Gulp, a build tool . This automates the watching of my codebase for changes, and accordingly re-runs associated necessary preparation tasks (to create the content in `/public/build`. The code in `gulpfile.js` was written from scratch so I now can fully use this tool.\n- D3, for taking the AST data steps and calculating the layout for each display component.\n- React (with JSX for allowing HTML-like syntax in Javascript), for creating the base interface - it should have a fairly minimal involvement in this project given that D3 will be doing most of the work.\n- acorn, for generating an estree-spec AST. I investigated and tried the newer Shift-AST format, but there is less documentation and tools available for it so I think I should go with the established JS AST creator for now.\n\n#Proposed methodology\nSo far I have learned how to use ES6, enough Node to set up the basic server and put the build system and folder structure in place. I am now further breaking down the tasks from \'Proposed Analysis\' using [trello.com](trello.com), a simple project management app. A rough summary of the steps to follow are:\n\n- visually design the interface layout on paper;\n- decide how D3 should manage this layout using pre-provided functionality wherever possible.\n\t- The D3 force-layout graph would seem like a good choice for representing the AST of a whole program (and was what I originally hoped to present as a prototype here), but it does not lend itself to displaying the actual flow of data through a time-based sequence. However, none of the baked-in graphs supplied with D3 seem to be good for this, so I think I will have to create this myself, somehow.\n- create visual function components by:\n\t- designing the first component (representing a function) in the frontend, and displaying it using D3 (this is currently most basically implemented without any style/design yet in `/public/modules/components/functionBlock`.\n\t-  parse and examine the AST from my simplest function `sumDemo` examples (in `/modules/examples`) and decide how to map the AST information given to that particular frontend-created component;\n\t-  add that information to the D3 engine so as to adjust the layout to accommodate it or that component.\n\nI would then iterate through the above for each new component, adding functionality to the D3 engine as I went. I don\'t think it will become apparent as to how best to step through the actual code, evaluate it and animate the changes in the D3 graph until I have a few of these components to play with.\n\n#Risk factors\n##Minimum functionality\nOne of the hard things here is choosing some bare minimum of functionality, and then trying to build upon it to the stage where a program can be represented. I don\'t think it would be possible to create visual representations for every aspect of a Javascript program for this project, but I will need some engine underneath that can accept new components (basically, an HTML/CSS/JS \'block\' that represents a single aspect of the program) and can incorporate it into the layout in a more generic fashion.\n\n##Visual design\nHow best to represent the passage of data in a functional manner, in a layout that highlights how functional programming is \'functional\' seems to be a fairly unique proposition. At the core I see a comparison and contrast, whereby representations of the same program coded functionally and imperatively are shown side by side, with the visualization for the imperative one somehow appearing more \'messy\' or \'displeasing\' to highlight the comparative elegance of the functional version.\n\nIdeally, a number of prototypes would be built and tweaked to evaluate the best, but I will probably need to settle upon one way of attempting this shortly and just go with it.\n\nIn the time available, I plan to first very simply represent the AST of the same program, one coded functionally and one imperatively,  using two D3 force-directed graphs side by side. Then, I can try as a first step to perhaps dynamically show the clean passing of variables as parameters between functions in the functional version, whilst the global variables in the imperative version could perhaps be \'floating\' outside the functions, and could perhaps flash red if modified by a function with a different scope to show undesired side effects. Even to get to this stage though will still take some time due to the functionality that must be in place underneath, so I am concerned about not ending up with anything near a complete representation in the time period.\n\n##Evaluating and representing data flow through AST representation\nWhilst I think that mapping out the display of a single AST in D3 is more a question of time than complexity (just creating a visual component for each function, a variable, etc, and the relevant part of the AST that causes it to appear), trying to determine how to actually evaluate and step through the tree in a sequential fashion mimicking the actual operation of a program (\'meta programming\') and displaying an update to the graph seems to be quite challenging.'
};

exports['default'] = earlyDeliverable;
module.exports = exports['default'];

},{}],"C:\\Users\\pitch\\functional-visualiser\\public\\index.jsx":[function(require,module,exports){
'use strict';
/* Single declaration point to instantiate React app
   and ensure that the React library is only imported
   as a single instance and then re-used by child components.
 */

function _interopRequireDefault(obj) {
   return obj && obj.__esModule ? obj : { 'default': obj };
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactComponentsAppJsx = require('./reactComponents/App.jsx');

var _reactComponentsAppJsx2 = _interopRequireDefault(_reactComponentsAppJsx);

_react2['default'].render(_react2['default'].createElement(_reactComponentsAppJsx2['default'], null), document.getElementById('root'));

},{"./reactComponents/App.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\App.jsx","react":"react"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\astTools\\astTools.js":[function(require,module,exports){
'use strict';

/* helper tools for various AST transforms. */

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

var _acorn = require('acorn');

var _estraverse = require('estraverse');

var _estraverse2 = _interopRequireDefault(_estraverse);

var _lodash = require('lodash');

var escodegen = require('escodegen');

var ace = require('brace');
var Range = ace.acequire('ace/range').Range;

function astTools() {

  function createAst(codeToParse, createLocations) {
    var parseString = typeof codeToParse === 'Function' ? codeToParse.toString() : codeToParse;
    return (0, _acorn.parse)(parseString, {
      locations: createLocations
    });
  }

  function createCode(ast, options) {
    return escodegen.generate(ast, options);
  }

  // check whether function is an
  // immediately invokable function expression (IIFE)
  // and if not, wrap it with one for the interpreter.
  // The wrapping function is hidden, unless the code
  // is imported to the editor via the pre-written examples.
  function getRunCodeString(codeString) {
    var runFuncString = codeString;
    if (codeString.slice(0, 1) !== '(' || !(codeString.slice(-1) === ')' || codeString.slice(-2) === ');' || codeString.slice(-4) === '());')) {
      if (!(codeString.slice(-1) === '}' || codeString.slice(-2) === '};')) {
        // allow for commands typed in directly without enclosing function
        runFuncString = '(function Program() { ' + codeString + ' })();';
      } else {
        // parse typed function as IIFE for interpreter
        runFuncString = '(' + codeString + ')();';
      }
    }
    return runFuncString;
  }

  function getId(node) {
    switch (node.type) {
      case 'Literal':
        return node.value.toString();
      case 'Identifier':
        return node.name;
      case 'CallExpression':
        return node.callee.name;
      case 'FunctionDeclaration':
        return node.id.name;
      case 'FunctionExpression':
        return node.id;
      case 'MemberExpression':
      case 'BinaryExpression':
        return createCode(node);
      default:
        console.error('unrecognised astType');
    }
  }

  function getArgs(node) {
    switch (node.type) {
      case 'CallExpression':
        return node.arguments;
      case 'FunctionDeclaration':
      case 'FunctionExpression':
        return node.params;
      default:
        return null;
    }
  }

  function getCodeRange(node) {
    if (node) {
      var loc = node.loc;
      var range = new Range(loc.start.line - 1, loc.start.column, loc.end.line - 1, loc.end.column);
      return range;
    }
    return null;
  }

  function createsNewFunctionScope(node) {
    // Expression statement?
    return node.type === 'Program' || node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression';
  }

  function getFirstActionSteps(node) {
    if (node.type === 'FunctionDeclaration') {
      return node.body.body;
    } else if (node.type === 'Program' && node.body[0].type === 'FunctionDeclaration') {
      return node.body[0].body.body;
    }
    console.error('unrecognised scope passed in');
  }

  function addScopeInfo(ast) {
    _estraverse2['default'].traverse(ast, {
      enter: function enter(node) {
        if (createsNewFunctionScope(node)) {
          node.scopeInfo = {
            id: 'scope' + functionNodes.length + 'function' + node.id.name,
            parent: node.type === 'Program' ? null : (0, _lodash.last)(functionNodes)
          };
        }
      }
    });
    return ast;
  }

  function createFunctionNodes(ast) {
    var functionNodes = [];
    _estraverse2['default'].traverse(ast, {
      enter: function enter(node) {
        if (createsNewFunctionScope(node)) {
          functionNodes.push(node);
        }
      }
    });
    return functionNodes;
  }

  function typeIsSupported(type) {
    if (!(type === 'Identifier' || type === 'FunctionExpression')) {
      throw new Error('Only Identifier variable types supported for static proof of concept.');
    }
    return true;
  }

  function getCalleeName(node) {
    if (node.callee.type === 'FunctionExpression') {
      return node.callee.id.name;
    }
    if (node.callee.type === 'Identifier') {
      return node.callee.name;
    }
    if (node.callee.type === 'MemberExpression') {
      return getEndMemberExpression(node.callee);
    }
    throw new Error('couldn\'t get callee name');
  }

  function getEndMemberExpression(node) {
    var _ = node;
    while (_.object) {
      _ = _.object;
    }
    return _.name;
  }

  return {
    astTools: astTools, createAst: createAst, createCode: createCode, getRunCodeString: getRunCodeString, getId: getId,
    getArgs: getArgs, createsNewFunctionScope: createsNewFunctionScope,
    addScopeInfo: addScopeInfo, getFirstActionSteps: getFirstActionSteps, typeIsSupported: typeIsSupported,
    getCodeRange: getCodeRange, getCalleeName: getCalleeName, getEndMemberExpression: getEndMemberExpression
  };
}

exports['default'] = astTools();
module.exports = exports['default'];

},{"acorn":"acorn","brace":"brace","escodegen":"escodegen","estraverse":"estraverse","lodash":"lodash"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\Sequencer\\Sequencer.js":[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i['return']) _i['return']();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError('Invalid attempt to destructure non-iterable instance');
    }
  };
})();

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

var _lodash = require('lodash');

var _storesCodeStoreJs = require('../../stores/CodeStore.js');

var _storesCodeStoreJs2 = _interopRequireDefault(_storesCodeStoreJs);

var _storesCodeStatusStoreJs = require('../../stores/CodeStatusStore.js');

var _storesCodeStatusStoreJs2 = _interopRequireDefault(_storesCodeStatusStoreJs);

var _storesSequencerStoreJs = require('../../stores/SequencerStore.js');

var _storesSequencerStoreJs2 = _interopRequireDefault(_storesSequencerStoreJs);

var _vendor_modJSInterpreterInterpreterJs = require('../../vendor_mod/JS-Interpreter/interpreter.js');

var _vendor_modJSInterpreterInterpreterJs2 = _interopRequireDefault(_vendor_modJSInterpreterInterpreterJs);

var _jsInterpreterInitJsInterpreterInitJs = require('../jsInterpreterInit/jsInterpreterInit.js');

var _jsInterpreterInitJsInterpreterInitJs2 = _interopRequireDefault(_jsInterpreterInitJsInterpreterInitJs);

var _astToolsAstToolsJs = require('../../astTools/astTools.js');

var _astToolsAstToolsJs2 = _interopRequireDefault(_astToolsAstToolsJs);

var _StateToNodeConverterStateToNodeConverterJs = require('../StateToNodeConverter/StateToNodeConverter.js');

var _StateToNodeConverterStateToNodeConverterJs2 = _interopRequireDefault(_StateToNodeConverterStateToNodeConverterJs);

/* Sequencer for d3DynamicVisualizer/Editor.
   controlled by React ControlBar via SequencerStore store.
   Inteprets next state, updates SequencerStore and drives synchronized
   events to the Editor and visualizer underneath React. 

   Follows the initialise/update pattern as D3, as essentially
   this module performs a pre-processing of the interpreter results
   before each D3 forceLayout update.
*/
function Sequencer() {

  var interpreter = undefined;
  var astWithLocations = undefined;
  var stateToNodeConverter = undefined;

  function displaySnackBarError(action, message) {
    _storesSequencerStoreJs2['default'].setStepOutput({
      warning: {
        action: action,
        message: '"' + (message.message || message) + '"\n        (Only basic built-in methods and ES5 supported)'
      }
    });
    _storesSequencerStoreJs2['default'].sendUpdate();
  }

  /* run once on code parse from editor.
     State can then be reset without re-parsing.
     Parsing will select user-written code once
     they have worked on/changed a preset example. */
  function parseCodeAsIIFE() {

    var codeString = _storesCodeStoreJs2['default'].get();
    var runCodeString = _astToolsAstToolsJs2['default'].getRunCodeString(codeString);
    try {
      astWithLocations = _astToolsAstToolsJs2['default'].createAst(runCodeString, true);
    } catch (e) {
      // display message if user types in invalid code;
      displaySnackBarError('Parser error', e);
      return;
    }
    resetInterpreterAndSequencerStore();
  }

  /* resets interpreter and SequencerStore state to begin the program again,
     without re-parsing code. */
  function resetInterpreterAndSequencerStore() {
    _storesSequencerStoreJs2['default'].resetState();
    /* SequencerStore now has new node/link refs,
       update via function closure */
    stateToNodeConverter = new _StateToNodeConverterStateToNodeConverterJs2['default'](_storesSequencerStoreJs2['default'].linkState().nodes, _storesSequencerStoreJs2['default'].linkState().links);
    // there isn't an AST if we switch from dynamic without parsing
    if (astWithLocations) {
      /* create deep copy so that d3 root modifications
       and interpreter transformations are not maintained */
      var sessionAst = (0, _lodash.cloneDeep)(astWithLocations).valueOf();
      try {
        interpreter = new _vendor_modJSInterpreterInterpreterJs2['default'](sessionAst, _jsInterpreterInitJsInterpreterInitJs2['default']);
      } catch (e) {
        displaySnackBarError('Interpreter error', e);
      }
    }
  }

  function nextStep(singleStep) {

    var delay = _storesSequencerStoreJs2['default'].getOptions().sequencerDelay * 3000;
    var maxAllowedReturnNodes = _storesSequencerStoreJs2['default'].getOptions().maxAllowedReturnNodes * _storesSequencerStoreJs2['default'].getOptions().maxAllowedReturnNodesFactor;
    var doneAction = false;
    var warning = null;
    if (_storesCodeStatusStoreJs2['default'].isCodeRunning()) {
      var _stateToNodeConverter$action = stateToNodeConverter.action(interpreter, maxAllowedReturnNodes);

      var _stateToNodeConverter$action2 = _slicedToArray(_stateToNodeConverter$action, 2);

      doneAction = _stateToNodeConverter$action2[0];
      warning = _stateToNodeConverter$action2[1];

      if (doneAction) {}
      // console.log('this step actioned:');

      // console.log(cloneDeep(interpreter.stateStack[0]));
      if (doneAction) {
        var representedNode = stateToNodeConverter.getRepresentedNode();
        _storesSequencerStoreJs2['default'].setStepOutput({
          // arrows are not drawn in ratio speed  if we're advancing one step at a time
          singleStep: singleStep,
          execCodeBlock: _astToolsAstToolsJs2['default'].createCode(representedNode),
          range: _astToolsAstToolsJs2['default'].getCodeRange(representedNode),
          warning: warning
        });
        // wait until sequencer has completed timedout editor/d3
        // output before recursing, or show warning
        _storesSequencerStoreJs2['default'].sendUpdate().then(function () {
          if (!(warning && _storesSequencerStoreJs2['default'].getOptions().stopOnNotices)) {
            gotoNextStep();
          } else {
            _storesCodeStatusStoreJs2['default'].setCodeRunning(false);
          }
        });
      } else {
        // keep skipping forward until we see something
        // representing one of the actions that has
        // a visualization component built for it.
        // add timeout to relieve UI thread and allow
        // delay slider bar to operate
        gotoNextStep();
      }
    }

    function gotoNextStep() {
      try {
        if (interpreter.step()) {
          stateToNodeConverter.nextStep();
          if (doneAction && singleStep) {
            _storesCodeStatusStoreJs2['default'].setCodeRunning(false);
          } else {
            setTimeout(nextStep.bind(null, singleStep), doneAction ? delay : 0);
          }
        } else {
          _storesCodeStatusStoreJs2['default'].setCodeFinished(true);
          stateToNodeConverter.setFinished();
          _storesSequencerStoreJs2['default'].sendUpdate();
        }
      } catch (e) {
        // the interpreter may throw errors if you type
        // valid AST code but containing unknown identifiers
        // in deeper scopes.
        _storesCodeStatusStoreJs2['default'].setCodeFinished(true);
        displaySnackBarError('Interpreter error', e);
      }
    }
  }

  return {
    initialize: parseCodeAsIIFE,
    update: nextStep,
    restart: resetInterpreterAndSequencerStore
  };
}
exports['default'] = new Sequencer();
module.exports = exports['default'];

},{"../../astTools/astTools.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\astTools\\astTools.js","../../stores/CodeStatusStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\CodeStatusStore.js","../../stores/CodeStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\CodeStore.js","../../stores/SequencerStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\SequencerStore.js","../../vendor_mod/JS-Interpreter/interpreter.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\vendor_mod\\JS-Interpreter\\interpreter.js","../StateToNodeConverter/StateToNodeConverter.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\StateToNodeConverter\\StateToNodeConverter.js","../jsInterpreterInit/jsInterpreterInit.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\jsInterpreterInit\\jsInterpreterInit.js","lodash":"lodash"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\StateToNodeConverter\\DisplayTextHandler\\DisplayTextHandler.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

var _lodash = require('lodash');

var _StringTokenizerStringTokenizerJs = require('./StringTokenizer/StringTokenizer.js');

var _StringTokenizerStringTokenizerJs2 = _interopRequireDefault(_StringTokenizerStringTokenizerJs);

function UpdateHandler() {

  // this is the interpreter scope, which is sometimes used
  // for filling in missing primitive values and types if they
  // have been evaluated beyond their original AST node format.
  var scope = null;

  // ===================================================
  // Update controller
  // ===================================================
  function doesDisplayNameNeedUpdating(state, updateNode, interpreter) {
    var conditionMet = false;
    gatherEnteringFunctionInformation(state, updateNode);

    var updateNodeHasArguments = updateNode.displayTokens.length > 1;

    var gatheredRequirementsForCallee = state.doneCallee_ && !state.doneExec;

    // the interpreter has computed all arguments a function requires
    // and created a wrapped function for it to execute.
    // (Due to an interpreter bug (I think), evaluating `func_` for
    // truthiness returns a copy of the object instead of true or
    // false, hence the Boolean wrapper
    var finishedGatheringArguments = Boolean(state.func_);

    if (updateNodeHasArguments && gatheredRequirementsForCallee && finishedGatheringArguments) {
      var newDisplayTokens = fillRemainingDisplayTokens(updateNode.displayTokens, updateNode, updateNode.interpreterComputedArgs);

      if (tokensHaveChanged(updateNode.displayTokens, newDisplayTokens)) {
        updateNode.displayName = _StringTokenizerStringTokenizerJs2['default'].joinAndFormatDisplayTokens(newDisplayTokens, updateNode.recursion);
        updateNode.updateText = true;
        updateNode.displayTokens = newDisplayTokens;
        conditionMet = true;
      }
    }
    return conditionMet;
  }
  // ==========================
  // Update helpers
  // ==========================

  function gatherEnteringFunctionInformation(state, updateNode) {
    if (state.scope) {
      scope = state.scope;
      updateNode.variablesDeclaredInScope = Object.keys(scope.properties);
    }
    if (state.func_ && !state.func_.nativeFunc) {
      // get the identifier paramNames so we can match with variables referring
      // to values declared in its parent scope when we hit the next function
      updateNode.paramNames = (0, _lodash.pluck)(state.func_.node.params, 'name');
    }

    // computedPrimitive: interpreter has fetched the result for an
    // interpolated function argument, eg (n - 1). Can't calculate
    // these through static analysis so take the interpreter's result now.
    var computedPrimitive = state.n_ && state.value && state.value.isPrimitive;
    if (computedPrimitive) {
      // need to get the interpreter computed values as they appear, eg (n-1)
      // take state.n_ -1 since interpreterComputedArgs does not have
      // a leading function identifier
      updateNode.interpreterComputedArgs[state.n_ - 1] = {
        value: state.value.data.toString(),
        type: state.value.type
      };
    }
  }

  function fillRemainingDisplayTokens(currentTokens, updateNode, interpreterComputedArgs) {
    // same as getInitialDisplayArgs, but this time adapted for
    // interpreter results rather than nodes, to update
    // any arguments with computed interpreter results
    if (currentTokens.length === 1) {
      // return function name only
      return [{
        value: currentTokens[0],
        type: 'string'
      }];
    }

    var displayTokens = [];
    var currentArgs = currentTokens.slice();
    var funcNameObject = currentArgs.shift();

    for (var i = 0, _length = currentArgs.length; i < _length; i++) {
      var arg = currentArgs[i];

      // recursive update for nested argument functions
      if (Array.isArray(arg)) {
        // interpreterComputed args to null for recursion -
        // they are only for top-level primitive results
        displayTokens[i] = fillRemainingDisplayTokens(arg, updateNode, null);
        continue;
      }

      // use the interpreter-calculated primitives
      // if it has already done so (eg for (10 === n) => ((n-1) === 9)))
      if (interpreterComputedArgs && interpreterComputedArgs[i]) {
        displayTokens[i] = interpreterComputedArgs[i];
        continue;
      }

      // pass literals straight through
      // (should be covered by interpreter case above
      // for the top level, but needed for nested args
      // in functions)
      if (arg.type === 'string' || arg.type === 'number') {
        displayTokens[i] = currentArgs[i];
        continue;
      }

      // last case - variable used from outside the scope
      // get object type for formatting
      var traverseToValue = scope;
      while (!(arg.value in traverseToValue.properties) && traverseToValue.parentScope !== null) {
        traverseToValue = traverseToValue.parentScope;
      }
      if (arg.value in traverseToValue.properties) {
        var property = undefined;
        if (arg.object) {

          for (var _i = 0; _i < arg.object.length - 1; _i++) {
            // don't go into the very last one
            traverseToValue = traverseToValue.properties[obj];
          }
          property = traverseToValue.properties[arg.property].data;
          var deepestObjName = arg.object[arg.object.length - 1];
          if (traverseToValue.properties[deepestObjName].properties[property]) {
            traverseToValue = traverseToValue.properties[deepestObjName].properties[property];
          } else {
            // sometimes the index property has increased (eg index++) and I try to read
            // the value before the function ends, causing there to be no value
            // fall back to the the next-highest object
            // console.error('warning: key not found from object property...falling back to parent object.')
            traverseToValue = traverseToValue.properties[deepestObjName];
          }
        } else {
          traverseToValue = traverseToValue.properties[arg.value];
        }
        if (traverseToValue.isPrimitive) {
          displayTokens[i] = {
            value: traverseToValue.data.toString(),
            type: traverseToValue.type
          };
        } else {
          displayTokens[i] = {
            value: arg.value,
            type: traverseToValue.type
          };
        }
        continue;
      } else {
        displayTokens[i] = arg;
        // things like parameters of anonymous functions
        // we don't know at all or want to update, should be of type 'code'.
        // pass through unchanged in the worst case.
        // console.error('display token not matched: ' + arg.value + ', ' + arg.type);
      }
    }
    displayTokens.unshift(funcNameObject);
    return displayTokens;
  }

  function tokensHaveChanged(initTokens, updateTokens) {
    if (initTokens.length === 1) {
      return false;
    }

    for (var i = 0, _length2 = initTokens.length; i < _length2; i++) {
      if (!updateTokens[i]) {
        // the interpreter needs to calculate these values
        // (eg (n-1) as argument)
        return false;
      }

      if (Array.isArray(initTokens[i])) {
        if (tokensHaveChanged(initTokens[i], updateTokens[i])) {
          return true;
        }
        continue;
      } else if (initTokens[i].value !== updateTokens[i].value || initTokens[i].type !== updateTokens[i].type) {
        return true;
      } else {
        continue;
      }
      return false;
    }
  }

  return {
    doesDisplayNameNeedUpdating: doesDisplayNameNeedUpdating
  };
}
exports['default'] = UpdateHandler;
module.exports = exports['default'];

},{"./StringTokenizer/StringTokenizer.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\StateToNodeConverter\\DisplayTextHandler\\StringTokenizer\\StringTokenizer.js","lodash":"lodash"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\StateToNodeConverter\\DisplayTextHandler\\StringTokenizer\\StringTokenizer.js":[function(require,module,exports){
/* Provides static functions for initial display
	(matching params), update (adding interpreter-computed
	values) and display (reforming to a single string 
	with formatting in line with type.)

	Does so via recursive tokenization, with every
	token assigned its own type for exact formatting
	of potentially deeply-nested functions in parameters.
   */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

var _astToolsAstToolsJs = require('../../../../astTools/astTools.js');

var _astToolsAstToolsJs2 = _interopRequireDefault(_astToolsAstToolsJs);

function StringTokenizer() {

  // recursively tokenizes functions as arguments:
  // e.g., [funcName, arg1, arg2, [funcName, arg1, arg2]].
  function getInitialDisplayTokens(funcName, nodeArgs, parentNode, interpreter) {
    var displayTokens = [];
    nodeArgs.forEach(function (arg, i) {
      if (arg.type === 'Literal') {
        displayTokens[i] = {
          value: arg.value.toString(),
          type: isNaN(arg.value) ? 'string' : 'number'
        };
      } else if (arg.type === 'CallExpression') {
        displayTokens[i] = getInitialDisplayTokens(arg.callee.name, arg.arguments, parentNode, interpreter);
      } else if (arg.type === 'FunctionExpression') {
        // anonymous functions - don't show the full details
        displayTokens[i] = getInitialDisplayTokens('anonymous', arg.params, parentNode, interpreter);
      } else if (arg.type === 'Identifier') {
        // interpolate paramNames with passed arguments
        // at this point. Would have liked to do this
        // at the update step, but for functions
        // which return functions this information
        // needs to be present as soon as the returned function
        // appears in the visualizer.
        var stackLevel = 1;
        var stateStack = interpreter.stateStack;
        var callerPassingParams = stateStack[stackLevel].node;
        // params will only be passed from Program down
        if (parentNode) {
          var nodeContainingParams = parentNode;
          var matchedParamIndex = nodeContainingParams.paramNames.indexOf(arg.name);
          while (nodeContainingParams.parentNode !== null && (!(matchedParamIndex > -1) || callerPassingParams.type === 'CallExpression')) {
            // check for nested CallExpressions in return:
            // will mean that param names don't come from immediate
            // parent but point above last CallExpression
            callerPassingParams = stateStack[++stackLevel].node;
            nodeContainingParams = nodeContainingParams.parentNode;
            matchedParamIndex = nodeContainingParams.paramNames.indexOf(arg.name);
          }
          if (matchedParamIndex > -1) {
            var parentTokens = nodeContainingParams.displayTokens;
            displayTokens[i] = parentTokens[matchedParamIndex + 1];
          } else {
            var value = interpreter.getScope().properties[arg.name];
            // must be rootScope - get type from interpreter.
            // or FunctionExpression - just pass through.
            var type = value ? value.type : 'code';
            displayTokens[i] = {
              value: arg.name,
              type: type
            };
          }
        } else {
          throw new Error('Wrapping root (Program) function shouldn\'t have arguments');
        }
      } else if (arg.type === 'MemberExpression') {
        var objArray = [];
        var _ = arg;
        while (_.object) {
          objArray.push(_.object.name);
          _ = _.object;
        }
        displayTokens[i] = {
          value: arg.object.name,
          type: 'object',
          object: objArray,
          property: arg.property.name
        };
      } else {
        // BinaryExpressions and more edge cases...just get the code
        // and the interpreter should provide an interpolated
        // replacement for this on the update pass.
        // console.log('just generating code for edge case of ' + arg.type + ' types');
        displayTokens[i] = {
          value: _astToolsAstToolsJs2['default'].createCode(arg),
          type: 'code'
        };
      }
    });
    displayTokens.unshift({
      value: funcName,
      type: 'function'
    });
    return displayTokens;
  }

  function joinAndFormatDisplayTokens(tokens, recursion) {
    var newArgs = tokens.slice();
    var funcName = newArgs.shift();
    return formatSingleToken(funcName, recursion) + '(' + newArgs.map(function (arg) {
      if (Array.isArray(arg)) {
        return joinAndFormatDisplayTokens(arg);
      }
      return formatSingleToken(arg);
    }).join(', ') + ')';
  }

  function formatSingleToken(token, recursion) {
    switch (token.type) {
      case 'undefined':
      case 'number':
      case 'code':
        return token.value;
      case 'string':
        return '"' + token.value + '"';
      case 'object':
        return '{' + token.value + '}';
      case 'function':
        return formatFunctionName(token, recursion);
      default:
        console.error('unknown token type encountered: ' + token.type);
    }
  }

  function formatFunctionName(token, recursion) {
    // don't show the body of the function, for brevity
    var preString = recursion ? '<i>(r)' : '<i>';

    var functionName = token.value ? preString + ' ' + token.value + '</i> ' : preString + ' anonymous</i> ';
    return functionName;
  }

  return {
    getInitialDisplayTokens: getInitialDisplayTokens,
    joinAndFormatDisplayTokens: joinAndFormatDisplayTokens,
    formatSingleToken: formatSingleToken
  };
}

exports['default'] = new StringTokenizer();
module.exports = exports['default'];

},{"../../../../astTools/astTools.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\astTools\\astTools.js"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\StateToNodeConverter\\ErrorChecker\\ErrorChecker.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

var _lodash = require('lodash');

var _WarningHandlerWarningHandlerJs = require('./WarningHandler/WarningHandler.js');

var _WarningHandlerWarningHandlerJs2 = _interopRequireDefault(_WarningHandlerWarningHandlerJs);

var _astToolsAstToolsJs = require('../../../astTools/astTools.js');

var _astToolsAstToolsJs2 = _interopRequireDefault(_astToolsAstToolsJs);

function ErrorChecker() {

  var warningHandler = new _WarningHandlerWarningHandlerJs2['default']();

  function doesFunctionReturn(state, node) {
    // check for explicit return of function
    var conditionMet = true;
    if (state.doneCallee_ && (state.value.isPrimitive && state.value.data !== undefined) || !state.value.isPrimitive) {
      if (node.status === 'normal') {
        // leave returned functions in error state
        // if they generated warnings
        node.status = 'returning';
      }
    } else {
      conditionMet = false;
      warningHandler.add({
        key: 'functionDoesNotReturnValue',
        actingNode: node
      });
    }
    return conditionMet;
  }

  function isVariableMutated(state, updateNode) {
    var errorMessageAlreadyGivenForVar = false;
    var assignmentMade = false;
    if (state.node.type === 'AssignmentExpression' && (state.doneLeft === true && state.doneRight === true)) {
      assignmentMade = true;

      var assignedExpression = state.node.left.type !== 'MemberExpression' ? state.node.left.name : _astToolsAstToolsJs2['default'].getEndMemberExpression(state.node.left);
      errorMessageAlreadyGivenForVar = updateNode.warningsInScope.has(assignedExpression);

      if (!(0, _lodash.includes)(updateNode.variablesDeclaredInScope, assignedExpression)) {
        var nodeContainingVar = updateNode;
        var varPresentInScope = false;
        while (nodeContainingVar.parentNode !== null && !varPresentInScope) {
          nodeContainingVar = nodeContainingVar.parentNode;
          varPresentInScope = (0, _lodash.includes)(nodeContainingVar.variablesDeclaredInScope, assignedExpression);
        }
        if (varPresentInScope) {
          // highlight both the mutation node and the affected node
          warningHandler.add({
            key: 'variableMutatedOutOfScope',
            actingNode: updateNode,
            affectedNode: nodeContainingVar,
            variableName: assignedExpression
          });
        } else {
          warningHandler.add({
            key: 'variableDoesNotExist',
            actingNode: updateNode,
            variableName: assignedExpression
          });
        }
      } else {
        warningHandler.add({
          key: 'variableMutatedInScope',
          actingNode: updateNode,
          variableName: assignedExpression
        });
      }
    }
    return assignmentMade && !errorMessageAlreadyGivenForVar;
  }

  function getErrorCountAndCurrentWarning() {
    return [warningHandler.getErrorCount(), warningHandler.getCurrentWarningAndStep()];
  }

  function addUnassignedFunctionWarning(actingNode, affectedNode) {
    warningHandler.add({
      key: 'functionReturnUnassigned',
      actingNode: actingNode,
      affectedNode: affectedNode
    });
  }

  return {
    doesFunctionReturn: doesFunctionReturn,
    isVariableMutated: isVariableMutated,
    getErrorCountAndCurrentWarning: getErrorCountAndCurrentWarning,
    addUnassignedFunctionWarning: addUnassignedFunctionWarning
  };
}

exports['default'] = ErrorChecker;
module.exports = exports['default'];

},{"../../../astTools/astTools.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\astTools\\astTools.js","./WarningHandler/WarningHandler.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\StateToNodeConverter\\ErrorChecker\\WarningHandler\\WarningHandler.js","lodash":"lodash"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\StateToNodeConverter\\ErrorChecker\\WarningHandler\\WarningHandler.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

var _warningConstantsJs = require('./warningConstants.js');

var _warningConstantsJs2 = _interopRequireDefault(_warningConstantsJs);

// tracks the warnings for each step and overall count.
// modifies properties on the passed nodes directly for
// use by d3.

function WarningHandler() {

  var errorCount = 0;
  var warning = null;

  /* options are:  warningString, actingNode,
  affectedNode, singleInstance,*/
  function add(opts) {
    // will only return one warning per step,
    // so as the more important warnings are lodged
    // first (function returns and assignments),
    // the most important warning is the one shown.

    // assign warning
    if (!warning) {
      var receivedWarning = _warningConstantsJs2['default'][opts.key];
      warning = receivedWarning.get(opts.actingNode ? opts.actingNode.name : null, opts.affectedNode ? opts.affectedNode.name : null, opts.variableName);
    }

    // If a variable error,
    // don't add 50 errors for 50 mutations of a single array!
    if (opts.variableName) {
      if (!opts.actingNode.warningsInScope.has(opts.variableName)) {
        errorCount += warning.errorValue;
        opts.actingNode.warningsInScope.add(opts.variableName);
      }
    } else {
      errorCount += warning.errorValue;
    }

    var classAssignees = [opts.actingNode, opts.affectedNode];
    // assign a class - but clear class if
    // the root node and preserve failures
    classAssignees.forEach(function (node) {
      if (node) {
        if (node.parentNode !== null) {
          node.status = node.status !== 'failure' ? warning.status : node.status;
        }
      }
    });
  }

  function getErrorCount() {
    return errorCount;
  }

  function getCurrentWarning() {
    return warning;
  }

  function getCurrentWarningAndStep() {
    var returnWarning = warning;
    warning = null;
    return returnWarning;
  }

  return {
    add: add,
    getErrorCount: getErrorCount,
    getCurrentWarning: getCurrentWarning,
    getCurrentWarningAndStep: getCurrentWarningAndStep
  };
}

exports['default'] = WarningHandler;
module.exports = exports['default'];

},{"./warningConstants.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\StateToNodeConverter\\ErrorChecker\\WarningHandler\\warningConstants.js"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\StateToNodeConverter\\ErrorChecker\\WarningHandler\\warningConstants.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var warnings = {
  functionDoesNotReturnValue: {
    get: function get(name) {
      return {
        status: 'failure',
        errorValue: 1,
        action: 'Principle: Referential transparency',
        message: 'Function \'' + name + '\' did not return a value.'
      };
    }
  },
  functionReturnUnassigned: {
    get: function get(actingNodeName, affectedNodeName) {
      return {
        errorValue: 1,
        status: 'warning',
        action: 'Principle: Side effects',
        message: 'Result of function \'' + actingNodeName + '\' is not assigned to a value in \'' + affectedNodeName + '\'.'
      };
    }
  },
  variableMutatedOutOfScope: {
    get: function get(mutatorScopeName, declarationScopeName, variableName) {
      return {
        errorValue: 1,
        status: 'warning',
        action: 'Principle: Side effects',
        message: 'Function  \'' + mutatorScopeName + '\' has mutated variable \'' + variableName + '\' in the scope of function \'' + declarationScopeName + '\'.'
      };
    }
  },
  variableDoesNotExist: {
    get: function get(name, affectedNodeName, variableName) {
      return {
        errorValue: 1,
        status: 'failure',
        'action': 'Principle: Side effects',
        message: 'Function \'' + name + '\' refers to the variable ' + variableName + ' that does not exist in the scope chain.'
      };
    }
  },
  variableMutatedInScope: {
    get: function get(name, declarationScopeName, variableName) {
      return {
        errorValue: 0,
        status: 'notice',
        'action': 'Principle: Immutability (notice only)',
        message: '\'' + name + '\' has mutated variable \'' + variableName + '\' within its own scope after creation'
      };
    }
  }
};

exports['default'] = warnings;
module.exports = exports['default'];

},{}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\StateToNodeConverter\\StateToNodeConverter.js":[function(require,module,exports){
// =============================================
// Pre-processing for dynamic D3 visualization.
// Analyzes js-interpreter results to
// infer adding and removing nodes
// for use by D3.
// Initiated by the Sequencer, and returns
// whether the Sequencer should consider the
// current state of the interpreter as constituting
// a display update step.
// =============================================

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i['return']) _i['return']();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError('Invalid attempt to destructure non-iterable instance');
    }
  };
})();

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

var _lodash = require('lodash');

// import formatOutput from '../d3DynamicVisualizer/formatOutput.js';

var _DisplayTextHandlerDisplayTextHandlerJs = require('./DisplayTextHandler/DisplayTextHandler.js');

var _DisplayTextHandlerDisplayTextHandlerJs2 = _interopRequireDefault(_DisplayTextHandlerDisplayTextHandlerJs);

var _DisplayTextHandlerStringTokenizerStringTokenizerJs = require('./DisplayTextHandler/StringTokenizer/StringTokenizer.js');

var _DisplayTextHandlerStringTokenizerStringTokenizerJs2 = _interopRequireDefault(_DisplayTextHandlerStringTokenizerStringTokenizerJs);

var _ErrorCheckerErrorCheckerJs = require('./ErrorChecker/ErrorChecker.js');

var _ErrorCheckerErrorCheckerJs2 = _interopRequireDefault(_ErrorCheckerErrorCheckerJs);

function StateToNodeConverter(resetNodes, resetLinks) {

  // these variables are all modified by the
  // add, remove and update helpers, though all variables
  // explicit to only the controllers for each of those
  // are passed explicitly
  var nodes = resetNodes;
  var links = resetLinks;
  // responsible for handling string tokenization and update
  var displayTextHandler = new _DisplayTextHandlerDisplayTextHandlerJs2['default']();
  var errorChecker = new _ErrorCheckerErrorCheckerJs2['default']();
  // use custom link index for d3 links and nodes, as otherwise they do not
  // re-associate reliably on popping off the end of the array and shifting
  // onto the front .
  var linkIndex = 0;
  // used to track current and previous interpreter state,
  // to make inferences about what is happening. Try to limit use
  // of prevState.
  var state = undefined;
  var prevState = undefined;

  // track the current depth of the scope chain
  // - by d3 node, not interpreter scope.
  var scopeChain = [];

  // index of errorCount tracked here is passed to d3 for angry colours.
  var rootNode = null;

  // as we start to return nodes, we pop them off the array
  // and unshift them onto the front. The oldest returning nodes
  // that can therefore be removed once the maxAllowedReturnNodes
  // limit is exceeded are those immediately behind the rootNodeIndex.
  var rootNodeIndex = 0;

  // this is assigned if returning to a callExpression;
  // the next state is then checked to ensure that the
  // return result is assigned back to a variable.
  var exitingNode = null;

  // ===============================================
  // Main action method. Runs add, remove and update
  // checks and returns warnings and updates for display.
  // Will short-circuit other checks if one satisfies
  // condition - Sequencer can only show entering,
  // exiting or updating step for a single interpreter step/state.
  // ===============================================
  function action(interpreter, maxAllowedReturnNodes) {
    var nodeEnterOrExit = false;
    var functionReturnUnassigned = false;
    var currentNodeUpdated = false;
    var variableErrors = false;
    var currentWarning = null;
    state = interpreter.stateStack[0];

    if (state) {

      if (exitingNode) {
        // make sure the returned function is
        // then assigned to a variable, before
        // the nodeExiting check clobbers it
        functionReturnUnassigned = isFunctionReturnUnassigned(state, exitingNode);
      }

      nodeEnterOrExit = isNodeEntering(state, interpreter) || isNodeExiting(state, interpreter, maxAllowedReturnNodes);

      var updateNode = (0, _lodash.last)(scopeChain) || null;

      if (!nodeEnterOrExit && updateNode) {
        currentNodeUpdated = displayTextHandler.doesDisplayNameNeedUpdating(state, updateNode, interpreter);
        variableErrors = errorChecker.isVariableMutated(state, updateNode);
      }
    }
    if (rootNode) {
      var _errorChecker$getErrorCountAndCurrentWarning = errorChecker.getErrorCountAndCurrentWarning();

      var _errorChecker$getErrorCountAndCurrentWarning2 = _slicedToArray(_errorChecker$getErrorCountAndCurrentWarning, 2);

      rootNode.errorCount = _errorChecker$getErrorCountAndCurrentWarning2[0];
      currentWarning = _errorChecker$getErrorCountAndCurrentWarning2[1];
    }
    return [nodeEnterOrExit || functionReturnUnassigned || variableErrors || currentNodeUpdated, currentWarning];
  }

  function getCallLink(source, target, linkState) {
    if (source && target) {
      var callLink = {
        source: source,
        target: target,
        linkState: linkState,
        linkIndex: linkIndex++
      };
      return callLink;
    }
  }

  /**
   * [isNodeEntering - checks to see if new nodes need to be added]
   * links have linkState: calling and returning
     nodes have type: root, normal or finished
     nodes additionally have status: neutral, notice, warning, failure or finished 
   */
  function isNodeEntering(state, interpreter) {
    var updateNeeded = false;

    function isSupportedFunctionCall(state) {
      // won't show stepping into and out of member methods (e.g array.slice)
      // because these are built-ins with black-boxed code.
      // User functions may also be object properties, but I am not considering
      // this for this exercise.
      return state.node.type === 'CallExpression' && !state.doneCallee_ && !(state.node.callee && state.node.callee.type === 'MemberExpression');
    }

    if (isSupportedFunctionCall(state)) {

      var enterNode = {
        name: state.node.callee.name || state.node.callee.id.name,
        parentNode: (0, _lodash.last)(scopeChain) || null,
        paramNames: [],
        interpreterComputedArgs: [],
        // variable information and warnings
        // populated once the interpreter
        // generates scope
        variablesDeclaredInScope: null,
        warningsInScope: new Set(),
        type: 'function',
        status: 'normal'
      };

      // set up string tokens for display text
      enterNode.recursion = enterNode.parentNode && enterNode.name === enterNode.parentNode.name;
      enterNode.displayTokens = _DisplayTextHandlerStringTokenizerStringTokenizerJs2['default'].getInitialDisplayTokens(enterNode.name, state.node.arguments, enterNode.parentNode, interpreter);
      enterNode.displayName = _DisplayTextHandlerStringTokenizerStringTokenizerJs2['default'].joinAndFormatDisplayTokens(enterNode.displayTokens, enterNode.recursion);

      // the root node carries through information to d3 about overall progress.
      if (nodes.length === 0) {
        enterNode.type = 'root';
        enterNode.errorCount = 0;
        enterNode.status = ''; //d3 manually assigns color to rootNode
        rootNode = enterNode;
      }

      // add nodes and links to d3
      nodes.push(enterNode);
      var callLink = getCallLink(enterNode.parentNode, enterNode, 'calling');
      if (callLink) {
        links.push(callLink);
      }

      /* Tracking by scope reference allows for
      displaying nested functions and recursion */
      scopeChain.push(enterNode);
      updateNeeded = true;
    }
    return updateNeeded;
  }

  // ===================
  // Exiting controller
  // ===================
  function isNodeExiting(state, interpreter, maxAllowedReturnNodes) {
    var updateNeeded = false;

    if (isSupportedReturnToCaller(state)) {
      // we'll check on this on future runs
      //  to make sure its result is assigned to a variable
      exitingNode = (0, _lodash.last)(scopeChain);

      if (exitingNode !== rootNode) {
        var link = (0, _lodash.last)(links) || null;
        if (link) {
          // don't want to come full circle and break links outgoing from root
          exitLink(link);
          exitNode(exitingNode);
          updateNeeded = true;
          scopeChain.pop();
        }
      } else {
        exitingNode = null; // can't exit from rootNode
      }
      if (rootNodeIndex > maxAllowedReturnNodes) {
        // the returned nodes shifted to the front of the array
        // has exceeded the limit; start removing the oldest
        // from the root node position backwards
        removeOldestReturned(nodes, links, maxAllowedReturnNodes);
        updateNeeded = true;
      }
    }
    return updateNeeded;
  }

  // =========================
  // Exiting helpers
  // =========================
  function isSupportedReturnToCaller(state) {
    return state.node.type === 'CallExpression' && state.doneExec && !(state.node.callee && state.node.callee.type === 'MemberExpression');
  }

  function exitLink(link) {
    // change directions and class on returning functions
    // nodes are about to be 'flipped' for return so target
    // is the exiting link
    var nodeReturning = link.target;

    if (errorChecker.doesFunctionReturn(state, nodeReturning)) {
      // reverse source and target to flip arrows and animation
      var returnLink = getCallLink(link.target, link.source, 'returning');
      links.unshift(returnLink);
    }
    // break the chain for non-returned functions!
    links.pop();
  }

  function findReturnIdentifier(node, index) {

    return prevState.node.argument[index];
  }

  function exitNode(node) {
    var returnValue = null;

    // interpreter provides result
    if (state.doneCallee_ && state.doneExec) {
      if (state.value.isPrimitive) {
        returnValue = _DisplayTextHandlerStringTokenizerStringTokenizerJs2['default'].formatSingleToken({
          value: state.value.data,
          type: state.value.type
        });
      } else if (state.value.type === 'function') {
        returnValue = _DisplayTextHandlerStringTokenizerStringTokenizerJs2['default'].joinAndFormatDisplayTokens(node.displayTokens);
      } else if (state.value.type === 'object') {
        if (state.n_) {
          var returningArgIndex = state.n_ - 1;
          if (node.interpreterComputedArgs[returningArgIndex] !== undefined) {
            returnValue = _DisplayTextHandlerStringTokenizerStringTokenizerJs2['default'].formatSingleToken({
              value: node.interpreterComputedArgs[returningArgIndex].value,
              type: state.value.type
            });
          } else {
            returnValue = _DisplayTextHandlerStringTokenizerStringTokenizerJs2['default'].formatSingleToken({
              value: 'object',
              type: 'object'
            });
          }
        }
      }
    }
    node.displayName = 'return (' + returnValue + ')';
    node.updateText = true;

    // move exiting node to the front of the queue and increase the marker
    // - the oldest nodes that can be removed if maxAllowedNodes are exceeded
    // fall directly before the rootNodeIndex.
    nodes.pop();
    nodes.unshift(node);
    rootNodeIndex++;
  }

  function nodeIsBeingAssigned(node) {
    return node.type === 'ReturnStatement' || node.type === 'VariableDeclarator' || node.type === 'VariableDeclaration' || node.type === 'BinaryExpression' || node.type === 'AssignmentExpression';
  }

  function nodeWillBeAssigned(state) {
    var node = state.node;
    var expressionAssigned = node.type === 'ExpressionStatement' && nodeIsBeingAssigned(node.expression);

    var callNotFinished = node.type === 'CallExpression' && !state.doneExec;

    var argIndex = state.n_;
    var variableWillBeAssignedInScope = true;
    if (argIndex !== undefined) {
      variableWillBeAssignedInScope = node.type === 'BlockStatement' && (nodeIsBeingAssigned(node.body[argIndex - 1]) || nodeWillBeAssigned(node.body[argIndex - 1]));

      return expressionAssigned || variableWillBeAssignedInScope || callNotFinished;
    }
    return expressionAssigned;
  }

  function isFunctionReturnUnassigned(state) {
    var conditionMet = false;
    // used to track an exit node to the next state, and ensure that
    // a returning function is being or will be (likely) assigned to a variable:
    // if the state progresses too far past the return then this potential error
    // just abandoned as it becomes increasingly unreliable to infer.
    if (!(nodeIsBeingAssigned(state.node) || nodeWillBeAssigned(state))) {
      errorChecker.addUnassignedFunctionWarning(exitingNode, exitingNode.parentNode);

      if (links[0] && links[0].source === exitingNode) {
        // break off this link too..but only if the returning link
        // (pointing back from target to source, and shifted back
        // onto the front of the links array)
        // hasn't already been removed because the function didn't have a return statement
        links.shift();
      }
      conditionMet = true;
    }
    // there will likely be other conditions where the node is being unassigned,
    // but it is getting hard to infer now and so best to prevent the warning then
    // to show it as a false positive
    exitingNode = null;
    return conditionMet;
  }

  function removeOldestReturned(nodes, links, maxAllowedReturnNodes) {
    // cannot remove so many nodes that the root node onwards would be deleted
    // (i.e, only returning nodes shifted to the start of the array
    //  are eligible for deletion)
    //  this may not always be simply 1, since the user can adjust
    //  the maxAllowedReturnNodes on the fly which could lead to
    //  many nodes needing removal on the next Sequencer step
    var itemsToRemoveCount = rootNodeIndex - maxAllowedReturnNodes;
    var removalStartIndex = rootNodeIndex - itemsToRemoveCount;
    // links always have one less item than nodes
    // (root node has no calling link attached)
    // the indexes match on the way back,
    // except we don't want to also try and remove
    // a link when there is only one node
    if (nodes.length > 1) {
      links.splice(removalStartIndex, itemsToRemoveCount);
    }
    nodes.splice(removalStartIndex, itemsToRemoveCount);
    rootNodeIndex -= itemsToRemoveCount;
  }

  // ====================================
  // Functions used by Sequencer to setup
  // the VisibleFunctionsUpdater for its
  // next run,
  // before and after it displays a step
  // ====================================

  function getRepresentedNode() {
    if (prevState.node.type === 'ReturnStatement') {
      return prevState.node;
    }
    return state.node;
  }

  function setPrevState() {
    if (state) {
      prevState = state;
    }
  }

  function setFinished() {
    rootNode.status = 'finished';
  }

  return {
    nextStep: setPrevState,
    action: action,
    getRepresentedNode: getRepresentedNode,
    setFinished: setFinished
  };
}

exports['default'] = StateToNodeConverter;
module.exports = exports['default'];

},{"./DisplayTextHandler/DisplayTextHandler.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\StateToNodeConverter\\DisplayTextHandler\\DisplayTextHandler.js","./DisplayTextHandler/StringTokenizer/StringTokenizer.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\StateToNodeConverter\\DisplayTextHandler\\StringTokenizer\\StringTokenizer.js","./ErrorChecker/ErrorChecker.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\StateToNodeConverter\\ErrorChecker\\ErrorChecker.js","lodash":"lodash"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\d3DynamicVisualizer.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

var _storesSequencerStoreJs = require('../stores/SequencerStore.js');

var _storesSequencerStoreJs2 = _interopRequireDefault(_storesSequencerStoreJs);

// ======================================================
// D3 functions
// uses the standard D3 initialize / update pattern
// except update occurs through externally subscribed
// SequencerStore emit event.
// ======================================================

var _d3 = require('d3');

var _d32 = _interopRequireDefault(_d3);

var options = {
  rootPositionFixed: false,
  singleStepDelay: 700,
  d3Force: {
    tuningFactor: function tuningFactor(nodes) {
      return Math.max(Math.sqrt(nodes.length / (options.dimensions.width * options.dimensions.height)), 80);
    },
    charge: -500,
    chargeDistance: 500,
    gravity: 0.03,
    gravityFunc: function gravityFunc(nodes) {
      return 100 * tuningFactor(nodes);
    }
  },
  cssVars: {
    colorPrimary: '#2196F3',
    colorSecondary: '#4CAF50',
    warningErrorRange: ['#4CAF50', '#8BC34A', '#CDDC39', '#FDD835', '#FFC107', '#FF9800', '#FF5722', '#F44336', '#D50000']
  },
  dimensions: {
    radius: {
      node: 10,
      factor: {
        'function': 1,
        'root': 1.6,
        'failure': 1.2,
        'finished': 4
      }
    },
    labelBuffer: 50,
    width: null,
    height: null
  },
  links: {
    strength: function strength(d) {
      return 0.9;
    },
    distance: function distance(nodes) {
      return Math.sqrt(options.dimensions.width * options.dimensions.height) / nodes.length;
    }
  }
};
var svg = undefined,
    node = undefined,
    nodeText = undefined,
    link = undefined,
    forceLayout = undefined,
    drag = undefined,
    rootNode = undefined,
    finished = undefined;

// shared by externally available update function
function initialize(element, nodes, links, dimensions) {
  // cleanup vars to prevent rootNode remaining allocated
  destroy();
  options.dimensions.width = dimensions.width;
  options.dimensions.height = dimensions.height;

  _d32['default'].select(element).selectAll('*').remove();

  svg = _d32['default'].select(element).append('svg').attr('class', 'd3-root').attr('width', options.dimensions.width).attr('height', options.dimensions.height);
  appendArrows();

  link = svg.append('g').selectAll('link');
  node = svg.append('g').selectAll('node');
  forceLayout = createNewForceLayout(options.graphType, nodes, links);
  drag = forceLayout.drag().on('dragstart', onDragStart);
}

function appendArrows() {
  // add arrow reference for link paths
  [['arrow-calling', options.cssVars.colorPrimary], ['arrow-returning', options.cssVars.colorSecondary]].forEach(function (arrow) {
    svg.append('svg:defs').append('svg:marker').attr('id', arrow[0]).attr('refX', 16).attr('refY', 8).attr('markerWidth', 30).attr('markerHeight', 30).attr('orient', 'auto').style('fill', arrow[1]).append('svg:path').attr('d', 'M0,0 L0,16 L16,8 L0,0');
  });
}

function createNewForceLayout(graphType, nodes, links) {
  var force = _d32['default'].layout.force().links(links).nodes(nodes).size([options.dimensions.width, options.dimensions.height]).linkDistance(options.links.distance.bind(this, nodes)).charge(options.d3Force.charge).friction(0.7).gravity(options.d3Force.gravity).linkStrength(options.links.strength).chargeDistance(options.d3Force.chargeDistance).on('tick', tick);

  // for keeping nodes within the boundaries
  var inlay = options.dimensions.radius.node * 2;

  return force;

  function tick() {
    link.attr('x1', function (d) {
      d.source.x = getBoundingX(d.source.x);
      return getCirclePerimiterIntersection(d.target, d.source, 'x');
    }).attr('y1', function (d) {
      d.source.y = getBoundingY(d.source.y);
      return getCirclePerimiterIntersection(d.target, d.source, 'y');
    }).attr('x2', function (d) {
      d.target.x = getBoundingX(d.target.x);
      return getCirclePerimiterIntersection(d.source, d.target, 'x');
    }).attr('y2', function (d) {
      d.target.y = getBoundingY(d.target.y);
      return getCirclePerimiterIntersection(d.source, d.target, 'y');
    });

    function getBoundingX(x) {
      return Math.max(inlay, Math.min(options.dimensions.width - options.dimensions.labelBuffer, x));
    }

    function getBoundingY(y) {
      return Math.max(inlay, Math.min(options.dimensions.height, y));
    }

    node.attr('transform', function (d) {
      d.x = getBoundingX(d.x);
      d.y = getBoundingY(d.y);
      return 'translate(' + d.x + ',' + d.y + ')';
    });
    nodeText.attr('transform', function (d) {
      return 'translate(' + (d.radius + 10) + ',' + -(d.radius + 10) + ')';
    });
  }
}

function getCirclePerimiterIntersection(start, target, coord) {
  // NOTE: This particular function to calculate the distance of the line
  // to the edge of the circle, rather than to the center point of the node,
  // is taken from this source:
  // http://stackoverflow.com/questions/16568313/arrows-on-links-in-d3js-force-layout/16568625
  // these three lines involving atan2, cos and sin are the
  // only code I have not written entirely myself,
  // since I know nothing about geometry/trigonometry
  // and it is purely to accomplish the visual effect of not having link arrows
  // overlap with the nodes.
  var dx = target.x - start.x;
  var dy = target.y - start.y;
  // Math.atan2 returns the angle in the correct quadrant as opposed to Math.atan
  var gamma = Math.atan2(dy, dx);
  if (coord === 'x') {
    return target.x - Math.cos(gamma) * target.radius;
  }
  return target.y - Math.sin(gamma) * target.radius;
}

/* update function is externally available so
   that React can handle unsubscription of 
   event listeners calling it*/

function update() {
  if (!link || !node) {
    return;
  }

  link = link.data(forceLayout.links(), function (d) {
    // not the d3 generated node index; this is my own:
    // link needs to be re-indexed on return in order
    // to show different green arrowhead
    return d.linkIndex;
  });
  node = node.data(forceLayout.nodes(), function (d) {
    // re-matches data to work with shifting rather than popping
    // to follow stack behaviour
    d.radius = options.dimensions.radius.node * options.dimensions.radius.factor[d.type];
    return d.index;
  });

  // set up arrow/line drawing to sync up with live Sequencer options
  var delay = _storesSequencerStoreJs2['default'].getOptions().sequencerDelay;
  var delayFactor = _storesSequencerStoreJs2['default'].getOptions().delayFactor;
  var visualizerPercentageOfDelay = _storesSequencerStoreJs2['default'].getOptions().staggerEditorAndVisualizer ? _storesSequencerStoreJs2['default'].getOptions().visualizerPercentageOfDelay : 1;
  var singleStepDelay = options.singleStepDelay;
  var transitionDelay = _storesSequencerStoreJs2['default'].isSingleStep() ? singleStepDelay : delay * delayFactor / visualizerPercentageOfDelay;
  var showFunctionLabels = _storesSequencerStoreJs2['default'].getOptions().showFunctionLabels;
  var newLink = link.enter();

  newLink.append('line').attr('class', function (d) {
    return 'link link-' + d.linkState;
  }).attr('marker-end', function (d) {
    return d.linkState === 'calling' ? 'url(#arrow-calling)' : 'url(#arrow-returning';
  }).transition().duration(transitionDelay).ease('circle').attrTween('x2', function (d) {
    return function (t) {
      return _d32['default'].interpolate(getCirclePerimiterIntersection(d.target, d.source, 'x'), d.target.x)(t);
    };
  }).attrTween('y2', function (d) {
    return function (t) {
      return _d32['default'].interpolate(getCirclePerimiterIntersection(d.target, d.source, 'y'), d.target.y)(t);
    };
  });

  var nodeGroup = node.enter().append('g').on('dblclick', onDoubleclickNode).call(drag);

  if (!rootNode) {
    rootNode = nodeGroup;
  }

  nodeGroup.append('circle').attr('r', options.dimensions.radius.node);

  nodeText = nodeGroup.append('foreignObject').attr('class', 'unselectable function-text');

  var allText = node.selectAll('foreignObject');
  if (showFunctionLabels) {
    // trigger single text animation via internal flag on node
    var updateText = allText.filter(function (d) {
      if (d.updateText) {
        d.updateText = false;
        return true;
      }
    });
    // swap out old text with new text
    // d3 will not notice changed text
    // unless this is done to all nodes
    allText.attr('width', 250).attr('height', 60).html(function (d) {
      return '<xhtml:div class="pointer unselectable function-text"}>' + d.displayName + '</div>';
    });
    // hide the text that is to be updated then re-grow
    var animateText = updateText.select('div');
    shrinkAndGrowText(animateText);
  } else {
    allText.html('');
  }

  function shrinkAndGrowText(selection) {
    selection.transition().duration(transitionDelay / 2).attr('opacity', 0).attr('class', 'update-text-shrink').each('end', function () {
      selection.transition().duration(transitionDelay / 2).attr('opacity', 1).attr('class', 'unselectable function-text');
    });
  }

  node.selectAll('circle').attr('class', function (d) {
    return 'function ' + d.type + ' ' + (d.status || '') + (d.fixed ? ' function-fixed' : '');
  });

  // make the root node more 'angry' and bigger for each error...
  var maxAllowedErrors = options.cssVars.warningErrorRange.length - 1;
  var errorCount = 0;
  var endGroup = rootNode.select('circle');

  endGroup.classed('finished', function (d) {
    if (d.status === 'finished') {
      rootNode.select('foreignObject').html('<xhtml:div class="finish-text"><div>' + (d.errorCount > 0 ? d.errorCount : 'No') + ' critical errors.</div>' + (!d.errorCount ? '<div>FUNCTIONAL.</div></div>' : '</div>'));
      return finished = true;
    }
  }).transition().duration(singleStepDelay).attr('r', function (d) {
    errorCount = d.errorCount;
    var nodeSize = errorCount + options.dimensions.radius.node * options.dimensions.radius.factor.root;
    d.radius = Math.min(nodeSize + errorCount * options.dimensions.radius.factor.root, nodeSize + maxAllowedErrors * options.dimensions.radius.factor.root);
    return d.radius;
  }).attr('fill', function (d) {
    return options.cssVars.warningErrorRange[Math.min(errorCount, maxAllowedErrors)];
  });

  if (errorCount > maxAllowedErrors) {
    rootNode.call(pulse);
  }

  // break links exceeding max return capacity,
  // then fade out their nodes
  link.exit().remove();

  node.exit().transition().duration(singleStepDelay).style('opacity', 0).remove();
  // the above alone does not fade out foreignObject text
  // so I fade out the text twice as fast as well, which is less obtrusive
  node.exit().selectAll('foreignObject').transition().duration(singleStepDelay / 2).style('opacity', 0).remove();

  // don't restart the layout if only text has changed,
  // otherwise this causes the forceLayout to 'kick' when
  // the parameter text is the only thing that updates
  var newNodesLength = nodeGroup[0].length;
  var newLinksLength = newLink[0].length;
  if (newNodesLength > 0 && nodeGroup[0][newNodesLength - 1] !== null || newLinksLength > 0 && newLink[0][newLinksLength - 1] !== null) {
    forceLayout.start();
  }

  function pulse() {
    if (rootNode && !finished) {
      rootNode.select('circle').transition().duration(250).attr('r', function (d) {
        return d.radius;
      }).transition().duration(250).attr('r', function (d) {
        return d.radius * 1.1;
      }).ease('ease').each('end', pulse);
    }
  }
}

function onDragStart(d) {
  if (!finished) {
    _d32['default'].select(this).select('circle').classed('function-fixed no-transition', d.fixed = true);
    // prevents browser scrolling whilst dragging about node
    _d32['default'].event.sourceEvent.preventDefault();
  }
}

function onDoubleclickNode(d) {
  if (!finished) {
    _d32['default'].select(this).select('circle').classed('function-fixed no-transition', d.fixed = false);
  }
}

function destroy() {
  // probably not necessary if React resets components
  if (svg) {
    svg.selectAll('*').remove();
    forceLayout.stop();
  }
  svg = forceLayout = node = link = rootNode = null;
  finished = false;
}

exports['default'] = {
  initialize: initialize, update: update, destroy: destroy
};
module.exports = exports['default'];

},{"../stores/SequencerStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\SequencerStore.js","d3":"d3"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\jsInterpreterInit\\jsInterpreterInit.js":[function(require,module,exports){
// the interpreter only supports basic built-in functions
// here I add some more wrappers to native functions I wanted to
// see supported for the purpose of this exercise:
// array.map and array.reduce, care of lodash and ES5 polyfills.

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function init(interpreter, scope) {

  var map = function map(iteratee, array) {

    array = this;
    iteratee = interpreter.FUNCTION.nativeFunc(iteratee);

    var index = -1,
        length = array.length,
        result = [];
    result.length = length;

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return interpreter.wrapPrimitive(result);
  };

  var reduce = function reduce(array, callback, initialValue) {

    var array = this;
    var len = array.length >>> 0,
        index = 0,
        accumulator;
    if (arguments.length == 2) {
      accumulator = arguments[1];
    } else {
      while (index < len && !(index in array)) {
        index++;
      }
      accumulator = array[index++];
    }
    for (; index < len; index++) {
      if (index in array) {
        accumulator = callback(accumulator, array[index]);
      }
    }
    return accumulator;
  };

  interpreter.setProperty(interpreter.ARRAY.properties.prototype, 'map', interpreter.createNativeFunction(map), false, true);
  interpreter.setProperty(interpreter.ARRAY.properties.prototype, 'reduce', interpreter.createNativeFunction(reduce), false, true);
}

exports['default'] = init;
module.exports = exports['default'];

},{}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3StaticVisualizer\\BuildStaticCallGraph.js":[function(require,module,exports){
/* static helper to provide 'dressed' array of new-scope
(function) nodes for initial static call graph display.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i['return']) _i['return']();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError('Invalid attempt to destructure non-iterable instance');
    }
  };
})();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

var _acorn = require('acorn');

var _estraverse = require('estraverse');

var _estraverse2 = _interopRequireDefault(_estraverse);

var _escodegen = require('escodegen');

var _escodegen2 = _interopRequireDefault(_escodegen);

var _lodash = require('lodash');

var _DeclarationTrackerJs = require('./DeclarationTracker.js');

var _DeclarationTrackerJs2 = _interopRequireDefault(_DeclarationTrackerJs);

var _astToolsAstToolsJs = require('../astTools/astTools.js');

var _astToolsAstToolsJs2 = _interopRequireDefault(_astToolsAstToolsJs);

var _storesSequencerStoreJs = require('../stores/SequencerStore.js');

var _storesSequencerStoreJs2 = _interopRequireDefault(_storesSequencerStoreJs);

function StaticCallGraph() {

  function showIdentifierError(e) {
    _storesSequencerStoreJs2['default'].setStepOutput({
      warning: {
        action: 'ok',
        message: e.message
      }
    });
    _storesSequencerStoreJs2['default'].sendUpdate(true);
  }

  var decTracker = new _DeclarationTrackerJs2['default']('array');

  function get(codeToParse) {
    var ast = _astToolsAstToolsJs2['default'].createAst(codeToParse, false);

    var _getCallGraph = getCallGraph(ast);

    var _getCallGraph2 = _slicedToArray(_getCallGraph, 2);

    var nodes = _getCallGraph2[0];
    var links = _getCallGraph2[1];

    return [nodes, links];
  }

  function getCallGraph(ast) {
    var scopeChain = [];
    var currentScope = null;
    var nodes = [];
    var links = [];

    _estraverse2['default'].traverse(ast, {
      enter: function enter(node, parent) {
        if (_astToolsAstToolsJs2['default'].createsNewFunctionScope(node)) {
          currentScope = createNewNode(node, nodes);
          nodes.push(currentScope);
          scopeChain.push(currentScope);

          var params = node.params;
          if (params && params.length > 0) {
            addVariableInfo(currentScope, params, true);
          }
        }
        switch (node.type) {
          case 'VariableDeclarator':
            // TODO: currently works for single assignment only
            addVariableInfo(currentScope, node.id);
            break;
          case 'FunctionDeclaration':
          case 'FunctionExpression':
            addFunctionInfo(currentScope, node);
            break;
          case 'CallExpression':
            addFunctionCallRef(currentScope, node);
            break;
        }
      },
      leave: function leave(node, parent) {
        if (_astToolsAstToolsJs2['default'].createsNewFunctionScope(node)) {
          addLinks(currentScope, links);
          decTracker.exitNode(node);
          scopeChain.pop();
          currentScope = (0, _lodash.last)(scopeChain);
        }
      }
    });
    return [nodes, links];
  }

  function createNewNode(node, nodes) {
    var parent = undefined;
    var functionName = undefined;
    if (node.type === 'Program') {
      parent = null;
      functionName = 'Program';
    } else {
      parent = (0, _lodash.last)(nodes);
      functionName = node.id ? node.id.name : 'anonymous';
    }

    var newNode = _extends(node, {
      scopeInfo: {
        id: functionName,
        scope: 'scope ' + nodes.length,
        codeString: _astToolsAstToolsJs2['default'].createCode(node, {}),
        params: node.params,
        parent: parent,
        declarationsMade: [],
        functionsCalled: []
      }
    });
    return newNode;
  }

  function addVariableInfo(currentScope, variables, isParam) {
    var varArray = Array.isArray(variables) ? variables : [variables];
    varArray.forEach(function (variable) {
      try {
        if (_astToolsAstToolsJs2['default'].typeIsSupported(variable.type)) {
          if (isParam) {
            variable.isParam = true;
          }
          decTracker.set(variable.name, currentScope);
          currentScope.scopeInfo.declarationsMade.push(variable);
        }
      } catch (e) {
        showIdentifierError(e);
      }
    });
  }

  function addFunctionInfo(currentScope, node) {
    // if there's no id, it's an anonymous function
    // so can't be referred to elsewhere and therefore
    // doesn't need to be tracked
    if (node.id) {
      decTracker.set(node.id.name, currentScope);
    }
  }

  function addFunctionCallRef(currentScope, node) {
    // TODO: add support for members and builtins
    try {
      if (_astToolsAstToolsJs2['default'].typeIsSupported(node.callee.type)) {
        currentScope.scopeInfo.functionsCalled.push({
          calleeName: _astToolsAstToolsJs2['default'].getCalleeName(node),
          source: currentScope,
          target: null,
          arguments: node.arguments
        });
      }
    } catch (e) {
      showIdentifierError(e);
    }
  }

  function addLinks(currentScope, links) {
    currentScope.scopeInfo.functionsCalled.forEach(function (funcCall) {
      /* now we're exiting the scope, we can add the target
         and thus account for hoisted functions declared after call */
      funcCall.target = decTracker.getLast(funcCall.calleeName);
      links.push(funcCall);
    });
  }

  return {
    get: get
  };
}

exports['default'] = new StaticCallGraph();
module.exports = exports['default'];

},{"../astTools/astTools.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\astTools\\astTools.js","../stores/SequencerStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\SequencerStore.js","./DeclarationTracker.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3StaticVisualizer\\DeclarationTracker.js","acorn":"acorn","escodegen":"escodegen","estraverse":"estraverse","lodash":"lodash"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3StaticVisualizer\\DeclarationTracker.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

function DeclarationTracker(valueRefType) {
  /* keep track of variable/function declaration set via:
   {variable string: [array containing each d3 scope node the variable is declared in]}
  (so this allows for same name being shadowed at deeper scope)
   extended normal Map functions to manage array access and confine
   the different management of choosing node.parent for function declarations */
  var declarationTracker = new Map();

  function set(key, node) {
    if (declarationTracker.has(key)) {
      declarationTracker.get(key).push(node);
    } else {
      declarationTracker.set(key, node ? [node] : []);
    }
  }

  function keys() {
    return declarationTracker.keys;
  }

  // 2d Map for tracking scope -> declaration -> array of recurring expressions from that declaration
  function setMap(key, valueKey, value) {
    if (declarationTracker.has(key)) {
      // it has the scope
      var foundPrimaryKey = declarationTracker.get(key);
      if (foundPrimaryKey.has(valueKey)) {
        foundPrimaryKey.get(valueKey).push(value);
      } else {
        foundPrimaryKey.set(valueKey, [value]);
      }
    } else {
      declarationTracker.set(key, new Map([[valueKey, [value]]]));
    }
  }

  function remove(key) {
    if (declarationTracker.get(key).length > 0) {
      declarationTracker.get(key).pop();
    }
    if (declarationTracker.get(key).length === 0) {
      declarationTracker['delete'](key);
    }
  }

  function removeMap(key, name) {
    if (declarationTracker.get(key).size > 0) {
      declarationTracker.get(key)['delete'](name);
    } else {
      declarationTracker['delete'](key);
    }
  }

  function get(key) {
    return declarationTracker.get(key);
  }

  function getMap(key, valueKey) {
    return declarationTracker.get(key);
  }

  function getLast(key) {
    return (0, _lodash.last)(declarationTracker.get(key));
  }

  function getFirst(key) {
    return declarationTracker.get(key)[0];
  }

  function has(key) {
    return declarationTracker.has(key);
  }

  function getDeclaredScope(key) {
    var node = (0, _lodash.last)(declarationTracker.get(key));
    if (node.type === 'FunctionDeclaration') {
      return node.parent;
    }
    return node;
  }

  function isDeclaredInCurrentScope(key, node) {
    return getDeclaredScope(key) === node;
  }

  function exitNode(node) {
    /* clean up - remove any nested function scopes.
       This process allows for same-named variables
       on different scopes to be matched. */
    declarationTracker.forEach(function (scopeChain, key) {
      var exitingDeclarationScope = (0, _lodash.last)(scopeChain);
      if (exitingDeclarationScope === node && node.type === 'Identifier') {
        scopeChain.pop();
      } else if (exitingDeclarationScope.parent === node && node.type === 'FunctionDeclaration') {
        scopeChain.pop();
      }
      if (scopeChain.length === 0) {
        declarationTracker['delete'](key);
      }
    });
  }

  return valueRefType === 'array' ? {
    get: get, getLast: getLast, getFirst: getFirst, set: set, has: has, exitNode: exitNode, remove: remove
  } : {
    get: get, set: setMap, has: has, remove: removeMap
  };
}

exports['default'] = DeclarationTracker;
module.exports = exports['default'];

},{"lodash":"lodash"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3StaticVisualizer\\d3StaticVisualizer.js":[function(require,module,exports){
// ======================================================
// D3 functions
// D3 controls the VisPane React component contents
// uses the standard D3 initialize / update pattern
// except update occurs through SequencerStore emit event
// ======================================================
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var d3 = require('d3');
//let cola = require('webcola');

var options = {
  graphType: 'd3',
  dimensions: {
    width: null,
    height: null
  },
  d3Force: {
    charge: -800,
    chargeDistance: 500,
    gravity: 0.01
  },
  layout: {
    globalScopeFixed: true
  },
  funcBlock: {
    height: 200,
    width: 190,
    text: {
      lineHeight: 20
    }
  },
  links: {
    display: 'call', // call, hierarchy, or both
    strength: function strength(d) {
      return 0.01;
    },
    distance: function distance(nodes) {
      return options.dimensions.width / Math.min(Math.max(nodes.length, 1), 15);
    }
  }
};

var svg = undefined,
    node = undefined,
    link = undefined,
    forceLayout = undefined,
    tooltip = undefined,
    drag = undefined;

function initialize(element, nodes, links, dimensions) {
  options.dimensions = dimensions;

  // take the global scope out and fix it in the top right to start
  if (options.layout.globalScopeFixed) {
    var globalScope = nodes[0];
    _extends(globalScope, {
      x: options.dimensions.width,
      y: 0,
      fixed: true
    });
  }

  // cleanup if React udpates and doesn't re-mount DOM element
  d3.select(element).selectAll('*').remove();

  svg = d3.select(element).append('svg').attr('class', 'd3-root').attr('width', options.dimensions.width).attr('height', options.dimensions.height);

  // save arrow SVG
  svg.append('svg:defs').append('svg:marker').attr('id', 'arrow').attr('refX', 3).attr('refY', 6).attr('markerWidth', 20).attr('markerHeight', 20).attr('orient', 'auto').style('fill', 'darkgray').append('svg:path').attr('d', 'M2,2 L2,11 L10,6 L2,2');

  tooltip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);

  forceLayout = createNewForceLayout(options.graphType, nodes, links);
  // allow for dragging of nodes to reposition functions
  drag = forceLayout.drag().on('dragstart', onDragStart);

  link = svg.selectAll('.function-link');
  node = svg.selectAll('.function-node');

  // for the bounding window when dragging functionBlocks
  var inlay = 0;
  var xBuffer = inlay + options.funcBlock.width / 2;
  var yBuffer = inlay + options.funcBlock.height / 2;
  var maxAllowedX = options.dimensions.width - options.funcBlock.width;
  var maxAllowedY = options.dimensions.height - options.funcBlock.height;
  forceLayout.on('tick', function () {
    link.attr('points', function (d) {
      var x1 = Math.max(xBuffer, Math.min(options.dimensions.width - xBuffer, d.source.x + xBuffer));
      var y1 = Math.max(yBuffer, Math.min(options.dimensions.height - yBuffer, d.source.y + yBuffer));
      var x2 = Math.max(xBuffer, Math.min(options.dimensions.width - xBuffer, d.target.x + xBuffer));
      var y2 = Math.max(yBuffer, Math.min(options.dimensions.height - yBuffer, d.target.y + yBuffer));
      var midX = (x1 + x2) / 2;
      var midY = (y1 + y2) / 2;
      return x1 + ',' + y1 + ' ' + midX + ',' + midY + ' ' + x2 + ',' + y2;
    });

    node.attr('transform', function (d) {
      d.x = Math.max(inlay, Math.min(maxAllowedX, d.x));
      d.y = Math.max(inlay, Math.min(maxAllowedY, d.y));
      return 'translate(' + d.x + ', ' + d.y + ')';
    });
  });
}

function update() {
  node = node.data(forceLayout.nodes());
  link = link.data(forceLayout.links());
  link.enter().append('polyline');
  drawFunctionLink(link);
  node.enter().append('g').on('dblclick', onDoubleclickNode);
  drawFunctionBlock(node, tooltip);
  node.exit().remove();
  node.call(drag);
}

function destroy(element) {
  if (forceLayout) {
    forceLayout.stop();
  }
  d3.select(element).selectAll('*').remove();
  svg = forceLayout = node = link = null;
}

// ===================
// Helper functions
// ===================

function createNewForceLayout(graphType, nodes, links) {
  var force = undefined;
  if (graphType === 'd3') {
    force = d3.layout.force();
  } else if (graphType === 'cola') {
    // colaJS improves and stabilises the d3 force layout graph
    force = cola.d3adaptor();
  }
  force.size([options.dimensions.width, options.dimensions.height]).nodes(nodes).links(links).linkDistance(options.links.distance.bind(this, nodes));

  if (graphType === 'd3') {
    force.charge(options.d3Force.charge).gravity(options.d3Force.gravity).linkStrength(options.links.strength).chargeDistance(options.d3Force.chargeDistance).start();
  } else if (graphType === 'cola') {
    force.avoidOverlaps(true).start([10, 15, 20]);
  }
  return force;
}

function drawFunctionLink(link) {
  link.attr('class', 'function-link').attr('marker-mid', 'url(#arrow)');
}

function drawFunctionBlock(funcBlock, tooltip) {
  funcBlock.append('rect').attr('class', 'function-node').attr('width', function (d) {
    return d.width || options.funcBlock.width;
  }).attr('height', function (d) {
    return d.height || options.funcBlock.height;
  }).attr('rx', 10).attr('ry', 10);

  var addText = appendText(funcBlock, 10, 25);
  addText('function-name', 'id');
  var addHoverText = appendText(funcBlock, 160, 10, 170, 'rect');
  var toolTipArea = addHoverText('function-hover');
  addToolTip(toolTipArea, tooltip);
  addText('function-text', 'scope');
  addText('function-text', 'params');
  addText('function-heading', 'Variables declared:');
  addText('function-text', 'declarationsMade');
  addText('function-heading', 'Variables mutated:');
  addText('function-text', 'variablesMutated');
  addText('function-heading', 'Functions called:');
  addText('function-text', 'functionsCalled');

  function appendText(block) {
    var textBlock = block;

    for (var _len = arguments.length, other = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      other[_key - 1] = arguments[_key];
    }

    var x = other[0];
    var y = other[1];
    var dx = other[2];
    var element = other[3];

    element = element ? element : 'text';

    return function (className, textOrKey) {
      textBlock = funcBlock.append(element).attr('class', className).attr('x', x).attr('y', y);

      if (dx) {
        textBlock.attr('dx', dx).style('text-anchor', 'end');
      }
      if (element === 'text') {
        textBlock.text(function (d) {
          var keyLookupText = d.scopeInfo[textOrKey];
          return keyLookupText !== undefined ? keyLookupText.toString() : textOrKey;
        });
      }

      y += options.funcBlock.text.lineHeight;
      return textBlock;
    };
  }
}

function addToolTip(area, tooltip) {
  area.on('mouseover', function (d) {
    tooltip.transition().duration(200).style('opacity', 0.9);
    tooltip.text(d.scopeInfo.codeString.split('\n')).style('left', d3.event.pageX + 'px').style('top', d3.event.pageY - 28 + 'px');
  }).on('mouseout', function (d) {
    tooltip.transition().duration(500).style('opacity', 0);
  });
}

function onDragStart(d) {
  d3.select(this).select('rect').classed('fixed', d.fixed = true);
  // prevents browser scrolling whilst dragging about node
  d3.event.sourceEvent.preventDefault();
}

function onDoubleclickNode(d) {
  d3.select(this).select('rect').classed('fixed', d.fixed = false);
}
exports['default'] = {
  initialize: initialize, update: update, destroy: destroy
};
module.exports = exports['default'];

},{"d3":"d3"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\examples\\exampleFiles\\fibonacciRecursive.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var fibonacciRecursive = {
  id: fibonacciRecursive,
  title: 'Fibonacci sequence',
  func: function Program() {
    /* This example demonstrates a side-effect free,
       functional implementation of the
       Fibonacci sequence. 
         Try turning down the sequencer delay
       (under the dropdown Options menu at the
        top right of the App bar)
       to the minimum, and see it go!
         All of the 'Dynamic Visualization' options
       can also be adjusted on the fly, whilst
       the visualization is running.
    */

    function fibonacci(n) {
      if (n <= 2) {
        return 1;
      }
      return fibonacci(n - 1) + fibonacci(n - 2);
    }

    var result = fibonacci(10);
  }
};
exports['default'] = fibonacciRecursive;
module.exports = exports['default'];

},{}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\examples\\exampleFiles\\funcWithoutReturn.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var funcWithoutReturn = {
    id: funcWithoutReturn,
    title: 'Function without return',
    func: function Program() {
        /* 
           Parse the filled-in code, then press
           the 'next' button to step through the
           program and see what happens when you
           exit a function that does not return
           a value (or returns undefined):
           
           you break the function chain!
             An error also occurs if you exit a function
           that returns a value, but do not assign
           that result to a function. 
        */

        function funcWithoutReturnStatement() {
            // some action without a
            // visible result passed back...
            var invisible = "I'm a blackboxed function...bad";
        }

        function funcWithReturnStatement() {
            return 'I return something...';
        }

        /* this will generate two errors - 
           one for no return, and one for 
           the result being unassigned */
        funcWithoutReturnStatement();

        /* I considered blocking the non-assignment
            error if the function had already
            not returned anything, but figured
            that they were both independent problems
            of each of the functions: the caller
            should be assuming that a blackboxed
            stateless function is returning
            a result that needs to be assigned. */
        funcWithoutReturnStatement();

        /* This only generates a single error: 
           The function successfully returns a 
           value, but this value remains unassigned. */
        funcWithReturnStatement();

        /* 
           Finally, you can observe the root node
           behaviour as indicative of how 'strictly'
           the program is adhering to the principles
           of purely functional patterns:
           it gets larger and 'redder' as more
           errors are made, eventually 'pulsating'.
        */
        funcWithReturnStatement();
        funcWithReturnStatement();
        funcWithReturnStatement();
        funcWithReturnStatement();
        funcWithReturnStatement();
        funcWithReturnStatement();

        /* This statement does not generate either error. */
        var assignedResult = funcWithReturnStatement();
    }
};
exports['default'] = funcWithoutReturn;
module.exports = exports['default'];

},{}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\examples\\exampleFiles\\functionalSum.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var functionalSum = {
  id: functionalSum,
  title: 'Sum: functional',
  func: function Program() {
    /* 
       This example demonstrates adding an
       array in a functional manner, via
       a 'reduce' callback function.
         Note that the program is not 'purely'
       functional, since the accumulator
       variable is mutated each time -
       so the end graph is not wholly green.
         However, variables mutated in scope
       only generate a 'yellow' node and give
       a notice - they do not actually add 
       to the error count, since in practice
       this is not a hard-and-fast requirement
       in a language that is not purely functional. 
    */

    function reduce(array, iteratee, accumulator, initFromArray) {
      var index = -1;
      var length = array.length;

      if (initFromArray && length) {
        accumulator = array[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }
      return accumulator;
    }

    function sumFunction(arrayToSum) {
      return reduce(arrayToSum, function (a, b) {
        return a + b;
      }, 0);
    }
    var numbers = [1, 1, 4, 6, 10, 50, 500];
    var sum = sumFunction(numbers);
  }
};

exports['default'] = functionalSum;
module.exports = exports['default'];

},{}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\examples\\exampleFiles\\imperativeSum.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var imperativeSum = {
    id: 'imperativeSum',
    title: 'Sum: imperative',
    text: 'It is easier to reason about the flow of a program\n         when variables are passed directly into a program\n         and a result is passed out to assign to a function.\n\n         Here, the variables arrayToSum and sum are mutated\n         out of scope, meaning that sumFunction causes\n         \'side effects\'.\n\n         The end result of \'sum\' is reliant on this mutation,\n         but if sumFunction was private, it may similarly\n         have mutated other variables without us knowing...      \n          ',
    func: function Program() {
        /*  This base case demonstarates adding an array of
            numbers imperatively.
            The variables arrayToSum and sum are mutated
            out of scope, so the function 'sumFunction' causes
            side effects. */

        /*  In this situation, a warning notice is given and 
            both the function mutating the variable and the 
            function in which the variable is declared are
            both highlighted orange. 
        */

        var arrayToSum = [3, 5, 5, 10];
        var sum = 0;

        function sumFunction() {
            for (var i = 0; i < arrayToSum.length; i++) {
                sum += arrayToSum[i];
            }
        }

        sumFunction();
    }
};

exports['default'] = imperativeSum;
module.exports = exports['default'];

},{}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\examples\\exampleFiles\\nestedReturn.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var nestedReturn = {
  id: nestedReturn,
  title: 'Nested returns',
  text: 'Demonstrates argument / param matching and propogation',
  func: function Program() {

    /* This function exists as a proof of concept for testing:
        - passing of literals
        - matching of param names used in calling function
          with the arguments passed in from the parent scope
        - passing back combinations of the two.     */

    function foo(receivedLiteralInFoo) {

      function bar(receivedLiteralInBar, receivedFunctionInBar) {
        return 'returning ' + receivedLiteralInBar + ' and ' + receivedFunctionInBar;
      }

      function passToBarAsArgument(receivedLiteralInBar) {
        return "I'm returning from passToBarAsArgument" + ' and ' + receivedLiteralInBar;
      }

      return bar(receivedLiteralInFoo, passToBarAsArgument(receivedLiteralInFoo));
    }

    var result = foo("I've been passed into foo");
  }
};

exports['default'] = nestedReturn;
module.exports = exports['default'];

},{}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\examples\\exampleFiles\\smashingMagazine.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var id = 'smashingMagazineDemo';
var title = 'Smashing Magazine demo';
var description = '';

function Program() {
  /* NOTE - this example does not work with the
     'static' Proof of Concept visualization - I 
     stopped work on that before I began working
     with this. The static POC was only intended to get me
     to grips with the various challenges involved
     for the dynamic visualization. */

  /* This code is an adaptation of that supplied with the 
     Smashing Magazine article, "Don't be Afraid of Functional
     Programming", by Jonathan Morgan. It can be found here:
     http://www.smashingmagazine.com/2014/07/dont-be-scared-of-functional-programming 
     */

  function map(iteratee, array) {
    var index = -1,
        length = array.length,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  function reduce(array, callback, initialValue) {
    var len = array.length,
        index = 0,
        accumulator;
    if (arguments.length == 2) {
      accumulator = arguments[1];
    } else {
      while (index < len && !(index in array)) {
        index++;
      }
      accumulator = array[index++];
    }
    for (; index < len; index++) {
      if (index in array) {
        accumulator = callback(accumulator, array[index]);
      }
    }
    return accumulator;
  }

  var data = [{
    name: 'Jamestown',
    population: 2047,
    temperatures: [-34, 67, 101, 87]
  }, {
    name: 'Awesome Town',
    population: 3568,
    temperatures: [-3, 4, 9, 12]
  }, {
    name: 'Funky Town',
    population: 1000000,
    temperatures: [75, 75, 75, 75]
  }];

  function addNumbers(a, b) {
    return a + b;
  }

  function totalForArray(arr) {
    return reduce(arr, addNumbers);
  }

  function average(total, count) {
    return total / count;
  }

  function averageForArray(arr) {
    return average(totalForArray(arr), arr.length);
  }

  // Pass in the name of the property that you'd like to retrieve
  function getItem(propertyName) {
    // Return a function that retrieves that item, but don't execute the function.

    return function (item) {
      return item[propertyName];
    };
  }

  function pluck(arr, propertyName) {
    return map(getItem(propertyName), arr);
  }

  function combineArrays(_x, _x2, _x3) {
    var _again = true;

    _function: while (_again) {
      var arr1 = _x,
          arr2 = _x2,
          finalArr = _x3;
      remainingArr1 = remainingArr2 = undefined;
      _again = false;

      // Just so we don't have to remember to pass an empty array as the third
      // argument when calling this function, we'll set a default.
      finalArr = finalArr || [];

      // Push the current element in each array into what we'll eventually return
      finalArr[finalArr.length] = [arr1[0], arr2[0]];

      var remainingArr1 = arr1.slice(1),
          remainingArr2 = arr2.slice(1);

      // If both arrays are empty, then we're done
      if (remainingArr1.length === 0 && remainingArr2.length === 0) {
        return finalArr;
      }
      _x = remainingArr1;
      _x2 = remainingArr2;
      _x3 = finalArr;
      _again = true;
      continue _function;
    }
  }

  /*  var processed = combineArrays(
      map(averageForArray, pluck(data, 'temperatures')),
      pluck(data, 'population'));
  */
  var populations = pluck(data, 'population');
  var allTemperatures = pluck(data, 'temperatures');
  var averageTemps = map(averageForArray, allTemperatures);
  var processed = combineArrays(averageTemps, populations);
}

exports['default'] = {
  id: id, title: title, description: description, func: Program
};
module.exports = exports['default'];
// array.
// We'll leave that up to the method that is taking action on items in our

},{}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\examples\\exampleFiles\\varMutatedOutOfScope.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var varMutatedOutOfScope = {
  id: varMutatedOutOfScope,
  title: 'Variable mutations',
  text: '',
  func: function Program() {
    /* This example demonstrates the effect of
       mutating a variable that was not declared
       in the same scope (no side effects allowed).
       The node mutating and the node (scope) in which the
       variable was initially declared are both highlighted.
    */
    function foo() {
      bar = 'mutation';
    }

    var bar = 'declaration';
    foo();
  }
};
exports['default'] = varMutatedOutOfScope;
module.exports = exports['default'];

},{}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\examples\\examples.js":[function(require,module,exports){
/*  examples constants file.
  every file in example dir has exports.
  can pre-sort by order here for easy adding/removal
  to NavBar.
  */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

var _exampleFilesFuncWithoutReturnJs = require('./exampleFiles/funcWithoutReturn.js');

var _exampleFilesFuncWithoutReturnJs2 = _interopRequireDefault(_exampleFilesFuncWithoutReturnJs);

var _exampleFilesImperativeSumJs = require('./exampleFiles/imperativeSum.js');

var _exampleFilesImperativeSumJs2 = _interopRequireDefault(_exampleFilesImperativeSumJs);

var _exampleFilesFunctionalSumJs = require('./exampleFiles/functionalSum.js');

var _exampleFilesFunctionalSumJs2 = _interopRequireDefault(_exampleFilesFunctionalSumJs);

var _exampleFilesVarMutatedOutOfScopeJs = require('./exampleFiles/varMutatedOutOfScope.js');

var _exampleFilesVarMutatedOutOfScopeJs2 = _interopRequireDefault(_exampleFilesVarMutatedOutOfScopeJs);

var _exampleFilesFibonacciRecursiveJs = require('./exampleFiles/fibonacciRecursive.js');

var _exampleFilesFibonacciRecursiveJs2 = _interopRequireDefault(_exampleFilesFibonacciRecursiveJs);

var _exampleFilesNestedReturnJs = require('./exampleFiles/nestedReturn.js');

var _exampleFilesNestedReturnJs2 = _interopRequireDefault(_exampleFilesNestedReturnJs);

var _exampleFilesSmashingMagazineJs = require('./exampleFiles/smashingMagazine.js');

var _exampleFilesSmashingMagazineJs2 = _interopRequireDefault(_exampleFilesSmashingMagazineJs);

var examples = [_exampleFilesFuncWithoutReturnJs2['default'], _exampleFilesImperativeSumJs2['default'], _exampleFilesFunctionalSumJs2['default'], _exampleFilesVarMutatedOutOfScopeJs2['default'], _exampleFilesNestedReturnJs2['default'], _exampleFilesFibonacciRecursiveJs2['default'], _exampleFilesSmashingMagazineJs2['default']];

exports['default'] = examples;
module.exports = exports['default'];

},{"./exampleFiles/fibonacciRecursive.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\examples\\exampleFiles\\fibonacciRecursive.js","./exampleFiles/funcWithoutReturn.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\examples\\exampleFiles\\funcWithoutReturn.js","./exampleFiles/functionalSum.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\examples\\exampleFiles\\functionalSum.js","./exampleFiles/imperativeSum.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\examples\\exampleFiles\\imperativeSum.js","./exampleFiles/nestedReturn.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\examples\\exampleFiles\\nestedReturn.js","./exampleFiles/smashingMagazine.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\examples\\exampleFiles\\smashingMagazine.js","./exampleFiles/varMutatedOutOfScope.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\examples\\exampleFiles\\varMutatedOutOfScope.js"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\CodeStatusStore.js":[function(require,module,exports){
/* specifically to announce when the code is running or not, 
   to give immediate timeout independent feedback to Editor
   and ControlBar, and checked on each pass of the Sequencer. */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var event = require('events');

function CodeStatusStore() {
  var codeStatusStore = Object.create(event.EventEmitter.prototype);

  var codeRunning = false;
  var codeParsed = false;
  var codeFinished = false;

  function subscribeListener(callback) {
    codeStatusStore.on('change', callback);
  }

  function unsubscribeListener(callback) {
    codeStatusStore.removeListener('change', callback);
  }

  function setCodeRunning(flag) {
    codeRunning = flag;
    codeStatusStore.emit('change', {
      codeRunning: codeRunning, codeParsed: codeParsed
    });
  }

  function isCodeRunning() {
    return codeRunning;
  }

  function emitChange() {
    codeStatusStore.emit('change', {
      codeRunning: codeRunning, codeParsed: codeParsed, codeFinished: codeFinished
    });
  }

  function setCodeParsed(flag) {
    codeParsed = flag;
    codeRunning = false;
    codeFinished = false;
    emitChange();
  }

  function isCodeParsed() {
    return codeParsed;
  }

  function setCodeFinished(flag) {
    codeFinished = flag;
    codeRunning = false;
    emitChange();
  }

  function isCodeFinished() {
    return codeFinished;
  }

  return {
    subscribeListener: subscribeListener,
    unsubscribeListener: unsubscribeListener,
    setCodeRunning: setCodeRunning,
    isCodeRunning: isCodeRunning,
    setCodeParsed: setCodeParsed,
    isCodeParsed: isCodeParsed,
    setCodeFinished: setCodeFinished,
    isCodeFinished: isCodeFinished
  };
}
exports['default'] = new CodeStatusStore();
module.exports = exports['default'];

},{"events":"C:\\Users\\pitch\\functional-visualiser\\node_modules\\browserify\\node_modules\\events\\events.js"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\CodeStore.js":[function(require,module,exports){
/* Solely for live updating code, since a number of components
   subscribe specifically to this and nothing else.*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var event = require('events');

function CodeStore() {
  var codeStore = Object.create(event.EventEmitter.prototype);

  var codeString = '';

  function subscribeListener(callback) {
    codeStore.on('change', callback);
  }

  function unsubscribeListener(callback) {
    codeStore.removeListener('change', callback);
  }

  function set(newCode, userUpdate) {
    codeString = newCode.toString().trim();
    codeStore.emit('change', userUpdate);
  }

  function get() {
    return codeString;
  }

  return {
    subscribeListener: subscribeListener,
    unsubscribeListener: unsubscribeListener,
    set: set,
    get: get
  };
}
exports['default'] = new CodeStore();
module.exports = exports['default'];

},{"events":"C:\\Users\\pitch\\functional-visualiser\\node_modules\\browserify\\node_modules\\events\\events.js"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\ConstantStore.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

var _examplesExamplesJs = require('../examples/examples.js');

var _examplesExamplesJs2 = _interopRequireDefault(_examplesExamplesJs);

var _docsEarlyDeliverableJs = require('../../docs/earlyDeliverable.js');

var _docsEarlyDeliverableJs2 = _interopRequireDefault(_docsEarlyDeliverableJs);

function ConstantStore() {
  var constants = {
    codeExamples: _examplesExamplesJs2['default'],
    markdown: {
      earlyDeliverable: _docsEarlyDeliverableJs2['default']
    }
  };

  function getConstants() {
    return constants;
  }

  return {
    getConstants: getConstants
  };
}
exports['default'] = new ConstantStore();
module.exports = exports['default'];

},{"../../docs/earlyDeliverable.js":"C:\\Users\\pitch\\functional-visualiser\\public\\docs\\earlyDeliverable.js","../examples/examples.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\examples\\examples.js"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\NavigationStore.js":[function(require,module,exports){
/* for overlay events that don't require any component refreshing. */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var event = require('events');

function NavigationStore() {
  var navigationStore = Object.create(event.EventEmitter.prototype);
  var navigationOptions = {
    isNavBarShowing: true,
    selectedMarkdown: null
  };

  function subscribeListener(callback) {
    navigationStore.on('change', callback);
  }

  function unsubscribeListener(callback) {
    navigationStore.removeListener('change', callback);
  }

  function isNavBarShowing() {
    return navigationOptions.isNavBarShowing;
  }

  function getSelectedMarkdown() {
    return navigationOptions.selectedMarkdown;
  }

  function setOptions(newOpts) {
    _extends(navigationOptions, newOpts);
    navigationStore.emit('change', navigationOptions);
  }

  return {
    subscribeListener: subscribeListener,
    unsubscribeListener: unsubscribeListener,
    getSelectedMarkdown: getSelectedMarkdown,
    isNavBarShowing: isNavBarShowing,
    setOptions: setOptions
  };
}
exports['default'] = new NavigationStore();
module.exports = exports['default'];

},{"events":"C:\\Users\\pitch\\functional-visualiser\\node_modules\\browserify\\node_modules\\events\\events.js"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\RefreshStore.js":[function(require,module,exports){
/* Stores those options relating
   to both the Editor and D3Visualizer
   that require a React component
   refresh to put into effect.*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var event = require('events');

function RefreshStore() {
  var refreshStore = Object.create(event.EventEmitter.prototype);
  var options = {};

  _extends(options, {
    showDynamic: true,
    dimensions: {
      width: 1000,
      height: 56 + 800
    }
  });

  function subscribeListener(callback) {
    refreshStore.on('change', callback);
  }

  function unsubscribeListener(callback) {
    refreshStore.removeListener('change', callback);
  }

  function setOptions(newOpts) {
    _extends(options, newOpts);
    refreshStore.emit('change', options);
  }

  function getOptions() {
    return options;
  }

  return {
    subscribeListener: subscribeListener,
    unsubscribeListener: unsubscribeListener,
    setOptions: setOptions,
    getOptions: getOptions
  };
}
exports['default'] = new RefreshStore();
module.exports = exports['default'];

},{"events":"C:\\Users\\pitch\\functional-visualiser\\node_modules\\browserify\\node_modules\\events\\events.js"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\SequencerStore.js":[function(require,module,exports){
/* The SequencerStore stores d3LinkedState related to the Sequencer, including
    the currently executed code string.
    It dispatches to the Visualizer and Code Editor.
    Update is controlled by the Sequencer, when
    d3 and the editor both have the relevant info
    the store manages the timing offset for both events
    (showing the code interpreted, then the visualized result.) */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var event = require('events');

function SequencerStore() {
  var sequencerStore = Object.create(event.EventEmitter.prototype);

  var d3LinkedState = {
    nodes: [],
    links: []
  };

  var options = {
    delayVisualizer: true,
    savedSequencerDelay: null,
    staggerEditorAndVisualizer: true, // not user adjustable, it's better like this
    visualizerPercentageOfDelay: 0.6,
    limitReturnedNodes: true,
    maxAllowedReturnNodes: 0.6,
    maxAllowedReturnNodesFactor: 100,
    sequencerDelay: 0.5, // * 1000 = ms, this is sliderValue
    minSequencerDelay: 0.01,
    delayFactor: 2000,
    stopOnNotices: true,
    showFunctionLabels: true,
    highlightExecutedCode: true
  };

  var stepOutput = {
    range: null,
    execCodeBlock: null,
    warning: null,
    singleStep: false
  };

  function subscribeListener(callback) {
    sequencerStore.on('update', callback);
  }

  function unsubscribeListener(callback) {
    sequencerStore.removeListener('update', callback);
  }

  function subscribeEditor(callback) {
    sequencerStore.on('updateEditor', callback);
  }

  function unsubscribeEditor(callback) {
    sequencerStore.removeListener('updateEditor', callback);
  }

  function subscribeOptionListener(callback) {
    sequencerStore.on('optionsChanged', callback);
  }

  function unsubscribeOptionListener(callback) {
    sequencerStore.removeListener('optionsChanged', callback);
  }

  function linkSequencerToD3Data() {
    return d3LinkedState;
  }

  function getCurrentRange() {
    return stepOutput.range;
  }

  function getCurrentCodeBlock() {
    return stepOutput.execCodeBlock;
  }

  function isSingleStep() {
    return stepOutput.singleStep;
  }

  function setStepOutput(output) {
    _extends(stepOutput, output);
  }

  function setSavedDelay() {
    if (!options.delayVisualizer) {
      options.savedSequencerDelay = options.sequencerDelay;
      options.sequencerDelay = options.minSequencerDelay;
    } else {
      options.sequencerDelay = options.savedSequencerDelay;
      options.savedSequencerDelay = null;
    }
  }

  function setOptions(newOpts) {
    _extends(options, newOpts);
    if (newOpts.delayVisualizer !== undefined) {
      setSavedDelay();
    }
    sequencerStore.emit('optionsChanged', options);
  }

  function getOptions() {
    return options;
  }

  function getWarning() {
    return stepOutput.warning;
  }

  function setWarningMessageShown() {
    stepOutput.warning = null;
  }

  function resetState() {
    d3LinkedState.nodes = [];
    d3LinkedState.links = [];
    sendUpdate(true);
  }

  function sendUpdate(shouldResetD3) {

    if (shouldResetD3) {
      if (options.highlightExecutedCode) {
        sequencerStore.emit('updateEditor');
      }
      sequencerStore.emit('update', shouldResetD3);
      return;
    }
    var stepDelay = options.sequencerDelay * options.delayFactor;
    return new Promise(function (resolveAll) {

      if (options.staggerEditorAndVisualizer) {
        // stagger code/visualizer steps evenly
        // to see cause/effect relationship.
        var editorComplete = new Promise(function (resolveEditorStep) {
          if (options.highlightExecutedCode) {
            sequencerStore.emit('updateEditor');
          }
          setTimeout(function () {
            resolveEditorStep(true);
          }, stepDelay * (1 - options.visualizerPercentageOfDelay));
        });

        editorComplete.then(function () {
          sequencerStore.emit('update');
          setTimeout(function () {
            resolveAll(true);
          }, stepDelay * options.visualizerPercentageOfDelay);
        });
      } else {
        // run both events synchronously at the
        // end of the stepDelay the return
        sequencerStore.emit('update');
        if (options.highlightExecutedCode) {
          sequencerStore.emit('updateEditor');
        }
        setTimeout(function () {
          resolveAll(true);
        }, stepDelay);
      }
    });
  }

  return {
    subscribeListener: subscribeListener, subscribeEditor: subscribeEditor,
    unsubscribeListener: unsubscribeListener, unsubscribeEditor: unsubscribeEditor,
    subscribeOptionListener: subscribeOptionListener, unsubscribeOptionListener: unsubscribeOptionListener,
    sendUpdate: sendUpdate,
    linkState: linkSequencerToD3Data,
    getCurrentRange: getCurrentRange,
    getCurrentCodeBlock: getCurrentCodeBlock,
    setStepOutput: setStepOutput,
    isSingleStep: isSingleStep,
    getWarning: getWarning,
    setWarningMessageShown: setWarningMessageShown,
    setOptions: setOptions,
    getOptions: getOptions,
    resetState: resetState
  };
}

exports['default'] = new SequencerStore();
module.exports = exports['default'];

},{"events":"C:\\Users\\pitch\\functional-visualiser\\node_modules\\browserify\\node_modules\\events\\events.js"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\vendor_mod\\JS-Interpreter\\interpreter.js":[function(require,module,exports){
/**
 * @license
 * JavaScript Interpreter
 *
 * Copyright 2013 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Interpreting JavaScript in JavaScript.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Create a new interpreter.
 * @param {string} code Raw JavaScript text.
 * @param {Function} opt_initFunc Optional initialization function.  Used to
 *     define APIs.  When called it is passed the interpreter object and the
 *     global scope object.
 * @constructor
 */

Object.defineProperty(exports, '__esModule', {
  value: true
});
var acorn = require('acorn');
var Interpreter = function Interpreter(code, opt_initFunc) {
  this.initFunc_ = opt_initFunc;
  this.UNDEFINED = this.createPrimitive(undefined);
  this.ast = typeof code === 'string' ? acorn.parse(code) : code;
  this.paused_ = false;
  var scope = this.createScope(this.ast, null);
  this.stateStack = [{ node: this.ast, scope: scope, thisExpression: scope }];
};

exports['default'] = Interpreter;

/**
 * Execute one step of the interpreter.
 * @return {boolean} True if a step was executed, false if no more instructions.
 */
Interpreter.prototype.step = function () {
  if (!this.stateStack.length) {
    return false;
  } else if (this.paused_) {
    return true;
  }
  var state = this.stateStack[0];
  this['step' + state.node.type]();
  return true;
};

/**
 * Execute the interpreter to program completion.  Vulnerable to infinite loops.
 * @return {boolean} True if a execution is asynchonously blocked,
 *     false if no more instructions.
 */
Interpreter.prototype.run = function () {
  while (!this.paused_ && this.step()) {};
  return this.paused_;
};

/**
 * Initialize the global scope with buitin properties and functions.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initGlobalScope = function (scope) {
  // Initialize uneditable global properties.
  this.setProperty(scope, 'Infinity', this.createPrimitive(Infinity), true);
  this.setProperty(scope, 'NaN', this.createPrimitive(NaN), true);
  this.setProperty(scope, 'undefined', this.UNDEFINED, true);
  this.setProperty(scope, 'window', scope, true);
  this.setProperty(scope, 'self', scope, false); // Editable.

  // Initialize global objects.
  this.initFunction(scope);
  this.initObject(scope);
  // Unable to set scope's parent prior (this.OBJECT did not exist).
  scope.parent = this.OBJECT;
  this.initArray(scope);
  this.initNumber(scope);
  this.initString(scope);
  this.initBoolean(scope);
  this.initDate(scope);
  this.initMath(scope);
  this.initRegExp(scope);
  this.initJSON(scope);

  // Initialize global functions.
  var thisInterpreter = this;
  var wrapper;
  wrapper = function (num) {
    num = num || thisInterpreter.UNDEFINED;
    return thisInterpreter.createPrimitive(isNaN(num.toNumber()));
  };
  this.setProperty(scope, 'isNaN', this.createNativeFunction(wrapper));
  wrapper = function (num) {
    num = num || thisInterpreter.UNDEFINED;
    return thisInterpreter.createPrimitive(isFinite(num.toNumber()));
  };
  this.setProperty(scope, 'isFinite', this.createNativeFunction(wrapper));
  wrapper = function (str) {
    str = str || thisInterpreter.UNDEFINED;
    return thisInterpreter.createPrimitive(parseFloat(str.toNumber()));
  };
  this.setProperty(scope, 'parseFloat', this.createNativeFunction(wrapper));
  wrapper = function (str, radix) {
    str = str || thisInterpreter.UNDEFINED;
    radix = radix || thisInterpreter.UNDEFINED;
    return thisInterpreter.createPrimitive(parseInt(str.toString(), radix.toNumber()));
  };
  this.setProperty(scope, 'parseInt', this.createNativeFunction(wrapper));

  var func = this.createObject(this.FUNCTION);
  func.eval = true;
  this.setProperty(func, 'length', this.createPrimitive(1), true);
  this.setProperty(scope, 'eval', func);

  var strFunctions = ['escape', 'unescape', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent'];
  for (var i = 0; i < strFunctions.length; i++) {
    wrapper = (function (nativeFunc) {
      return function (str) {
        str = str || thisInterpreter.UNDEFINED;
        return thisInterpreter.createPrimitive(nativeFunc(str.toString()));
      };
    })(window[strFunctions[i]]);
    this.setProperty(scope, strFunctions[i], this.createNativeFunction(wrapper));
  }

  // Run any user-provided initialization.
  if (this.initFunc_) {
    this.initFunc_(this, scope);
  }
};

/**
 * Initialize the Function class.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initFunction = function (scope) {
  var thisInterpreter = this;
  var wrapper;
  // Function constructor.
  wrapper = function (var_args) {
    if (this.parent == thisInterpreter.FUNCTION) {
      // Called with new.
      var newFunc = this;
    } else {
      var newFunc = thisInterpreter.createObject(thisInterpreter.FUNCTION);
    }
    if (arguments.length) {
      var code = arguments[arguments.length - 1].toString();
    } else {
      var code = '';
    }
    var args = [];
    for (var i = 0; i < arguments.length - 1; i++) {
      args.push(arguments[i].toString());
    }
    args = args.join(', ');
    if (args.indexOf(')') != -1) {
      throw new SyntaxError('Function arg string contains parenthesis');
    }
    // Interestingly, the scope for constructed functions is the global scope,
    // even if they were constructed in some other scope.
    newFunc.parentScope = thisInterpreter.stateStack[thisInterpreter.stateStack.length - 1].scope;
    var ast = acorn.parse('$ = function(' + args + ') {' + code + '};');
    newFunc.node = ast.body[0].expression.right;
    thisInterpreter.setProperty(newFunc, 'length', thisInterpreter.createPrimitive(newFunc.node.length), true);
    return newFunc;
  };
  this.FUNCTION = this.createObject(null);
  this.setProperty(scope, 'Function', this.FUNCTION);
  // Manually setup type and prototype because createObj doesn't recognize
  // this object as a function (this.FUNCTION did not exist).
  this.FUNCTION.type = 'function';
  this.setProperty(this.FUNCTION, 'prototype', this.createObject(null));
  this.FUNCTION.nativeFunc = wrapper;

  // Create stub functions for apply and call.
  // These are processed as special cases in stepCallExpression.
  var node = {
    type: 'FunctionApply_',
    params: [],
    id: null,
    body: null,
    start: 0,
    end: 0
  };
  this.setProperty(this.FUNCTION.properties.prototype, 'apply', this.createFunction(node, {}), false, true);
  node = {
    type: 'FunctionCall_',
    params: [],
    id: null,
    body: null,
    start: 0,
    end: 0
  };
  this.setProperty(this.FUNCTION.properties.prototype, 'call', this.createFunction(node, {}), false, true);

  // Function has no parent to inherit from, so it needs its own mandatory
  // toString and valueOf functions.
  wrapper = function () {
    return thisInterpreter.createPrimitive(this.toString());
  };
  this.setProperty(this.FUNCTION.properties.prototype, 'toString', this.createNativeFunction(wrapper), false, true);
  this.setProperty(this.FUNCTION, 'toString', this.createNativeFunction(wrapper), false, true);
  wrapper = function () {
    return thisInterpreter.createPrimitive(this.valueOf());
  };
  this.setProperty(this.FUNCTION.properties.prototype, 'valueOf', this.createNativeFunction(wrapper), false, true);
  this.setProperty(this.FUNCTION, 'valueOf', this.createNativeFunction(wrapper), false, true);
};

/**
 * Initialize the Object class.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initObject = function (scope) {
  var thisInterpreter = this;
  var wrapper;
  // Object constructor.
  wrapper = function (var_args) {
    if (this.parent == thisInterpreter.OBJECT) {
      // Called with new.
      var newObj = this;
    } else {
      var newObj = thisInterpreter.createObject(thisInterpreter.OBJECT);
    }
    return newObj;
  };
  this.OBJECT = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'Object', this.OBJECT);

  wrapper = function () {
    return thisInterpreter.createPrimitive(this.toString());
  };
  this.setProperty(this.OBJECT.properties.prototype, 'toString', this.createNativeFunction(wrapper), false, true);
  wrapper = function () {
    return thisInterpreter.createPrimitive(this.valueOf());
  };
  this.setProperty(this.OBJECT.properties.prototype, 'valueOf', this.createNativeFunction(wrapper), false, true);
  wrapper = function (property) {
    for (var key in this.properties) if (key == property) return thisInterpreter.createPrimitive(true);
    return thisInterpreter.createPrimitive(false);
  };
  this.setProperty(this.OBJECT.properties.prototype, 'hasOwnProperty', this.createNativeFunction(wrapper), false, true);

  wrapper = function (obj) {
    var pseudoList = thisInterpreter.createObject(thisInterpreter.ARRAY);
    var i = 0;
    for (var key in obj.properties) {
      thisInterpreter.setProperty(pseudoList, i, thisInterpreter.createPrimitive(key));
      i++;
    }
    return pseudoList;
  };
  this.setProperty(this.OBJECT, 'keys', this.createNativeFunction(wrapper));
};

/**
 * Initialize the Array class.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initArray = function (scope) {
  var thisInterpreter = this;
  var getInt = function getInt(obj, def) {
    // Return an integer, or the default.
    var n = obj ? Math.floor(obj.toNumber()) : def;
    if (isNaN(n)) {
      n = def;
    }
    return n;
  };
  var wrapper;
  // Array constructor.
  wrapper = function (var_args) {
    if (this.parent == thisInterpreter.ARRAY) {
      // Called with new.
      var newArray = this;
    } else {
      var newArray = thisInterpreter.createObject(thisInterpreter.ARRAY);
    }
    var first = arguments[0];
    if (first && first.type == 'number') {
      if (isNaN(thisInterpreter.arrayIndex(first))) {
        throw new RangeError('Invalid array length');
      }
      newArray.length = first.data;
    } else {
      for (var i = 0; i < arguments.length; i++) {
        newArray.properties[i] = arguments[i];
      }
      newArray.length = i;
    }
    return newArray;
  };
  this.ARRAY = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'Array', this.ARRAY);

  wrapper = function () {
    if (this.length) {
      var value = this.properties[this.length - 1];
      delete this.properties[this.length - 1];
      this.length--;
    } else {
      var value = thisInterpreter.UNDEFINED;
    }
    return value;
  };
  this.setProperty(this.ARRAY.properties.prototype, 'pop', this.createNativeFunction(wrapper), false, true);

  wrapper = function (var_args) {
    for (var i = 0; i < arguments.length; i++) {
      this.properties[this.length] = arguments[i];
      this.length++;
    }
    return thisInterpreter.createPrimitive(this.length);
  };
  this.setProperty(this.ARRAY.properties.prototype, 'push', this.createNativeFunction(wrapper), false, true);

  wrapper = function () {
    if (this.length) {
      var value = this.properties[0];
      for (var i = 1; i < this.length; i++) {
        this.properties[i - 1] = this.properties[i];
      }
      this.length--;
      delete this.properties[this.length];
    } else {
      var value = thisInterpreter.UNDEFINED;
    }
    return value;
  };
  this.setProperty(this.ARRAY.properties.prototype, 'shift', this.createNativeFunction(wrapper), false, true);

  wrapper = function (var_args) {
    for (var i = this.length - 1; i >= 0; i--) {
      this.properties[i + arguments.length] = this.properties[i];
    }
    this.length += arguments.length;
    for (var i = 0; i < arguments.length; i++) {
      this.properties[i] = arguments[i];
    }
    return thisInterpreter.createPrimitive(this.length);
  };
  this.setProperty(this.ARRAY.properties.prototype, 'unshift', this.createNativeFunction(wrapper), false, true);

  wrapper = function () {
    for (var i = 0; i < this.length / 2; i++) {
      var tmp = this.properties[this.length - i - 1];
      this.properties[this.length - i - 1] = this.properties[i];
      this.properties[i] = tmp;
    }
    return thisInterpreter.UNDEFINED;
  };
  this.setProperty(this.ARRAY.properties.prototype, 'reverse', this.createNativeFunction(wrapper), false, true);

  wrapper = function (index, howmany, var_args) {
    index = getInt(index, 0);
    if (index < 0) {
      index = Math.max(this.length + index, 0);
    } else {
      index = Math.min(index, this.length);
    }
    howmany = getInt(howmany, Infinity);
    howmany = Math.min(howmany, this.length - index);
    var removed = thisInterpreter.createObject(thisInterpreter.ARRAY);
    // Remove specified elements.
    for (var i = index; i < index + howmany; i++) {
      removed.properties[removed.length++] = this.properties[i];
      this.properties[i] = this.properties[i + howmany];
    }
    for (var i = index + howmany; i < this.length; i++) {
      delete this.properties[i];
    }
    this.length -= howmany;
    // Insert specified items.
    for (var i = this.length - 1; i >= index; i--) {
      this.properties[i + arguments.length - 2] = this.properties[i];
    }
    this.length += arguments.length - 2;
    for (var i = 2; i < arguments.length; i++) {
      this.properties[index + i - 2] = arguments[i];
    }
    return removed;
  };
  this.setProperty(this.ARRAY.properties.prototype, 'splice', this.createNativeFunction(wrapper), false, true);

  wrapper = function (opt_begin, opt_end) {
    var list = thisInterpreter.createObject(thisInterpreter.ARRAY);
    var begin = getInt(opt_begin, 0);
    if (begin < 0) {
      begin = this.length + begin;
    }
    begin = Math.max(0, Math.min(begin, this.length));
    var end = getInt(opt_end, this.length);
    if (end < 0) {
      end = this.length + end;
    }
    end = Math.max(0, Math.min(end, this.length));
    var length = 0;
    for (var i = begin; i < end; i++) {
      var element = thisInterpreter.getProperty(this, i);
      thisInterpreter.setProperty(list, length++, element);
    }
    return list;
  };
  this.setProperty(this.ARRAY.properties.prototype, 'slice', this.createNativeFunction(wrapper), false, true);

  wrapper = function (opt_separator) {
    if (!opt_separator || opt_separator.data === undefined) {
      var sep = undefined;
    } else {
      var sep = opt_separator.toString();
    }
    var text = [];
    for (var i = 0; i < this.length; i++) {
      text[i] = this.properties[i];
    }
    return thisInterpreter.createPrimitive(text.join(sep));
  };
  this.setProperty(this.ARRAY.properties.prototype, 'join', this.createNativeFunction(wrapper), false, true);

  wrapper = function (var_args) {
    var list = thisInterpreter.createObject(thisInterpreter.ARRAY);
    var length = 0;
    // Start by copying the current array.
    for (var i = 0; i < this.length; i++) {
      var element = thisInterpreter.getProperty(this, i);
      thisInterpreter.setProperty(list, length++, element);
    }
    // Loop through all arguments and copy them in.
    for (var i = 0; i < arguments.length; i++) {
      var value = arguments[i];
      if (thisInterpreter.isa(value, thisInterpreter.ARRAY)) {
        for (var j = 0; j < value.length; j++) {
          var element = thisInterpreter.getProperty(value, j);
          thisInterpreter.setProperty(list, length++, element);
        }
      } else {
        thisInterpreter.setProperty(list, length++, value);
      }
    }
    return list;
  };
  this.setProperty(this.ARRAY.properties.prototype, 'concat', this.createNativeFunction(wrapper), false, true);

  wrapper = function (searchElement, opt_fromIndex) {
    searchElement = searchElement || thisInterpreter.UNDEFINED;
    var fromIndex = getInt(opt_fromIndex, 0);
    if (fromIndex < 0) {
      fromIndex = this.length + fromIndex;
    }
    fromIndex = Math.max(0, Math.min(fromIndex, this.length));
    for (var i = fromIndex; i < this.length; i++) {
      var element = thisInterpreter.getProperty(this, i);
      if (thisInterpreter.comp(element, searchElement) == 0) {
        return thisInterpreter.createPrimitive(i);
      }
    }
    return thisInterpreter.createPrimitive(-1);
  };
  this.setProperty(this.ARRAY.properties.prototype, 'indexOf', this.createNativeFunction(wrapper), false, true);

  wrapper = function (searchElement, opt_fromIndex) {
    searchElement = searchElement || thisInterpreter.UNDEFINED;
    var fromIndex = getInt(opt_fromIndex, this.length);
    if (fromIndex < 0) {
      fromIndex = this.length + fromIndex;
    }
    fromIndex = Math.max(0, Math.min(fromIndex, this.length));
    for (var i = fromIndex; i >= 0; i--) {
      var element = thisInterpreter.getProperty(this, i);
      if (thisInterpreter.comp(element, searchElement) == 0) {
        return thisInterpreter.createPrimitive(i);
      }
    }
    return thisInterpreter.createPrimitive(-1);
  };
  this.setProperty(this.ARRAY.properties.prototype, 'lastIndexOf', this.createNativeFunction(wrapper), false, true);

  wrapper = function (opt_compFunc) {
    var jsList = [];
    for (var i = 0; i < this.length; i++) {
      jsList[i] = this.properties[i];
    }
    // TODO: Add custom sort comparison function (opt_compFunc).
    jsList.sort();
    for (var i = 0; i < jsList.length; i++) {
      thisInterpreter.setProperty(this, i, jsList[i]);
    }
    return this;
  };
  this.setProperty(this.ARRAY.properties.prototype, 'sort', this.createNativeFunction(wrapper), false, true);
};

/**
 * Initialize the Number class.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initNumber = function (scope) {
  var thisInterpreter = this;
  var wrapper;
  // Number constructor.
  wrapper = function (value) {
    value = value ? value.toNumber() : 0;
    if (this.parent == thisInterpreter.NUMBER) {
      this.toBoolean = function () {
        return !!value;
      };
      this.toNumber = function () {
        return value;
      };
      this.toString = function () {
        return String(value);
      };
      return undefined;
    } else {
      return thisInterpreter.createPrimitive(value);
    }
  };
  this.NUMBER = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'Number', this.NUMBER);

  var numConsts = ['MAX_VALUE', 'MIN_VALUE', 'NaN', 'NEGATIVE_INFINITY', 'POSITIVE_INFINITY'];
  for (var i = 0; i < numConsts.length; i++) {
    this.setProperty(this.NUMBER, numConsts[i], this.createPrimitive(Number[numConsts[i]]));
  }

  wrapper = function (fractionDigits) {
    fractionDigits = fractionDigits ? fractionDigits.toNumber() : undefined;
    var n = this.toNumber();
    return thisInterpreter.createPrimitive(n.toExponential(fractionDigits));
  };
  this.setProperty(this.NUMBER.properties.prototype, 'toExponential', this.createNativeFunction(wrapper), false, true);

  wrapper = function (digits) {
    digits = digits ? digits.toNumber() : undefined;
    var n = this.toNumber();
    return thisInterpreter.createPrimitive(n.toFixed(digits));
  };
  this.setProperty(this.NUMBER.properties.prototype, 'toFixed', this.createNativeFunction(wrapper), false, true);

  wrapper = function (precision) {
    precision = precision ? precision.toNumber() : undefined;
    var n = this.toNumber();
    return thisInterpreter.createPrimitive(n.toPrecision(precision));
  };
  this.setProperty(this.NUMBER.properties.prototype, 'toPrecision', this.createNativeFunction(wrapper), false, true);

  wrapper = function (radix) {
    radix = radix ? radix.toNumber() : 10;
    var n = this.toNumber();
    return thisInterpreter.createPrimitive(n.toString(radix));
  };
  this.setProperty(this.OBJECT.properties.prototype, 'toString', this.createNativeFunction(wrapper), false, true);
};

/**
 * Initialize the String class.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initString = function (scope) {
  var thisInterpreter = this;
  var wrapper;
  // String constructor.
  wrapper = function (value) {
    value = (value || thisInterpreter.UNDEFINED).toString();
    if (this.parent == thisInterpreter.STRING) {
      this.toBoolean = function () {
        return !!value;
      };
      this.toNumber = function () {
        return Number(value);
      };
      this.toString = function () {
        return value;
      };
      this.valueOf = function () {
        return value;
      };
      this.data = value;
      return undefined;
    } else {
      return thisInterpreter.createPrimitive(value);
    }
  };
  this.STRING = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'String', this.STRING);

  var functions = ['toLowerCase', 'toUpperCase', 'toLocaleLowerCase', 'toLocaleUpperCase'];
  for (var i = 0; i < functions.length; i++) {
    wrapper = (function (nativeFunc) {
      return function () {
        return thisInterpreter.createPrimitive(nativeFunc.apply(this));
      };
    })(String.prototype[functions[i]]);
    this.setProperty(this.STRING.properties.prototype, functions[i], this.createNativeFunction(wrapper), false, true);
  }

  // Trim function may not exist in host browser.  Write them from scratch.
  wrapper = function () {
    var str = this.toString();
    return thisInterpreter.createPrimitive(str.replace(/^\s+|\s+$/g, ''));
  };
  this.setProperty(this.STRING.properties.prototype, 'trim', this.createNativeFunction(wrapper), false, true);
  wrapper = function () {
    var str = this.toString();
    return thisInterpreter.createPrimitive(str.replace(/^\s+/g, ''));
  };
  this.setProperty(this.STRING.properties.prototype, 'trimLeft', this.createNativeFunction(wrapper), false, true);
  wrapper = function () {
    var str = this.toString();
    return thisInterpreter.createPrimitive(str.replace(/\s+$/g, ''));
  };
  this.setProperty(this.STRING.properties.prototype, 'trimRight', this.createNativeFunction(wrapper), false, true);

  wrapper = function (num) {
    var str = this.toString();
    num = (num || thisInterpreter.UNDEFINED).toNumber();
    return thisInterpreter.createPrimitive(str.charAt(num));
  };
  this.setProperty(this.STRING.properties.prototype, 'charAt', this.createNativeFunction(wrapper), false, true);

  wrapper = function (num) {
    var str = this.toString();
    num = (num || thisInterpreter.UNDEFINED).toNumber();
    return thisInterpreter.createPrimitive(str.charCodeAt(num));
  };
  this.setProperty(this.STRING.properties.prototype, 'charCodeAt', this.createNativeFunction(wrapper), false, true);

  wrapper = function (searchValue, fromIndex) {
    var str = this.toString();
    searchValue = (searchValue || thisInterpreter.UNDEFINED).toString();
    fromIndex = fromIndex ? fromIndex.toNumber() : undefined;
    return thisInterpreter.createPrimitive(str.indexOf(searchValue, fromIndex));
  };
  this.setProperty(this.STRING.properties.prototype, 'indexOf', this.createNativeFunction(wrapper), false, true);

  wrapper = function (searchValue, fromIndex) {
    var str = this.toString();
    searchValue = (searchValue || thisInterpreter.UNDEFINED).toString();
    fromIndex = fromIndex ? fromIndex.toNumber() : undefined;
    return thisInterpreter.createPrimitive(str.lastIndexOf(searchValue, fromIndex));
  };
  this.setProperty(this.STRING.properties.prototype, 'lastIndexOf', this.createNativeFunction(wrapper), false, true);

  wrapper = function (compareString) {
    var str = this.toString();
    compareString = (compareString || thisInterpreter.UNDEFINED).toString();
    return thisInterpreter.createPrimitive(str.localeCompare(compareString));
  };
  this.setProperty(this.STRING.properties.prototype, 'localeCompare', this.createNativeFunction(wrapper), false, true);

  wrapper = function (separator, limit) {
    var str = this.toString();
    if (separator) {
      separator = thisInterpreter.isa(separator, thisInterpreter.REGEXP) ? separator.data : separator.toString();
    } else {
      // is this really necessary?
      separator = undefined;
    }
    limit = limit ? limit.toNumber() : undefined;
    var jsList = str.split(separator, limit);
    var pseudoList = thisInterpreter.createObject(thisInterpreter.ARRAY);
    for (var i = 0; i < jsList.length; i++) {
      thisInterpreter.setProperty(pseudoList, i, thisInterpreter.createPrimitive(jsList[i]));
    }
    return pseudoList;
  };
  this.setProperty(this.STRING.properties.prototype, 'split', this.createNativeFunction(wrapper), false, true);

  wrapper = function (indexA, indexB) {
    var str = this.toString();
    indexA = indexA ? indexA.toNumber() : undefined;
    indexB = indexB ? indexB.toNumber() : undefined;
    return thisInterpreter.createPrimitive(str.substring(indexA, indexB));
  };
  this.setProperty(this.STRING.properties.prototype, 'substring', this.createNativeFunction(wrapper), false, true);

  wrapper = function (start, length) {
    var str = this.toString();
    start = start ? start.toNumber() : undefined;
    length = length ? length.toNumber() : undefined;
    return thisInterpreter.createPrimitive(str.substr(start, length));
  };
  this.setProperty(this.STRING.properties.prototype, 'substr', this.createNativeFunction(wrapper), false, true);

  wrapper = function (var_args) {
    var str = this.toString();
    for (var i = 0; i < arguments.length; i++) {
      str += arguments[i].toString();
    }
    return thisInterpreter.createPrimitive(str);
  };
  this.setProperty(this.STRING.properties.prototype, 'concat', this.createNativeFunction(wrapper), false, true);

  wrapper = function (beginSlice, endSlice) {
    var str = this.toString();
    beginSlice = beginSlice ? beginSlice.toNumber() : undefined;
    endSlice = endSlice ? endSlice.toNumber() : undefined;
    return thisInterpreter.createPrimitive(str.slice(beginSlice, endSlice));
  };
  this.setProperty(this.STRING.properties.prototype, 'slice', this.createNativeFunction(wrapper), false, true);

  wrapper = function (regexp) {
    var str = this.toString();
    regexp = regexp ? regexp.data : undefined;
    var match = str.match(regexp);
    if (match === null) {
      return thisInterpreter.createPrimitive(null);
    }
    var pseudoList = thisInterpreter.createObject(thisInterpreter.ARRAY);
    for (var i = 0; i < match.length; i++) {
      thisInterpreter.setProperty(pseudoList, i, thisInterpreter.createPrimitive(match[i]));
    }
    return pseudoList;
  };
  this.setProperty(this.STRING.properties.prototype, 'match', this.createNativeFunction(wrapper), false, true);

  wrapper = function (regexp) {
    var str = this.toString();
    regexp = regexp ? regexp.data : undefined;
    return thisInterpreter.createPrimitive(str.search(regexp));
  };
  this.setProperty(this.STRING.properties.prototype, 'search', this.createNativeFunction(wrapper), false, true);
};

/**
 * Initialize the Boolean class.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initBoolean = function (scope) {
  var thisInterpreter = this;
  var wrapper;
  // Boolean constructor.
  wrapper = function (value) {
    value = value ? value.toBoolean() : false;
    if (this.parent == thisInterpreter.STRING) {
      this.toBoolean = function () {
        return value;
      };
      this.toNumber = function () {
        return Number(value);
      };
      this.toString = function () {
        return String(value);
      };
      this.valueOf = function () {
        return value;
      };
      return undefined;
    } else {
      return thisInterpreter.createPrimitive(value);
    }
  };
  this.BOOLEAN = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'Boolean', this.BOOLEAN);
};

/**
 * Initialize the Date class.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initDate = function (scope) {
  var thisInterpreter = this;
  var wrapper;
  // Date constructor.
  wrapper = function (a, b, c, d, e, f, h) {
    if (this.parent == thisInterpreter.DATE) {
      var newDate = this;
    } else {
      var newDate = thisInterpreter.createObject(thisInterpreter.DATE);
    }
    var dateString = a;
    if (!arguments.length) {
      newDate.date = new Date();
    } else if (arguments.length == 1 && (dateString.type == 'string' || thisInterpreter.isa(dateString, thisInterpreter.STRING))) {
      newDate.date = new Date(dateString.toString());
    } else {
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        args[i] = arguments[i] ? arguments[i].toNumber() : undefined;
      }
      // Sadly there is no way to use 'apply' on a constructor.
      if (args.length == 1) {
        newDate.date = new Date(args[0]);
      } else if (args.length == 2) {
        newDate.date = new Date(args[0], args[1]);
      } else if (args.length == 3) {
        newDate.date = new Date(args[0], args[1], args[2]);
      } else if (args.length == 4) {
        newDate.date = new Date(args[0], args[1], args[2], args[3]);
      } else if (args.length == 5) {
        newDate.date = new Date(args[0], args[1], args[2], args[3], args[4]);
      } else if (args.length == 6) {
        newDate.date = new Date(args[0], args[1], args[2], args[3], args[4], args[5]);
      } else {
        newDate.date = new Date(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
      }
    }
    newDate.toString = function () {
      return String(this.date);
    };
    newDate.toNumber = function () {
      return Number(this.date);
    };
    newDate.valueOf = function () {
      return this.date.valueOf();
    };
    return newDate;
  };
  this.DATE = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'Date', this.DATE);

  // Static methods on Date.
  wrapper = function () {
    return thisInterpreter.createPrimitive(new Date().getTime());
  };
  this.setProperty(this.DATE, 'now', this.createNativeFunction(wrapper), false, true);

  wrapper = function (dateString) {
    dateString = dateString ? dateString.toString() : undefined;
    return thisInterpreter.createPrimitive(Date.parse(dateString));
  };
  this.setProperty(this.DATE, 'parse', this.createNativeFunction(wrapper), false, true);

  wrapper = function (a, b, c, d, e, f, h) {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args[i] = arguments[i] ? arguments[i].toNumber() : undefined;
    }
    return thisInterpreter.createPrimitive(Date.UTC.apply(Date, args));
  };
  this.setProperty(this.DATE, 'UTC', this.createNativeFunction(wrapper), false, true);

  // Getter methods.
  var getFunctions = ['getDate', 'getDay', 'getFullYear', 'getHours', 'getMilliseconds', 'getMinutes', 'getMonth', 'getSeconds', 'getTime', 'getTimezoneOffset', 'getUTCDate', 'getUTCDay', 'getUTCFullYear', 'getUTCHours', 'getUTCMilliseconds', 'getUTCMinutes', 'getUTCMonth', 'getUTCSeconds', 'getYear'];
  for (var i = 0; i < getFunctions.length; i++) {
    wrapper = (function (nativeFunc) {
      return function () {
        return thisInterpreter.createPrimitive(this.date[nativeFunc]());
      };
    })(getFunctions[i]);
    this.setProperty(this.DATE.properties.prototype, getFunctions[i], this.createNativeFunction(wrapper), false, true);
  }

  // Setter methods.
  var setFunctions = ['setDate', 'setFullYear', 'setHours', 'setMilliseconds', 'setMinutes', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds', 'setYear'];
  for (var i = 0; i < setFunctions.length; i++) {
    wrapper = (function (nativeFunc) {
      return function (var_args) {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args[i] = arguments[i] ? arguments[i].toNumber() : undefined;
        }
        return thisInterpreter.createPrimitive(this.date[nativeFunc].apply(this.date, args));
      };
    })(setFunctions[i]);
    this.setProperty(this.DATE.properties.prototype, setFunctions[i], this.createNativeFunction(wrapper), false, true);
  }

  // Conversion getter methods.
  getFunctions = ['toDateString', 'toISOString', 'toGMTString', 'toLocaleDateString', 'toLocaleString', 'toLocaleTimeString', 'toTimeString', 'toUTCString'];
  for (var i = 0; i < getFunctions.length; i++) {
    wrapper = (function (nativeFunc) {
      return function () {
        return thisInterpreter.createPrimitive(this.date[nativeFunc]());
      };
    })(getFunctions[i]);
    this.setProperty(this.DATE.properties.prototype, getFunctions[i], this.createNativeFunction(wrapper), false, true);
  }
};

/**
 * Initialize Math object.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initMath = function (scope) {
  var thisInterpreter = this;
  var myMath = this.createObject(this.OBJECT);
  this.setProperty(scope, 'Math', myMath);
  var mathConsts = ['E', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'PI', 'SQRT1_2', 'SQRT2'];
  for (var i = 0; i < mathConsts.length; i++) {
    this.setProperty(myMath, mathConsts[i], this.createPrimitive(Math[mathConsts[i]]));
  }
  var numFunctions = ['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'random', 'round', 'sin', 'sqrt', 'tan'];
  for (var i = 0; i < numFunctions.length; i++) {
    var wrapper = (function (nativeFunc) {
      return function () {
        for (var j = 0; j < arguments.length; j++) {
          arguments[j] = arguments[j].toNumber();
        }
        return thisInterpreter.createPrimitive(nativeFunc.apply(Math, arguments));
      };
    })(Math[numFunctions[i]]);
    this.setProperty(myMath, numFunctions[i], this.createNativeFunction(wrapper));
  }
};

/**
 * Initialize Regular Expression object.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initRegExp = function (scope) {
  var thisInterpreter = this;
  var wrapper;
  // Regex constructor.
  wrapper = function (pattern, flags) {
    var rgx;
    if (this.parent == thisInterpreter.REGEXP) {
      rgx = this;
    } else {
      rgx = thisInterpreter.createObject(thisInterpreter.REGEXP);
    }

    pattern = pattern.toString();
    flags = flags && flags.toString();
    thisInterpreter.createRegExp(rgx, new RegExp(pattern, flags || ''));
    return rgx;
  };
  this.REGEXP = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'RegExp', this.REGEXP);

  wrapper = function () {
    return thisInterpreter.createPrimitive(this.data.toString());
  };
  this.setProperty(this.REGEXP.properties.prototype, 'toString', this.createNativeFunction(wrapper), false, true);

  wrapper = function (str) {
    str = str.toString();
    return thisInterpreter.createPrimitive(this.data.test(str));
  };
  this.setProperty(this.REGEXP.properties.prototype, 'test', this.createNativeFunction(wrapper), false, true);

  wrapper = function (str) {
    str = str.toString();
    // Get lastIndex from wrapped regex, since this is settable.
    this.data.lastIndex = thisInterpreter.getProperty(this, 'lastIndex').toNumber();
    var match = this.data.exec(str);
    thisInterpreter.setProperty(this, 'lastIndex', thisInterpreter.createPrimitive(this.data.lastIndex));

    if (match) {
      var result = thisInterpreter.createObject(thisInterpreter.ARRAY);
      for (var i = 0; i < match.length; i++) {
        thisInterpreter.setProperty(result, i, thisInterpreter.createPrimitive(match[i]));
      }
      // match has additional properties.
      thisInterpreter.setProperty(result, 'index', thisInterpreter.createPrimitive(match.index));
      thisInterpreter.setProperty(result, 'input', thisInterpreter.createPrimitive(match.input));
      return result;
    }
    return thisInterpreter.createPrimitive(null);
  };
  this.setProperty(this.REGEXP.properties.prototype, 'exec', this.createNativeFunction(wrapper), false, true);
};

/**
 * Initialize JSON object.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initJSON = function (scope) {
  var thisInterpreter = this;
  var myJSON = thisInterpreter.createObject(this.OBJECT);
  this.setProperty(scope, 'JSON', myJSON);

  /**
   * Converts from native JS object to this.OBJECT.
   * @param {!Object} nativeObj The native JS object to be converted.
   * @return {Object} The equivalent this.OBJECT.
   */
  function toPseudoObject(nativeObj) {
    if (typeof nativeObj !== 'object') {
      return thisInterpreter.createPrimitive(nativeObj);
    }

    var pseudoObject;
    if (nativeObj instanceof Array) {
      // is array
      pseudoObject = thisInterpreter.createObject(thisInterpreter.ARRAY);
      for (var i = 0; i < nativeObj.length; i++) {
        thisInterpreter.setProperty(pseudoObject, i, toPseudoObject(nativeObj[i]));
      }
    } else {
      // is object
      pseudoObject = thisInterpreter.createObject(thisInterpreter.OBJECT);
      for (var key in nativeObj) {
        thisInterpreter.setProperty(pseudoObject, key, toPseudoObject(nativeObj[key]));
      }
    }

    return pseudoObject;
  }

  var wrapper = (function (nativeFunc) {
    return function () {
      var arg = arguments[0].data;
      var nativeObj = nativeFunc.call(JSON, arg);
      return toPseudoObject(nativeObj);
    };
  })(JSON.parse);
  this.setProperty(myJSON, 'parse', this.createNativeFunction(wrapper));

  /**
   * Converts from this.OBJECT object to native JS object.
   * @param {!Object} obj The this.OBJECT object to be converted.
   * @return {Object} The equivalent native JS object.
   */
  function toNativeObject(obj) {
    if (obj.isPrimitive) {
      return obj.data;
    }

    var nativeObj;
    if (obj.length) {
      // is array
      nativeObj = [];
      for (var i = 0; i < obj.length; i++) {
        nativeObj[i] = toNativeObject(obj.properties[i]);
      }
    } else {
      // is object
      nativeObj = {};
      for (var key in obj.properties) {
        nativeObj[key] = toNativeObject(obj.properties[key]);
      }
    }

    return nativeObj;
  }

  wrapper = (function (nativeFunc) {
    return function () {
      var arg = toNativeObject(arguments[0]);
      return thisInterpreter.createPrimitive(nativeFunc.call(JSON, arg));
    };
  })(JSON.stringify);
  this.setProperty(myJSON, 'stringify', this.createNativeFunction(wrapper));
};

/**
 * Is an object of a certain class?
 * @param {Object} child Object to check.
 * @param {!Object} parent Class of object.
 * @return {boolean} True if object is the class or inherits from it.
 *     False otherwise.
 */
Interpreter.prototype.isa = function (child, parent) {
  if (!child || !parent) {
    return false;
  } else if (child.parent == parent) {
    return true;
  } else if (!child.parent || !child.parent.prototype) {
    return false;
  }
  return this.isa(child.parent.prototype, parent);
};

/**
 * Compares two objects against each other.
 * @param {!Object} a First object.
 * @param {!Object} b Second object.
 * @return {number} -1 if a is smaller, 0 if a == b, 1 if a is bigger,
 *     NaN if they are not comparable.
 */
Interpreter.prototype.comp = function (a, b) {
  if (a.isPrimitive && typeof a == 'number' && isNaN(a.data) || b.isPrimitive && typeof b == 'number' && isNaN(b.data)) {
    return NaN;
  }
  if (a.isPrimitive && b.isPrimitive) {
    a = a.data;
    b = b.data;
  } else {
    // TODO: Handle other types.
    return NaN;
  }
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  }
  return 0;
};

/**
 * Is a value a legal integer for an array?
 * @param {*} n Value to check.
 * @return {number} Zero, or a positive integer if the value can be
 *     converted to such.  NaN otherwise.
 */
Interpreter.prototype.arrayIndex = function (n) {
  n = Number(n);
  if (!isFinite(n) || n != Math.floor(n) || n < 0) {
    return NaN;
  }
  return n;
};

/**
 * Create a new data object for a primitive.
 * @param {undefined|null|boolean|number|string|RegExp} data Data to
 *     encapsulate.
 * @return {!Object} New data object.
 */
Interpreter.prototype.createPrimitive = function (data) {
  if (data === undefined && this.UNDEFINED) {
    return this.UNDEFINED; // Reuse the same object.
  } else if (data instanceof RegExp) {
      return this.createRegExp(this.createObject(this.REGEXP), data);
    }
  var type = typeof data;
  var obj = {
    data: data,
    isPrimitive: true,
    type: type,
    toBoolean: function toBoolean() {
      return Boolean(this.data);
    },
    toNumber: function toNumber() {
      return Number(this.data);
    },
    toString: function toString() {
      return String(this.data);
    },
    valueOf: function valueOf() {
      return this.data;
    }
  };
  if (type == 'number') {
    obj.parent = this.NUMBER;
  } else if (type == 'string') {
    obj.parent = this.STRING;
  } else if (type == 'boolean') {
    obj.parent = this.BOOLEAN;
  }
  return obj;
};

/**
 * Create a new data object.
 * @param {Object} parent Parent constructor function.
 * @return {!Object} New data object.
 */
Interpreter.prototype.createObject = function (parent) {
  var obj = {
    isPrimitive: false,
    type: 'object',
    parent: parent,
    fixed: Object.create(null),
    nonenumerable: Object.create(null),
    properties: Object.create(null),
    toBoolean: function toBoolean() {
      return true;
    },
    toNumber: function toNumber() {
      return 0;
    },
    toString: function toString() {
      return '[' + this.type + ']';
    },
    valueOf: function valueOf() {
      return this;
    }
  };
  // Functions have prototype objects.
  if (this.isa(obj, this.FUNCTION)) {
    obj.type = 'function';
    this.setProperty(obj, 'prototype', this.createObject(this.OBJECT || null));
  };
  // Arrays have length.
  if (this.isa(obj, this.ARRAY)) {
    obj.length = 0;
    obj.toString = function () {
      var strs = [];
      for (var i = 0; i < this.length; i++) {
        strs[i] = this.properties[i].toString();
      }
      return strs.join(',');
    };
  };

  return obj;
};

/**
 * Creates a new regular expression object.
 * @param {Object} obj The existing object to set.
 * @param {Object} data The native regular expression.
 * @return {!Object} New regular expression object.
 */
Interpreter.prototype.createRegExp = function (obj, data) {
  obj.data = data;
  // lastIndex is settable, all others are read-only attributes
  this.setProperty(obj, 'lastIndex', this.createPrimitive(obj.data.lastIndex), false, true);
  this.setProperty(obj, 'source', this.createPrimitive(obj.data.source), true, true);
  this.setProperty(obj, 'global', this.createPrimitive(obj.data.global), true, true);
  this.setProperty(obj, 'ignoreCase', this.createPrimitive(obj.data.ignoreCase), true, true);
  this.setProperty(obj, 'multiline', this.createPrimitive(obj.data.multiline), true, true);
  return obj;
};

/**
 * Create a new function.
 * @param {Object} node AST node defining the function.
 * @param {Object} opt_scope Optional parent scope.
 * @return {!Object} New function.
 */
Interpreter.prototype.createFunction = function (node, opt_scope) {
  var func = this.createObject(this.FUNCTION);
  func.parentScope = opt_scope || this.getScope();
  func.node = node;
  this.setProperty(func, 'length', this.createPrimitive(func.node.params.length), true);
  return func;
};

/**
 * Create a new native function.
 * @param {!Function} nativeFunc JavaScript function.
 * @return {!Object} New function.
 */
Interpreter.prototype.createNativeFunction = function (nativeFunc) {
  var func = this.createObject(this.FUNCTION);
  func.nativeFunc = nativeFunc;
  this.setProperty(func, 'length', this.createPrimitive(nativeFunc.length), true);
  return func;
};

/**
 * Create a new native asynchronous function.
 * @param {!Function} asyncFunc JavaScript function.
 * @return {!Object} New function.
 */
Interpreter.prototype.createAsyncFunction = function (asyncFunc) {
  var func = this.createObject(this.FUNCTION);
  func.asyncFunc = asyncFunc;
  this.setProperty(func, 'length', this.createPrimitive(asyncFunc.length), true);
  return func;
};

/**
 * Fetch a property value from a data object.
 * @param {!Object} obj Data object.
 * @param {*} name Name of property.
 * @return {!Object} Property value (may be UNDEFINED).
 */
Interpreter.prototype.getProperty = function (obj, name) {
  name = name.toString();
  // Special cases for magic length property.
  if (this.isa(obj, this.STRING)) {
    if (name == 'length') {
      return this.createPrimitive(obj.data.length);
    }
    var n = this.arrayIndex(name);
    if (!isNaN(n) && n < obj.data.length) {
      return this.createPrimitive(obj.data[n]);
    }
  } else if (this.isa(obj, this.ARRAY) && name == 'length') {
    return this.createPrimitive(obj.length);
  }
  while (true) {
    if (obj.properties && name in obj.properties) {
      return obj.properties[name];
    }
    if (obj.parent && obj.parent.properties && obj.parent.properties.prototype) {
      obj = obj.parent.properties.prototype;
    } else {
      // No parent, reached the top.
      break;
    }
  }
  return this.UNDEFINED;
};

/**
 * Does the named property exist on a data object.
 * @param {!Object} obj Data object.
 * @param {*} name Name of property.
 * @return {boolean} True if property exists.
 */
Interpreter.prototype.hasProperty = function (obj, name) {
  name = name.toString();
  if (obj.isPrimitive) {
    throw new TypeError('Primitive data type has no properties');
  }
  if (name == 'length' && (this.isa(obj, this.STRING) || this.isa(obj, this.ARRAY))) {
    return true;
  }
  if (this.isa(obj, this.STRING)) {
    var n = this.arrayIndex(name);
    if (!isNaN(n) && n < obj.data.length) {
      return true;
    }
  }
  while (true) {
    if (obj.properties && name in obj.properties) {
      return true;
    }
    if (obj.parent && obj.parent.properties && obj.parent.properties.prototype) {
      obj = obj.parent.properties.prototype;
    } else {
      // No parent, reached the top.
      break;
    }
  }
  return false;
};

/**
 * Set a property value on a data object.
 * @param {!Object} obj Data object.
 * @param {*} name Name of property.
 * @param {*} value New property value.
 * @param {boolean} opt_fixed Unchangeable property if true.
 * @param {boolean} opt_nonenum Non-enumerable property if true.
 */
Interpreter.prototype.setProperty = function (obj, name, value, opt_fixed, opt_nonenum) {
  name = name.toString();
  if (obj.isPrimitive || obj.fixed[name]) {
    return;
  }
  if (this.isa(obj, this.STRING)) {
    var n = this.arrayIndex(name);
    if (name == 'length' || !isNaN(n) && n < obj.data.length) {
      // Can't set length or letters on Strings.
      return;
    }
  }
  if (this.isa(obj, this.ARRAY)) {
    // Arrays have a magic length variable that is bound to the elements.
    var i;
    if (name == 'length') {
      // Delete elements if length is smaller.
      var newLength = this.arrayIndex(value.toNumber());
      if (isNaN(newLength)) {
        throw new RangeError('Invalid array length');
      }
      if (newLength < obj.length) {
        for (i in obj.properties) {
          i = this.arrayIndex(i);
          if (!isNaN(i) && newLength <= i) {
            delete obj.properties[i];
          }
        }
      }
      obj.length = newLength;
      return; // Don't set a real length property.
    } else if (!isNaN(i = this.arrayIndex(name))) {
        // Increase length if this index is larger.
        obj.length = Math.max(obj.length, i + 1);
      }
  }
  // Set the property.
  obj.properties[name] = value;
  if (opt_fixed) {
    obj.fixed[name] = true;
  }
  if (opt_nonenum) {
    obj.nonenumerable[name] = true;
  }
};

/**
 * Delete a property value on a data object.
 * @param {!Object} obj Data object.
 * @param {*} name Name of property.
 */
Interpreter.prototype.deleteProperty = function (obj, name) {
  name = name.toString();
  if (obj.isPrimitive || obj.fixed[name]) {
    return false;
  }
  if (name == 'length' && this.isa(obj, this.ARRAY)) {
    return false;
  }
  return delete obj.properties[name];
};

/**
 * Returns the current scope from the stateStack.
 * @return {!Object} Current scope dictionary.
 */
Interpreter.prototype.getScope = function () {
  for (var i = 0; i < this.stateStack.length; i++) {
    if (this.stateStack[i].scope) {
      return this.stateStack[i].scope;
    }
  }
  throw 'No scope found.';
};

/**
 * Create a new scope dictionary.
 * @param {!Object} node AST node defining the scope container
 *     (e.g. a function).
 * @param {Object} parentScope Scope to link to.
 * @return {!Object} New scope.
 */
Interpreter.prototype.createScope = function (node, parentScope) {
  var scope = this.createObject(null);
  scope.parentScope = parentScope;
  if (!parentScope) {
    this.initGlobalScope(scope);
  }
  this.populateScope_(node, scope);
  return scope;
};

/**
 * Retrieves a value from the scope chain.
 * @param {!Object} name Name of variable.
 * @throws {string} Error if identifier does not exist.
 */
Interpreter.prototype.getValueFromScope = function (name) {
  var scope = this.getScope();
  var nameStr = name.toString();
  while (scope) {
    if (this.hasProperty(scope, nameStr)) {
      return this.getProperty(scope, nameStr);
    }
    scope = scope.parentScope;
  }
  throw 'Unknown identifier: ' + nameStr;
};

/**
 * Sets a value to the current scope.
 * @param {!Object} name Name of variable.
 * @param {*} value Value.
 */
Interpreter.prototype.setValueToScope = function (name, value) {
  var scope = this.getScope();
  var nameStr = name.toString();
  while (scope) {
    if (this.hasProperty(scope, nameStr)) {
      return this.setProperty(scope, nameStr, value);
    }
    scope = scope.parentScope;
  }
  throw 'Unknown identifier: ' + nameStr;
};

/**
 * Create a new scope for the given node.
 * @param {!Object} node AST node (program or function).
 * @param {!Object} scope Scope dictionary to populate.
 * @private
 */
Interpreter.prototype.populateScope_ = function (node, scope) {
  if (node.type == 'VariableDeclaration') {
    for (var i = 0; i < node.declarations.length; i++) {
      this.setProperty(scope, node.declarations[i].id.name, this.UNDEFINED);
    }
  } else if (node.type == 'FunctionDeclaration') {
    this.setProperty(scope, node.id.name, this.createFunction(node, scope));
    return; // Do not recurse into function.
  } else if (node.type == 'FunctionExpression') {
      return; // Do not recurse into function.
    }
  var thisIterpreter = this;
  function recurse(child) {
    if (child.constructor == thisIterpreter.ast.constructor) {
      thisIterpreter.populateScope_(child, scope);
    }
  }
  for (var name in node) {
    var prop = node[name];
    if (prop && typeof prop == 'object') {
      if (typeof prop.length == 'number' && prop.splice) {
        // Prop is an array.
        for (var i = 0; i < prop.length; i++) {
          recurse(prop[i]);
        }
      } else {
        recurse(prop);
      }
    }
  }
};

/**
 * Gets a value from the scope chain or from an object property.
 * @param {!Object|!Array} left Name of variable or object/propname tuple.
 * @return {!Object} Value.
 */
Interpreter.prototype.getValue = function (left) {
  if (left.length) {
    var obj = left[0];
    var prop = left[1];
    return this.getProperty(obj, prop);
  } else {
    return this.getValueFromScope(left);
  }
};

/**
 * Sets a value to the scope chain or to an object property.
 * @param {!Object|!Array} left Name of variable or object/propname tuple.
 * @param {!Object} value Value.
 */
Interpreter.prototype.setValue = function (left, value) {
  if (left.length) {
    var obj = left[0];
    var prop = left[1];
    this.setProperty(obj, prop, value);
  } else {
    this.setValueToScope(left, value);
  }
};

// Functions to handle each node type.

Interpreter.prototype['stepArrayExpression'] = function () {
  var state = this.stateStack[0];
  var node = state.node;
  var n = state.n || 0;
  if (!state.array) {
    state.array = this.createObject(this.ARRAY);
  } else {
    this.setProperty(state.array, n - 1, state.value);
  }
  if (node.elements[n]) {
    state.n = n + 1;
    this.stateStack.unshift({ node: node.elements[n] });
  } else {
    state.array.length = state.n || 0;
    this.stateStack.shift();
    this.stateStack[0].value = state.array;
  }
};

Interpreter.prototype['stepAssignmentExpression'] = function () {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.doneLeft) {
    state.doneLeft = true;
    this.stateStack.unshift({ node: node.left, components: true });
  } else if (!state.doneRight) {
    state.doneRight = true;
    state.leftSide = state.value;
    this.stateStack.unshift({ node: node.right });
  } else {
    this.stateStack.shift();
    var leftSide = state.leftSide;
    var rightSide = state.value;
    var value;
    if (node.operator == '=') {
      value = rightSide;
    } else {
      var leftValue = this.getValue(leftSide);
      var rightValue = rightSide;
      var leftNumber = leftValue.toNumber();
      var rightNumber = rightValue.toNumber();
      if (node.operator == '+=') {
        var left, right;
        if (leftValue.type == 'string' || rightValue.type == 'string') {
          left = leftValue.toString();
          right = rightValue.toString();
        } else {
          left = leftNumber;
          right = rightNumber;
        }
        value = left + right;
      } else if (node.operator == '-=') {
        value = leftNumber - rightNumber;
      } else if (node.operator == '*=') {
        value = leftNumber * rightNumber;
      } else if (node.operator == '/=') {
        value = leftNumber / rightNumber;
      } else if (node.operator == '%=') {
        value = leftNumber % rightNumber;
      } else if (node.operator == '<<=') {
        value = leftNumber << rightNumber;
      } else if (node.operator == '>>=') {
        value = leftNumber >> rightNumber;
      } else if (node.operator == '>>>=') {
        value = leftNumber >>> rightNumber;
      } else if (node.operator == '&=') {
        value = leftNumber & rightNumber;
      } else if (node.operator == '^=') {
        value = leftNumber ^ rightNumber;
      } else if (node.operator == '|=') {
        value = leftNumber | rightNumber;
      } else {
        throw 'Unknown assignment expression: ' + node.operator;
      }
      value = this.createPrimitive(value);
    }
    this.setValue(leftSide, value);
    this.stateStack[0].value = value;
  }
};

Interpreter.prototype['stepBinaryExpression'] = function () {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.doneLeft) {
    state.doneLeft = true;
    this.stateStack.unshift({ node: node.left });
  } else if (!state.doneRight) {
    state.doneRight = true;
    state.leftValue = state.value;
    this.stateStack.unshift({ node: node.right });
  } else {
    this.stateStack.shift();
    var leftSide = state.leftValue;
    var rightSide = state.value;
    var value;
    var comp = this.comp(leftSide, rightSide);
    if (node.operator == '==' || node.operator == '!=') {
      if (leftSide.isPrimitive && rightSide.isPrimitive) {
        value = leftSide.data == rightSide.data;
      } else {
        value = comp === 0;
      }
      if (node.operator == '!=') {
        value = !value;
      }
    } else if (node.operator == '===' || node.operator == '!==') {
      if (leftSide.isPrimitive && rightSide.isPrimitive) {
        value = leftSide.data === rightSide.data;
      } else {
        value = leftSide === rightSide;
      }
      if (node.operator == '!==') {
        value = !value;
      }
    } else if (node.operator == '>') {
      value = comp == 1;
    } else if (node.operator == '>=') {
      value = comp == 1 || comp === 0;
    } else if (node.operator == '<') {
      value = comp == -1;
    } else if (node.operator == '<=') {
      value = comp == -1 || comp === 0;
    } else if (node.operator == '+') {
      if (leftSide.type == 'string' || rightSide.type == 'string') {
        var leftValue = leftSide.toString();
        var rightValue = rightSide.toString();
      } else {
        var leftValue = leftSide.toNumber();
        var rightValue = rightSide.toNumber();
      }
      value = leftValue + rightValue;
    } else if (node.operator == 'in') {
      value = this.hasProperty(rightSide, leftSide);
    } else {
      var leftValue = leftSide.toNumber();
      var rightValue = rightSide.toNumber();
      if (node.operator == '-') {
        value = leftValue - rightValue;
      } else if (node.operator == '*') {
        value = leftValue * rightValue;
      } else if (node.operator == '/') {
        value = leftValue / rightValue;
      } else if (node.operator == '%') {
        value = leftValue % rightValue;
      } else if (node.operator == '&') {
        value = leftValue & rightValue;
      } else if (node.operator == '|') {
        value = leftValue | rightValue;
      } else if (node.operator == '^') {
        value = leftValue ^ rightValue;
      } else if (node.operator == '<<') {
        value = leftValue << rightValue;
      } else if (node.operator == '>>') {
        value = leftValue >> rightValue;
      } else if (node.operator == '>>>') {
        value = leftValue >>> rightValue;
      } else {
        throw 'Unknown binary operator: ' + node.operator;
      }
    }
    this.stateStack[0].value = this.createPrimitive(value);
  }
};

Interpreter.prototype['stepBreakStatement'] = function () {
  var state = this.stateStack.shift();
  var node = state.node;
  var label = null;
  if (node.label) {
    label = node.label.name;
  }
  state = this.stateStack.shift();
  while (state && state.node.type != 'callExpression') {
    if (label ? label == state.label : state.isLoop || state.isSwitch) {
      return;
    }
    state = this.stateStack.shift();
  }
  throw new SyntaxError('Illegal break statement');
};

Interpreter.prototype['stepBlockStatement'] = function () {
  var state = this.stateStack[0];
  var node = state.node;
  var n = state.n_ || 0;
  if (node.body[n]) {
    state.n_ = n + 1;
    this.stateStack.unshift({ node: node.body[n] });
  } else {
    this.stateStack.shift();
  }
};

Interpreter.prototype['stepCallExpression'] = function () {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.doneCallee_) {
    state.doneCallee_ = true;
    this.stateStack.unshift({ node: node.callee, components: true });
  } else {
    if (!state.func_) {
      // Determine value of the function.
      if (state.value.type == 'function') {
        state.func_ = state.value;
      } else {
        state.member_ = state.value[0];
        state.func_ = this.getValue(state.value);
        if (!state.func_ || state.func_.type != 'function') {
          throw new TypeError((state.func_ && state.func_.type) + ' is not a function');
        }
      }
      // Determine value of 'this' in function.
      if (state.node.type == 'NewExpression') {
        state.funcThis_ = this.createObject(state.func_);
        state.isConstructor_ = true;
      } else if (state.value.length) {
        state.funcThis_ = state.value[0];
      } else {
        state.funcThis_ = this.stateStack[this.stateStack.length - 1].thisExpression;
      }
      state.arguments = [];
      var n = 0;
    } else {
      var n = state.n_;
      if (state.arguments.length != node.arguments.length) {
        state.arguments[n - 1] = state.value;
      }
    }
    if (node.arguments[n]) {
      state.n_ = n + 1;
      this.stateStack.unshift({ node: node.arguments[n] });
    } else if (!state.doneExec) {
      state.doneExec = true;
      if (state.func_.node && (state.func_.node.type == 'FunctionApply_' || state.func_.node.type == 'FunctionCall_')) {
        state.funcThis_ = state.arguments.shift();
        if (state.func_.node.type == 'FunctionApply_') {
          // Unpack all the arguments from the provided array.
          var argsList = state.arguments.shift();
          if (argsList && this.isa(argsList, this.ARRAY)) {
            state.arguments = [];
            for (var i = 0; i < argsList.length; i++) {
              state.arguments[i] = this.getProperty(argsList, i);
            }
          } else {
            state.arguments = [];
          }
        }
        state.func_ = state.member_;
      }
      if (state.func_.node) {
        var scope = this.createScope(state.func_.node.body, state.func_.parentScope);
        // Add all arguments.
        for (var i = 0; i < state.func_.node.params.length; i++) {
          var paramName = this.createPrimitive(state.func_.node.params[i].name);
          var paramValue = state.arguments.length > i ? state.arguments[i] : this.UNDEFINED;
          this.setProperty(scope, paramName, paramValue);
        }
        // Build arguments variable.
        var argsList = this.createObject(this.ARRAY);
        for (var i = 0; i < state.arguments.length; i++) {
          this.setProperty(argsList, this.createPrimitive(i), state.arguments[i]);
        }
        this.setProperty(scope, 'arguments', argsList);
        var funcState = {
          node: state.func_.node.body,
          scope: scope,
          thisExpression: state.funcThis_
        };
        this.stateStack.unshift(funcState);
        state.value = this.UNDEFINED; // Default value if no explicit return.
      } else if (state.func_.nativeFunc) {
          state.value = state.func_.nativeFunc.apply(state.funcThis_, state.arguments);
        } else if (state.func_.asyncFunc) {
          var thisInterpreter = this;
          var callback = function callback(value) {
            state.value = value || this.UNDEFINED;
            thisInterpreter.stateStack.unshift(state);
            thisInterpreter.paused_ = false;
          };
          var argsWithCallback = state.arguments.concat(callback);
          state.func_.asyncFunc.apply(state.funcThis_, argsWithCallback);
          this.paused_ = true;
          return;
        } else if (state.func_.eval) {
          var code = state.arguments[0];
          if (!code) {
            state.value = this.UNDEFINED;
          } else if (!code.isPrimitive) {
            // JS does not parse String objects:
            // eval(new String('1 + 1')) -> '1 + 1'
            state.value = code;
          } else {
            var evalInterpreter = new Interpreter(code.toString());
            evalInterpreter.stateStack[0].scope.parentScope = this.getScope();
            state = {
              node: { type: 'Eval_' },
              interpreter: evalInterpreter
            };
            this.stateStack.unshift(state);
          }
        } else {
          throw new TypeError('function not a function (huh?)');
        }
    } else {
      this.stateStack.shift();
      this.stateStack[0].value = state.isConstructor_ ? state.funcThis_ : state.value;
    }
  }
};

Interpreter.prototype['stepConditionalExpression'] = function () {
  var state = this.stateStack[0];
  if (!state.done) {
    if (!state.test) {
      state.test = true;
      this.stateStack.unshift({ node: state.node.test });
    } else {
      state.done = true;
      if (state.value.toBoolean() && state.node.consequent) {
        this.stateStack.unshift({ node: state.node.consequent });
      } else if (!state.value.toBoolean() && state.node.alternate) {
        this.stateStack.unshift({ node: state.node.alternate });
      }
    }
  } else {
    this.stateStack.shift();
    if (state.node.type == 'ConditionalExpression') {
      this.stateStack[0].value = state.value;
    }
  }
};

Interpreter.prototype['stepContinueStatement'] = function () {
  var node = this.stateStack[0].node;
  var label = null;
  if (node.label) {
    label = node.label.name;
  }
  var state = this.stateStack[0];
  while (state && state.node.type != 'callExpression') {
    if (state.isLoop) {
      if (!label || label == state.label) {
        return;
      }
    }
    this.stateStack.shift();
    state = this.stateStack[0];
  }
  throw new SyntaxError('Illegal continue statement');
};

Interpreter.prototype['stepDoWhileStatement'] = function () {
  var state = this.stateStack[0];
  state.isLoop = true;
  if (state.node.type == 'DoWhileStatement' && state.test === undefined) {
    // First iteration of do/while executes without checking test.
    state.value = this.createPrimitive(true);
    state.test = true;
  }
  if (!state.test) {
    state.test = true;
    this.stateStack.unshift({ node: state.node.test });
  } else {
    state.test = false;
    if (!state.value.toBoolean()) {
      this.stateStack.shift();
    } else if (state.node.body) {
      this.stateStack.unshift({ node: state.node.body });
    }
  }
};

Interpreter.prototype['stepEmptyStatement'] = function () {
  this.stateStack.shift();
};

Interpreter.prototype['stepEval_'] = function () {
  var state = this.stateStack[0];
  if (!state.interpreter.step()) {
    this.stateStack.shift();
    this.stateStack[0].value = state.interpreter.value || this.UNDEFINED;
  }
};

Interpreter.prototype['stepExpressionStatement'] = function () {
  var state = this.stateStack[0];
  if (!state.done) {
    state.done = true;
    this.stateStack.unshift({ node: state.node.expression });
  } else {
    this.stateStack.shift();
    // Save this value to the interpreter for use as a return value if
    // this code is inside an eval function.
    this.value = state.value;
  }
};

Interpreter.prototype['stepForInStatement'] = function () {
  var state = this.stateStack[0];
  state.isLoop = true;
  var node = state.node;
  if (!state.doneVariable_) {
    state.doneVariable_ = true;
    var left = node.left;
    if (left.type == 'VariableDeclaration') {
      // Inline variable declaration: for (var x in y)
      left = left.declarations[0].id;
    }
    this.stateStack.unshift({ node: left, components: true });
  } else if (!state.doneObject_) {
    state.doneObject_ = true;
    state.variable = state.value;
    this.stateStack.unshift({ node: node.right });
  } else {
    if (typeof state.iterator == 'undefined') {
      // First iteration.
      state.object = state.value;
      state.iterator = 0;
    }
    var name = null;
    done: do {
      var i = state.iterator;
      for (var prop in state.object.properties) {
        if (prop in state.object.nonenumerable) {
          continue;
        }
        if (i == 0) {
          name = prop;
          break done;
        }
        i--;
      }
      state.object = state.object.parent && state.object.parent.properties.prototype;
      state.iterator = 0;
    } while (state.object);
    state.iterator++;
    if (name === null) {
      this.stateStack.shift();
    } else {
      this.setValueToScope(state.variable, this.createPrimitive(name));
      if (node.body) {
        this.stateStack.unshift({ node: node.body });
      }
    }
  }
};

Interpreter.prototype['stepForStatement'] = function () {
  var state = this.stateStack[0];
  state.isLoop = true;
  var node = state.node;
  var mode = state.mode || 0;
  if (mode == 0) {
    state.mode = 1;
    if (node.init) {
      this.stateStack.unshift({ node: node.init });
    }
  } else if (mode == 1) {
    state.mode = 2;
    if (node.test) {
      this.stateStack.unshift({ node: node.test });
    }
  } else if (mode == 2) {
    state.mode = 3;
    if (state.value && !state.value.toBoolean()) {
      // Loop complete.  Bail out.
      this.stateStack.shift();
    } else if (node.body) {
      this.stateStack.unshift({ node: node.body });
    }
  } else if (mode == 3) {
    state.mode = 1;
    if (node.update) {
      this.stateStack.unshift({ node: node.update });
    }
  }
};

Interpreter.prototype['stepFunctionDeclaration'] = function () {
  this.stateStack.shift();
};

Interpreter.prototype['stepFunctionExpression'] = function () {
  var state = this.stateStack[0];
  this.stateStack.shift();
  this.stateStack[0].value = this.createFunction(state.node);
};

Interpreter.prototype['stepIdentifier'] = function () {
  var state = this.stateStack[0];
  this.stateStack.shift();
  var name = this.createPrimitive(state.node.name);
  this.stateStack[0].value = state.components ? name : this.getValueFromScope(name);
};

Interpreter.prototype['stepIfStatement'] = Interpreter.prototype['stepConditionalExpression'];

Interpreter.prototype['stepLabeledStatement'] = function () {
  // No need to hit this node again on the way back up the stack.
  var state = this.stateStack.shift();
  this.stateStack.unshift({ node: state.node.body,
    label: state.node.label.name });
};

Interpreter.prototype['stepLiteral'] = function () {
  var state = this.stateStack[0];
  this.stateStack.shift();
  this.stateStack[0].value = this.createPrimitive(state.node.value);
};

Interpreter.prototype['stepLogicalExpression'] = function () {
  var state = this.stateStack[0];
  var node = state.node;
  if (node.operator != '&&' && node.operator != '||') {
    throw 'Unknown logical operator: ' + node.operator;
  }
  if (!state.doneLeft_) {
    state.doneLeft_ = true;
    this.stateStack.unshift({ node: node.left });
  } else if (!state.doneRight_) {
    if (node.operator == '&&' && !state.value.toBoolean() || node.operator == '||' && state.value.toBoolean()) {
      // Shortcut evaluation.
      this.stateStack.shift();
      this.stateStack[0].value = state.value;
    } else {
      state.doneRight_ = true;
      this.stateStack.unshift({ node: node.right });
    }
  } else {
    this.stateStack.shift();
    this.stateStack[0].value = state.value;
  }
};

Interpreter.prototype['stepMemberExpression'] = function () {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.doneObject_) {
    state.doneObject_ = true;
    this.stateStack.unshift({ node: node.object });
  } else if (!state.doneProperty_) {
    state.doneProperty_ = true;
    state.object = state.value;
    this.stateStack.unshift({
      node: node.property,
      components: !node.computed
    });
  } else {
    this.stateStack.shift();
    if (state.components) {
      this.stateStack[0].value = [state.object, state.value];
    } else {
      this.stateStack[0].value = this.getProperty(state.object, state.value);
    }
  }
};

Interpreter.prototype['stepNewExpression'] = Interpreter.prototype['stepCallExpression'];

Interpreter.prototype['stepObjectExpression'] = function () {
  var state = this.stateStack[0];
  var node = state.node;
  var valueToggle = state.valueToggle;
  var n = state.n || 0;
  if (!state.object) {
    state.object = this.createObject(this.OBJECT);
  } else {
    if (valueToggle) {
      state.key = state.value;
    } else {
      this.setProperty(state.object, state.key, state.value);
    }
  }
  if (node.properties[n]) {
    if (valueToggle) {
      state.n = n + 1;
      this.stateStack.unshift({ node: node.properties[n].value });
    } else {
      this.stateStack.unshift({ node: node.properties[n].key, components: true });
    }
    state.valueToggle = !valueToggle;
  } else {
    this.stateStack.shift();
    this.stateStack[0].value = state.object;
  }
};

Interpreter.prototype['stepProgram'] = Interpreter.prototype['stepBlockStatement'];

Interpreter.prototype['stepReturnStatement'] = function () {
  var state = this.stateStack[0];
  var node = state.node;
  if (node.argument && !state.done) {
    state.done = true;
    this.stateStack.unshift({ node: node.argument });
  } else {
    var value = state.value || this.UNDEFINED;
    do {
      this.stateStack.shift();
      if (this.stateStack.length == 0) {
        throw new SyntaxError('Illegal return statement');
      }
      state = this.stateStack[0];
    } while (state.node.type != 'CallExpression');
    state.value = value;
  }
};

Interpreter.prototype['stepSequenceExpression'] = function () {
  var state = this.stateStack[0];
  var node = state.node;
  var n = state.n || 0;
  if (node.expressions[n]) {
    state.n = n + 1;
    this.stateStack.unshift({ node: node.expressions[n] });
  } else {
    this.stateStack.shift();
    this.stateStack[0].value = state.value;
  }
};

Interpreter.prototype['stepSwitchStatement'] = function () {
  var state = this.stateStack[0];
  state.checked = state.checked || [];
  state.isSwitch = true;

  if (!state.test) {
    state.test = true;
    this.stateStack.unshift({ node: state.node.discriminant });
  } else {
    if (!state.switchValue) {
      // Preserve switch value between case tests.
      state.switchValue = state.value;
    }

    var index = state.index || 0;
    var currentCase = state.node.cases[index];
    if (currentCase) {
      if (!state.done && !state.checked[index] && currentCase.test) {
        state.checked[index] = true;
        this.stateStack.unshift({ node: currentCase.test });
      } else {
        // Test on the default case will be null.
        if (state.done || !currentCase.test || this.comp(state.value, state.switchValue) == 0) {
          state.done = true;
          var n = state.n || 0;
          if (currentCase.consequent[n]) {
            this.stateStack.unshift({ node: currentCase.consequent[n] });
            state.n = n + 1;
            return;
          }
        }
        state.n = 0;
        state.index = index + 1;
      }
    } else {
      this.stateStack.shift();
    }
  }
};

Interpreter.prototype['stepThisExpression'] = function () {
  this.stateStack.shift();
  for (var i = 0; i < this.stateStack.length; i++) {
    if (this.stateStack[i].thisExpression) {
      this.stateStack[0].value = this.stateStack[i].thisExpression;
      return;
    }
  }
  throw 'No this expression found.';
};

Interpreter.prototype['stepThrowStatement'] = function () {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.argument) {
    state.argument = true;
    this.stateStack.unshift({ node: node.argument });
  } else {
    throw state.value.toString();
  }
};

Interpreter.prototype['stepUnaryExpression'] = function () {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.done) {
    state.done = true;
    var nextState = { node: node.argument };
    if (node.operator == 'delete') {
      nextState.components = true;
    }
    this.stateStack.unshift(nextState);
  } else {
    this.stateStack.shift();
    var value;
    if (node.operator == '-') {
      value = -state.value.toNumber();
    } else if (node.operator == '+') {
      value = state.value.toNumber();
    } else if (node.operator == '!') {
      if (state.value.isPrimitive) {
        value = !state.value.data;
      } else {
        value = !state.value.toNumber();
      }
    } else if (node.operator == '~') {
      value = ~state.value.toNumber();
    } else if (node.operator == 'typeof') {
      value = state.value.type;
    } else if (node.operator == 'delete') {
      if (state.value.length) {
        var obj = state.value[0];
        var name = state.value[1];
      } else {
        var obj = this.getScope();
        var name = state.value;
      }
      value = this.deleteProperty(obj, name);
    } else if (node.operator == 'void') {
      value = undefined;
    } else {
      throw 'Unknown unary operator: ' + node.operator;
    }
    this.stateStack[0].value = this.createPrimitive(value);
  }
};

Interpreter.prototype['stepUpdateExpression'] = function () {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.done) {
    state.done = true;
    this.stateStack.unshift({ node: node.argument, components: true });
  } else {
    this.stateStack.shift();
    var leftSide = state.value;
    var leftValue = this.getValue(leftSide).toNumber();
    var changeValue;
    if (node.operator == '++') {
      changeValue = this.createPrimitive(leftValue + 1);
    } else if (node.operator == '--') {
      changeValue = this.createPrimitive(leftValue - 1);
    } else {
      throw 'Unknown update expression: ' + node.operator;
    }
    this.setValue(leftSide, changeValue);
    this.stateStack[0].value = node.prefix ? changeValue : this.createPrimitive(leftValue);
  }
};

Interpreter.prototype['stepVariableDeclaration'] = function () {
  var state = this.stateStack[0];
  var node = state.node;
  var n = state.n || 0;
  if (node.declarations[n]) {
    state.n = n + 1;
    this.stateStack.unshift({ node: node.declarations[n] });
  } else {
    this.stateStack.shift();
  }
};

Interpreter.prototype['stepVariableDeclarator'] = function () {
  var state = this.stateStack[0];
  var node = state.node;
  if (node.init && !state.done) {
    state.done = true;
    this.stateStack.unshift({ node: node.init });
  } else {
    if (!this.hasProperty(this, node.id.name) || node.init) {
      var value = node.init ? state.value : this.UNDEFINED;
      this.setValue(this.createPrimitive(node.id.name), value);
    }
    this.stateStack.shift();
  }
};

Interpreter.prototype['stepWhileStatement'] = Interpreter.prototype['stepDoWhileStatement'];

// Preserve top-level API functions from being pruned by JS compilers.
// Add others as needed.
window['Interpreter'] = Interpreter;
Interpreter.prototype['step'] = Interpreter.prototype.step;
Interpreter.prototype['run'] = Interpreter.prototype.run;
module.exports = exports['default'];

},{"acorn":"acorn"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\vendor_mod\\react-ace\\index.js":[function(require,module,exports){
'use strict';

module.exports = require('./src/ace.jsx');

},{"./src/ace.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\vendor_mod\\react-ace\\src\\ace.jsx"}],"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\vendor_mod\\react-ace\\src\\ace.jsx":[function(require,module,exports){
'use strict';

var ace = require('brace');
var React = require('react');

module.exports = React.createClass({
  displayName: 'ReactAce',

  propTypes: {
    mode: React.PropTypes.string,
    theme: React.PropTypes.string,
    name: React.PropTypes.string,
    className: React.PropTypes.string,
    height: React.PropTypes.string,
    width: React.PropTypes.string,
    fontSize: React.PropTypes.number,
    showGutter: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    onPaste: React.PropTypes.func,
    value: React.PropTypes.string,
    onLoad: React.PropTypes.func,
    maxLines: React.PropTypes.number,
    readOnly: React.PropTypes.bool,
    highlightActiveLine: React.PropTypes.bool,
    showPrintMargin: React.PropTypes.bool,
    cursorStart: React.PropTypes.number,
    editorProps: React.PropTypes.object
  },
  getDefaultProps: function getDefaultProps() {
    return {
      name: 'brace-editor',
      mode: '',
      theme: '',
      height: '500px',
      width: '500px',
      value: '',
      fontSize: 12,
      showGutter: true,
      onChange: null,
      onPaste: null,
      onLoad: null,
      maxLines: null,
      readOnly: false,
      highlightActiveLine: true,
      showPrintMargin: true,
      cursorStart: 1,
      editorProps: {}
    };
  },
  onChange: function onChange() {
    var value = this.editor.getValue();
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  },
  onPaste: function onPaste(text) {
    if (this.props.onPaste) {
      this.props.onPaste(text);
    }
  },
  componentDidMount: function componentDidMount() {
    this.editor = ace.edit(this.props.name);

    var editorProps = Object.getOwnPropertyNames(this.props.editorProps);
    for (var i = 0; i < editorProps.length; i++) {
      this.editor[editorProps[i]] = this.props.editorProps[editorProps[i]];
    }

    this.editor.getSession().setMode('ace/mode/' + this.props.mode);
    this.editor.setTheme('ace/theme/' + this.props.theme);
    this.editor.setFontSize(this.props.fontSize);
    this.editor.on('change', this.onChange);
    this.editor.on('paste', this.onPaste);
    this.editor.setValue(this.props.value, this.props.cursorStart);
    this.editor.renderer.setShowGutter(this.props.showGutter);
    this.editor.setOption('maxLines', this.props.maxLines);
    this.editor.setOption('readOnly', this.props.readOnly);
    this.editor.setOption('highlightActiveLine', this.props.highlightActiveLine);
    this.editor.setShowPrintMargin(this.props.setShowPrintMargin);

    if (this.props.onLoad) {
      this.props.onLoad(this.editor);
    }
  },

  componentWillUnmount: function componentWillUnmount() {
    this.editor = null;
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.editor = ace.edit(nextProps.name);
    this.editor.getSession().setMode('ace/mode/' + nextProps.mode);
    this.editor.setTheme('ace/theme/' + nextProps.theme);
    this.editor.setFontSize(nextProps.fontSize);
    this.editor.setOption('maxLines', nextProps.maxLines);
    this.editor.setOption('readOnly', nextProps.readOnly);
    this.editor.setOption('highlightActiveLine', nextProps.highlightActiveLine);
    this.editor.setShowPrintMargin(nextProps.setShowPrintMargin);
    if (this.editor.getValue() !== nextProps.value) {
      this.editor.setValue(nextProps.value, nextProps.cursorStart);
    }
    this.editor.renderer.setShowGutter(nextProps.showGutter);
    if (nextProps.onLoad) {
      nextProps.onLoad(this.editor);
    }
  },

  render: function render() {
    var divStyle = {
      width: this.props.width,
      height: this.props.height
    };
    var className = this.props.className;
    return React.createElement('div', { id: this.props.name,
      className: className,
      onChange: this.onChange,
      onPaste: this.onPaste,
      style: divStyle });
  }
});

},{"brace":"brace","react":"react"}],"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\App.jsx":[function(require,module,exports){
'use strict';
// ==========================================
// Main root-level app module.
// The App class is used purely to set up theme boilerplate.
// ==========================================

// dependencies
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _materialUi2 = _interopRequireDefault(_materialUi);

var _reactTapEventPlugin = require('react-tap-event-plugin');

var _reactTapEventPlugin2 = _interopRequireDefault(_reactTapEventPlugin);

var _BaseLayoutBaseLayoutJsx = require('./BaseLayout/BaseLayout.jsx');

var _BaseLayoutBaseLayoutJsx2 = _interopRequireDefault(_BaseLayoutBaseLayoutJsx);

// boilerplate for material-UI initialisation
var ThemeManager = new _materialUi2['default'].Styles.ThemeManager();
ThemeManager.setTheme(ThemeManager.types.DARK);
(0, _reactTapEventPlugin2['default'])();

var App = (function (_React$Component) {
  _inherits(App, _React$Component);

  _createClass(App, null, [{
    key: 'childContextTypes',
    value: {
      muiTheme: _react2['default'].PropTypes.object
    },
    enumerable: true
  }]);

  function App(props) {
    _classCallCheck(this, App);

    _get(Object.getPrototypeOf(App.prototype), 'constructor', this).call(this, props);
    // boilerplate for Material-UI initialisation
    this.state = {
      showNavBar: true
    };
  }

  // boilerplate for material-UI initialisation

  _createClass(App, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        muiTheme: ThemeManager.getCurrentTheme()
      };
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2['default'].createElement('div', { className: 'app' }, _react2['default'].createElement(_BaseLayoutBaseLayoutJsx2['default'], null));
    }
  }]);

  return App;
})(_react2['default'].Component);

exports['default'] = App;
module.exports = exports['default'];

},{"./BaseLayout/BaseLayout.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\BaseLayout.jsx","material-ui":"material-ui","react":"react","react-tap-event-plugin":"react-tap-event-plugin"}],"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\ActionPane\\ActionPane.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _CodePaneCodePaneJsx = require('./CodePane/CodePane.jsx');

var _CodePaneCodePaneJsx2 = _interopRequireDefault(_CodePaneCodePaneJsx);

var _VisPaneVispaneJsx = require('./VisPane/Vispane.jsx');

var _VisPaneVispaneJsx2 = _interopRequireDefault(_VisPaneVispaneJsx);

var _modulesStoresRefreshStoreJs = require('../../../modules/stores/RefreshStore.js');

var _modulesStoresRefreshStoreJs2 = _interopRequireDefault(_modulesStoresRefreshStoreJs);

var ActionPane = (function (_React$Component) {
  _inherits(ActionPane, _React$Component);

  function ActionPane(props) {
    var _this = this;

    _classCallCheck(this, ActionPane);

    _get(Object.getPrototypeOf(ActionPane.prototype), 'constructor', this).call(this, props);

    this.componentWillUnmount = function () {
      _modulesStoresRefreshStoreJs2['default'].unsubscribeListener(_this.onRefreshOptionsChanged);
    };

    this.onRefreshOptionsChanged = function () {
      _this.setState({
        showDynamic: _modulesStoresRefreshStoreJs2['default'].getOptions().showDynamic,
        visualizationDimensions: _modulesStoresRefreshStoreJs2['default'].getOptions().dimensions
      });
    };

    this.render = function () {
      return _react2['default'].createElement('div', { className: 'flex-action-pane' }, _react2['default'].createElement(_VisPaneVispaneJsx2['default'], {
        showDynamic: _this.state.showDynamic,
        dimensions: _this.state.visualizationDimensions }), _react2['default'].createElement(_CodePaneCodePaneJsx2['default'], {
        showDynamic: _this.state.showDynamic }));
    };

    this.state = {
      showDynamic: _modulesStoresRefreshStoreJs2['default'].getOptions().showDynamic,
      visualizationDimensions: _modulesStoresRefreshStoreJs2['default'].getOptions().dimensions
    };
  }

  _createClass(ActionPane, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      _modulesStoresRefreshStoreJs2['default'].subscribeListener(this.onRefreshOptionsChanged);
    }
  }]);

  return ActionPane;
})(_react2['default'].Component);

exports['default'] = ActionPane;
module.exports = exports['default'];

// those changes requiring a component refresh.
// Below here, the components subscribe to code changes directly.

},{"../../../modules/stores/RefreshStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\RefreshStore.js","./CodePane/CodePane.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\ActionPane\\CodePane\\CodePane.jsx","./VisPane/Vispane.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\ActionPane\\VisPane\\Vispane.jsx","react":"react"}],"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\ActionPane\\CodePane\\CodePane.jsx":[function(require,module,exports){
/* Responsible for re-rendering the editor externally
   if the selectedExample constant changes 
   in the RefreshStore.
   The editor can then maintain state internally
   and independently synchronise via the CodeStore. */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _EditorEditorJsx = require('./Editor/Editor.jsx');

var _EditorEditorJsx2 = _interopRequireDefault(_EditorEditorJsx);

var _ControlBarControlBarJsx = require('./ControlBar/ControlBar.jsx');

var _ControlBarControlBarJsx2 = _interopRequireDefault(_ControlBarControlBarJsx);

var _modulesStoresCodeStatusStoreJs = require('../../../../modules/stores/CodeStatusStore.js');

var _modulesStoresCodeStatusStoreJs2 = _interopRequireDefault(_modulesStoresCodeStatusStoreJs);

var CodePane = (function (_React$Component) {
  _inherits(CodePane, _React$Component);

  function CodePane(props) {
    var _this = this;

    _classCallCheck(this, CodePane);

    _get(Object.getPrototypeOf(CodePane.prototype), 'constructor', this).call(this, props);

    this.componentDidMount = function () {
      _modulesStoresCodeStatusStoreJs2['default'].subscribeListener(_this.onCodeStatusChange);
    };

    this.componentWillReceiveProps = function (nextProps) {
      if (nextProps.showDynamic !== _this.props.showDynamic) {
        _modulesStoresCodeStatusStoreJs2['default'].setCodeParsed(false);
      }
    };

    this.componentWillUnmount = function () {
      _modulesStoresCodeStatusStoreJs2['default'].unsubscribeListener(_this.onCodeStatusChange);
    };

    this.onCodeStatusChange = function (newStatus) {
      // don't wait for the sequencer, it doesn't update
      // needlessly if only advancing a single step.
      // and even if it did, if the delay is set to high
      // we would still want to
      // give the user control again immediately.
      _this.setState({
        codeRunning: newStatus.codeRunning,
        codeParsed: newStatus.codeParsed,
        codeFinished: newStatus.codeFinished
      });
    };

    this.render = function () {
      return _react2['default'].createElement('div', { className: 'flex-code-pane' }, _react2['default'].createElement(_ControlBarControlBarJsx2['default'], { showDynamic: _this.props.showDynamic,
        codeRunning: _this.state.codeRunning,
        codeParsed: _this.state.codeParsed,
        codeFinished: _this.state.codeFinished }), _react2['default'].createElement(_EditorEditorJsx2['default'], { codeRunning: _this.state.codeRunning,
        onUserChangeCode: _modulesStoresCodeStatusStoreJs2['default'].setCodeParsed.bind(_this, false) }));
    };

    this.state = {
      codeRunning: _modulesStoresCodeStatusStoreJs2['default'].isCodeRunning(),
      codeParsed: _modulesStoresCodeStatusStoreJs2['default'].isCodeParsed(),
      codeFinished: _modulesStoresCodeStatusStoreJs2['default'].isCodeFinished()
    };
  }

  _createClass(CodePane, null, [{
    key: 'propTypes',
    value: {
      showDynamic: _react2['default'].PropTypes.bool.isRequired
    },
    enumerable: true
  }]);

  return CodePane;
})(_react2['default'].Component);

exports['default'] = CodePane;
module.exports = exports['default'];

},{"../../../../modules/stores/CodeStatusStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\CodeStatusStore.js","./ControlBar/ControlBar.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\ActionPane\\CodePane\\ControlBar\\ControlBar.jsx","./Editor/Editor.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\ActionPane\\CodePane\\Editor\\Editor.jsx","react":"react"}],"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\ActionPane\\CodePane\\ControlBar\\ControlBar.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

/* clicking buttons on the DynamicControlBar either sends
   commands to the Sequencer, which triggers changes in 
   the CodeStatusStore and thus disables/enables various 
   buttons on callback, or the CodeStatusStore is 
   set directly, which the Sequencer checks on each update
   cycle as well as calling back to enable/disable buttons here. */

var _modulesStoresCodeStatusStoreJs = require('../../../../../modules/stores/CodeStatusStore.js');

var _modulesStoresCodeStatusStoreJs2 = _interopRequireDefault(_modulesStoresCodeStatusStoreJs);

var _modulesD3DynamicVisualizerSequencerSequencerJs = require('../../../../../modules/d3DynamicVisualizer/Sequencer/Sequencer.js');

var _modulesD3DynamicVisualizerSequencerSequencerJs2 = _interopRequireDefault(_modulesD3DynamicVisualizerSequencerSequencerJs);

var ControlBar = (function (_React$Component) {
  _inherits(ControlBar, _React$Component);

  function ControlBar(props) {
    var _this = this;

    _classCallCheck(this, ControlBar);

    _get(Object.getPrototypeOf(ControlBar.prototype), 'constructor', this).call(this, props);

    this.onPlay = function () {
      _modulesStoresCodeStatusStoreJs2['default'].setCodeRunning(true);
      _this.setState({
        allowResetButton: true
      });
      _modulesD3DynamicVisualizerSequencerSequencerJs2['default'].update();
    };

    this.onPause = function () {
      _modulesStoresCodeStatusStoreJs2['default'].setCodeRunning(false);
    };

    this.onAdvance = function () {
      _modulesStoresCodeStatusStoreJs2['default'].setCodeRunning(true);
      _this.setState({
        allowResetButton: true
      });
      _modulesD3DynamicVisualizerSequencerSequencerJs2['default'].update(true);
    };

    this.onReset = function () {
      _modulesStoresCodeStatusStoreJs2['default'].setCodeRunning(false);
      _this.setState({
        allowResetButton: false
      });
      _modulesD3DynamicVisualizerSequencerSequencerJs2['default'].restart();
    };

    this.onParse = function () {
      _modulesStoresCodeStatusStoreJs2['default'].setCodeParsed(true);
      if (_this.props.showDynamic) {
        _modulesD3DynamicVisualizerSequencerSequencerJs2['default'].initialize();
      }
    };

    this.render = function () {
      return _react2['default'].createElement(_materialUi.Toolbar, { style: { backgroundColor: 'lightgrey', display: 'flex', 'alignItems': 'center', justifyContent: 'space-around' } }, _react2['default'].createElement(_materialUi.ToolbarGroup, { className: 'legacy-flex', style: { display: 'flex', 'flexGrow': 2, justifyContent: 'space-around' } }, _react2['default'].createElement(_materialUi.IconButton, { disabled: !_this.props.showDynamic || !_this.props.codeParsed || _this.props.codeRunning || _this.props.codeFinished, onClick: _this.onPlay, style: { 'zIndex': 5 }, tooltip: 'Play or resume dynamic execution' }, _react2['default'].createElement('i', { className: 'material-icons' }, 'play_arrow')), _react2['default'].createElement(_materialUi.IconButton, { disabled: !_this.props.showDynamic || !_this.props.codeParsed || !_this.props.codeRunning || _this.props.codeFinished, onClick: _this.onPause, style: { 'zIndex': 5 }, tooltip: 'Pause dynamic execution' }, _react2['default'].createElement('i', { className: 'material-icons' }, 'pause')), _react2['default'].createElement(_materialUi.IconButton, { disabled: !_this.props.showDynamic || !_this.props.codeParsed || _this.props.codeRunning || _this.props.codeFinished, onClick: _this.onAdvance, style: { 'zIndex': 5 }, tooltip: 'Advance one step' }, _react2['default'].createElement('i', { className: 'material-icons' }, 'skip_next')), _react2['default'].createElement(_materialUi.IconButton, { disabled: !_this.props.showDynamic || !_this.props.codeParsed || !_this.state.allowResetButton, onClick: _this.onReset, style: { 'zIndex': 5 }, tooltip: 'Stop and reset execution to start' }, _react2['default'].createElement('i', { className: 'material-icons' }, 'replay'))), _react2['default'].createElement(_materialUi.ToolbarSeparator, { style: { 'top': 0 } }), _react2['default'].createElement(_materialUi.ToolbarGroup, { style: { flexGrow: 1, display: 'flex', justifyContent: 'space-around' } }, _react2['default'].createElement(_materialUi.FlatButton, { style: { minWidth: '160px' }, disabled: _this.props.codeParsed, onClick: _this.onParse, label: 'Parse code' })));
    };

    this.state = {
      allowResetButton: false
    };
  }

  _createClass(ControlBar, null, [{
    key: 'propTypes',
    value: {
      showDynamic: _react2['default'].PropTypes.bool,
      codeParsed: _react2['default'].PropTypes.bool,
      codeRunning: _react2['default'].PropTypes.bool
    },
    enumerable: true
  }]);

  return ControlBar;
})(_react2['default'].Component);

exports['default'] = ControlBar;
module.exports = exports['default'];

},{"../../../../../modules/d3DynamicVisualizer/Sequencer/Sequencer.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\Sequencer\\Sequencer.js","../../../../../modules/stores/CodeStatusStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\CodeStatusStore.js","material-ui":"material-ui","react":"react"}],"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\ActionPane\\CodePane\\Editor\\Editor.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

function _objectWithoutProperties(obj, keys) {
  var target = {};for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];
  }return target;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _modulesVendor_modReactAceIndexJs = require('../../../../../modules/vendor_mod/react-ace/index.js');

var _modulesVendor_modReactAceIndexJs2 = _interopRequireDefault(_modulesVendor_modReactAceIndexJs);

/* Interface between React and Ace Editor:
   React may pass in staticCodeExample and cause component
   to re-render entirely, but the
   subscriptions to code updating via the CodeStore/SequencerStore
   change the underlying Ace Editor state directly and 
   so don't trigger React re-rendering */

var _modulesStoresSequencerStoreJs = require('../../../../../modules/stores/SequencerStore.js');

var _modulesStoresSequencerStoreJs2 = _interopRequireDefault(_modulesStoresSequencerStoreJs);

var _modulesStoresCodeStoreJs = require('../../../../../modules/stores/CodeStore.js');

var _modulesStoresCodeStoreJs2 = _interopRequireDefault(_modulesStoresCodeStoreJs);

var brace = require('brace');
require('brace/mode/javascript');
require('brace/theme/solarized_dark');
var Editor = (function () {
  function Editor() {
    var _this = this;

    _classCallCheck(this, Editor);

    this.componentDidMount = function () {
      _modulesStoresSequencerStoreJs2['default'].subscribeEditor(_this.onSequencerAction);
      _modulesStoresCodeStoreJs2['default'].subscribeListener(_this.onCodeStoreChange);
      _this.refs.aceEditor.editor.session.setUseWrapMode(true);
    };

    this.shouldComponentUpdate = function () {
      return false;
    };

    this.componentWillReceiveProps = function (nextProps) {
      _this.refs.aceEditor.editor.setReadOnly(nextProps.codeRunning);
    };

    this.componentDidUpdate = function () {};

    this.setRange = function (editor, range) {
      if (range) {
        editor.selection.setSelectionRange(range);
      } else {
        editor.selection.clearSelection();
      }
    };

    this.componentWillUnmount = function () {
      _modulesStoresSequencerStoreJs2['default'].unsubscribeEditor(_this.onSequencerAction);
      _modulesStoresCodeStoreJs2['default'].unsubscribeListener(_this.onCodeStoreChange);
    };

    this.onSequencerAction = function () {
      // highlight actioned code in the editor on each Sequencer update.
      var editor = _this.refs.aceEditor.editor;
      if (_this.props.codeRunning) {
        // action happened, disable editing and select range result
        var execCodeBlock = _modulesStoresSequencerStoreJs2['default'].getCurrentCodeBlock();
        /* try to find via find (regex) first, since the way AceEditor displays
           tabs means that range selections include the preceding tab so don't 
           look as exact. Still starts looking from the actual character the 
           range is on anyway, so should find immediately. */
        var range = editor.find(execCodeBlock, {
          start: _modulesStoresSequencerStoreJs2['default'].getCurrentRange().start
        });
        if (!range) {
          /* backup selection by node LOC, due to escodegen
             ocassionally not rebuilding the exact same code string 
             from a single node versus the whole progam */
          range = _modulesStoresSequencerStoreJs2['default'].getCurrentRange().collapseRows();
        }
        _this.setRange(editor, range);
      }
    };

    this.onChangeCodeInEditor = function (newValue, isPaste) {
      /* The Sequencer always checks the CodeStore preferentially to 
         the RefreshStore for user-modified code that has overwritten
         the selectedExample.*/
      var editor = _this.refs.aceEditor.editor;
      // don't trigger change for programmatic events (adding IIFE info)
      // as this will clear the state of the DynamicControlBar
      if (editor.curOp && editor.curOp.command.name || isPaste) {
        _modulesStoresCodeStoreJs2['default'].set(newValue, true);
        _this.props.onUserChangeCode();
      }
    };

    this.onPaste = function () {
      _this.onChangeCodeInEditor(_this.refs.aceEditor.editor.getValue(), true);
    };

    this.onCodeStoreChange = function (userUpdate) {
      if (!userUpdate) {
        var editor = _this.refs.aceEditor.editor;
        editor.setValue(_modulesStoresCodeStoreJs2['default'].get());
        editor.selection.clearSelection();
      }
    };

    this.render = function () {
      var other = _objectWithoutProperties(_this.props.options, []);

      return _react2['default'].createElement('div', null, _react2['default'].createElement(_modulesVendor_modReactAceIndexJs2['default'], _extends({ ref: 'aceEditor',
        value: _this.props.codeString,
        onChange: _this.onChangeCodeInEditor,
        onPaste: _this.onPaste
      }, other)));
    };
  }

  _createClass(Editor, null, [{
    key: 'propTypes',
    value: {
      options: _react2['default'].PropTypes.object,
      codeRunning: _react2['default'].PropTypes.bool
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      options: {
        theme: 'solarized_dark',
        mode: 'javascript',
        height: '800px',
        width: '100%',
        fontSize: 18,
        cursorStart: 1,
        editorProps: {
          $blockScrolling: Infinity,
          readOnly: false
        }
      }
    },
    enumerable: true
  }]);

  return Editor;
})();

exports['default'] = Editor;
module.exports = exports['default'];

},{"../../../../../modules/stores/CodeStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\CodeStore.js","../../../../../modules/stores/SequencerStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\SequencerStore.js","../../../../../modules/vendor_mod/react-ace/index.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\vendor_mod\\react-ace\\index.js","brace":"brace","brace/mode/javascript":"C:\\Users\\pitch\\functional-visualiser\\node_modules\\brace\\mode\\javascript.js","brace/theme/solarized_dark":"C:\\Users\\pitch\\functional-visualiser\\node_modules\\brace\\theme\\solarized_dark.js","react":"react"}],"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\ActionPane\\VisPane\\D3DynamicInterface\\D3DynamicInterface.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _modulesD3DynamicVisualizerD3DynamicVisualizerJs = require('../../../../../modules/d3DynamicVisualizer/d3DynamicVisualizer.js');

var _modulesD3DynamicVisualizerD3DynamicVisualizerJs2 = _interopRequireDefault(_modulesD3DynamicVisualizerD3DynamicVisualizerJs);

var _modulesStoresSequencerStoreJs = require('../../../../../modules/stores/SequencerStore.js');

var _modulesStoresSequencerStoreJs2 = _interopRequireDefault(_modulesStoresSequencerStoreJs);

// Interface between React and D3.
// Initialize and code is pushed from above via ActionPane, but
// updates are pushed directly from SequencerStore without React knowing.
// (manipulating state directly in d3DynamicVisualizer via d3Update function)

var D3DynamicInterface = (function () {
  function D3DynamicInterface() {
    var _this = this;

    _classCallCheck(this, D3DynamicInterface);

    this.componentDidMount = function () {
      _modulesStoresSequencerStoreJs2['default'].subscribeListener(_this.onSequencerUpdate);
    };

    this.onSequencerUpdate = function (shouldResetD3) {
      // noop if component has already unmounted.
      if (shouldResetD3) {
        // SequencerStore has new array ref,
        // re-link to Store and re-initialize force layout
        _this.d3Restart();
      } else {
        _modulesD3DynamicVisualizerD3DynamicVisualizerJs2['default'].update();
      }
    };

    this.d3Restart = function () {
      var element = _react2['default'].findDOMNode(_this);
      _modulesD3DynamicVisualizerD3DynamicVisualizerJs2['default'].initialize(element, _modulesStoresSequencerStoreJs2['default'].linkState().nodes, _modulesStoresSequencerStoreJs2['default'].linkState().links, _this.props.dimensions);
    };
  }

  _createClass(D3DynamicInterface, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      return false;
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _modulesStoresSequencerStoreJs2['default'].unsubscribeListener(this.onSequencerUpdate);
      // d3Dynamic.destroy(React.findDOMNode(this));
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2['default'].createElement('div', { className: 'd3-dynamic-root' });
    }
  }], [{
    key: 'propTypes',
    value: {
      dimensions: _react2['default'].PropTypes.object
    },
    enumerable: true
  }]);

  return D3DynamicInterface;
})();

exports['default'] = D3DynamicInterface;
module.exports = exports['default'];

},{"../../../../../modules/d3DynamicVisualizer/d3DynamicVisualizer.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\d3DynamicVisualizer.js","../../../../../modules/stores/SequencerStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\SequencerStore.js","react":"react"}],"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\ActionPane\\VisPane\\D3StaticInterface\\D3StaticInterface.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i['return']) _i['return']();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError('Invalid attempt to destructure non-iterable instance');
    }
  };
})();

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _modulesAstToolsAstToolsJs = require('../../../../../modules/astTools/astTools.js');

var _modulesAstToolsAstToolsJs2 = _interopRequireDefault(_modulesAstToolsAstToolsJs);

var _modulesD3StaticVisualizerBuildStaticCallGraphJs = require('../../../../../modules/d3StaticVisualizer/BuildStaticCallGraph.js');

var _modulesD3StaticVisualizerBuildStaticCallGraphJs2 = _interopRequireDefault(_modulesD3StaticVisualizerBuildStaticCallGraphJs);

var _modulesD3StaticVisualizerD3StaticVisualizerJs = require('../../../../../modules/d3StaticVisualizer/d3StaticVisualizer.js');

var _modulesD3StaticVisualizerD3StaticVisualizerJs2 = _interopRequireDefault(_modulesD3StaticVisualizerD3StaticVisualizerJs);

var _modulesStoresCodeStatusStoreJs = require('../../../../../modules/stores/CodeStatusStore.js');

var _modulesStoresCodeStatusStoreJs2 = _interopRequireDefault(_modulesStoresCodeStatusStoreJs);

var _modulesStoresCodeStoreJs = require('../../../../../modules/stores/CodeStore.js');

var _modulesStoresCodeStoreJs2 = _interopRequireDefault(_modulesStoresCodeStoreJs);

var D3StaticInterface = (function () {
  function D3StaticInterface() {
    var _this = this;

    _classCallCheck(this, D3StaticInterface);

    this.componentDidMount = function () {
      _modulesStoresCodeStatusStoreJs2['default'].subscribeListener(_this.onCodeStatusStoreUpdate);
      _modulesStoresCodeStoreJs2['default'].subscribeListener(_this.onNewCodeString);
    };

    this.componentWillUnmount = function () {
      _modulesStoresCodeStatusStoreJs2['default'].unsubscribeListener(_this.onCodeStatusStoreUpdate);
      _modulesStoresCodeStoreJs2['default'].unsubscribeListener(_this.onNewCodeString);
    };

    this.onCodeStatusStoreUpdate = function (codeOptions) {
      // the ControlBar just sets 'codeParsed' to true here
      // which is sufficient for redrawing the static analyzer.
      if (codeOptions.codeParsed) {
        _this.d3Restart();
      } else {
        _modulesD3StaticVisualizerD3StaticVisualizerJs2['default'].destroy(_react2['default'].findDOMNode(_this));
      }
    };

    this.onNewCodeString = function () {
      _modulesD3StaticVisualizerD3StaticVisualizerJs2['default'].destroy(_react2['default'].findDOMNode(_this));
    };

    this.d3Restart = function () {
      var runCodeString = _modulesAstToolsAstToolsJs2['default'].getRunCodeString(_modulesStoresCodeStoreJs2['default'].get());

      var _buildGraph$get = _modulesD3StaticVisualizerBuildStaticCallGraphJs2['default'].get(runCodeString);

      var _buildGraph$get2 = _slicedToArray(_buildGraph$get, 2);

      var nodes = _buildGraph$get2[0];
      var links = _buildGraph$get2[1];

      var element = _react2['default'].findDOMNode(_this);
      _modulesD3StaticVisualizerD3StaticVisualizerJs2['default'].initialize(element, nodes, links, _this.props.dimensions);
      _modulesD3StaticVisualizerD3StaticVisualizerJs2['default'].update();
    };
  }

  _createClass(D3StaticInterface, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      return false;
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2['default'].createElement('div', { className: 'd3-static-root' });
    }
  }], [{
    key: 'propTypes',
    value: {
      dimensions: _react2['default'].PropTypes.object.isRequired
    },
    enumerable: true
  }]);

  return D3StaticInterface;
})();

exports['default'] = D3StaticInterface;
module.exports = exports['default'];

},{"../../../../../modules/astTools/astTools.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\astTools\\astTools.js","../../../../../modules/d3StaticVisualizer/BuildStaticCallGraph.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3StaticVisualizer\\BuildStaticCallGraph.js","../../../../../modules/d3StaticVisualizer/d3StaticVisualizer.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3StaticVisualizer\\d3StaticVisualizer.js","../../../../../modules/stores/CodeStatusStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\CodeStatusStore.js","../../../../../modules/stores/CodeStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\CodeStore.js","react":"react"}],"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\ActionPane\\VisPane\\Vispane.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _D3DynamicInterfaceD3DynamicInterfaceJsx = require('./D3DynamicInterface/D3DynamicInterface.jsx');

var _D3DynamicInterfaceD3DynamicInterfaceJsx2 = _interopRequireDefault(_D3DynamicInterfaceD3DynamicInterfaceJsx);

var _D3StaticInterfaceD3StaticInterfaceJsx = require('./D3StaticInterface/D3StaticInterface.jsx');

var _D3StaticInterfaceD3StaticInterfaceJsx2 = _interopRequireDefault(_D3StaticInterfaceD3StaticInterfaceJsx);

var VisPane = (function (_React$Component) {
  _inherits(VisPane, _React$Component);

  function VisPane() {
    var _this = this;

    _classCallCheck(this, VisPane);

    _get(Object.getPrototypeOf(VisPane.prototype), 'constructor', this).apply(this, arguments);

    this.render = function () {
      var d3Component = null;
      if (_this.props.showDynamic) {
        d3Component = _react2['default'].createElement(_D3DynamicInterfaceD3DynamicInterfaceJsx2['default'], {
          dimensions: _this.props.dimensions
        });
      } else {
        d3Component = _react2['default'].createElement(_D3StaticInterfaceD3StaticInterfaceJsx2['default'], {
          dimensions: _this.props.dimensions });
      }

      return _react2['default'].createElement('div', { className: 'flex-vis-pane',
        style: { width: _this.props.dimensions.width + 'px', height: _this.props.dimensions.height + 'px' } }, d3Component);
    };
  }

  _createClass(VisPane, null, [{
    key: 'propTypes',
    value: {
      dimensions: _react2['default'].PropTypes.object,
      showDynamic: _react2['default'].PropTypes.bool.isRequired
    },
    enumerable: true
  }]);

  return VisPane;
})(_react2['default'].Component);

exports['default'] = VisPane;
module.exports = exports['default'];

},{"./D3DynamicInterface/D3DynamicInterface.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\ActionPane\\VisPane\\D3DynamicInterface\\D3DynamicInterface.jsx","./D3StaticInterface/D3StaticInterface.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\ActionPane\\VisPane\\D3StaticInterface\\D3StaticInterface.jsx","react":"react"}],"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\BaseLayout.jsx":[function(require,module,exports){
/*
  Navigation split and receives subscriptions seperately
  so as to not trigger re-render of ActionPane on
  Navbar / Modal show/hide.
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _NavigationNavigationJsx = require('./Navigation/Navigation.jsx');

var _NavigationNavigationJsx2 = _interopRequireDefault(_NavigationNavigationJsx);

var _ActionPaneActionPaneJsx = require('./ActionPane/ActionPane.jsx');

var _ActionPaneActionPaneJsx2 = _interopRequireDefault(_ActionPaneActionPaneJsx);

var BaseLayout = (function () {
  function BaseLayout() {
    _classCallCheck(this, BaseLayout);
  }

  _createClass(BaseLayout, [{
    key: 'render',
    value: function render() {
      return _react2['default'].createElement('div', null, _react2['default'].createElement(_NavigationNavigationJsx2['default'], null), _react2['default'].createElement(_ActionPaneActionPaneJsx2['default'], null));
    }
  }]);

  return BaseLayout;
})();

exports['default'] = BaseLayout;
module.exports = exports['default'];

},{"./ActionPane/ActionPane.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\ActionPane\\ActionPane.jsx","./Navigation/Navigation.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\Navigation\\Navigation.jsx","react":"react"}],"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\Navigation\\ErrorPopup\\ErrorPopup.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _modulesStoresSequencerStoreJs = require('../../../../modules/stores/SequencerStore.js');

var _modulesStoresSequencerStoreJs2 = _interopRequireDefault(_modulesStoresSequencerStoreJs);

var _modulesStoresRefreshStoreJs = require('../../../../modules/stores/RefreshStore.js');

var _modulesStoresRefreshStoreJs2 = _interopRequireDefault(_modulesStoresRefreshStoreJs);

var ErrorPopup = (function (_React$Component) {
  _inherits(ErrorPopup, _React$Component);

  function ErrorPopup(props) {
    var _this = this;

    _classCallCheck(this, ErrorPopup);

    _get(Object.getPrototypeOf(ErrorPopup.prototype), 'constructor', this).call(this, props);

    this.componentDidMount = function () {
      _modulesStoresSequencerStoreJs2['default'].subscribeListener(_this.onSequencerStoreUpdate);
    };

    this.componentWillUnmount = function () {
      _modulesStoresSequencerStoreJs2['default'].unsubscribeListener(_this.onSequencerStoreUpdate);
    };

    this.onSequencerStoreUpdate = function () {
      _this.setState({
        warning: _modulesStoresSequencerStoreJs2['default'].getWarning()
      });
    };

    this.dismissSnackbar = function () {
      _this.refs.snackbar.dismiss();
    };

    this.render = function () {
      return _react2['default'].createElement(_materialUi.Snackbar, {
        ref: 'snackbar',
        action: _this.state.warning ? _this.state.warning.action : '',
        message: _this.state.warning ? _this.state.warning.message : '',
        onActionTouchTap: _this.dismissSnackbar,
        style: { maxWidth: 'auto' }
      });
    };

    this.state = {
      warning: _modulesStoresSequencerStoreJs2['default'].getWarning()
    };
  }

  _createClass(ErrorPopup, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      if (this.state.warning && !(_modulesStoresRefreshStoreJs2['default'].getOptions().showDynamic && !_modulesStoresSequencerStoreJs2['default'].getOptions().stopOnNotices)) {
        this.refs.snackbar.show();
        _modulesStoresSequencerStoreJs2['default'].setWarningMessageShown();
      } else {
        this.refs.snackbar.dismiss();
      }
    }
  }]);

  return ErrorPopup;
})(_react2['default'].Component);

exports['default'] = ErrorPopup;
module.exports = exports['default'];

},{"../../../../modules/stores/RefreshStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\RefreshStore.js","../../../../modules/stores/SequencerStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\SequencerStore.js","material-ui":"material-ui","react":"react"}],"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\Navigation\\MarkdownModal\\MarkdownModal.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _reactRemarkable = require('react-remarkable');

var _reactRemarkable2 = _interopRequireDefault(_reactRemarkable);

var _modulesStoresNavigationStoreJs = require('../../../../modules/stores/NavigationStore.js');

var _modulesStoresNavigationStoreJs2 = _interopRequireDefault(_modulesStoresNavigationStoreJs);

var MarkdownModal = (function (_React$Component) {
  _inherits(MarkdownModal, _React$Component);

  function MarkdownModal(props) {
    var _this = this;

    _classCallCheck(this, MarkdownModal);

    _get(Object.getPrototypeOf(MarkdownModal.prototype), 'constructor', this).call(this, props);

    this.componentDidMount = function () {
      _modulesStoresNavigationStoreJs2['default'].subscribeListener(_this.onNavigationStoreChange);
    };

    this.componentDidUpdate = function () {
      _this.refs.dialog.show();
    };

    this.componentWillUnmount = function () {
      _modulesStoresNavigationStoreJs2['default'].unsubscribeListener(_this.onNavigationStoreChange);
    };

    this.onNavigationStoreChange = function () {
      _this.setState({
        selectedMarkdown: _modulesStoresNavigationStoreJs2['default'].getSelectedMarkdown()
      });
    };

    this.handleDialogClose = function (userClickedCloseButton) {
      if (userClickedCloseButton) {
        _this.refs.dialog.dismiss();
      }
      _modulesStoresNavigationStoreJs2['default'].setOptions({
        selectedMarkdown: null
      });
    };

    this.state = {
      selectedMarkdown: null
    };
  }

  _createClass(MarkdownModal, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return nextState.selectedMarkdown;
    }
  }, {
    key: 'render',
    value: function render() {

      if (!this.state.selectedMarkdown) {
        return null;
      }

      var customActions = [_react2['default'].createElement(_materialUi.FlatButton, {
        key: 'close',
        label: 'Close',
        primary: true,
        onTouchTap: this.handleDialogClose.bind(this, true)
      })];
      return _react2['default'].createElement(_materialUi.Dialog, {
        ref: 'dialog',
        key: 'dialog',
        style: { color: 'white' },
        title: this.state.selectedMarkdown.title,
        actions: customActions,
        openImmediately: true,
        onDismiss: this.handleDialogClose.bind(this, false),
        autoDetectWindowHeight: true,
        autoScrollBodyContent: true }, _react2['default'].createElement('div', { style: { height: '500px', 'overflowY': 'auto' } }, _react2['default'].createElement(_reactRemarkable2['default'], {
        key: 'markdownModal',
        source: this.state.selectedMarkdown.body })));
    }
  }]);

  return MarkdownModal;
})(_react2['default'].Component);

exports['default'] = MarkdownModal;
module.exports = exports['default'];

},{"../../../../modules/stores/NavigationStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\NavigationStore.js","material-ui":"material-ui","react":"react","react-remarkable":"react-remarkable"}],"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\Navigation\\NavBar\\NavBar.jsx":[function(require,module,exports){
/*
All setting of the RefreshStore is done directly through here.
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _materialUi2 = _interopRequireDefault(_materialUi);

var _modulesStoresNavigationStoreJs = require('../../../../modules/stores/NavigationStore.js');

var _modulesStoresNavigationStoreJs2 = _interopRequireDefault(_modulesStoresNavigationStoreJs);

var _modulesStoresConstantStoreJs = require('../../../../modules/stores/ConstantStore.js');

var _modulesStoresConstantStoreJs2 = _interopRequireDefault(_modulesStoresConstantStoreJs);

var _modulesStoresCodeStoreJs = require('../../../../modules/stores/CodeStore.js');

var _modulesStoresCodeStoreJs2 = _interopRequireDefault(_modulesStoresCodeStoreJs);

var _modulesStoresCodeStatusStoreJs = require('../../../../modules/stores/CodeStatusStore.js');

var _modulesStoresCodeStatusStoreJs2 = _interopRequireDefault(_modulesStoresCodeStatusStoreJs);

var LeftNav = _materialUi2['default'].LeftNav;
var MenuItem = _materialUi2['default'].MenuItem;

var NavBar = (function () {
  function NavBar() {
    var _this = this;

    _classCallCheck(this, NavBar);

    this.componentDidMount = function () {
      _modulesStoresNavigationStoreJs2['default'].subscribeListener(_this.onNavigationStoreChange);
      _this.setNavBarState();
    };

    this.componentWillUnmount = function () {
      _modulesStoresNavigationStoreJs2['default'].unsubscribeListener(_this.onNavigationStoreChange);
    };

    this.onNavigationStoreChange = function () {
      _this.setNavBarState();
    };

    this.setNavBarState = function () {
      if (_modulesStoresNavigationStoreJs2['default'].isNavBarShowing()) {
        _this.refs.leftNav.toggle();
      }
    };

    this.handleClick = function (e, selectedIndex, menuItem) {
      var constants = _modulesStoresConstantStoreJs2['default'].getConstants();
      switch (menuItem.optionGroup) {
        case 'codeExamples':
          // user has selected pre-written example; this resets the user-typed code.
          var staticCodeExample = constants[menuItem.optionGroup][menuItem.index].func;
          _modulesStoresCodeStoreJs2['default'].set(staticCodeExample, false, true);
          _modulesStoresCodeStatusStoreJs2['default'].setCodeParsed(false);
          break;

        case 'markdown':
          var selectedMarkdown = constants[menuItem.optionGroup][menuItem.id];
          _modulesStoresNavigationStoreJs2['default'].setOptions({
            selectedMarkdown: selectedMarkdown
          });
          break;
      }
    };
  }

  _createClass(NavBar, [{
    key: 'onNavClose',
    value: function onNavClose() {
      _modulesStoresNavigationStoreJs2['default'].setOptions({
        isNavBarShowing: false
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2['default'].createElement('div', null, _react2['default'].createElement(LeftNav, { ref: 'leftNav',
        menuItems: this.props.menuItems,
        docked: false,
        style: { 'lineHeight': 1.5 },
        onChange: this.handleClick,
        onNavClose: this.onNavClose }));
    }
  }], [{
    key: 'propTypes',
    value: {
      menuItems: _react2['default'].PropTypes.array.isRequired
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      menuItems: [{
        type: MenuItem.Types.SUBHEADER,
        text: 'Program walkthrough'
      }].concat(_modulesStoresConstantStoreJs2['default'].getConstants().codeExamples.map(function (example, i) {
        return {
          optionGroup: 'codeExamples',
          text: i + 1 + ': ' + example.title,
          index: i
        };
      })).concat([{
        type: MenuItem.Types.SUBHEADER,
        text: 'Docs'
      }, {
        type: MenuItem.Types.LINK,
        payload: 'https://github.com/breakingco/functional-visualiser',
        text: 'GitHub source'
      }, {
        optionGroup: 'markdown',
        text: 'Early deliverable',
        id: 'earlyDeliverable'
      }, {
        optionGroup: 'markdown',
        payload: 'https://www.google.com',
        text: 'Dissertation',
        'id': 'dissertation',
        disabled: true
      }])
    },
    enumerable: true
  }]);

  return NavBar;
})();

exports['default'] = NavBar;
module.exports = exports['default'];

},{"../../../../modules/stores/CodeStatusStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\CodeStatusStore.js","../../../../modules/stores/CodeStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\CodeStore.js","../../../../modules/stores/ConstantStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\ConstantStore.js","../../../../modules/stores/NavigationStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\NavigationStore.js","material-ui":"material-ui","react":"react"}],"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\Navigation\\Navigation.jsx":[function(require,module,exports){
/*
  Responsible for showing/hiding main NavBar
  and UserOptions components.
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _NavBarNavBarJsx = require('./NavBar/NavBar.jsx');

var _NavBarNavBarJsx2 = _interopRequireDefault(_NavBarNavBarJsx);

var _OptionMenuOptionMenuJsx = require('./OptionMenu/OptionMenu.jsx');

var _OptionMenuOptionMenuJsx2 = _interopRequireDefault(_OptionMenuOptionMenuJsx);

var _MarkdownModalMarkdownModalJsx = require('./MarkdownModal/MarkdownModal.jsx');

var _MarkdownModalMarkdownModalJsx2 = _interopRequireDefault(_MarkdownModalMarkdownModalJsx);

var _ErrorPopupErrorPopupJsx = require('./ErrorPopup/ErrorPopup.jsx');

var _ErrorPopupErrorPopupJsx2 = _interopRequireDefault(_ErrorPopupErrorPopupJsx);

var _modulesStoresNavigationStoreJs = require('../../../modules/stores/NavigationStore.js');

var _modulesStoresNavigationStoreJs2 = _interopRequireDefault(_modulesStoresNavigationStoreJs);

var Navigation = (function (_React$Component) {
  _inherits(Navigation, _React$Component);

  function Navigation(props) {
    var _this = this;

    _classCallCheck(this, Navigation);

    _get(Object.getPrototypeOf(Navigation.prototype), 'constructor', this).call(this, props);

    this.setNavBarShowing = function () {
      _modulesStoresNavigationStoreJs2['default'].setOptions({
        isNavBarShowing: true
      });
    };

    this.render = function () {
      return _react2['default'].createElement('div', null, _react2['default'].createElement(_materialUi.AppBar, {
        style: { backgroundColor: '#2aa198' },
        title: 'Functional Visualiser',
        iconElementRight: _react2['default'].createElement(_OptionMenuOptionMenuJsx2['default'], null),
        onLeftIconButtonTouchTap: _this.setNavBarShowing }), _react2['default'].createElement(_MarkdownModalMarkdownModalJsx2['default'], {
        selectedMarkdown: _this.state.selectedMarkdown,
        zDepth: 5 }), _react2['default'].createElement(_NavBarNavBarJsx2['default'], null), _react2['default'].createElement(_ErrorPopupErrorPopupJsx2['default'], null));
    };

    this.state = {
      isNavBarShowing: _modulesStoresNavigationStoreJs2['default'].isNavBarShowing(),
      selectedMarkdown: _modulesStoresNavigationStoreJs2['default'].getSelectedMarkdown(),
      warning: null
    };
  }

  _createClass(Navigation, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      // every element is a persistent popup
      // with its own subscription to relevant events
      return false;
    }
  }]);

  return Navigation;
})(_react2['default'].Component);

exports['default'] = Navigation;
module.exports = exports['default'];

},{"../../../modules/stores/NavigationStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\NavigationStore.js","./ErrorPopup/ErrorPopup.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\Navigation\\ErrorPopup\\ErrorPopup.jsx","./MarkdownModal/MarkdownModal.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\Navigation\\MarkdownModal\\MarkdownModal.jsx","./NavBar/NavBar.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\Navigation\\NavBar\\NavBar.jsx","./OptionMenu/OptionMenu.jsx":"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\Navigation\\OptionMenu\\OptionMenu.jsx","material-ui":"material-ui","react":"react"}],"C:\\Users\\pitch\\functional-visualiser\\public\\reactComponents\\BaseLayout\\Navigation\\OptionMenu\\OptionMenu.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) {
  var _again = true;_function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;desc = parent = getter = undefined;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _modulesStoresSequencerStoreJs = require('../../../../modules/stores/SequencerStore.js');

var _modulesStoresSequencerStoreJs2 = _interopRequireDefault(_modulesStoresSequencerStoreJs);

var _modulesD3DynamicVisualizerSequencerSequencerJs = require('../../../../modules/d3DynamicVisualizer/Sequencer/Sequencer.js');

var _modulesD3DynamicVisualizerSequencerSequencerJs2 = _interopRequireDefault(_modulesD3DynamicVisualizerSequencerSequencerJs);

var _modulesStoresRefreshStoreJs = require('../../../../modules/stores/RefreshStore.js');

var _modulesStoresRefreshStoreJs2 = _interopRequireDefault(_modulesStoresRefreshStoreJs);

var _modulesStoresCodeStatusStoreJs = require('../../../../modules/stores/CodeStatusStore.js');

var _modulesStoresCodeStatusStoreJs2 = _interopRequireDefault(_modulesStoresCodeStatusStoreJs);

var OptionMenu = (function (_React$Component) {
  _inherits(OptionMenu, _React$Component);

  function OptionMenu(props) {
    var _this = this;

    _classCallCheck(this, OptionMenu);

    _get(Object.getPrototypeOf(OptionMenu.prototype), 'constructor', this).call(this, props);

    this.componentDidMount = function () {
      _modulesStoresSequencerStoreJs2['default'].subscribeOptionListener(_this.onSequencerStoreOptionChange);
      _modulesStoresCodeStatusStoreJs2['default'].subscribeListener(_this.onCodeStatusStoreChange);
      _modulesStoresRefreshStoreJs2['default'].subscribeListener(_this.onRefreshStoreOptionChange);
    };

    this.componentWillUnmount = function () {
      _modulesStoresSequencerStoreJs2['default'].unsubscribeOptionListener(_this.onSequencerStoreOptionChange);
      _modulesStoresRefreshStoreJs2['default'].unsubscribeListener(_this.onRefreshStoreOptionChange);
      _modulesStoresCodeStatusStoreJs2['default'].unsubscribeListener(_this.onCodeStatusStoreChange);
    };

    this.setVisualizationType = function () {
      var flag = !_this.state.showDynamic;
      _modulesStoresRefreshStoreJs2['default'].setOptions({
        showDynamic: flag
      });
      _modulesD3DynamicVisualizerSequencerSequencerJs2['default'].restart();
    };

    this.setShowFunctionLabels = function () {
      var flag = !_this.state.showFunctionLabels;
      _modulesStoresSequencerStoreJs2['default'].setOptions({
        showFunctionLabels: flag
      });
    };

    this.setHighlightExecutedCode = function () {
      var flag = !_this.state.highlightExecutedCode;
      _modulesStoresSequencerStoreJs2['default'].setOptions({
        highlightExecutedCode: flag
      });
    };

    this.setStopOnNotices = function () {
      var flag = !_this.state.stopOnNotices;
      _modulesStoresSequencerStoreJs2['default'].setOptions({
        stopOnNotices: flag
      });
    };

    this.setDelayVisualizer = function () {
      var flag = !_this.state.delayVisualizer;
      _modulesStoresSequencerStoreJs2['default'].setOptions({
        delayVisualizer: flag
      });
    };

    this.setLimitReturnedNodes = function () {
      var flag = !_this.state.limitReturnedNodes;
      _modulesStoresSequencerStoreJs2['default'].setOptions({
        limitReturnedNodes: flag
      });
    };

    this.setMaxAllowedReturnNodes = function (e, sliderValue) {
      _modulesStoresSequencerStoreJs2['default'].setOptions({
        maxAllowedReturnNodes: sliderValue
      });
    };

    this.setDelayValue = function (e, sliderValue) {
      _modulesStoresSequencerStoreJs2['default'].setOptions({
        sequencerDelay: sliderValue
      });
    };

    this.onSequencerStoreOptionChange = function () {
      _this.setState({
        limitReturnedNodes: _modulesStoresSequencerStoreJs2['default'].getOptions().limitReturnedNodes,
        maxAllowedReturnNodes: _modulesStoresSequencerStoreJs2['default'].getOptions().maxAllowedReturnNodes,
        maxAllowedReturnNodesFactor: _modulesStoresSequencerStoreJs2['default'].getOptions().maxAllowedReturnNodesFactor,
        delayVisualizer: _modulesStoresSequencerStoreJs2['default'].getOptions().delayVisualizer,
        sequencerDelay: _modulesStoresSequencerStoreJs2['default'].getOptions().sequencerDelay,
        minSequencerDelay: _modulesStoresSequencerStoreJs2['default'].getOptions().minSequencerDelay,
        delayFactor: _modulesStoresSequencerStoreJs2['default'].getOptions().delayFactor,
        stopOnNotices: _modulesStoresSequencerStoreJs2['default'].getOptions().stopOnNotices,
        showFunctionLabels: _modulesStoresSequencerStoreJs2['default'].getOptions().showFunctionLabels,
        highlightExecutedCode: _modulesStoresSequencerStoreJs2['default'].getOptions().highlightExecutedCode
      });
    };

    this.onRefreshStoreOptionChange = function () {
      _this.setState({
        showDynamic: _modulesStoresRefreshStoreJs2['default'].getOptions().showDynamic
      });
    };

    this.onCodeStatusStoreChange = function () {
      _this.setState({
        codeRunning: _modulesStoresCodeStatusStoreJs2['default'].isCodeRunning()
      });
    };

    this.render = function () {
      return _react2['default'].createElement(_materialUi.IconMenu, {
        closeOnItemTouchTap: false,
        iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { style: { zIndex: '2', color: '#EBF6F5' }, tooltip: 'Options' }, 'Options', _react2['default'].createElement('i', { className: 'material-icons' }, 'expand_more')) }, _react2['default'].createElement(_materialUi.List, { subheader: 'Visualization type', subheaderStyle: { color: 'darkgray', width: '280px' } }, _react2['default'].createElement(_materialUi.MenuItem, { disabled: true, index: 0, className: 'legacy-flex', style: { color: 'white', display: 'flex', justifyContent: 'space-around', alignItems: 'center' } }, _react2['default'].createElement('div', { style: { color: 'white' } }, 'static (POC)'), _react2['default'].createElement(_materialUi.Toggle, {
        ref: 'toggleDynamic',
        onToggle: _this.setVisualizationType,
        name: 'toggleDynamic',
        checked: _this.state.showDynamic,
        style: { width: 'auto' } }), _react2['default'].createElement('div', { style: { color: 'white' } }, 'dynamic'))), _react2['default'].createElement(_materialUi.List, { subheader: 'Dynamic visualization options', subheaderStyle: { color: 'darkgray' } }, _react2['default'].createElement(_materialUi.Checkbox, {
        style: { padding: '0 24px 0 24px', margin: '12px 0' },
        name: 'showLabelsCheckbox',
        ref: 'showLabelsCheckbox',
        label: 'Show function labels',
        labelPosition: 'left',
        labelStyle: { width: 'calc(100% - 100px)' },
        checked: _this.state.showFunctionLabels,
        onCheck: _this.setShowFunctionLabels }), _react2['default'].createElement(_materialUi.Checkbox, {
        style: { padding: '0 24px 0 24px', margin: '12px 0' },
        name: 'stopForNoticesCheckbox',
        ref: 'stopForNoticesCheckbox',
        label: 'Stop on warnings',
        labelPosition: 'left',
        labelStyle: { width: 'calc(100% - 100px)' },
        checked: _this.state.stopOnNotices,
        onCheck: _this.setStopOnNotices }), _react2['default'].createElement(_materialUi.Checkbox, {
        style: { padding: '0 24px 0 24px', margin: '12px 0' },
        name: 'highlightExecutedCodeCheckbox',
        ref: 'highlightExecutedCodeCheckbox',
        label: 'Highlight executed code',
        labelPosition: 'left',
        labelStyle: { width: 'calc(100% - 100px)' },
        checked: _this.state.highlightExecutedCode,
        onCheck: _this.setHighlightExecutedCode }), _react2['default'].createElement(_materialUi.Checkbox, { style: { padding: '0 24px 0 24px', margin: '12px 0' },
        name: 'delayVisualizerCheckbox',
        ref: 'delayVisualizerCheckbox',
        label: 'Delay visualizer steps',
        labelPosition: 'left',
        labelStyle: { width: 'calc(100% - 100px)' },
        checked: _this.state.delayVisualizer,
        onCheck: _this.setDelayVisualizer }), _react2['default'].createElement(_materialUi.MenuItem, { index: 1, disabled: true, style: { lineHeight: '24px' } }, _react2['default'].createElement('div', { style: { paddingLeft: '24px', 'color': _this.state.delayVisualizer ? 'white' : 'darkgray' } }, 'Delay: ', Math.round(_this.state.sequencerDelay * _this.state.delayFactor) + ' ms'), _react2['default'].createElement(_materialUi.Slider, { style: { margin: '0 12px 24px 12px', touchAction: 'none', cursor: 'pointer' },
        disabled: !_this.state.delayVisualizer,
        onChange: _this.setDelayValue,
        name: 'sequencerDelay',
        min: _this.state.minSequencerDelay,
        defaultValue: _this.state.sequencerDelay,
        value: _this.state.sequencerDelay,
        max: 1 })), _react2['default'].createElement(_materialUi.Checkbox, { style: { padding: '0 24px 0 24px', margin: '12px 0' },
        name: 'limitReturnedNodesCheckbox',
        disabled: _this.state.codeRunning,
        label: 'Limit visible returned functions',
        labelPosition: 'left',
        labelStyle: { width: 'calc(100% - 100px)' },
        checked: _this.state.limitReturnedNodes,
        onCheck: _this.setLimitReturnedNodes }), _react2['default'].createElement(_materialUi.MenuItem, { index: 2, disabled: true, style: { lineHeight: '24px' } }, _react2['default'].createElement('div', { style: { paddingLeft: '24px', 'color': _this.state.limitReturnedNodes && !_this.state.codeRunning ? 'white' : 'darkgray' } }, 'Visible: ', _this.state.limitReturnedNodes ? Math.round(_this.state.maxAllowedReturnNodes * _this.state.maxAllowedReturnNodesFactor) : 'unlimited'), _react2['default'].createElement(_materialUi.Slider, { style: { margin: '0 12px 24px 12px', touchAction: 'none', cursor: 'pointer' },
        disabled: !_this.state.limitReturnedNodes || _this.state.codeRunning,
        onChange: _this.setMaxAllowedReturnNodes,
        name: 'maxAllowedReturnNodesSlider',
        min: 0,
        value: _this.state.maxAllowedReturnNodes,
        max: 1 }))));
    };

    this.state = {
      limitReturnedNodes: _modulesStoresSequencerStoreJs2['default'].getOptions().limitReturnedNodes,
      maxAllowedReturnNodes: _modulesStoresSequencerStoreJs2['default'].getOptions().maxAllowedReturnNodes,
      maxAllowedReturnNodesFactor: _modulesStoresSequencerStoreJs2['default'].getOptions().maxAllowedReturnNodesFactor,
      showDynamic: _modulesStoresRefreshStoreJs2['default'].getOptions().showDynamic,
      delayVisualizer: _modulesStoresSequencerStoreJs2['default'].getOptions().delayVisualizer,
      sequencerDelay: _modulesStoresSequencerStoreJs2['default'].getOptions().sequencerDelay,
      minSequencerDelay: _modulesStoresSequencerStoreJs2['default'].getOptions().minSequencerDelay,
      delayFactor: _modulesStoresSequencerStoreJs2['default'].getOptions().delayFactor,
      stopOnNotices: _modulesStoresSequencerStoreJs2['default'].getOptions().stopOnNotices,
      showFunctionLabels: _modulesStoresSequencerStoreJs2['default'].getOptions().showFunctionLabels,
      highlightExecutedCode: _modulesStoresSequencerStoreJs2['default'].getOptions().highlightExecutedCode,
      isCodeRunning: _modulesStoresCodeStatusStoreJs2['default'].isCodeRunning()
    };
  }

  return OptionMenu;
})(_react2['default'].Component);

exports['default'] = OptionMenu;
module.exports = exports['default'];

},{"../../../../modules/d3DynamicVisualizer/Sequencer/Sequencer.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\d3DynamicVisualizer\\Sequencer\\Sequencer.js","../../../../modules/stores/CodeStatusStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\CodeStatusStore.js","../../../../modules/stores/RefreshStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\RefreshStore.js","../../../../modules/stores/SequencerStore.js":"C:\\Users\\pitch\\functional-visualiser\\public\\modules\\stores\\SequencerStore.js","material-ui":"material-ui","react":"react"}]},{},["C:\\Users\\pitch\\functional-visualiser\\public\\index.jsx"])


//# sourceMappingURL=index.js.map