/*
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/

 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations
 * under the License.
 * 
 * Contributor(s): 
 *   Jamon Terrell <jamon@sofea.net>
*/
var parser = require('./soyparser'), fs = require('fs'), util = require('util');

var SoyCompiler = function(soy) {
    this.soy = soy;
    this.parse();
    this._code = [];
};
SoyCompiler.prototype.indentString = "    ";
SoyCompiler.prototype.newline = "\n";
SoyCompiler.prototype._indentCount = 0;

SoyCompiler.prototype.parse = function() {
    this.parsed = parser.parse(this.soy);
};
SoyCompiler.prototype.compile = function() {
    // @TODO add namespace handlers (to allow for AMD/commonJS loader, goog.load, or namespaced globals, etc)
    var p = this.parsed;
    this
        ._("/**").nl()
        ._(" * Automatically generated from soy template").nl()
        ._(" *  -- ", p.namespace).nl()
        ._(" */").nl()
        ._("var template  = function() {};").nl()
        .compileTemplates(p);
    return this._code.join("");
};
SoyCompiler.prototype.compileTemplates = function(p) {
    for(var i = 0; i < p.templates.length; i++) {
        this.nl().compileTemplate(p.templates[i]);
    }
};
SoyCompiler.prototype.compileTemplate = function(t) {
    this
        ._("/**").nl()
        ._(" * ", t.description).nl()
        ._(" */").nl()
        ._("template.", t.name, " = function(o) {").i()
            ._("var output = [];").nl()
            .compileContent(t.content).u()
        ._("};");
    return this;
};
SoyCompiler.prototype.compileContent = function(c) {
    for(var i = 0; i < c.length; i++) {
        if(i > 0) this.nl();
        this.compileCommand(c[i]);
    };
    return this;
};
SoyCompiler.prototype.compileCommand = function(c) {
    switch(c.command) {
        case "print_text":
            // @todo add output buffering on print statements, to combine multiples
            this._('output.push("', c.content, '");');
            break;
        case "if":
            // @TODO add ternary when appropriate
            // if statement
            this._('if (').compileExpression(c.conditions[0].expression)._(') {').i()
                .compileContent(c.conditions[0].content).u();
            for(var i = 1; i < c.conditions.length; i++) {
                this._('} else if (').compileExpression(c.conditions[i].expression)._(') {').i()
                    .compileContent(c.conditions[i].content).u();
            }
            if(c.else_content !== "") {
                this._('} else {').i()
                    .compileContent(c.else_content).u();
            }
            this._('}');
            break;
        default:
            break;
    }
    return this;
};
SoyCompiler.prototype.compileExpression = function(e) {
    this.code(e);
    return this;
};
SoyCompiler.prototype.indent = function(omitNewline) {
    this._indentCount++;
    return this.code((omitNewline ? "" : this.newline) + this.calculateIndent());
};
SoyCompiler.prototype.i = SoyCompiler.prototype.indent; // alias

SoyCompiler.prototype.unindent = function(omitNewline) {
    this._indentCount--;
    return this.code((omitNewline ? "" : this.newline) + this.calculateIndent());
};
SoyCompiler.prototype.u = SoyCompiler.prototype.unindent; // alias
SoyCompiler.prototype.nl = function() {
    return this.code(this.newline, this._indent);
};
SoyCompiler.prototype.calculateIndent = function() {
    return this._indent = new Array(this._indentCount + 1).join(this.indentString);
};
SoyCompiler.prototype.code = function() {
    Array.prototype.push.apply(this._code, arguments);
    return this;
};
SoyCompiler.prototype._ = SoyCompiler.prototype.code; // alias

fs.readFile('./example.soy', 'utf8', function(err, data) {
    console.log(util.inspect(parser.parse(data), false, 100));
    console.log("-------------------------");
    var sc = new SoyCompiler(data);
    console.log(sc.compile());
});
