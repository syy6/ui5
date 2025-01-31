/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/gantt/misc/Utility","./Drawer","sap/ui/thirdparty/d3"],function(U,D){"use strict";var V=D.extend("sap.gantt.drawer.VerticalLine",{constructor:function(a){this.oAxisTime=a;}});V.prototype.drawSvg=function(g){var c=jQuery(g.node()),C=c.width(),a=Math.max.apply(null,c.map(function(){return jQuery(this).height();}).get());var z=this.oAxisTime.getZoomStrategy();var t=this.oAxisTime.getTickTimeIntervalLabel(z.getTimeLineOption(),null,[0,C]);var T=t[1];var p="";for(var i=0;i<T.length;i++){p+=" M"+" "+(T[i].value-1/2)+" 0"+" L"+" "+(T[i].value-1/2)+" "+(a);}if(p){g.selectAll(".sapGanttChartVerticalLine").remove();var $=jQuery(g.select("rect").node());var s=$.attr("class")?$.attr("class").split(" ")[0]:"";if(sap.ui.getCore().byId(s)&&sap.ui.getCore().byId(s).getMetadata().getName()==="sap.gantt.shape.ext.RowBackgroundRectangle"){g.select("g").append("g").classed("sapGanttChartVerticalLine",true).append("path").attr("d",p);}else{g.insert("g",":first-child").classed("sapGanttChartVerticalLine",true).append("path").attr("d",p);}}};V.prototype.destroySvg=function(g){if(g){g.selectAll(".sapGanttChartVerticalLine").remove();}};return V;},true);
