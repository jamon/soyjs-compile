start
  = ns:namespace wsnl? t:template* wsnl? {return {namespace: ns, templates: t};} 

namespace 
  = token_tag_start token_tag_namespace wsnl? v:var token_tag_end
  { return v }

// template  
template
  = doc:template_doc wsnl? def:template_definition
    {return {description: doc.description, vars: doc.vars, name: def.name, content: def.content}; }

// template documentation
template_doc = token_doc_start [\r\n]+ d:doc_description* v:doc_var* token_doc_end 
      { return {description: d.join("\n"), vars: v }; }
doc_description = token_doc_line_start desc:([^@][^\r\n]*) [\r\n]+ 
      { return desc[0] + desc[1].join(""); }
doc_var = token_doc_line_start token_doc_var v:var " " d:[^\r\n]* [\r\n]+ 
      { return {name: v, desc: d.join("")}; }

// template definition
template_definition = n:template_definition_begin wsnl c:content* wsnl? template_definition_end 
    { return {name: n, content: c}; }
template_definition_begin = token_tag_start token_tag_template ws "." v:var token_tag_end { return v; }
template_definition_end = token_tag_start token_tag_endtag token_tag_template token_tag_end wsnl? { return ""; }

// template content
content = c:(content_text / content_print / content_print_short / content_if) wsnl*  { return c; }
content_text = ct:content_text_+ { return {command: "print_text", content: ct.join("") }; }
content_text_ = !token_tag_start t:text { return t; }
text = t:. newlines:(ws* [\r\n]+)? { return t + (typeof newlines[1] !== "undefined" ? " " : ""); }

content_print = token_tag_start token_tag_print ws e:expression ws? token_tag_endtag token_tag_end
    { return {command: "print_expression", expression: e }; }
content_print_short = token_tag_start ws? e:expression ws? token_tag_end
    { return {command: "print_expression", expression: e }; }

content_if = cif:content_if_begin  celseif:content_elseif* celse:content_else? content_if_end 
    { return {command: "if", conditions: [cif].concat(celseif), else_content: celse}; }
content_if_begin = token_tag_start token_tag_if ws e:expression token_tag_end c:content+ 
    { return { expression: e, content: c}; }
content_if_end = token_tag_start token_tag_endtag token_tag_if token_tag_end
content_elseif = token_tag_start token_tag_elseif ws e:expression token_tag_end c:content 
    { return { expression: e, content: c}; }
content_else = token_tag_start token_tag_else token_tag_end c:content+
    { return c; }

// re-usable
var = v1:[a-zA-Z] v2:[a-zA-Z0-9]* { return v1 + v2.join(""); }
expression = t:token_var + v:var { return t + v; }
wsnl = [ \t\r\n]+ { return ""; }
ws = [ \t]+ { return ""; }

// tokens
token_doc_line_start = ws? "*" ws?
token_doc_var = "@"
token_doc_start = "/**"
token_doc_end = " */"
token_tag_start = "{"
token_tag_end = "}"
token_tag_endtag = "/"
token_var = "$"

// tag names
token_tag_namespace = "namespace"
token_tag_template = "template"
token_tag_print = "print"
token_tag_if = "if"
token_tag_else = "else"
token_tag_elseif = "elseif"
