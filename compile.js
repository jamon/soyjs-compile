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
    this
        ._("/**").nl()
        ._(" * Automatically generated from soy template").nl()
        ._(" */").nl()
        ._("var ", this.parsed.namespace, " = function() {").i()
            ._("// test").u()
        ._("}");
    return this._code.join("");
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
    return this.code(this.newline);
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
