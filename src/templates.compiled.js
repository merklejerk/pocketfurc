var Handlebars = require("handlebars");  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['app-header'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div id=\"header\">\n   <span class=\"left\">\n      <img class=\"logo\" src=\"img/logo.png\" />\n      <img class=\"logo-text\" src=\"img/logo-text.png\" />\n   </span>\n   <span class=\"right\">\n      <div class=\"players-visible-button\" title=\"Nearby players\">\n         <img class=\"icon\" src=\"/img/players-visible-icon.png\" />\n         <div class=\"count-container\">\n            <div class=\"count\"></div>\n         </div>\n      </div>\n      <img class=\"reconnect-button\" title=\"Reconnect\" src=\"/img/reconnect-button.png\" />\n      <img class=\"menu-button\" src=\"img/settings-button.png\" />\n   </span>\n</div>\n";
  },"useData":true});
templates['chat-buffer-line'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div class=\"line\">\n	<span class=\"timestamp\">"
    + escapeExpression(((helper = (helper = helpers.timestamp || (depth0 != null ? depth0.timestamp : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"timestamp","hash":{},"data":data}) : helper)))
    + "</span> <span class=\"body\"></span>\n</div>\n";
},"useData":true});
templates['chat-buffer'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"chat-buffer\">\n	<div class=\"buffer\" />\n	<div class=\"alert-area\">\n		<img class=\"new-line-alert\" src=\"img/new-line-alert.png\" />\n	</div>\n</div>\n";
  },"useData":true});
templates['chat-input-floating-tool'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"chat-input-floating-tool\">\n   <div class=\"content maximized\">\n      <div class=\"styles\">\n         <div class=\"container\"><div class=\"bold button\"></div></div>\n         <div class=\"container\"><div class=\"italic button\"></div></div>\n         <div class=\"container\"><div class=\"underline button\"></div></div>\n      </div>\n      <div class=\"link\">\n         <input class=\"url\" tabindex=\"0\" />\n         <div class=\"overlay\">URL</div>\n      </div>\n   </div>\n   <div class=\"content minimized\">\n      <div class=\"icon\"></div>\n   </div>\n   <div class=\"tail\"><img src=\"img/input-tool-tail.svg\" /></div>\n</div>\n";
  },"useData":true});
templates['chat-input'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"chat-input\">\n	<img class=\"mode\" />\n	<span class=\"placeholder\">...</span>\n	<span class=\"text\" contentEditable=\"true\" tabIndex=\"0\"></span>\n	<span class=\"send\"></span>\n</div>\n";
  },"useData":true});
templates['chat-message-nearby-players'] = template({"1":function(depth0,helpers,partials,data) {
  var stack1, lambda=this.lambda, escapeExpression=this.escapeExpression, buffer = "   <name>"
    + escapeExpression(lambda((depth0 != null ? depth0.name : depth0), depth0))
    + "</name>";
  stack1 = helpers['if'].call(depth0, (data && data.last), {"name":"if","hash":{},"fn":this.program(2, data),"inverse":this.program(4, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n";
},"2":function(depth0,helpers,partials,data) {
  return ".";
  },"4":function(depth0,helpers,partials,data) {
  return ", ";
  },"6":function(depth0,helpers,partials,data) {
  return "   No players nearby.\n";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, buffer = "Nearby players:\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.players : depth0), {"name":"each","hash":{},"fn":this.program(1, data),"inverse":this.program(6, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});
templates['fancy-chat-buffer-block-emote-echo'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"fancy-block emote echo\">\n	<div class=\"content-container\">\n		<div class=\"content\"></div>\n		<div class=\"age\"></div>\n	</div>\n</div>\n";
  },"useData":true});
templates['fancy-chat-buffer-block-emote'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"fancy-block emote\">\n	<div class=\"content-container\">\n		<div class=\"content\"></div>\n		<div class=\"age\"></div>\n	</div>\n</div>\n";
  },"useData":true});
templates['fancy-chat-buffer-block-speech-echo'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div class=\"fancy-block speech echo\">\n	<div class=\"content-container\">\n		<div class=\"head\">\n			<span class=\"username\" data-username=\""
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\">You</span> say,\n		</div>\n		<div class=\"content\"></div>\n		<div class=\"age\"></div>\n	</div>\n	<div class=\"arm\" />\n</div>\n";
},"useData":true});
templates['fancy-chat-buffer-block-speech'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div class=\"fancy-block speech\">\n	<div class=\"arm\" />\n	<div class=\"content-container\">\n		<div class=\"head\">\n			<span class=\"username\" data-username=\""
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "</span> says,\n		</div>\n		<div class=\"content\"></div>\n		<div class=\"age\"></div>\n	</div>\n</div>\n";
},"useData":true});
templates['fancy-chat-buffer-block-system'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"fancy-block system\">\n	<div class=\"content-container\">\n		<div class=\"content\"></div>\n		<div class=\"age\"></div>\n	</div>\n</div>\n";
  },"useData":true});
