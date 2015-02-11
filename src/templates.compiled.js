var Handlebars = require("handlebars");  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['app-header'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"header\">\n	<span class=\"left\">\n		<img class=\"logo\" src=\"img/logo.png\" />\n		<img class=\"logo-text\" src=\"img/logo-text.png\" />\n	</span>\n	<span class=\"right\">\n		<img class=\"reconnect-button\" src=\"/img/reconnect-button.png\" />\n		<img class=\"menu-button\" src=\"img/settings-button.png\" />\n	</span>\n</div>\n";
},"useData":true});
templates['chat-buffer-line'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"line\">\n	<span class=\"timestamp\">"
    + this.escapeExpression(((helper = (helper = helpers.timestamp || (depth0 != null ? depth0.timestamp : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"timestamp","hash":{},"data":data}) : helper)))
    + "</span> <span class=\"body\"></span>\n</div>\n";
},"useData":true});
templates['chat-buffer'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"chat-buffer\">\n	<div class=\"buffer\" />\n	<div class=\"alert-area\">\n		<img class=\"new-line-alert\" src=\"img/new-line-alert.png\" />\n	</div>\n</div>\n";
},"useData":true});
templates['chat-input'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"chat-input\">\n	<img class=\"mode\" />\n	<span class=\"placeholder\">...</span>\n	<span class=\"text\" contentEditable=\"true\" tabIndex=\"0\"></span>\n	<span class=\"send\"></span>\n</div>\n";
},"useData":true});
templates['fancy-chat-buffer-block-emote-echo'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"fancy-block emote echo\">\n	<div class=\"content-container\">\n		<div class=\"content\"></div>\n		<div class=\"age\"></div>\n	</div>\n</div>\n";
},"useData":true});
templates['fancy-chat-buffer-block-emote'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"fancy-block emote\">\n	<div class=\"content-container\">\n		<div class=\"content\"></div>\n		<div class=\"age\"></div>\n	</div>\n</div>\n";
},"useData":true});
templates['fancy-chat-buffer-block-speech-echo'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"fancy-block speech echo\">\n	<div class=\"content-container\">\n		<div class=\"head\">\n			<span class=\"username\" data-username=\""
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">You</span> say,\n		</div>\n		<div class=\"content\"></div>\n		<div class=\"age\"></div>\n	</div>\n	<div class=\"arm\" />\n</div>\n";
},"useData":true});
templates['fancy-chat-buffer-block-speech'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"fancy-block speech\">\n	<div class=\"arm\" />\n	<div class=\"content-container\">\n		<div class=\"head\">\n			<span class=\"username\" data-username=\""
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span> says,\n		</div>\n		<div class=\"content\"></div>\n		<div class=\"age\"></div>\n	</div>\n</div>\n";
},"useData":true});
templates['fancy-chat-buffer-block-system'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"fancy-block system\">\n	<div class=\"content-container\">\n		<div class=\"content\"></div>\n		<div class=\"age\"></div>\n	</div>\n</div>\n";
},"useData":true});
templates['fancy-chat-buffer-block-whisper-echo'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"fancy-block whisper echo\">\n	<div class=\"content-container\">\n		<div class=\"head\">\n			You whisper to <span class=\"username\" data-username=\""
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span>,\n		</div>\n		<div class=\"content\"></div>\n		<div class=\"age\"></div>\n	</div>\n	<div class=\"arm\" />\n</div>\n";
},"useData":true});
templates['fancy-chat-buffer-block-whisper'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"fancy-block whisper\">\n	<div class=\"arm\" />\n	<div class=\"content-container\">\n		<div class=\"head\">\n			<span class=\"username\" data-username=\""
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span> whispers to you,\n		</div>\n		<div class=\"content\"></div>\n		<div class=\"age\"></div>\n	</div>\n</div>\n";
},"useData":true});
templates['fancy-chat-buffer-content-emote-echo'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"line\"><span class=\"username\" data-username=\""
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span>"
    + ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});
templates['fancy-chat-buffer-content-emote'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"line\"><span class=\"username\" data-username=\""
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span>"
    + ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});
templates['fancy-chat-buffer-content-speech-echo'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"line\">"
    + ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});
templates['fancy-chat-buffer-content-speech'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"line\">"
    + ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});
templates['fancy-chat-buffer-content-system'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"line\">"
    + ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});
templates['fancy-chat-buffer-content-whisper-echo'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"line\">"
    + ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});
templates['fancy-chat-buffer-content-whisper'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"line\">"
    + ((stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"message","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});
templates['login-prompt'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"login-prompt\">\n	<div class=\"contents\">\n		<input class=\"name required empty\" autofocus=\"autofocus\" />\n		<input type=\"password\" class=\"password required empty\" />\n		<div class=\"error\"></div>\n		<div class=\"login-button\"><div class=\"label\">LOGIN</div></div>\n		<div class=\"working\">\n			<img src=\"img/login-prompt-working.gif\" /><br/>\n			Fetching character...\n		</div>\n	</div>\n</div>\n";
},"useData":true});
templates['raw-chat-buffer-line'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<span class=\"raw-chat\">"
    + this.escapeExpression(((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"message","hash":{},"data":data}) : helper)))
    + "</span>\n";
},"useData":true});
