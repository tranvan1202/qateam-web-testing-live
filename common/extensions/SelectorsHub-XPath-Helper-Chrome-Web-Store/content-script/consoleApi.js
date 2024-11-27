var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));

// ../packages/playwright-core/src/server/isomorphic/cssTokenizer.js
var require_cssTokenizer = __commonJS({
  "../packages/playwright-core/src/server/isomorphic/cssTokenizer.js"(exports2) {
    (function(root, factory) {
      if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
      } else if (typeof exports2 !== "undefined") {
        factory(exports2);
      } else {
        factory(root);
      }
    })(exports2, function(exports3) {
      var between = function(num, first, last) {
        return num >= first && num <= last;
      };
      function digit(code) {
        return between(code, 48, 57);
      }
      function hexdigit(code) {
        return digit(code) || between(code, 65, 70) || between(code, 97, 102);
      }
      function uppercaseletter(code) {
        return between(code, 65, 90);
      }
      function lowercaseletter(code) {
        return between(code, 97, 122);
      }
      function letter(code) {
        return uppercaseletter(code) || lowercaseletter(code);
      }
      function nonascii(code) {
        return code >= 128;
      }
      function namestartchar(code) {
        return letter(code) || nonascii(code) || code == 95;
      }
      function namechar(code) {
        return namestartchar(code) || digit(code) || code == 45;
      }
      function nonprintable(code) {
        return between(code, 0, 8) || code == 11 || between(code, 14, 31) || code == 127;
      }
      function newline(code) {
        return code == 10;
      }
      function whitespace(code) {
        return newline(code) || code == 9 || code == 32;
      }
      function badescape(code) {
        return newline(code) || isNaN(code);
      }
      var maximumallowedcodepoint = 1114111;
      var InvalidCharacterError = function(message) {
        this.message = message;
      };
      InvalidCharacterError.prototype = new Error();
      InvalidCharacterError.prototype.name = "InvalidCharacterError";
      function preprocess(str) {
        var codepoints = [];
        for (var i = 0; i < str.length; i++) {
          var code = str.charCodeAt(i);
          if (code == 13 && str.charCodeAt(i + 1) == 10) {
            code = 10;
            i++;
          }
          if (code == 13 || code == 12)
            code = 10;
          if (code == 0)
            code = 65533;
          if (between(code, 55296, 56319) && between(str.charCodeAt(i + 1), 56320, 57343)) {
            var lead = code - 55296;
            var trail = str.charCodeAt(i + 1) - 56320;
            code = Math.pow(2, 16) + lead * Math.pow(2, 10) + trail;
            i++;
          }
          codepoints.push(code);
        }
        return codepoints;
      }
      function stringFromCode(code) {
        if (code <= 65535)
          return String.fromCharCode(code);
        code -= Math.pow(2, 16);
        var lead = Math.floor(code / Math.pow(2, 10)) + 55296;
        var trail = code % Math.pow(2, 10) + 56320;
        return String.fromCharCode(lead) + String.fromCharCode(trail);
      }
      function tokenize2(str) {
        str = preprocess(str);
        var i = -1;
        var tokens = [];
        var code;
        var line = 0;
        var column = 0;
        var lastLineLength = 0;
        var incrLineno = function() {
          line += 1;
          lastLineLength = column;
          column = 0;
        };
        var locStart = { line, column };
        var codepoint = function(i2) {
          if (i2 >= str.length) {
            return -1;
          }
          return str[i2];
        };
        var next = function(num) {
          if (num === void 0)
            num = 1;
          if (num > 3)
            throw "Spec Error: no more than three codepoints of lookahead.";
          return codepoint(i + num);
        };
        var consume = function(num) {
          if (num === void 0)
            num = 1;
          i += num;
          code = codepoint(i);
          if (newline(code))
            incrLineno();
          else
            column += num;
          return true;
        };
        var reconsume = function() {
          i -= 1;
          if (newline(code)) {
            line -= 1;
            column = lastLineLength;
          } else {
            column -= 1;
          }
          locStart.line = line;
          locStart.column = column;
          return true;
        };
        var eof = function(codepoint2) {
          if (codepoint2 === void 0)
            codepoint2 = code;
          return codepoint2 == -1;
        };
        var donothing = function() {
        };
        var parseerror = function() {
          console.log("Parse error at index " + i + ", processing codepoint 0x" + code.toString(16) + ".");
          return true;
        };
        var consumeAToken = function() {
          consumeComments();
          consume();
          if (whitespace(code)) {
            while (whitespace(next()))
              consume();
            return new WhitespaceToken2();
          } else if (code == 34)
            return consumeAStringToken();
          else if (code == 35) {
            if (namechar(next()) || areAValidEscape(next(1), next(2))) {
              var token = new HashToken2();
              if (wouldStartAnIdentifier(next(1), next(2), next(3)))
                token.type = "id";
              token.value = consumeAName();
              return token;
            } else {
              return new DelimToken2(code);
            }
          } else if (code == 36) {
            if (next() == 61) {
              consume();
              return new SuffixMatchToken();
            } else {
              return new DelimToken2(code);
            }
          } else if (code == 39)
            return consumeAStringToken();
          else if (code == 40)
            return new OpenParenToken();
          else if (code == 41)
            return new CloseParenToken2();
          else if (code == 42) {
            if (next() == 61) {
              consume();
              return new SubstringMatchToken();
            } else {
              return new DelimToken2(code);
            }
          } else if (code == 43) {
            if (startsWithANumber()) {
              reconsume();
              return consumeANumericToken();
            } else {
              return new DelimToken2(code);
            }
          } else if (code == 44)
            return new CommaToken2();
          else if (code == 45) {
            if (startsWithANumber()) {
              reconsume();
              return consumeANumericToken();
            } else if (next(1) == 45 && next(2) == 62) {
              consume(2);
              return new CDCToken2();
            } else if (startsWithAnIdentifier()) {
              reconsume();
              return consumeAnIdentlikeToken();
            } else {
              return new DelimToken2(code);
            }
          } else if (code == 46) {
            if (startsWithANumber()) {
              reconsume();
              return consumeANumericToken();
            } else {
              return new DelimToken2(code);
            }
          } else if (code == 58)
            return new ColonToken2();
          else if (code == 59)
            return new SemicolonToken2();
          else if (code == 60) {
            if (next(1) == 33 && next(2) == 45 && next(3) == 45) {
              consume(3);
              return new CDOToken2();
            } else {
              return new DelimToken2(code);
            }
          } else if (code == 64) {
            if (wouldStartAnIdentifier(next(1), next(2), next(3))) {
              return new AtKeywordToken2(consumeAName());
            } else {
              return new DelimToken2(code);
            }
          } else if (code == 91)
            return new OpenSquareToken2();
          else if (code == 92) {
            if (startsWithAValidEscape()) {
              reconsume();
              return consumeAnIdentlikeToken();
            } else {
              parseerror();
              return new DelimToken2(code);
            }
          } else if (code == 93)
            return new CloseSquareToken2();
          else if (code == 94) {
            if (next() == 61) {
              consume();
              return new PrefixMatchToken();
            } else {
              return new DelimToken2(code);
            }
          } else if (code == 123)
            return new OpenCurlyToken2();
          else if (code == 124) {
            if (next() == 61) {
              consume();
              return new DashMatchToken();
            } else if (next() == 124) {
              consume();
              return new ColumnToken2();
            } else {
              return new DelimToken2(code);
            }
          } else if (code == 125)
            return new CloseCurlyToken2();
          else if (code == 126) {
            if (next() == 61) {
              consume();
              return new IncludeMatchToken();
            } else {
              return new DelimToken2(code);
            }
          } else if (digit(code)) {
            reconsume();
            return consumeANumericToken();
          } else if (namestartchar(code)) {
            reconsume();
            return consumeAnIdentlikeToken();
          } else if (eof())
            return new EOFToken2();
          else
            return new DelimToken2(code);
        };
        var consumeComments = function() {
          while (next(1) == 47 && next(2) == 42) {
            consume(2);
            while (true) {
              consume();
              if (code == 42 && next() == 47) {
                consume();
                break;
              } else if (eof()) {
                parseerror();
                return;
              }
            }
          }
        };
        var consumeANumericToken = function() {
          var num = consumeANumber();
          if (wouldStartAnIdentifier(next(1), next(2), next(3))) {
            var token = new DimensionToken();
            token.value = num.value;
            token.repr = num.repr;
            token.type = num.type;
            token.unit = consumeAName();
            return token;
          } else if (next() == 37) {
            consume();
            var token = new PercentageToken2();
            token.value = num.value;
            token.repr = num.repr;
            return token;
          } else {
            var token = new NumberToken2();
            token.value = num.value;
            token.repr = num.repr;
            token.type = num.type;
            return token;
          }
        };
        var consumeAnIdentlikeToken = function() {
          var str2 = consumeAName();
          if (str2.toLowerCase() == "url" && next() == 40) {
            consume();
            while (whitespace(next(1)) && whitespace(next(2)))
              consume();
            if (next() == 34 || next() == 39) {
              return new FunctionToken2(str2);
            } else if (whitespace(next()) && (next(2) == 34 || next(2) == 39)) {
              return new FunctionToken2(str2);
            } else {
              return consumeAURLToken();
            }
          } else if (next() == 40) {
            consume();
            return new FunctionToken2(str2);
          } else {
            return new IdentToken2(str2);
          }
        };
        var consumeAStringToken = function(endingCodePoint) {
          if (endingCodePoint === void 0)
            endingCodePoint = code;
          var string = "";
          while (consume()) {
            if (code == endingCodePoint || eof()) {
              return new StringToken2(string);
            } else if (newline(code)) {
              parseerror();
              reconsume();
              return new BadStringToken2();
            } else if (code == 92) {
              if (eof(next())) {
                donothing();
              } else if (newline(next())) {
                consume();
              } else {
                string += stringFromCode(consumeEscape());
              }
            } else {
              string += stringFromCode(code);
            }
          }
        };
        var consumeAURLToken = function() {
          var token = new URLToken2("");
          while (whitespace(next()))
            consume();
          if (eof(next()))
            return token;
          while (consume()) {
            if (code == 41 || eof()) {
              return token;
            } else if (whitespace(code)) {
              while (whitespace(next()))
                consume();
              if (next() == 41 || eof(next())) {
                consume();
                return token;
              } else {
                consumeTheRemnantsOfABadURL();
                return new BadURLToken2();
              }
            } else if (code == 34 || code == 39 || code == 40 || nonprintable(code)) {
              parseerror();
              consumeTheRemnantsOfABadURL();
              return new BadURLToken2();
            } else if (code == 92) {
              if (startsWithAValidEscape()) {
                token.value += stringFromCode(consumeEscape());
              } else {
                parseerror();
                consumeTheRemnantsOfABadURL();
                return new BadURLToken2();
              }
            } else {
              token.value += stringFromCode(code);
            }
          }
        };
        var consumeEscape = function() {
          consume();
          if (hexdigit(code)) {
            var digits = [code];
            for (var total = 0; total < 5; total++) {
              if (hexdigit(next())) {
                consume();
                digits.push(code);
              } else {
                break;
              }
            }
            if (whitespace(next()))
              consume();
            var value = parseInt(digits.map(function(x) {
              return String.fromCharCode(x);
            }).join(""), 16);
            if (value > maximumallowedcodepoint)
              value = 65533;
            return value;
          } else if (eof()) {
            return 65533;
          } else {
            return code;
          }
        };
        var areAValidEscape = function(c1, c2) {
          if (c1 != 92)
            return false;
          if (newline(c2))
            return false;
          return true;
        };
        var startsWithAValidEscape = function() {
          return areAValidEscape(code, next());
        };
        var wouldStartAnIdentifier = function(c1, c2, c3) {
          if (c1 == 45) {
            return namestartchar(c2) || c2 == 45 || areAValidEscape(c2, c3);
          } else if (namestartchar(c1)) {
            return true;
          } else if (c1 == 92) {
            return areAValidEscape(c1, c2);
          } else {
            return false;
          }
        };
        var startsWithAnIdentifier = function() {
          return wouldStartAnIdentifier(code, next(1), next(2));
        };
        var wouldStartANumber = function(c1, c2, c3) {
          if (c1 == 43 || c1 == 45) {
            if (digit(c2))
              return true;
            if (c2 == 46 && digit(c3))
              return true;
            return false;
          } else if (c1 == 46) {
            if (digit(c2))
              return true;
            return false;
          } else if (digit(c1)) {
            return true;
          } else {
            return false;
          }
        };
        var startsWithANumber = function() {
          return wouldStartANumber(code, next(1), next(2));
        };
        var consumeAName = function() {
          var result = "";
          while (consume()) {
            if (namechar(code)) {
              result += stringFromCode(code);
            } else if (startsWithAValidEscape()) {
              result += stringFromCode(consumeEscape());
            } else {
              reconsume();
              return result;
            }
          }
        };
        var consumeANumber = function() {
          var repr = [];
          var type = "integer";
          if (next() == 43 || next() == 45) {
            consume();
            repr += stringFromCode(code);
          }
          while (digit(next())) {
            consume();
            repr += stringFromCode(code);
          }
          if (next(1) == 46 && digit(next(2))) {
            consume();
            repr += stringFromCode(code);
            consume();
            repr += stringFromCode(code);
            type = "number";
            while (digit(next())) {
              consume();
              repr += stringFromCode(code);
            }
          }
          var c1 = next(1), c2 = next(2), c3 = next(3);
          if ((c1 == 69 || c1 == 101) && digit(c2)) {
            consume();
            repr += stringFromCode(code);
            consume();
            repr += stringFromCode(code);
            type = "number";
            while (digit(next())) {
              consume();
              repr += stringFromCode(code);
            }
          } else if ((c1 == 69 || c1 == 101) && (c2 == 43 || c2 == 45) && digit(c3)) {
            consume();
            repr += stringFromCode(code);
            consume();
            repr += stringFromCode(code);
            consume();
            repr += stringFromCode(code);
            type = "number";
            while (digit(next())) {
              consume();
              repr += stringFromCode(code);
            }
          }
          var value = convertAStringToANumber(repr);
          return { type, value, repr };
        };
        var convertAStringToANumber = function(string) {
          return +string;
        };
        var consumeTheRemnantsOfABadURL = function() {
          while (consume()) {
            if (code == 41 || eof()) {
              return;
            } else if (startsWithAValidEscape()) {
              consumeEscape();
              donothing();
            } else {
              donothing();
            }
          }
        };
        var iterationCount = 0;
        while (!eof(next())) {
          tokens.push(consumeAToken());
          iterationCount++;
          if (iterationCount > str.length * 2)
            return "I'm infinite-looping!";
        }
        return tokens;
      }
      function CSSParserToken() {
        throw "Abstract Base Class";
      }
      CSSParserToken.prototype.toJSON = function() {
        return { token: this.tokenType };
      };
      CSSParserToken.prototype.toString = function() {
        return this.tokenType;
      };
      CSSParserToken.prototype.toSource = function() {
        return "" + this;
      };
      function BadStringToken2() {
        return this;
      }
      BadStringToken2.prototype = Object.create(CSSParserToken.prototype);
      BadStringToken2.prototype.tokenType = "BADSTRING";
      function BadURLToken2() {
        return this;
      }
      BadURLToken2.prototype = Object.create(CSSParserToken.prototype);
      BadURLToken2.prototype.tokenType = "BADURL";
      function WhitespaceToken2() {
        return this;
      }
      WhitespaceToken2.prototype = Object.create(CSSParserToken.prototype);
      WhitespaceToken2.prototype.tokenType = "WHITESPACE";
      WhitespaceToken2.prototype.toString = function() {
        return "WS";
      };
      WhitespaceToken2.prototype.toSource = function() {
        return " ";
      };
      function CDOToken2() {
        return this;
      }
      CDOToken2.prototype = Object.create(CSSParserToken.prototype);
      CDOToken2.prototype.tokenType = "CDO";
      CDOToken2.prototype.toSource = function() {
        return "<!--";
      };
      function CDCToken2() {
        return this;
      }
      CDCToken2.prototype = Object.create(CSSParserToken.prototype);
      CDCToken2.prototype.tokenType = "CDC";
      CDCToken2.prototype.toSource = function() {
        return "-->";
      };
      function ColonToken2() {
        return this;
      }
      ColonToken2.prototype = Object.create(CSSParserToken.prototype);
      ColonToken2.prototype.tokenType = ":";
      function SemicolonToken2() {
        return this;
      }
      SemicolonToken2.prototype = Object.create(CSSParserToken.prototype);
      SemicolonToken2.prototype.tokenType = ";";
      function CommaToken2() {
        return this;
      }
      CommaToken2.prototype = Object.create(CSSParserToken.prototype);
      CommaToken2.prototype.tokenType = ",";
      function GroupingToken() {
        throw "Abstract Base Class";
      }
      GroupingToken.prototype = Object.create(CSSParserToken.prototype);
      function OpenCurlyToken2() {
        this.value = "{";
        this.mirror = "}";
        return this;
      }
      OpenCurlyToken2.prototype = Object.create(GroupingToken.prototype);
      OpenCurlyToken2.prototype.tokenType = "{";
      function CloseCurlyToken2() {
        this.value = "}";
        this.mirror = "{";
        return this;
      }
      CloseCurlyToken2.prototype = Object.create(GroupingToken.prototype);
      CloseCurlyToken2.prototype.tokenType = "}";
      function OpenSquareToken2() {
        this.value = "[";
        this.mirror = "]";
        return this;
      }
      OpenSquareToken2.prototype = Object.create(GroupingToken.prototype);
      OpenSquareToken2.prototype.tokenType = "[";
      function CloseSquareToken2() {
        this.value = "]";
        this.mirror = "[";
        return this;
      }
      CloseSquareToken2.prototype = Object.create(GroupingToken.prototype);
      CloseSquareToken2.prototype.tokenType = "]";
      function OpenParenToken() {
        this.value = "(";
        this.mirror = ")";
        return this;
      }
      OpenParenToken.prototype = Object.create(GroupingToken.prototype);
      OpenParenToken.prototype.tokenType = "(";
      function CloseParenToken2() {
        this.value = ")";
        this.mirror = "(";
        return this;
      }
      CloseParenToken2.prototype = Object.create(GroupingToken.prototype);
      CloseParenToken2.prototype.tokenType = ")";
      function IncludeMatchToken() {
        return this;
      }
      IncludeMatchToken.prototype = Object.create(CSSParserToken.prototype);
      IncludeMatchToken.prototype.tokenType = "~=";
      function DashMatchToken() {
        return this;
      }
      DashMatchToken.prototype = Object.create(CSSParserToken.prototype);
      DashMatchToken.prototype.tokenType = "|=";
      function PrefixMatchToken() {
        return this;
      }
      PrefixMatchToken.prototype = Object.create(CSSParserToken.prototype);
      PrefixMatchToken.prototype.tokenType = "^=";
      function SuffixMatchToken() {
        return this;
      }
      SuffixMatchToken.prototype = Object.create(CSSParserToken.prototype);
      SuffixMatchToken.prototype.tokenType = "$=";
      function SubstringMatchToken() {
        return this;
      }
      SubstringMatchToken.prototype = Object.create(CSSParserToken.prototype);
      SubstringMatchToken.prototype.tokenType = "*=";
      function ColumnToken2() {
        return this;
      }
      ColumnToken2.prototype = Object.create(CSSParserToken.prototype);
      ColumnToken2.prototype.tokenType = "||";
      function EOFToken2() {
        return this;
      }
      EOFToken2.prototype = Object.create(CSSParserToken.prototype);
      EOFToken2.prototype.tokenType = "EOF";
      EOFToken2.prototype.toSource = function() {
        return "";
      };
      function DelimToken2(code) {
        this.value = stringFromCode(code);
        return this;
      }
      DelimToken2.prototype = Object.create(CSSParserToken.prototype);
      DelimToken2.prototype.tokenType = "DELIM";
      DelimToken2.prototype.toString = function() {
        return "DELIM(" + this.value + ")";
      };
      DelimToken2.prototype.toJSON = function() {
        var json = this.constructor.prototype.constructor.prototype.toJSON.call(this);
        json.value = this.value;
        return json;
      };
      DelimToken2.prototype.toSource = function() {
        if (this.value == "\\")
          return "\\\n";
        else
          return this.value;
      };
      function StringValuedToken() {
        throw "Abstract Base Class";
      }
      StringValuedToken.prototype = Object.create(CSSParserToken.prototype);
      StringValuedToken.prototype.ASCIIMatch = function(str) {
        return this.value.toLowerCase() == str.toLowerCase();
      };
      StringValuedToken.prototype.toJSON = function() {
        var json = this.constructor.prototype.constructor.prototype.toJSON.call(this);
        json.value = this.value;
        return json;
      };
      function IdentToken2(val) {
        this.value = val;
      }
      IdentToken2.prototype = Object.create(StringValuedToken.prototype);
      IdentToken2.prototype.tokenType = "IDENT";
      IdentToken2.prototype.toString = function() {
        return "IDENT(" + this.value + ")";
      };
      IdentToken2.prototype.toSource = function() {
        return escapeIdent(this.value);
      };
      function FunctionToken2(val) {
        this.value = val;
        this.mirror = ")";
      }
      FunctionToken2.prototype = Object.create(StringValuedToken.prototype);
      FunctionToken2.prototype.tokenType = "FUNCTION";
      FunctionToken2.prototype.toString = function() {
        return "FUNCTION(" + this.value + ")";
      };
      FunctionToken2.prototype.toSource = function() {
        return escapeIdent(this.value) + "(";
      };
      function AtKeywordToken2(val) {
        this.value = val;
      }
      AtKeywordToken2.prototype = Object.create(StringValuedToken.prototype);
      AtKeywordToken2.prototype.tokenType = "AT-KEYWORD";
      AtKeywordToken2.prototype.toString = function() {
        return "AT(" + this.value + ")";
      };
      AtKeywordToken2.prototype.toSource = function() {
        return "@" + escapeIdent(this.value);
      };
      function HashToken2(val) {
        this.value = val;
        this.type = "unrestricted";
      }
      HashToken2.prototype = Object.create(StringValuedToken.prototype);
      HashToken2.prototype.tokenType = "HASH";
      HashToken2.prototype.toString = function() {
        return "HASH(" + this.value + ")";
      };
      HashToken2.prototype.toJSON = function() {
        var json = this.constructor.prototype.constructor.prototype.toJSON.call(this);
        json.value = this.value;
        json.type = this.type;
        return json;
      };
      HashToken2.prototype.toSource = function() {
        if (this.type == "id") {
          return "#" + escapeIdent(this.value);
        } else {
          return "#" + escapeHash(this.value);
        }
      };
      function StringToken2(val) {
        this.value = val;
      }
      StringToken2.prototype = Object.create(StringValuedToken.prototype);
      StringToken2.prototype.tokenType = "STRING";
      StringToken2.prototype.toString = function() {
        return '"' + escapeString(this.value) + '"';
      };
      function URLToken2(val) {
        this.value = val;
      }
      URLToken2.prototype = Object.create(StringValuedToken.prototype);
      URLToken2.prototype.tokenType = "URL";
      URLToken2.prototype.toString = function() {
        return "URL(" + this.value + ")";
      };
      URLToken2.prototype.toSource = function() {
        return 'url("' + escapeString(this.value) + '")';
      };
      function NumberToken2() {
        this.value = null;
        this.type = "integer";
        this.repr = "";
      }
      NumberToken2.prototype = Object.create(CSSParserToken.prototype);
      NumberToken2.prototype.tokenType = "NUMBER";
      NumberToken2.prototype.toString = function() {
        if (this.type == "integer")
          return "INT(" + this.value + ")";
        return "NUMBER(" + this.value + ")";
      };
      NumberToken2.prototype.toJSON = function() {
        var json = this.constructor.prototype.constructor.prototype.toJSON.call(this);
        json.value = this.value;
        json.type = this.type;
        json.repr = this.repr;
        return json;
      };
      NumberToken2.prototype.toSource = function() {
        return this.repr;
      };
      function PercentageToken2() {
        this.value = null;
        this.repr = "";
      }
      PercentageToken2.prototype = Object.create(CSSParserToken.prototype);
      PercentageToken2.prototype.tokenType = "PERCENTAGE";
      PercentageToken2.prototype.toString = function() {
        return "PERCENTAGE(" + this.value + ")";
      };
      PercentageToken2.prototype.toJSON = function() {
        var json = this.constructor.prototype.constructor.prototype.toJSON.call(this);
        json.value = this.value;
        json.repr = this.repr;
        return json;
      };
      PercentageToken2.prototype.toSource = function() {
        return this.repr + "%";
      };
      function DimensionToken() {
        this.value = null;
        this.type = "integer";
        this.repr = "";
        this.unit = "";
      }
      DimensionToken.prototype = Object.create(CSSParserToken.prototype);
      DimensionToken.prototype.tokenType = "DIMENSION";
      DimensionToken.prototype.toString = function() {
        return "DIM(" + this.value + "," + this.unit + ")";
      };
      DimensionToken.prototype.toJSON = function() {
        var json = this.constructor.prototype.constructor.prototype.toJSON.call(this);
        json.value = this.value;
        json.type = this.type;
        json.repr = this.repr;
        json.unit = this.unit;
        return json;
      };
      DimensionToken.prototype.toSource = function() {
        var source = this.repr;
        var unit = escapeIdent(this.unit);
        if (unit[0].toLowerCase() == "e" && (unit[1] == "-" || between(unit.charCodeAt(1), 48, 57))) {
          unit = "\\65 " + unit.slice(1, unit.length);
        }
        return source + unit;
      };
      function escapeIdent(string) {
        string = "" + string;
        var result = "";
        var firstcode = string.charCodeAt(0);
        for (var i = 0; i < string.length; i++) {
          var code = string.charCodeAt(i);
          if (code == 0) {
            throw new InvalidCharacterError("Invalid character: the input contains U+0000.");
          }
          if (between(code, 1, 31) || code == 127 || i == 0 && between(code, 48, 57) || i == 1 && between(code, 48, 57) && firstcode == 45) {
            result += "\\" + code.toString(16) + " ";
          } else if (code >= 128 || code == 45 || code == 95 || between(code, 48, 57) || between(code, 65, 90) || between(code, 97, 122)) {
            result += string[i];
          } else {
            result += "\\" + string[i];
          }
        }
        return result;
      }
      function escapeHash(string) {
        string = "" + string;
        var result = "";
        var firstcode = string.charCodeAt(0);
        for (var i = 0; i < string.length; i++) {
          var code = string.charCodeAt(i);
          if (code == 0) {
            throw new InvalidCharacterError("Invalid character: the input contains U+0000.");
          }
          if (code >= 128 || code == 45 || code == 95 || between(code, 48, 57) || between(code, 65, 90) || between(code, 97, 122)) {
            result += string[i];
          } else {
            result += "\\" + code.toString(16) + " ";
          }
        }
        return result;
      }
      function escapeString(string) {
        string = "" + string;
        var result = "";
        for (var i = 0; i < string.length; i++) {
          var code = string.charCodeAt(i);
          if (code == 0) {
            throw new InvalidCharacterError("Invalid character: the input contains U+0000.");
          }
          if (between(code, 1, 31) || code == 127) {
            result += "\\" + code.toString(16) + " ";
          } else if (code == 34 || code == 92) {
            result += "\\" + string[i];
          } else {
            result += string[i];
          }
        }
        return result;
      }
      exports3.tokenize = tokenize2;
      exports3.IdentToken = IdentToken2;
      exports3.FunctionToken = FunctionToken2;
      exports3.AtKeywordToken = AtKeywordToken2;
      exports3.HashToken = HashToken2;
      exports3.StringToken = StringToken2;
      exports3.BadStringToken = BadStringToken2;
      exports3.URLToken = URLToken2;
      exports3.BadURLToken = BadURLToken2;
      exports3.DelimToken = DelimToken2;
      exports3.NumberToken = NumberToken2;
      exports3.PercentageToken = PercentageToken2;
      exports3.DimensionToken = DimensionToken;
      exports3.IncludeMatchToken = IncludeMatchToken;
      exports3.DashMatchToken = DashMatchToken;
      exports3.PrefixMatchToken = PrefixMatchToken;
      exports3.SuffixMatchToken = SuffixMatchToken;
      exports3.SubstringMatchToken = SubstringMatchToken;
      exports3.ColumnToken = ColumnToken2;
      exports3.WhitespaceToken = WhitespaceToken2;
      exports3.CDOToken = CDOToken2;
      exports3.CDCToken = CDCToken2;
      exports3.ColonToken = ColonToken2;
      exports3.SemicolonToken = SemicolonToken2;
      exports3.CommaToken = CommaToken2;
      exports3.OpenParenToken = OpenParenToken;
      exports3.CloseParenToken = CloseParenToken2;
      exports3.OpenSquareToken = OpenSquareToken2;
      exports3.CloseSquareToken = CloseSquareToken2;
      exports3.OpenCurlyToken = OpenCurlyToken2;
      exports3.CloseCurlyToken = CloseCurlyToken2;
      exports3.EOFToken = EOFToken2;
      exports3.CSSParserToken = CSSParserToken;
      exports3.GroupingToken = GroupingToken;
    });
  }
});