templates['fancy-chat-buffer-block-whisper-echo'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div class=\"fancy-block whisper echo\">\n	<div class=\"content-container\">\n		<div class=\"head\">\n			You whisper to <span class=\"username\" data-username=\""
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "</span>,\n		</div>\n		<div class=\"content\"></div>\n		<div class=\"age\"></div>\n	</div>\n	<div class=\"arm\" />\n</div>\n";
},"useData":true});
templates['fancy-chat-buffer-block-whisper'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div class=\"fancy-block whisper\">\n	<div class=\"arm\" />\n	<div class=\"content-container\">\n		<div class=\"head\">\n			<span class=\"username\" data-username=\""
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "</span> whispers to you,\n		</div>\n		<div class=\"content\"></div>\n		<div class=\"age\"></div>\n	</div>\n</div>\n";
},"useData":true});
templates['fancy-chat-buffer-content-emote-echo'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<div class=\"line\"><span class=\"username\" data-username=\""
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "</span>";
  stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"message","hash":{},"data":data}) : helper));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"useData":true});
templates['fancy-chat-buffer-content-emote'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<div class=\"line\"><span class=\"username\" data-username=\""
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "</span>";
  stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"message","hash":{},"data":data}) : helper));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"useData":true});
templates['fancy-chat-buffer-content-speech-echo'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, buffer = "<div class=\"line\">";
  stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"message","hash":{},"data":data}) : helper));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"useData":true});
templates['fancy-chat-buffer-content-speech'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, buffer = "<div class=\"line\">";
  stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"message","hash":{},"data":data}) : helper));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"useData":true});
templates['fancy-chat-buffer-content-system'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, buffer = "<div class=\"line\">";
  stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"message","hash":{},"data":data}) : helper));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"useData":true});
templates['fancy-chat-buffer-content-whisper-echo'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, buffer = "<div class=\"line\">";
  stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"message","hash":{},"data":data}) : helper));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"useData":true});
templates['fancy-chat-buffer-content-whisper'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, buffer = "<div class=\"line\">";
  stack1 = ((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"message","hash":{},"data":data}) : helper));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"useData":true});
templates['login-prompt'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"login-prompt\">\n	<div class=\"contents\">\n		<input class=\"name required empty\" autofocus=\"autofocus\" />\n		<input type=\"password\" class=\"password required empty\" />\n		<div class=\"error\"></div>\n		<div class=\"login-button\"><div class=\"label\">LOGIN</div></div>\n		<div class=\"working\">\n			<img src=\"img/login-prompt-working.gif\" /><br/>\n			Fetching character...\n		</div>\n	</div>\n</div>\n";
  },"useData":true});
templates['raw-chat-buffer-line'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<span class=\"raw-chat\">"
    + escapeExpression(((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"message","hash":{},"data":data}) : helper)))
    + "</span>\n";
},"useData":true});
