/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine('sap/ui/codeeditor/library',['sap/ui/core/Core','sap/ui/core/library'],function(C){"use strict";sap.ui.getCore().initLibrary({name:"sap.ui.codeeditor",dependencies:["sap.ui.core"],types:[],interfaces:[],controls:["sap.ui.codeeditor.CodeEditor"],elements:[],noLibraryCSS:false,version:"1.60.42"});return sap.ui.codeeditor;});
sap.ui.require.preload({
	"sap/ui/codeeditor/manifest.json":'{"_version":"1.9.0","sap.app":{"id":"sap.ui.codeeditor","type":"library","embeds":[],"applicationVersion":{"version":"1.60.42"},"title":"UI5 library: sap.ui.codeeditor","description":"UI5 library: sap.ui.codeeditor","resources":"resources.json","offline":true,"openSourceComponents":[{"name":"ace","packagedWithMySelf":true,"version":"0.0.0"}]},"sap.ui":{"technology":"UI5","supportedThemes":["base"]},"sap.ui5":{"dependencies":{"minUI5Version":"1.60","libs":{"sap.ui.core":{"minVersion":"1.60.42"}}},"library":{"i18n":false,"content":{"controls":["sap.ui.codeeditor.CodeEditor"],"elements":[],"types":[],"interfaces":[]}}}}',
	"sap/ui/codeeditor/CodeEditor.js":function(){sap.ui.loader.config({shim:{'sap/ui/codeeditor/js/ace/ace':{exports:'ace'},'sap/ui/codeeditor/js/ace/ext-language_tools':{deps:['sap/ui/codeeditor/js/ace/ace']},'sap/ui/codeeditor/js/ace/ext-beautify':{deps:['sap/ui/codeeditor/js/ace/ace']},'sap/ui/codeeditor/js/ace/mode-javascript':{deps:['sap/ui/codeeditor/js/ace/ace']},'sap/ui/codeeditor/js/ace/mode-json':{deps:['sap/ui/codeeditor/js/ace/ace']}}});sap.ui.define(['sap/ui/core/Control','sap/ui/codeeditor/js/ace/ace','sap/ui/codeeditor/js/ace/ext-language_tools','sap/ui/codeeditor/js/ace/ext-beautify','sap/ui/codeeditor/js/ace/mode-javascript','sap/ui/codeeditor/js/ace/mode-json'],function(C){"use strict";
var a=C.extend("sap.ui.codeeditor.CodeEditor",{
metadata:{library:"sap.ui.core",properties:{value:{type:"string",group:"Misc",defaultValue:""},type:{type:"string",group:"Appearance",defaultValue:"javascript"},width:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:"100%"},height:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:"100%"},editable:{type:"boolean",group:"Behavior",defaultValue:true},lineNumbers:{type:"boolean",group:"Behavior",defaultValue:true},valueSelection:{type:"boolean",group:"Behavior",defaultValue:false},maxLines:{type:"int",group:"Behavior",defaultValue:0},colorTheme:{type:"string",group:"Behavior",defaultValue:"default"},syntaxHints:{type:"boolean",group:"Behavior",defaultValue:true}},events:{liveChange:{},change:{}},defaultProperty:"content"},
renderer:function(r,c){r.write("<div ");r.writeControlData(c);r.addStyle("width",c.getWidth());r.addStyle("height",c.getHeight());r.addClass("sapCEd");r.writeAttributeEscaped("data-sap-ui-syntaxhints",c.getSyntaxHints());r.writeStyles();r.writeClasses();r.write(">");r.write("</div>");}
});
var p=sap.ui.require.toUrl("sap/ui/codeeditor/js/ace");ace.config.set("basePath",p);var l=ace.require("ace/ext/language_tools");
a.prototype.init=function(){var d=document.createElement("div");this._oEditorDomRef=d;this._oEditorDomRef.style.height="100%";this._oEditorDomRef.style.width="100%";this._oEditor=ace.edit(d);var s=this._oEditor.getSession();s.setUseWorker(false);s.setValue("");s.setUseWrapMode(true);s.setMode("ace/mode/javascript");this._oEditor.setTheme("ace/theme/tomorrow");this._oEditor.setOptions({enableBasicAutocompletion:true,enableSnippets:true,enableLiveAutocompletion:true});this._oEditor.renderer.setShowGutter(true);this._oEditor.$blockScrolling=Infinity;var t=this;this._oEditor.addEventListener("change",function(e){var v=t.getCurrentValue();t.fireLiveChange({value:v,editorEvent:e});});this._oEditor.addEventListener("blur",function(e){var v=t.getCurrentValue(),c=t.getValue();t.setProperty("value",v,true);if(v!=c){t.fireChange({value:v,oldValue:c});}});};
a.prototype.invalidate=function(){return this;};
a.prototype.setEditable=function(v){this.setProperty("editable",v,true);if(v){this._oEditor.renderer.$cursorLayer.element.style.display="";}else{this._oEditor.renderer.$cursorLayer.element.style.display="none";}this._oEditor.setReadOnly(!v);this._oEditor.textInput.setReadOnly(!v);return this;};
a.prototype.focus=function(){this._oEditor.focus();return this;};
a.prototype.setType=function(t){this.setProperty("type",t,true);this._oEditor.getSession().setMode("ace/mode/"+this.getType());return this;};
a.prototype.setSyntaxHints=function(s){this.setProperty("syntaxHints",s,true);this._oEditor.renderer.setShowGutter(this.getLineNumbers());if(this.getDomRef()){this.getDomRef().setAttribute("data-sap-ui-syntaxhints",s);}return this;};
a.prototype.setColorTheme=function(t){this.setProperty("colorTheme",t,true);if(t==="default"){t="tomorrow";}else if(t==="hcb"){t="tomorrow_night";}else if(t==="hcb_bright"){t="tomorrow_night_bright";}else if(t==="hcb_blue"){t="tomorrow_night_blue";}this._oEditor.setTheme("ace/theme/"+t);return this;};
a.prototype.setValue=function(v){this.setProperty("value",v,true);this._oEditor.getSession().setValue(this.getProperty("value"));if(!this.getValueSelection()){this._oEditor.selection.clearSelection();}return this;};
a.prototype.getCurrentValue=function(){return this._oEditor.getValue();};
a.prototype.setLineNumbers=function(v){this.setProperty("lineNumbers",v,true);this._oEditor.renderer.setShowGutter(this.getLineNumbers());return this;};
a.prototype.onAfterRendering=function(){var d=this.getDomRef(),P=this.getMetadata().getPropertyDefaults();setTimeout(function(){if(this.getMaxLines()===P.maxLines&&this.getHeight()===P.height&&d.height<20){d.style.height="3rem";}}.bind(this),0);d.appendChild(this._oEditorDomRef);this._oEditor.renderer.updateText();};
a.prototype.setMaxLines=function(m){this._oEditor.setOption("maxLines",m);return this.setProperty("maxLines",m,true);};
a.prototype.addCustomCompleter=function(c){l.addCompleter({getCompletions:function(e,s,P,b,f){c.getCompletions(f,{oPos:P,sPrefix:b});}});};
a.prototype._getEditorInstance=function(){return this._oEditor;};
a.prototype.setVisible=function(v){if(this.getVisible()!==v){this.setProperty("visible",v);this.rerender();}return this;};
a.prototype.prettyPrint=function(){ace.require("ace/ext/beautify").beautify(this._oEditor.session);};
a.prototype.destroy=function(s){this._oEditor.destroy(s);C.prototype.destroy.call(this,s);};
a.prototype.onfocusout=function(){this._oEditor.getSession().setUseWorker(false);};
a.prototype.onfocusin=function(){if(!this.getEditable()){document.activeElement.blur();}this._oEditor.getSession().setUseWorker(true);};
return a;},true);
}
},"sap/ui/codeeditor/library-preload"
);
//# sourceMappingURL=library-preload.js.map