// ../packages/playwright-core/src/utils/isomorphic/stringUtils.ts
function escapeWithQuotes(text, char = "'") {
  const stringified = JSON.stringify(text);
  const escapedText = stringified.substring(1, stringified.length - 1).replace(/\\"/g, '"');
  if (char === "'")
    return char + escapedText.replace(/[']/g, "\\'") + char;
  if (char === '"')
    return char + escapedText.replace(/["]/g, '\\"') + char;
  if (char === "`")
    return char + escapedText.replace(/[`]/g, "`") + char;
  throw new Error("Invalid escape char");
}

// ../packages/playwright-core/src/server/isomorphic/cssParser.ts
var css = __toESM(require_cssTokenizer());

// ../packages/playwright-core/src/server/injected/selectorEvaluator.ts
function shouldSkipForTextMatching(element) {
  return element.nodeName === "SCRIPT" || element.nodeName === "STYLE" || document.head && document.head.contains(element);
}
function elementText(evaluator, root) {
  let value = evaluator._cacheText.get(root);
  if (value === void 0) {
    value = { full: "", immediate: [] };
    if (!shouldSkipForTextMatching(root)) {
      let currentImmediate = "";
      if (root instanceof HTMLInputElement && (root.type === "submit" || root.type === "button")) {
        value = { full: root.value, immediate: [root.value] };
      } else {
        for (let child = root.firstChild; child; child = child.nextSibling) {
          if (child.nodeType === Node.TEXT_NODE) {
            value.full += child.nodeValue || "";
            currentImmediate += child.nodeValue || "";
          } else {
            if (currentImmediate)
              value.immediate.push(currentImmediate);
            currentImmediate = "";
            if (child.nodeType === Node.ELEMENT_NODE)
              value.full += elementText(evaluator, child).full;
          }
        }
        if (currentImmediate)
          value.immediate.push(currentImmediate);
        if (root.shadowRoot)
          value.full += elementText(evaluator, root.shadowRoot).full;
      }
    }
    evaluator._cacheText.set(root, value);
  }
  return value;
}

// ../packages/playwright-core/src/server/injected/selectorGenerator.ts
var cacheAllowText = /* @__PURE__ */ new Map();
var cacheDisallowText = /* @__PURE__ */ new Map();
var kNthScore = 1e3;
function generateSelector(injectedScript, targetElement, strict) {
  injectedScript._evaluator.begin();
  try {
    targetElement = targetElement.closest("button,select,input,[role=button],[role=checkbox],[role=radio]") || targetElement;
    const targetTokens = generateSelectorFor(injectedScript, targetElement, strict);
    const bestTokens = targetTokens || cssFallback(injectedScript, targetElement, strict);
    const selector = joinTokens(bestTokens);
    const parsedSelector = injectedScript.parseSelector(selector);
    return {
      selector,
      elements: injectedScript.querySelectorAll(parsedSelector, targetElement.ownerDocument)
    };
  } finally {
    cacheAllowText.clear();
    cacheDisallowText.clear();
    injectedScript._evaluator.end();
  }
}
function filterRegexTokens(textCandidates) {
  return textCandidates.filter((c) => c[0].selector[0] !== "/");
}
function generateSelectorFor(injectedScript, targetElement, strict) {
  if (targetElement.ownerDocument.documentElement === targetElement)
    return [{ engine: "css", selector: "html", score: 1 }];
  const calculate = (element, allowText) => {
    const allowNthMatch = element === targetElement;
    let textCandidates = allowText ? buildTextCandidates(injectedScript, element, element === targetElement).map((token) => [token]) : [];
    if (element !== targetElement) {
      textCandidates = filterRegexTokens(textCandidates);
    }
    const noTextCandidates = buildCandidates(injectedScript, element).map((token) => [token]);
    let result = chooseFirstSelector(injectedScript, targetElement.ownerDocument, element, [...textCandidates, ...noTextCandidates], allowNthMatch, strict);
    textCandidates = filterRegexTokens(textCandidates);
    const checkWithText = (textCandidatesToUse) => {
      const allowParentText = allowText && !textCandidatesToUse.length;
      const candidates = [...textCandidatesToUse, ...noTextCandidates].filter((c) => {
        if (!result)
          return true;
        return combineScores(c) < combineScores(result);
      });
      let bestPossibleInParent = candidates[0];
      if (!bestPossibleInParent)
        return;
      for (let parent = parentElementOrShadowHost(element); parent; parent = parentElementOrShadowHost(parent)) {
        const parentTokens = calculateCached(parent, allowParentText);
        if (!parentTokens)
          continue;
        if (result && combineScores([...parentTokens, ...bestPossibleInParent]) >= combineScores(result))
          continue;
        bestPossibleInParent = chooseFirstSelector(injectedScript, parent, element, candidates, allowNthMatch, strict);
        if (!bestPossibleInParent)
          return;
        const combined = [...parentTokens, ...bestPossibleInParent];
        if (!result || combineScores(combined) < combineScores(result))
          result = combined;
      }
    };
    checkWithText(textCandidates);
    if (element === targetElement && textCandidates.length)
      checkWithText([]);
    return result;
  };
  const calculateCached = (element, allowText) => {
    const cache = allowText ? cacheAllowText : cacheDisallowText;
    let value = cache.get(element);
    if (value === void 0) {
      value = calculate(element, allowText);
      cache.set(element, value);
    }
    return value;
  };
  return calculateCached(targetElement, true);
}
function buildCandidates(injectedScript, element) {
  const candidates = [];
  for (const attribute of ["data-testid", "data-test-id", "data-test"]) {
    if (element.getAttribute(attribute))
      candidates.push({ engine: "css", selector: `[${attribute}=${quoteAttributeValue(element.getAttribute(attribute))}]`, score: 1 });
  }
  if (element.nodeName === "INPUT") {
    const input = element;
    if (input.placeholder)
      candidates.push({ engine: "css", selector: `[placeholder=${quoteAttributeValue(input.placeholder)}]`, score: 10 });
  }
  if (element.getAttribute("aria-label"))
    candidates.push({ engine: "css", selector: `[aria-label=${quoteAttributeValue(element.getAttribute("aria-label"))}]`, score: 10 });
  if (element.getAttribute("alt") && ["APPLET", "AREA", "IMG", "INPUT"].includes(element.nodeName))
    candidates.push({ engine: "css", selector: `${cssEscape(element.nodeName.toLowerCase())}[alt=${quoteAttributeValue(element.getAttribute("alt"))}]`, score: 10 });
  if (element.getAttribute("role"))
    candidates.push({ engine: "css", selector: `${cssEscape(element.nodeName.toLowerCase())}[role=${quoteAttributeValue(element.getAttribute("role"))}]`, score: 50 });
  if (element.getAttribute("name") && ["BUTTON", "FORM", "FIELDSET", "IFRAME", "INPUT", "KEYGEN", "OBJECT", "OUTPUT", "SELECT", "TEXTAREA", "MAP", "META", "PARAM"].includes(element.nodeName))
    candidates.push({ engine: "css", selector: `${cssEscape(element.nodeName.toLowerCase())}[name=${quoteAttributeValue(element.getAttribute("name"))}]`, score: 50 });
  if (["INPUT", "TEXTAREA"].includes(element.nodeName) && element.getAttribute("type") !== "hidden") {
    if (element.getAttribute("type"))
      candidates.push({ engine: "css", selector: `${cssEscape(element.nodeName.toLowerCase())}[type=${quoteAttributeValue(element.getAttribute("type"))}]`, score: 50 });
  }
  if (["INPUT", "TEXTAREA", "SELECT"].includes(element.nodeName))
    candidates.push({ engine: "css", selector: cssEscape(element.nodeName.toLowerCase()), score: 50 });
  const idAttr = element.getAttribute("id");
  if (idAttr && !isGuidLike(idAttr))
    candidates.push({ engine: "css", selector: makeSelectorForId(idAttr), score: 100 });
  candidates.push({ engine: "css", selector: cssEscape(element.nodeName.toLowerCase()), score: 200 });
  return candidates;
}
function buildTextCandidates(injectedScript, element, allowHasText) {
  if (element.nodeName === "SELECT")
    return [];
  const text = elementText(injectedScript._evaluator, element).full.trim().replace(/\s+/g, " ").substring(0, 80);
  if (!text)
    return [];
  const candidates = [];
  let escaped = text;
  if (text.includes('"') || text.includes(">>") || text[0] === "/")
    escaped = `/.*${escapeForRegex(text)}.*/`;
  candidates.push({ engine: "text", selector: escaped, score: 10 });
  if (allowHasText && escaped === text) {
    let prefix = element.nodeName.toLowerCase();
    if (element.hasAttribute("role"))
      prefix += `[role=${quoteAttributeValue(element.getAttribute("role"))}]`;
    candidates.push({ engine: "css", selector: `${prefix}:has-text("${text}")`, score: 30 });
  }
  return candidates;
}
function parentElementOrShadowHost(element) {
  if (element.parentElement)
    return element.parentElement;
  if (!element.parentNode)
    return null;
  if (element.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE && element.parentNode.host)
    return element.parentNode.host;
  return null;
}
function makeSelectorForId(id) {
  return /^[a-zA-Z][a-zA-Z0-9\-\_]+$/.test(id) ? "#" + id : `[id="${cssEscape(id)}"]`;
}
function cssFallback(injectedScript, targetElement, strict) {
  const kFallbackScore = 1e7;
  const root = targetElement.ownerDocument;
  const tokens = [];
  function uniqueCSSSelector(prefix) {
    const path = tokens.slice();
    if (prefix)
      path.unshift(prefix);
    const selector = path.join(" ");
    const parsedSelector = injectedScript.parseSelector(selector);
    const node = injectedScript.querySelector(parsedSelector, targetElement.ownerDocument, false);
    return node === targetElement ? selector : void 0;
  }
  function makeStrict(selector) {
    const token = { engine: "css", selector, score: kFallbackScore };
    if (!strict)
      return [token];
    const parsedSelector = injectedScript.parseSelector(selector);
    const elements = injectedScript.querySelectorAll(parsedSelector, targetElement.ownerDocument);
    if (elements.length === 1)
      return [token];
    const nth = { engine: "nth", selector: String(elements.indexOf(targetElement)), score: kNthScore };
    return [token, nth];
  }
  for (let element = targetElement; element && element !== root; element = parentElementOrShadowHost(element)) {
    const nodeName = element.nodeName.toLowerCase();
    let bestTokenForLevel = "";
    if (element.id) {
      const token = makeSelectorForId(element.id);
      const selector = uniqueCSSSelector(token);
      if (selector)
        return makeStrict(selector);
      bestTokenForLevel = token;
    }
    const parent = element.parentNode;
    const classes = [...element.classList];
    for (let i = 0; i < classes.length; ++i) {
      const token = "." + classes.slice(0, i + 1).join(".");
      const selector = uniqueCSSSelector(token);
      if (selector)
        return makeStrict(selector);
      if (!bestTokenForLevel && parent) {
        const sameClassSiblings = parent.querySelectorAll(token);
        if (sameClassSiblings.length === 1)
          bestTokenForLevel = token;
      }
    }
    if (parent) {
      const siblings = [...parent.children];
      const sameTagSiblings = siblings.filter((sibling) => sibling.nodeName.toLowerCase() === nodeName);
      const token = sameTagSiblings.indexOf(element) === 0 ? cssEscape(nodeName) : `${cssEscape(nodeName)}:nth-child(${1 + siblings.indexOf(element)})`;
      const selector = uniqueCSSSelector(token);
      if (selector)
        return makeStrict(selector);
      if (!bestTokenForLevel)
        bestTokenForLevel = token;
    } else if (!bestTokenForLevel) {
      bestTokenForLevel = nodeName;
    }
    tokens.unshift(bestTokenForLevel);
  }
  return makeStrict(uniqueCSSSelector());
}
function escapeForRegex(text) {
  return text.replace(/[.*+?^>${}()|[\]\\]/g, "\\$&");
}
function quoteAttributeValue(text) {
  return `"${cssEscape(text).replace(/\\ /g, " ")}"`;
}
function joinTokens(tokens) {
  const parts = [];
  let lastEngine = "";
  for (const { engine, selector } of tokens) {
    if (parts.length && (lastEngine !== "css" || engine !== "css" || selector.startsWith(":nth-match(")))
      parts.push(">>");
    lastEngine = engine;
    if (engine === "css")
      parts.push(selector);
    else
      parts.push(`${engine}=${selector}`);
  }
  return parts.join(" ");
}
function combineScores(tokens) {
  let score = 0;
  for (let i = 0; i < tokens.length; i++)
    score += tokens[i].score * (tokens.length - i);
  return score;
}
function chooseFirstSelector(injectedScript, scope, targetElement, selectors, allowNthMatch, strict) {
  const joined = selectors.map((tokens) => ({ tokens, score: combineScores(tokens) }));
  joined.sort((a, b) => a.score - b.score);
  let bestWithIndex = null;
  for (const { tokens } of joined) {
    const parsedSelector = injectedScript.parseSelector(joinTokens(tokens));
    const result = injectedScript.querySelectorAll(parsedSelector, scope);
    const isStrictEnough = !strict || result.length === 1;
    const index = result.indexOf(targetElement);
    if (index === 0 && isStrictEnough) {
      return tokens;
    }
    if (!allowNthMatch || bestWithIndex || index === -1 || result.length > 5)
      continue;
    const nth = { engine: "nth", selector: String(index), score: kNthScore };
    bestWithIndex = [...tokens, nth];
  }
  return bestWithIndex;
}
function isGuidLike(id) {
  let lastCharacterType;
  let transitionCount = 0;
  for (let i = 0; i < id.length; ++i) {
    const c = id[i];
    let characterType;
    if (c === "-" || c === "_")
      continue;
    if (c >= "a" && c <= "z")
      characterType = "lower";
    else if (c >= "A" && c <= "Z")
      characterType = "upper";
    else if (c >= "0" && c <= "9")
      characterType = "digit";
    else
      characterType = "other";
    if (characterType === "lower" && lastCharacterType === "upper") {
      lastCharacterType = characterType;
      continue;
    }
    if (lastCharacterType && lastCharacterType !== characterType)
      ++transitionCount;
    lastCharacterType = characterType;
  }
  return transitionCount >= id.length / 4;
}
function cssEscape(s) {
  let result = "";
  for (let i = 0; i < s.length; i++)
    result += cssEscapeOne(s, i);
  return result;
}
function cssEscapeOne(s, i) {
  const c = s.charCodeAt(i);
  if (c === 0)
    return "\uFFFD";
  if (c >= 1 && c <= 31 || c >= 48 && c <= 57 && (i === 0 || i === 1 && s.charCodeAt(0) === 45))
    return "\\" + c.toString(16) + " ";
  if (i === 0 && c === 45 && s.length === 1)
    return "\\" + s.charAt(i);
  if (c >= 128 || c === 45 || c === 95 || c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122)
    return s.charAt(i);
  return "\\" + s.charAt(i);
}

// ../packages/playwright-core/src/server/injected/consoleApi.ts
function createLocator(injectedScript, initial, options) {
  class Locator {
    constructor(selector, options2) {
      this.selector = selector;
      if (options2 == null ? void 0 : options2.hasText) {
        const text = options2.hasText;
        if (text instanceof RegExp)
          this.selector += ` >> :scope:text-matches(${escapeWithQuotes(text.source, '"')}, "${text.flags}")`;
        else
          this.selector += ` >> :scope:has-text(${escapeWithQuotes(text)})`;
      }
      if (options2 == null ? void 0 : options2.has)
        this.selector += ` >> has=` + JSON.stringify(options2.has.selector);
      const parsed = injectedScript.parseSelector(this.selector);
      this.element = injectedScript.querySelector(parsed, document, false);
      this.elements = injectedScript.querySelectorAll(parsed, document);
    }
    locator(selector, options2) {
      return new Locator(this.selector ? this.selector + " >> " + selector : selector, options2);
    }
  }
  return new Locator(initial, options);
}
var ConsoleAPI = class {
  constructor(injectedScript) {
    this._injectedScript = injectedScript;
    if (window.playwright)
      return;
    window.playwright = {
      $: (selector, strict) => this._querySelector(selector, !!strict),
      $$: (selector) => this._querySelectorAll(selector),
      locator: (selector, options) => createLocator(this._injectedScript, selector, options),
      inspect: (selector) => this._inspect(selector),
      selector: (element) => this._selector(element),
      resume: () => this._resume()
    };
  }
  _querySelector(selector, strict) {
    if (typeof selector !== "string")
      throw new Error(`Usage: playwright.query('Playwright >> selector').`);
    const parsed = this._injectedScript.parseSelector(selector);
    return this._injectedScript.querySelector(parsed, document, strict);
  }
  _querySelectorAll(selector) {
    if (typeof selector !== "string")
      throw new Error(`Usage: playwright.$$('Playwright >> selector').`);
    const parsed = this._injectedScript.parseSelector(selector);
    return this._injectedScript.querySelectorAll(parsed, document);
  }
  _inspect(selector) {
    if (typeof selector !== "string")
      throw new Error(`Usage: playwright.inspect('Playwright >> selector').`);
    window.inspect(this._querySelector(selector, false));
  }
  _selector(element) {
    if (!(element instanceof Element))
      throw new Error(`Usage: playwright.selector(element).`);
    return generateSelector(this._injectedScript, element, true).selector;
  }
  _resume() {
    window._playwrightResume().catch(() => {
    });
  }
};

// InjectScript Params
var isFirefox = typeof InstallTrigger !== 'undefined';

var isUnderTest = true;
var stableRafCount = 1;
var browserName = isFirefox ? "firefox" : "chrome";
var experimentalFeaturesEnabled = false;
var customEngines = [];


const ij = new InjectedScript(isUnderTest, stableRafCount, browserName, experimentalFeaturesEnabled, customEngines);

// add playwright to the window object
new ConsoleAPI(ij);
var { playwright } = window;