/*!
 * (c) Copyright 2010-2019 SAP SE or an SAP affiliate company.
 */
jQuery.sap.declare("sap.zen.crosstab.Crosstab");jQuery.sap.require("sap.zen.crosstab.library");jQuery.sap.require("sap.ui.core.Control");sap.ui.core.Control.extend("sap.zen.crosstab.Crosstab",{metadata:{library:"sap.zen.crosstab",properties:{"width":{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:null},"height":{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:null}}}});jQuery.sap.require("sap.zen.crosstab.paging.PageManager");jQuery.sap.require("sap.zen.crosstab.DataArea");jQuery.sap.require("sap.zen.crosstab.ColumnHeaderArea");jQuery.sap.require("sap.zen.crosstab.RowHeaderArea");jQuery.sap.require("sap.zen.crosstab.DimensionHeaderArea");jQuery.sap.require("sap.zen.crosstab.EventHandler");jQuery.sap.require("sap.zen.crosstab.SelectionHandler");jQuery.sap.require("sap.zen.crosstab.rendering.RenderEngine");jQuery.sap.require("sap.zen.crosstab.utils.Utils");jQuery.sap.require("sap.zen.crosstab.PropertyBag");jQuery.sap.require("sap.zen.crosstab.CrosstabCellApi");jQuery.sap.require("sap.zen.crosstab.CrosstabTestProxy");jQuery.sap.require("sap.zen.crosstab.CellStyleHandler");jQuery.sap.require("sap.zen.crosstab.CrosstabContextMenu");jQuery.sap.require("sap.zen.crosstab.CrosstabHeaderInfo");jQuery.sap.require("sap.zen.crosstab.dragdrop.DragDropHandler");
sap.zen.crosstab.Crosstab.prototype.init=function(){"use strict";this.scrolled=false;this.ensureIndexOf();var c=this.getId();var d=c+"_dataArea";this.dataArea=new sap.zen.crosstab.DataArea(this);this.dataArea.setId(d);var C=c+"_colHeaderArea";this.columnHeaderArea=new sap.zen.crosstab.ColumnHeaderArea(this);this.columnHeaderArea.setId(C);var r=c+"_rowHeaderArea";this.rowHeaderArea=new sap.zen.crosstab.RowHeaderArea(this);this.rowHeaderArea.setId(r);var D=c+"_dimHeaderArea";this.dimensionHeaderArea=new sap.zen.crosstab.DimensionHeaderArea(this);this.dimensionHeaderArea.setId(D);this.oPropertyBag=new sap.zen.crosstab.PropertyBag(this);this.oRenderEngine=new sap.zen.crosstab.rendering.RenderEngine(this);this.oSelectionHandler=null;this.oEventHandler=new sap.zen.crosstab.EventHandler(this);this.oUtils=new sap.zen.crosstab.utils.Utils(this);this.iCalculatedWidth=-1;this.iCalculatedHeight=-1;this.fPageRequestHandler=null;this.bOnAfterRendering=true;this.bIsVResize=false;this.bIsHResize=false;this.iHierarchyIndentWidth=0;this.iHierarchyIndentHeight=0;this.iExceptionSymbolWidth=0;this.iRenderMode=sap.zen.crosstab.rendering.RenderingConstants.RENDERMODE_COMPACT;this.bRenderScrollbars=true;this.bHCutOff=false;this.bVCutOff=false;this.sOnSelectCommand=null;this.sTransferDataCommand=null;this.sCallValueHelpCommand=null;this.iTotalRowCnt=0;this.iTotalColCnt=0;this.oHScrollbar=null;this.oVScrollbar=null;this.oHorizontalHeaderScrollbar=null;this.iTimeoutCounter=0;this.iTimeoutCounter2=0;this.oColHeaderHierarchyLevels={};this.oRowHeaderHierarchyLevels={};this.oTestProxy=new sap.zen.crosstab.CrosstabTestProxy(this,this.oEventHandler,this.oRenderEngine);this.bAdjustFrameDivs=true;this.iSavedWidthForPrepareDom=0;this.iSavedHeightForPrepareDom=0;this.oCellApi=null;this.iNewLinesCnt=0;this.sNewLinesPos="";this.bPlanningCheckMode=false;this.sScrollNotifyCommand=null;this.oContextMenu=null;this.iValueHelpStatus=0;this.bHeaderHScrolling=false;this.bPreparedDom=false;this.bWasRendered=false;this.sUserHeaderWidthCommand=null;this.bIsUserHeaderResizeAllowed=false;this.bIsHeaderScrollingConfigured=false;this.bContainerIsRendered=false;this.bContainerRenderRequest=false;this.oContainer=null;this.oHeaderInfo=null;this.sSelectionMode="";this.sSelectionSpace="";this.bEnableHoverEffect=true;this.oRenderTimer=null;this.oRenderTimer2=null;this.bQueueHeaderWidthRequest=true;this.bScrollInvalidate=false;this.bCalledByScrolling=false;this.bRevertDragDrop=false;this.bDragAction=false;this.oDragDropHandler=null;this.oDragDropCommands=null;this.bIsBlocked=false;this.bHasData=false;this.sUpdateColWidthCommand=null;};
sap.zen.crosstab.Crosstab.prototype.ensureIndexOf=function(){if(!Array.prototype.indexOf){Array.prototype.indexOf=function(s){"use strict";if(this==null){throw new TypeError();}var t=Object(this);var l=t.length>>>0;if(l===0){return-1;}var n=0;if(arguments.length>1){n=Number(arguments[1]);if(n!=n){n=0;}else if(n!=0&&n!=Infinity&&n!=-Infinity){n=(n>0||-1)*Math.floor(Math.abs(n));}}if(n>=l){return-1;}var k=n>=0?n:Math.max(l-Math.abs(n),0);for(;k<l;k++){if(k in t&&t[k]===s){return k;}}return-1;};}};
sap.zen.crosstab.Crosstab.prototype.getTableDiv=function(){var t=null;if(this.iRenderMode===sap.zen.crosstab.rendering.RenderingConstants.RENDERMODE_COMPACT){t=$(document.getElementById(this.getId()+"_altRenderModeTableDiv"));}else{t=$(document.getElementById(this.getId()));}return t;};
sap.zen.crosstab.Crosstab.prototype.ensurePageManager=function(){if(!this.oPageManager){this.oPageManager=new sap.zen.crosstab.paging.PageManager(this);}return this.oPageManager;};
sap.zen.crosstab.Crosstab.prototype.getIntWidth=function(){var w=-1;var W=this.getWidth();if(W&&W!=="auto"){w=parseInt(W,10);}else{w=this.iCalculatedWidth;}return w;};
sap.zen.crosstab.Crosstab.prototype.getContentWidth=function(){var w=this.getIntWidth();var t=this.getRenderEngine().getTableDivValues();w=w-t.borders.iLeftBorderWidth-t.borders.iRightBorderWidth;return w;};
sap.zen.crosstab.Crosstab.prototype.getContentHeight=function(){var h=this.getIntHeight();var t=this.getRenderEngine().getTableDivValues();var T=this.oPropertyBag.getToolbarHeight();h=h-t.borders.iTopBorderWidth-t.borders.iBottomBorderWidth-T;return h;};
sap.zen.crosstab.Crosstab.prototype.getIntHeight=function(){var h=-1;var H=this.getHeight();if(H&&H!=="auto"){h=parseInt(H,10);}else{h=this.iCalculatedHeight;}return h;};
sap.zen.crosstab.Crosstab.prototype.resize=function(e){var d=jQuery.sap.byId(this.getId());var n=parseInt(d.outerWidth(),10);var N=parseInt(d.outerHeight(),10);this.isHResize=n!==this.getIntWidth();this.isVResize=N!==this.getIntHeight();if(this.isHResize||this.isVResize){this.ensurePageManager().resizeEvent();}};
sap.zen.crosstab.Crosstab.prototype.determineRenderMode=function(c){var n=-1;if(c){if(c.alwaysfill){n=sap.zen.crosstab.rendering.RenderingConstants.RENDERMODE_FILL;}else{n=sap.zen.crosstab.rendering.RenderingConstants.RENDERMODE_COMPACT;}}if(n===-1){n=sap.zen.crosstab.rendering.RenderingConstants.RENDERMODE_COMPACT;}if(n!==this.iRenderMode){this.oRenderEngine.reset();this.iRenderMode=n;}};
sap.zen.crosstab.Crosstab.prototype.determineScrollMode=function(c){var n=c.pixelscrolling;if(n!==this.oPropertyBag.isPixelScrolling()){this.oRenderEngine.reset();this.oPropertyBag.setPixelScrolling(n);}};
sap.zen.crosstab.Crosstab.prototype.applyControlProperties=function(c){this.bPlanningCheckMode=c.pvcheck!==null&&c.pvcheck!==undefined;var i=this.ensurePageManager().checkResponseConsistency(c);if(!i){this.reset(c);}if(!this.bPlanningCheckMode){if(c.removeselection===true){if(this.oSelectionHandler){this.oSelectionHandler.removeAllSelections();this.bOnAfterRendering=true;}}else{this.determineRenderMode(c);this.determineScrollMode(c);this.ensurePageManager().receiveData(c);}}else{this.handlePlanningCheckData(c);this.bOnAfterRendering=true;}this.bPlanningCheckMode=false;};
sap.zen.crosstab.Crosstab.prototype.calculateOffset=function(c){var o=0;var a=c.getArea();if(a.isRowHeaderArea()){for(var i=0;i<c.getCol();i++){var t=a.getCell(c.getRow(),i);if(!t){o++;}else if(!t.isEntryEnabled()){o++;}}}return o;};
sap.zen.crosstab.Crosstab.prototype.calculateRowHeaderColOffsetsForRow=function(t){var c={};var T=0;var C=null;var e=0;var m=this.rowHeaderArea.getColCnt();for(T=0;T<m;T++){C=this.getTableCell(t,T);if(C!==null&&C.isEntryEnabled()){c[e]=T;e++;}}return c;};
sap.zen.crosstab.Crosstab.prototype.handlePlanningCheckData=function(c){var i=0;var C=c.pvcheck;var a=C.length;var o={};var b=null;var t=0;for(i=0;i<a;i++){var d=C[i];b=o[d.tabrow];if(!b){b=this.calculateRowHeaderColOffsetsForRow(d.tabrow);o[d.tabrow]=b;}var t=b[d.tabcol]||d.tabcol;var e=this.getTableCell(d.tabrow,t);if(e){e.setText(d.text);if(d.valid===false){e.addStyle(sap.zen.crosstab.rendering.RenderingConstants.STYLE_INVALID_VALUE);}else{e.removeStyle(sap.zen.crosstab.rendering.RenderingConstants.STYLE_INVALID_VALUE);}if(d.newvalue===true){e.addStyle(sap.zen.crosstab.rendering.RenderingConstants.STYLE_NEW_VALUE);}this.oRenderEngine.updateRenderingOfInputCellAfterCheck(e);}}};
sap.zen.crosstab.Crosstab.prototype.determineKeepUserColWidths=function(c){if(c.dataproviderchanged){return false;}if(c.resultsetchanged&&c.rootcause===undefined){return false;}return false;};
sap.zen.crosstab.Crosstab.prototype.determineKeepCalculatedColWidths=function(c){if(c.rootcause==="sorting"){return true;}var v=(c.v_pos||1)-1;var s=c.sentdatarows||0;var C=c.clientvpos||0;var t=c.totaldatarows||0;var h=(c.h_pos||1)-1;var S=c.sentdatacols||0;var i=c.clienthpos||0;var T=c.totaldatacols||0;var I=c.ispaging||false;var k=false;var K=false;if(this.bWasRendered===true&&!I){if((C>0)&&(C<=t)&&(C>(v+s))){K=true;}if((i>0)&&(i<=T)&&(i>(h+S))){k=true;}if(K===true||k===true){return true;}}return false;};
sap.zen.crosstab.Crosstab.prototype.reset=function(c){var k=this.determineKeepUserColWidths(c);var K=this.determineKeepCalculatedColWidths(c);this.getDimensionHeaderArea().clear(k,K);this.getColumnHeaderArea().clear(k,K);this.getRowHeaderArea().clear(k,K);this.getDataArea().clear(k,K);this.oRenderEngine.reset(K);this.oPageManager.reset();};
sap.zen.crosstab.Crosstab.prototype.updateControlProperties=function(c){if(c&&c.changed){this.reset(c);}this.applyControlProperties(c);};
sap.zen.crosstab.Crosstab.prototype.expectOnAfterRenderingCall=function(){this.bOnAfterRendering=false;};
sap.zen.crosstab.Crosstab.prototype.setContainerIsRendered=function(){this.bContainerIsRendered=true;};
sap.zen.crosstab.Crosstab.prototype.setContainerRenderRequest=function(){this.bContainerRenderRequest=true;};
sap.zen.crosstab.Crosstab.prototype.cleanupContainer=function(){if(this.oContainer){if(this.oContainer.oNotificationRegistry){delete this.oContainer.oNotificationRegistry[this.getId()];}if(sap.zen.crosstab.utils.Utils.getSizeOf(this.oContainer.oNotificationRegistry)===0){if(this.oContainer.fOriginalRender){this.oContainer.getRenderer().render=this.oContainer.fOriginalRender;delete this.oContainer.fOriginalRender;}this.oContainer.removeEventDelegate(this.onAfterRenderingDelegate);}}this.oContainer=null;};
sap.zen.crosstab.Crosstab.prototype.onAfterRenderingDelegate=null;
sap.zen.crosstab.Crosstab.prototype.setupContainer=function(c){var t=this;var r=null;if(c&&c.getRenderer&&sap.zen.crosstab.utils.Utils.isDispatcherAvailable()===true){if(!c.fOriginalRender){r=c.getRenderer();c.fOriginalRender=r.render;r.render=function(R,C){c.fOriginalRender.call(c.getRenderer(),R,C);if(c.oNotificationRegistry){$.each(c.oNotificationRegistry,function(i,h){var C=sap.zen.Dispatcher.instance.getControlForId(i);if(C){h.fSetRenderRequest.call(C);}});}};this.bContainerRenderRequest=true;}if(c.onAfterRendering){c.removeEventDelegate(t.onAfterRenderingDelegate);t.onAfterRenderingDelegate={onAfterRendering:function(){if(c.oNotificationRegistry){$.each(c.oNotificationRegistry,function(i,h){var C=sap.zen.Dispatcher.instance.getControlForId(i);if(C){h.fSetIsRendered.call(C);}});}}};c.addEventDelegate(t.onAfterRenderingDelegate);}else{this.bContainerIsRendered=true;}if(!c.oNotificationRegistry){c.oNotificationRegistry={};}c.oNotificationRegistry[this.getId()]={"fSetRenderRequest":this.setContainerRenderRequest,"fSetIsRendered":this.setContainerIsRendered};this.oContainer=c;}else{this.oContainer=null;}};
sap.zen.crosstab.Crosstab.prototype.getContainer=function(){var c=null;if(this.oContainer){c=this.oContainer;}else{c=this.getParent().getParent();}return c;};
sap.zen.crosstab.Crosstab.prototype.isAutoSize=function(){var w=this.getWidth();var h=this.getHeight();if(!w){return true;}else{if(w==="auto"){return true;}}if(!h){return true;}else{if(h==="auto"){return true;}}return false;};
sap.zen.crosstab.Crosstab.prototype.prepareContainer=function(){var c=null;var C=null;this.bContainerRenderRequest=false;if(!this.isAutoSize()){this.cleanupContainer();return;}if(!sap.zen.Dispatcher){this.cleanupContainer();return;}c=this.getParent().getParent();if(!c){this.cleanupContainer();return;}if(this.oContainer&&(c!==this.oContainer)){this.cleanupContainer();}this.setupContainer(c);};
sap.zen.crosstab.Crosstab.prototype.onAfterRendering=function(){if(!this.bIsDeferredRendering&&sap.zen.crosstab.utils.Utils.isDispatcherAvailable()){this.bIsDeferredRendering=sap.zen.Dispatcher.instance.isDeferredRendering();}if(!this.bContainerIsRendered&&this.bContainerRenderRequest===true&&this.oContainer){this.iTimeoutCounter++;if(this.iTimeoutCounter>1000){return;}if(this.oRenderTimer){clearTimeout(this.oRenderTimer);this.oRenderTimer=null;}this.oRenderTimer=setTimeout((function(t){return function(){t.onAfterRendering();};})(this),10);return;}if(this.bOnAfterRendering||this.bIsDeferredRendering){this.doRendering();}this.bContainerRenderRequest=false;this.bContainerIsRendered=false;this.bIsDeferredRendering=false;};
sap.zen.crosstab.Crosstab.prototype.prepareExistingDom=function(){if(!this.bPlanningCheckMode){var d=$(document.getElementById(this.getDimensionHeaderArea().getId())).find("tbody");d.empty();d=$(document.getElementById(this.getRowHeaderArea().getId())).find("tbody");d.empty();d=$(document.getElementById(this.getColumnHeaderArea().getId())).find("tbody");d.empty();d=$(document.getElementById(this.getDataArea().getId())).find("tbody");d.empty();this.bRenderScrollbars=false;this.determineNeedToAdjustOuterDivs();this.bPreparedDom=true;}};
sap.zen.crosstab.Crosstab.prototype.determineNeedToAdjustOuterDivs=function(){var w=this.getIntWidth();var h=this.getIntHeight();this.bAdjustFrameDivs=true;if(w===this.iSavedWidthForPrepareDom&&h===this.iSavedHeightForPrepareDom){this.bAdjustFrameDivs=false;}else{this.getRenderEngine().removeOuterDivBorders();}if(!this.getDataArea().hasLoadingPages()){this.iSavedWidthForPrepareDom=w;this.iSavedHeightForPrepareDom=h;}};
sap.zen.crosstab.Crosstab.prototype.determineHierarchyIndents=function(){var d=$(document.getElementById(this.getId()+"_measureDiv"));if(d&&d.length>0){d.css("visibility","visible");this.iHierarchyIndentWidth=parseInt(d.outerWidth(),10);this.iHierarchyIndentHeight=parseInt(d.outerHeight(),10);d.css("visibility","none");}};
sap.zen.crosstab.Crosstab.prototype.determineAlertSymbolDimensions=function(){var d=$(document.getElementById(this.getId()+"_exceptionMeasureDiv"));if(d&&d.length>0){d.css("visibility","visible");this.iExceptionSymbolWidth=parseInt(d.outerWidth(),10);d.css("visibility","none");}};
sap.zen.crosstab.Crosstab.prototype.isRenderingPossible=function(){if(sap.zen.crosstab.utils.Utils.isDispatcherAvailable()===true&&sap.zen.Dispatcher.instance.suppressRendering()){if(!sap.zen.Dispatcher.instance.isSingleDelta(this.getId())){sap.zen.Dispatcher.instance.registerForDeferredRendering(this);return false;}}var e=[];e.push($(document.getElementById(this.getId())));e.push($(document.getElementById(this.getId()+'_upperSection')));e.push($(document.getElementById(this.getId()+'_lowerSection')));e.push($(document.getElementById(this.getId()+'_dimHeaderArea')));e.push($(document.getElementById(this.getId()+'_colHeaderArea')));e.push($(document.getElementById(this.getId()+'_dataArea')));for(var i=0;i<e.length;i++){if(e[i].length!==1){this.bOnAfterRendering=true;return false;}}return true;};
sap.zen.crosstab.Crosstab.prototype.determineCrosstabSize=function(){var c=true;var j=null;if(!this.getWidth()||!this.getHeight()){c=false;}else{j=jQuery.sap.byId(this.getId()).parent();var w=j.outerWidth();if(w&&w>10){this.iCalculatedWidth=w;}var h=j.outerHeight();if(h&&h>10){this.iCalculatedHeight=h;}}return c;};
sap.zen.crosstab.Crosstab.prototype.setInvalidateCalledByScrolling=function(){this.bCalledByScrolling=true;};
sap.zen.crosstab.Crosstab.prototype.doRendering=function(i){this.iTimeoutCounter=0;if(this.oRenderTimer){clearTimeout(this.oRenderTimer);this.oRenderTimer=null;}if(this.bPlanningCheckMode===true){return;}if(!this.isRenderingPossible()){return;}if(!this.determineCrosstabSize()){return;}if(this.iCalculatedWidth===-1||this.iCalculatedHeight===-1){this.iTimeoutCounter2++;if(this.iTimeoutCounter2>1000){return;}if(this.oRenderTimer2){clearTimeout(this.oRenderTimer2);this.oRenderTimer2=null;}this.oRenderTimer2=setTimeout((function(a){return function(){a.doRendering();};})(this),10);return;}this.iTimeoutCounter2=0;if(this.oRenderTimer2){clearTimeout(this.oRenderTimer2);this.oRenderTimer2=null;}this.determineHierarchyIndents();if(this.getPropertyBag().isDisplayExceptions()){this.determineAlertSymbolDimensions();}var r=this.getRenderEngine();r.setAdjustFrameDivs(this.bAdjustFrameDivs);if(r.hasCrosstabSizeChanged()){this.ensurePageManager().resizeEvent();}if(this.oPropertyBag.hasToolbar()){var t=$(document.getElementById(this.getId()+"_toolbar"));var T=t.outerHeight();this.oPropertyBag.setToolbarHeight(T);}r.beginRendering();r.renderCrosstabAreas();r.calculateRenderSizeDivSize();if(!this.oPropertyBag.isPixelScrolling()){r.appendColumnsAfterResize();r.appendRowsAfterResize();}if(this.bRenderScrollbars){r.renderScrollbars();}r.adjustRenderSizeDivSize();if(this.bRenderScrollbars){r.setScrollbarSteps();}r.adjustScrollDivSizes();if(!this.bRenderScrollbars){r.checkScrollbarSize();}r.adjustScrollPositions(this.bRenderScrollbars);if(!this.oPropertyBag.isRtl()){if(!this.oPropertyBag.isPixelScrolling()){r.moveScrollDivs();}}else{if(this.oPropertyBag.isPixelScrolling()&&$.browser.webkit){r.moveScrollDivs();}}if(this.oHorizontalHeaderScrollbar&&!this.bPreparedDom){r.updateHeaderScrollbarSizes();}r.updateHeaderResizeDiv();if(this.getPropertyBag().isDragDropEnabled()===true&&sap.zen.crosstab.utils.Utils.isDispatcherAvailable()===true){if(!this.oDragDropHandler){this.oDragDropHandler=new sap.zen.crosstab.dragdrop.DragDropHandler(this,this.oDragDropCommands);}}r.finishRendering();this.oEventHandler.attachEvents();this.bOnAfterRendering=true;this.bRenderScrollbars=true;this.bAdjustFrameDivs=true;this.bPreparedDom=false;this.bWasRendered=true;var c=this.bCalledByScrolling;this.bCalledByScrolling=false;var s=this.bScrollInvalidate;this.bScrollInvalidate=false;if(!c&&!this.hasLoadingPages()&&s===true){this.invalidate();}if(!this.hasLoadingPages()){this.getPropertyBag().setBookmarkProcessing(false);}};
sap.zen.crosstab.Crosstab.prototype.setScrollInvalidate=function(s){this.bScrollInvalidate=s;};
sap.zen.crosstab.Crosstab.prototype.isScrollInvalidate=function(){return this.bScrollInvalidate;};
sap.zen.crosstab.Crosstab.prototype.scrollHorizontal=function(c){this.oRenderEngine.scrollHorizontal(c);};
sap.zen.crosstab.Crosstab.prototype.scrollVertical=function(r){this.oRenderEngine.scrollVertical(r);};
sap.zen.crosstab.Crosstab.prototype.scrollHeaderHorizontal=function(p){this.oRenderEngine.scrollHeaderHorizontal(p);};
sap.zen.crosstab.Crosstab.prototype.getVScrollPos=function(){var v=-1;if(this.oVScrollbar){v=this.oVScrollbar.getScrollPosition();}return v;};
sap.zen.crosstab.Crosstab.prototype.getHScrollPos=function(){var h=-1;if(this.oHScrollbar){h=this.oHScrollbar.getScrollPosition();}return h;};
sap.zen.crosstab.Crosstab.prototype.renderResizeOutline=function(){this.oRenderEngine.renderResizeOutline();};
sap.zen.crosstab.Crosstab.prototype.removeResizeOutline=function(){this.oRenderEngine.removeResizeOutline();};
sap.zen.crosstab.Crosstab.prototype.registerPageRequestHandler=function(h){this.fPageRequestHandler=h;};
sap.zen.crosstab.Crosstab.prototype.unregisterPageRequestHandler=function(){this.fPageRequestHandler=null;};
sap.zen.crosstab.Crosstab.prototype.getPageRequestHandler=function(){return this.fPageRequestHandler;};
sap.zen.crosstab.Crosstab.prototype.getReceivedPages=function(){return this.ensurePageManager().getReceivedPages();};
sap.zen.crosstab.Crosstab.prototype.getHierarchyIndentWidth=function(){return this.iHierarchyIndentWidth;};
sap.zen.crosstab.Crosstab.prototype.getExceptionSymbolWidth=function(){return this.iExceptionSymbolWidth;};
sap.zen.crosstab.Crosstab.prototype.getHierarchyIndentHeight=function(){return this.iHierarchyIndentHeight;};
sap.zen.crosstab.Crosstab.prototype.hideLoadingIndicator=function(){this.oRenderEngine.hideLoadingIndicator();};
sap.zen.crosstab.Crosstab.prototype.showLoadingIndicator=function(){this.oRenderEngine.showLoadingIndicator();};
sap.zen.crosstab.Crosstab.prototype.setHCutOff=function(h){this.bHCutOff=h;};
sap.zen.crosstab.Crosstab.prototype.isHCutOff=function(){return this.bHCutOff;};
sap.zen.crosstab.Crosstab.prototype.setVCutOff=function(v){this.bVCutOff=v;};
sap.zen.crosstab.Crosstab.prototype.isVCutOff=function(){return this.bVCutOff;};
sap.zen.crosstab.Crosstab.prototype.getTotalRows=function(){return this.iTotalRowCnt;};
sap.zen.crosstab.Crosstab.prototype.getTotalCols=function(){return this.iTotalColCnt;};
sap.zen.crosstab.Crosstab.prototype.setTotalCols=function(c){this.iTotalColCnt=c;};
sap.zen.crosstab.Crosstab.prototype.setTotalRows=function(r){this.iTotalRowCnt=r;};
sap.zen.crosstab.Crosstab.prototype.setHScrollbar=function(h){this.oHScrollbar=h;};
sap.zen.crosstab.Crosstab.prototype.setVScrollbar=function(v){this.oVScrollbar=v;};
sap.zen.crosstab.Crosstab.prototype.getVScrollbar=function(){return this.oVScrollbar;};
sap.zen.crosstab.Crosstab.prototype.getHScrollbar=function(){return this.oHScrollbar;};
sap.zen.crosstab.Crosstab.prototype.getTestProxy=function(){return this.oTestProxy;};
sap.zen.crosstab.Crosstab.prototype.setOnSelectCommand=function(o){this.sOnSelectCommand=o;};
sap.zen.crosstab.Crosstab.prototype.getOnSelectCommand=function(){return this.sOnSelectCommand;};
sap.zen.crosstab.Crosstab.prototype.setTransferDataCommand=function(t){this.sTransferDataCommand=t;};
sap.zen.crosstab.Crosstab.prototype.getTransferDataCommand=function(){return this.sTransferDataCommand;};
sap.zen.crosstab.Crosstab.prototype.setCallValueHelpCommand=function(c){this.sCallValueHelpCommand=c;};
sap.zen.crosstab.Crosstab.prototype.getCallValueHelpCommand=function(){return this.sCallValueHelpCommand;};
sap.zen.crosstab.Crosstab.prototype.getRenderMode=function(){return this.iRenderMode;};
sap.zen.crosstab.Crosstab.prototype.getUtils=function(){return this.oUtils;};
sap.zen.crosstab.Crosstab.prototype.getDataArea=function(){return this.dataArea;};
sap.zen.crosstab.Crosstab.prototype.getDimensionHeaderArea=function(){return this.dimensionHeaderArea;};
sap.zen.crosstab.Crosstab.prototype.getColumnHeaderArea=function(){return this.columnHeaderArea;};
sap.zen.crosstab.Crosstab.prototype.getRowHeaderArea=function(){return this.rowHeaderArea;};
sap.zen.crosstab.Crosstab.prototype.getRenderEngine=function(){return this.oRenderEngine;};
sap.zen.crosstab.Crosstab.prototype.hResize=function(){return this.isHResize;};
sap.zen.crosstab.Crosstab.prototype.vResize=function(){return this.isVResize;};
sap.zen.crosstab.Crosstab.prototype.getPageManager=function(){return this.oPageManager;};
sap.zen.crosstab.Crosstab.prototype.isRenderScrollbars=function(){return this.bRenderScrollbars;};
sap.zen.crosstab.Crosstab.prototype.getPropertyBag=function(){return this.oPropertyBag;};
sap.zen.crosstab.Crosstab.prototype.hasToolbar=function(){return this.bHasToolbar;};
sap.zen.crosstab.Crosstab.prototype.setColHeaderHierarchyLevels=function(l){this.oColHeaderHierarchyLevels=l;};
sap.zen.crosstab.Crosstab.prototype.getColHeaderHierarchyLevels=function(){return this.oColHeaderHierarchyLevels;};
sap.zen.crosstab.Crosstab.prototype.setRowHeaderHierarchyLevels=function(l){this.oRowHeaderHierarchyLevels=l;};
sap.zen.crosstab.Crosstab.prototype.getRowHeaderHierarchyLevels=function(){return this.oRowHeaderHierarchyLevels;};
sap.zen.crosstab.Crosstab.prototype.isIE8Mode=function(){return this.oRenderEngine.isIE8Mode();};
sap.zen.crosstab.Crosstab.prototype.hasDimensionHeaderArea=function(){var r=false;if(this.dimensionHeaderArea!==undefined){r=(this.dimensionHeaderArea.getColCnt()>0&&this.dimensionHeaderArea.getRowCnt()>0);}return r;};
sap.zen.crosstab.Crosstab.prototype.hasRowHeaderArea=function(){var r=false;if(this.rowHeaderArea!==undefined){r=(this.rowHeaderArea.getColCnt()>0&&this.rowHeaderArea.getRowCnt()>0);}return r;};
sap.zen.crosstab.Crosstab.prototype.hasColHeaderArea=function(){var r=false;if(this.columnHeaderArea!==undefined){r=(this.columnHeaderArea.getColCnt()>0&&this.columnHeaderArea.getRowCnt()>0);}return r;};
sap.zen.crosstab.Crosstab.prototype.hasDataArea=function(){var r=false;if(this.dataArea!==undefined){r=(this.dataArea.getColCnt()>0&&this.dataArea.getRowCnt()>0);}return r;};
sap.zen.crosstab.Crosstab.prototype.restoreFocusOnCell=function(){this.oEventHandler.restoreFocusOnCell();};
sap.zen.crosstab.Crosstab.prototype.getTableCell=function(t,T){return this.oCellApi.getTableCell(t,T);};
sap.zen.crosstab.Crosstab.prototype.getTableCellWithSpans=function(r,c){return this.oCellApi.getTableCellWithSpans(r,c);};
sap.zen.crosstab.Crosstab.prototype.getTableCellWithColSpan=function(r,c){return this.oCellApi.getTableCellWithColSpan(r,c);};
sap.zen.crosstab.Crosstab.prototype.getTableCellWithRowSpan=function(r,c){return this.oCellApi.getTableCellWithRowSpan(r,c);};
sap.zen.crosstab.Crosstab.prototype.getTableRowCnt=function(t,T){return this.oCellApi.getTableRowCnt();};
sap.zen.crosstab.Crosstab.prototype.getTableColCnt=function(t,T){return this.oCellApi.getTableColCnt();};
sap.zen.crosstab.Crosstab.prototype.getTableFixedRowHeaderColCnt=function(){return this.oCellApi.getTableFixedRowHeaderColCnt();};
sap.zen.crosstab.Crosstab.prototype.getTableFixedColHeaderRowCnt=function(){return this.oCellApi.getTableFixedColHeaderRowCnt();};
sap.zen.crosstab.Crosstab.prototype.getTableMaxScrollColCnt=function(){return this.oCellApi.getTableMaxScrollColCnt();};
sap.zen.crosstab.Crosstab.prototype.getTableMaxScrollRowCnt=function(){return this.oCellApi.getTableMaxScrollRowCnt();};
sap.zen.crosstab.Crosstab.prototype.getTableMaxDimHeaderRow=function(){return this.oCellApi.getTableMaxDimHeaderRow();};
sap.zen.crosstab.Crosstab.prototype.getTableMaxDimHeaderCol=function(){return this.oCellApi.getTableMaxDimHeaderCol();};
sap.zen.crosstab.Crosstab.prototype.setCellApi=function(p){this.oCellApi=p;};
sap.zen.crosstab.Crosstab.prototype.hasLoadingPages=function(){return this.dataArea.hasLoadingPages()||this.rowHeaderArea.hasLoadingPages()||this.columnHeaderArea.hasLoadingPages();};
sap.zen.crosstab.Crosstab.prototype.getRenderRowCnt=function(){if(this.dataArea){return this.dataArea.getRenderRowCnt();}else if(this.rowHeaderArea){return this.rowHeaderArea.getRenderRowCnt();}};
sap.zen.crosstab.Crosstab.prototype.getRenderStartRow=function(){if(this.dataArea){return this.dataArea.getRenderStartRow();}else if(this.rowHeaderArea){return this.rowHeaderArea.getRenderStartRow();}};
sap.zen.crosstab.Crosstab.prototype.getRenderColCnt=function(){if(this.dataArea){return this.dataArea.getRenderColCnt();}else if(this.columnHeaderArea){return this.columnHeaderArea.getRenderColCnt();}};
sap.zen.crosstab.Crosstab.prototype.getRenderStartCol=function(){if(this.dataArea){return this.dataArea.getRenderStartCol();}else if(this.columnHeaderArea){return this.columnHeaderArea.getRenderStartCol();}};
sap.zen.crosstab.Crosstab.prototype.setNewLinesCnt=function(n){this.iNewLinesCnt=n;};
sap.zen.crosstab.Crosstab.prototype.getNewLinesCnt=function(){return this.iNewLinesCnt;};
sap.zen.crosstab.Crosstab.prototype.setNewLinesPos=function(n){this.sNewLinesPos=n;};
sap.zen.crosstab.Crosstab.prototype.getNewLinesPos=function(){return this.sNewLinesPos;};
sap.zen.crosstab.Crosstab.prototype.isNewLinesTop=function(){if(!this.sNewLinesPos){return false;}return(this.sNewLinesPos==="TOP");};
sap.zen.crosstab.Crosstab.prototype.isNewLinesBottom=function(){if(!this.sNewLinesPos){return false;}return(this.sNewLinesPos==="BOTTOM");};
sap.zen.crosstab.Crosstab.prototype.setScrollNotifyCommand=function(s){this.sScrollNotifyCommand=s;};
sap.zen.crosstab.Crosstab.prototype.getScrollNotifyCommand=function(){return this.sScrollNotifyCommand;};
sap.zen.crosstab.Crosstab.prototype.getContextMenuAction=function(c,d){var a=null;if(this.oContextMenu){a=this.oContextMenu.getContextMenuAction(c,d);}return a;};
sap.zen.crosstab.Crosstab.prototype.createContextMenu=function(){if(!this.oContextMenu){this.oContextMenu=new sap.zen.crosstab.CrosstabContextMenu(this);}};
sap.zen.crosstab.Crosstab.prototype.setValueHelpStatus=function(v){this.iValueHelpStatus=v;};
sap.zen.crosstab.Crosstab.prototype.getValueHelpStatus=function(){return this.iValueHelpStatus;};
sap.zen.crosstab.Crosstab.prototype.getHorizontalHeaderScrollbar=function(){return this.oHorizontalHeaderScrollbar;};
sap.zen.crosstab.Crosstab.prototype.setHorizontalHeaderScrollbar=function(h){this.oHorizontalHeaderScrollbar=h;};
sap.zen.crosstab.Crosstab.prototype.setHeaderHScrolling=function(h){this.bHeaderHScrolling=h;if(!this.bHeaderHScrolling){this.oHorizontalHeaderScrollbar=null;}};
sap.zen.crosstab.Crosstab.prototype.isHeaderHScrolling=function(){return this.bHeaderHScrolling;};
sap.zen.crosstab.Crosstab.prototype.setUserHeaderWidthCommand=function(u){this.sUserHeaderWidthCommand=u;};
sap.zen.crosstab.Crosstab.prototype.getUserHeaderWidthCommand=function(){return this.sUserHeaderWidthCommand;};
sap.zen.crosstab.Crosstab.prototype.isUserHeaderResizeAllowed=function(){return this.bIsUserHeaderResizeAllowed;};
sap.zen.crosstab.Crosstab.prototype.setUserHeaderResizeAllowed=function(i){this.bIsUserHeaderResizeAllowed=i;};
sap.zen.crosstab.Crosstab.prototype.setHeaderScrollingConfigured=function(i){this.bIsHeaderScrollingConfigured=i;};
sap.zen.crosstab.Crosstab.prototype.isHeaderScrollingConfigured=function(){return this.bIsHeaderScrollingConfigured;};
sap.zen.crosstab.Crosstab.prototype.isPreparedDom=function(){return this.bPreparedDom;};
sap.zen.crosstab.Crosstab.prototype.getSelectionHandler=function(){if(!this.oSelectionHandler&&this.sSelectionMode!==undefined&&this.sSelectionMode!==""){this.oSelectionHandler=new sap.zen.crosstab.SelectionHandler(this);}return this.oSelectionHandler;};
sap.zen.crosstab.Crosstab.prototype.initHeaderInfo=function(h){this.oHeaderInfo=new sap.zen.crosstab.CrosstabHeaderInfo(this,h);};
sap.zen.crosstab.Crosstab.prototype.getHeaderInfo=function(){return this.oHeaderInfo;};
sap.zen.crosstab.Crosstab.prototype.setSelectionProperties=function(s,S,d,b){this.sSelectionMode=s;this.sSelectionSpace=S;if(!d){this.bEnableHoverEffect=true;}else{this.bEnableHoverEffect=false;}this.getPropertyBag().setFireOnSelectedOnlyOnce(b);};
sap.zen.crosstab.Crosstab.prototype.getSelectionMode=function(){return this.sSelectionMode;};
sap.zen.crosstab.Crosstab.prototype.getSelectionSpace=function(){return this.sSelectionSpace;};
sap.zen.crosstab.Crosstab.prototype.isHoveringEnabled=function(){return this.bEnableHoverEffect;};
sap.zen.crosstab.Crosstab.prototype.isPlanningMode=function(){return(this.getTransferDataCommand()&&this.getTransferDataCommand()!=="");};
sap.zen.crosstab.Crosstab.prototype.isSelectable=function(){return(this.oSelectionHandler&&this.sSelectionMode!==undefined&&this.sSelectionMode!=="");};
sap.zen.crosstab.Crosstab.prototype.isQueueHeaderWidthRequest=function(){return this.bQueueHeaderWidthRequest;};
sap.zen.crosstab.Crosstab.prototype.setQueueHeaderWidthRequest=function(q){this.bQueueHeaderWidthRequest=q;};
sap.zen.crosstab.Crosstab.prototype.postPlanningValue=function(){return this.oEventHandler.postPlanningValue();};
sap.zen.crosstab.Crosstab.prototype.setDragAction=function(d){this.bDragAction=d;if(this.oSelectionHandler){this.oSelectionHandler.blockSelectionHovering(d);}};
sap.zen.crosstab.Crosstab.prototype.isDragAction=function(){return this.bDragAction;};
sap.zen.crosstab.Crosstab.prototype.onUnhandledDrop=function(e,u,p){this.oDragDropHandler.onUnhandledDrop(e,u,p);};
sap.zen.crosstab.Crosstab.prototype.onEscKeyPressed=function(){this.oDragDropHandler.onEscKeyPressed();};
sap.zen.crosstab.Crosstab.prototype.setDragDropCommands=function(d){this.oDragDropCommands=d;};
sap.zen.crosstab.Crosstab.prototype.getDragDropHandler=function(){return this.oDragDropHandler;};
sap.zen.crosstab.Crosstab.prototype.getRenderSizeDiv=function(){return $(document.getElementById(this.getId()+"_renderSizeDiv"));};
sap.zen.crosstab.Crosstab.prototype.getRowHeaderAreaDiv=function(){return $(document.getElementById(this.getId()+"_lowerLeft_scrollDiv"));};
sap.zen.crosstab.Crosstab.prototype.getColHeaderAreaDiv=function(){return $(document.getElementById(this.getId()+"_upperRight_scrollDiv"));};
sap.zen.crosstab.Crosstab.prototype.getDimHeaderAreaDiv=function(){return $(document.getElementById(this.getId()+"_upperLeft_scrollDiv"));};
sap.zen.crosstab.Crosstab.prototype.isVScrolling=function(){var i=false;var v=this.oRenderEngine.getScrollbarVisibility();if(v){i=v.bHasVScrollbar;}return i;};
sap.zen.crosstab.Crosstab.prototype.isHScrolling=function(){var i=false;var v=this.oRenderEngine.getScrollbarVisibility();if(v){i=v.bHasHScrollbar;}return i;};
sap.zen.crosstab.Crosstab.prototype.getGlassPane=function(){return $(document.getElementById(this.getId()+"_glassPane"));};
sap.zen.crosstab.Crosstab.prototype.block=function(){var j;this.bIsBlocked=true;j=this.getGlassPane();j.css("visibility","visible");};
sap.zen.crosstab.Crosstab.prototype.unblock=function(){var j;if(!this.hasLoadingPages()){j=this.getGlassPane();j.css("visibility","hidden");this.bIsBlocked=false;}};
sap.zen.crosstab.Crosstab.prototype.isBlocked=function(){return this.bIsBlocked;};
sap.zen.crosstab.Crosstab.prototype.setHasData=function(h){this.bHasData=h;};
sap.zen.crosstab.Crosstab.prototype.hasData=function(){return this.bHasData;};
sap.zen.crosstab.Crosstab.prototype.enableClick=function(){this.oEventHandler.enableClick();};
sap.zen.crosstab.Crosstab.prototype.getColResizer=function(){return this.oEventHandler.getColResizer();};
sap.zen.crosstab.Crosstab.prototype.setUpdateColWidthCommand=function(c){this.sUpdateColWidthCommand=c;};
sap.zen.crosstab.Crosstab.prototype.getUpdateColWidthCommand=function(){return this.sUpdateColWidthCommand;};
sap.zen.crosstab.Crosstab.prototype.executeScrollSequence=function(s){var m=s.length-1;var c;var t=this;function d(){var C;var S;var i;var T;var D=false;if(c<=m){C=s[c];S=C[0];i=C[1];D=C[2];if(C.length>3){T=C[3];}else{T=1000;}setTimeout(function(){if(D===true){debugger;}if(S==="H"){t.scrollHorizontal(i);}else if(S==="V"){t.scrollVertical(i);}c++;d();},T);}}if(m>=0){c=0;d();}};
