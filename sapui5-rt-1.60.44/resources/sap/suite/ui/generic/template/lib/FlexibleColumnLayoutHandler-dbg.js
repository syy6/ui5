sap.ui.define(["jquery.sap.global", "sap/ui/base/Object", "sap/f/FlexibleColumnLayoutSemanticHelper", "sap/f/LayoutType"],
	function(jQuery, BaseObject, FlexibleColumnLayoutSemanticHelper, LayoutType) {
		"use strict";
		
		// routing helper is not part of sap.ui.define in order to avoid cyclic dependencies
		function onRoutingHelper(fnOnRoutingHelper){
			sap.ui.require(["sap/suite/ui/generic/template/lib/routingHelper"], fnOnRoutingHelper);
		}
		
		var oResolvedPromise = Promise.resolve(); // constant for a trivial resolved Promise
		
		var iDefaultColumn = 2;
		
		var aColumnNames = ["begin", "mid", "end"];
		
		var aMessagePageTargets = ["messagePageBeginColumn", "messagePageMidColumn", "messagePageEndColumn"];
		
		function tVL(iViewLevel){
			return aColumnNames[iViewLevel] ? iViewLevel : iDefaultColumn;
		}
		
		function isInsideFCL(iViewLevel){
			return 	tVL(iViewLevel) === iViewLevel;
		}
		
		function getPagesAggregation(iViewLevel){
			return 	aColumnNames[tVL(iViewLevel)] + "ColumnPages";
		}
		
		function createMessagePageTargets(fnCreateAdditionalMessageTarget){
			for (var i = 0; i < aColumnNames.length; i++){
				fnCreateAdditionalMessageTarget(aMessagePageTargets[i], getPagesAggregation(i));	
			}
		}
		
		function getTargetForMessagePage(iViewLevel){
			return aMessagePageTargets[tVL(iViewLevel)];
		}
		
		function getColumnForViewLevel(iViewLevel){
			return 	aColumnNames[tVL(iViewLevel)];
		}
		
		function isQueryRoute(oRoute){
			return oRoute.name.length > 5 && oRoute.name.lastIndexOf("query") === oRoute.name.length - "query".length;
		}

		function getItemsArrayFromTable(oTable) {
			var aItems;
			if (oTable instanceof sap.ui.table.Table) {
				aItems = oTable.getRows();
			} else if (oTable instanceof sap.m.Table) {
				aItems = oTable.getItems();
			}	
			return aItems;
		}

		function getFirstItemInTable(oTable) {
			// Returns the first item of the list which is not a grouping item. Returns a faulty value if list is empty.
			var aItems = getItemsArrayFromTable(oTable);
			var vRet = aItems ? aItems[0] : false;
			return vRet;
		}

		function getMethods(oFlexibleColumnLayout, oNavigationControllerProxy) {
			var oManifestEntryGenricApp = oNavigationControllerProxy.oTemplateContract.oAppComponent.getConfig();
			var oFCLSettings = oManifestEntryGenricApp.settings.flexibleColumnLayout; // if this is not truthy the instance will not be created
			var oFlexibleColumnLayoutSemanticHelper = FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFlexibleColumnLayout, oFCLSettings);
			var oDefaultUiLayouts = oFlexibleColumnLayoutSemanticHelper.getDefaultLayouts();
			var oRouteMatchedEventEndColumn; // TODO1: Comment this
			var oLastRoute;
			var oUiState;
			var sCurrentLayout;
			var sStoredTargetLayout;
			var iMessagePageColumn = -1;
			
			var oTemplateContract =	oNavigationControllerProxy.oTemplateContract,
				oRouter = oNavigationControllerProxy.oRouter;
			
			// it is possible to use the FCL with 3 columns which is the default. But you can also have 2 columns as maximum. Further views are displayed in fullscreen mode	
			var iMaxColumnCountInFCL = oFCLSettings.maxColumnCountInFCL || 3;
			
			// if this is true we trigger a search in list report on startup and load the first entry for the second column. This is basically the master/detail mode.
			var bLoadListAndFirstEntryOnStartup = oFCLSettings.initialColumnsCount === 2;
			
			// if this is true we load the next item in the second column after the current object is deleted. If this is false we close the column.
			var bDisplayNextObjectAfterDelete = oFCLSettings.displayNextObjectAfterDelete === true; 
			
			function getPreferedColumnCount(iViewLevel){
				if (iViewLevel >= iMaxColumnCountInFCL || sap.ui.Device.system.phone) {
					return 1;
				}
				var initialColumnsCount = oFCLSettings.initialColumnsCount || 1;
				var iRet = Math.max(iViewLevel + 1, initialColumnsCount);
				if (sap.ui.Device.system.tablet && iRet > 2){
					return 2;
				}
				return iRet;
			}

			// Adapts the route and returns the control aggregation
			function fnAdaptRoutingInfo(oRoute, sTargetName, aPredecessorTargets) {
				var iViewLevel = oRoute.viewLevel;
				var iPreferedColumnCount = getPreferedColumnCount(iViewLevel);
				// Note: If iViewLevel === 2 and iPreferredColumnCount === 2 (tablet case)
				// still all 3 columns should be available although only 2 of them will be visible at the same time.
				oRoute.showBeginColumn = iViewLevel === 0 || iPreferedColumnCount > 1;
				oRoute.showMidColumn = iViewLevel === 1 || iPreferedColumnCount > 1;
				oRoute.showEndColumn = iViewLevel > 1;
				
				if (iPreferedColumnCount === 1){
					oRoute.target = sTargetName;
				} else if (iViewLevel === 0){
					oRoute.target = [sTargetName, oRoute.pages[0].entitySet];
				} else {
					oRoute.target = aPredecessorTargets.concat([sTargetName]);
				}

				return getPagesAggregation(iViewLevel);
			}
			
			function isLayoutDefault(sLayout){
				// temporary solution
				if (sLayout === "OneColumn" && bLoadListAndFirstEntryOnStartup){
					return false;
				}
				
				return sLayout === oDefaultUiLayouts.defaultLayoutType || sLayout === oDefaultUiLayouts.defaultTwoColumnLayoutType || sLayout === oDefaultUiLayouts.defaultThreeColumnLayoutType;
			}
			
			function activateView(oActivationInfo, sPath, sRouteName) {
				var oPromise = oTemplateContract.mRouteToTemplateComponentPromise[sRouteName];
				if (oPromise) {
					return oPromise.then(function(oComponent) {
						return oNavigationControllerProxy.activateOneComponent(sPath, oActivationInfo, oComponent);
					});
				}
				return oResolvedPromise;
			}

			function removeQueryInRouteName(sRouteName) {
				// remove query in sRouteName
				var checkForQuery = sRouteName.substring(sRouteName.length - 5, sRouteName.length);
				if (checkForQuery === "query") {
					return sRouteName.substring(0, sRouteName.length - 5);
				}
				return sRouteName;
			}
			
			function fnAfterActivation(aActivationPromises){
				return Promise.all(aActivationPromises).then(oNavigationControllerProxy.afterActivation);
			}
			
			function fnReplaceLayoutInHash(sNewLayout, bReplace) {
				var bIsDefault = isLayoutDefault(sNewLayout);
				// check wether we are in a query route
				if (oLastRoute && isQueryRoute(oLastRoute)) {
					oLastRoute.arguments.query = oLastRoute.arguments["?query"];
					if (bIsDefault){
						delete oLastRoute.arguments.query.FCLLayout;
						if (jQuery.isEmptyObject(oLastRoute.arguments.query)){
							delete oLastRoute.arguments.query;
							oLastRoute.name = removeQueryInRouteName(oLastRoute.name);
						}
					} else {
						oLastRoute.arguments.query.FCLLayout = sNewLayout;
					}
				} else if (!bIsDefault){
					oLastRoute.name = oLastRoute.name + "query";
					oLastRoute.arguments.query = {
						FCLLayout : sNewLayout
					};
				}

				var sHash = oRouter.getURL(oLastRoute.name, oLastRoute.arguments);
				// router put unwanted / to the end of the route
				sHash = sHash.replace("/?", "?");
				oNavigationControllerProxy.navigate(sHash, bReplace);
			}
			
			// This method returns a Promise that resolves to the path to be used for the mid column.
			// Note that there are two notions of this path:
			// a) The path to be used for navigation
			// b) The path to be used for binding
			// If the mid column contains a standard object page these two pathes are identical (they have the form <entitySet>(<key>) in this case).
			// If the mid column contains a page not based on OData (canvas page) the pathes are different.
			// In this case the path used for binding will be empty, whereas the path used for navigation will be set according to the pattern of the corresponding route (as usual)
			function getMidColumnPathPromise(oConfig, oEvent, bForODataBinding){
				var oRouteViewLevel1 = oNavigationControllerProxy.getAncestralRoute(oEvent, 1);
				var oTreeNode = oNavigationControllerProxy.oTemplateContract.mRoutingTree[oRouteViewLevel1.name];
				if (bForODataBinding && oTreeNode.noOData){
					return Promise.resolve();
				}
				return new Promise(function(fnResolve){
					onRoutingHelper(function(routingHelper) {
						fnResolve(routingHelper.determinePath(oConfig, oEvent, oRouteViewLevel1.pattern));
					});
				});
			}
			
			// Returns a Promise that resolves to an object that may have the following three attributes: begin, middle, end.
			// The availability of the attributes depends on the availability of the corresponding column according to the current viewe level.
			// Each of the attributes will be an object with the following attributes:
			// - route: Name of the route leading to the view in this column
			// - path: The OData path that this view should be bound to
			// - isVisible: The information whether this column is really visible
			function fnDetermineRoutesAndPathes(){
				var fnPromise = function(fnResolve, fnReject){
					var oRet = {};
					if (!oLastRoute){ //this is the case if this method is called before first route matched (due to resize)
						fnReject();
						return;
					}
					var iViewLevel = oLastRoute.event.getParameter("config").viewLevel;
					if (iViewLevel < 3){
						oRet.begin = {
							route: "root",
							path: "",
							isVisible: oUiState.columnsVisibility.beginColumn
						};
						
						if (iViewLevel === 0){
							fnResolve(oRet);
							return;
						}
					}
					var sRouteName = removeQueryInRouteName(oLastRoute.name);
					
					if (iViewLevel > 0){
						var sPar = getColumnForViewLevel(iViewLevel);
						oRet[sPar] = {
							route: sRouteName,
							path: oLastRoute.path,
							isVisible: iViewLevel > 2 || (iViewLevel === 1 && oUiState.columnsVisibility.midColumn) || (iViewLevel === 2 && oUiState.columnsVisibility.endColumn)
						};
					}
					
					if (iViewLevel === 2) { // activate view in midColumn if we show endColumn
						getMidColumnPathPromise(oLastRoute.routeConfig, oLastRoute.event, true).then(function(sMidColumnPath){
							var oRouteViewLevel1 = oNavigationControllerProxy.getAncestralRoute(oLastRoute.event, 1);
							oRet.mid = {
								route: oRouteViewLevel1.name,
								path: sMidColumnPath,
								isVisible: oUiState.columnsVisibility.midColumn
							};
							fnResolve(oRet);
						});
					} else {
						fnResolve(oRet);
					}
				};
				return new Promise(fnPromise);
			}

			function fnAdaptToVisibilityChange(oVisibilityChanged){
				var oRoutesAndPathesPromise = fnDetermineRoutesAndPathes();
				oRoutesAndPathesPromise.then(function(oRoutesAndPathes){
					var aActivationPromises = [];
					var aStaysVisible = [oRoutesAndPathes.begin, oRoutesAndPathes.mid, oRoutesAndPathes.end];
					var oActivationInfo = oNavigationControllerProxy.performPseudoHashChange(aStaysVisible);
					for (var sColumn in oVisibilityChanged){
						if (oVisibilityChanged[sColumn]){
							var oColumnInfo = oRoutesAndPathes[sColumn];
							if (oColumnInfo){
								aActivationPromises.push(activateView(oActivationInfo, oColumnInfo.path, oColumnInfo.route));
							}
							// Note: deactivation is handled by the afterActivation
						}
					}
					fnAfterActivation(aActivationPromises);
				}, jQuery.noop);
			}
			
			function isVisuallyFullscreen(){
				return !(oUiState.columnsVisibility.beginColumn ? oUiState.columnsVisibility.midColumn :  oUiState.columnsVisibility.midColumn && oUiState.columnsVisibility.endColumn);
			}

			function fnAdaptLayout(bChangedRoute){
				var oNewUiState = oFlexibleColumnLayoutSemanticHelper.getCurrentUIState();
				var oVisibilityChanged = {};
				oVisibilityChanged.end = oUiState && (oUiState.columnsVisibility.endColumn !== oNewUiState.columnsVisibility.endColumn);
				oVisibilityChanged.mid = oUiState && (oUiState.columnsVisibility.midColumn !== oNewUiState.columnsVisibility.midColumn);
				oVisibilityChanged.begin = oUiState && (oUiState.columnsVisibility.beginColumn !== oNewUiState.columnsVisibility.beginColumn);
				oUiState = oNewUiState;
				
				oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/midActionButtons", {
					fullScreen: oUiState.actionButtonsInfo.midColumn.fullScreen !== null,
					exitFullScreen: oUiState.actionButtonsInfo.midColumn.exitFullScreen !== null,
					closeColumn: oUiState.actionButtonsInfo.midColumn.closeColumn !== null
				});
				oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/endActionButtons", {
					fullScreen: oUiState.actionButtonsInfo.endColumn.fullScreen !== null,
					exitFullScreen: oUiState.actionButtonsInfo.endColumn.exitFullScreen !== null,
					closeColumn: oUiState.actionButtonsInfo.endColumn.closeColumn !== null
				});
				oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/isVisuallyFullScreen", isVisuallyFullscreen());
				var iHighestViewLevel;
				if (oUiState.columnsVisibility.endColumn){
					iHighestViewLevel = oTemplateContract.oTemplatePrivateGlobalModel.getProperty("/generic/routeLevel");	
				} else if (oUiState.columnsVisibility.midColumn) {
					iHighestViewLevel = 1;
				} else {
					iHighestViewLevel = 0;
				}
				oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/highestViewLevel", iHighestViewLevel);
				
				var iLowestDetailViewLevel;
				if (oUiState.columnsVisibility.midColumn){
					iLowestDetailViewLevel = 1;
				} else {
					iLowestDetailViewLevel = oTemplateContract.oTemplatePrivateGlobalModel.getProperty("/generic/routeLevel");
				}
				oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/lowestDetailViewLevel", iLowestDetailViewLevel);
				
				if (oLastRoute && sCurrentLayout !== oUiState.layout){
					fnReplaceLayoutInHash(oUiState.layout, true);
				} else if ((oVisibilityChanged.begin || oVisibilityChanged.mid || oVisibilityChanged.end)  && !bChangedRoute){
					fnAdaptToVisibilityChange(oVisibilityChanged);	
				}
			}

			// we expect oEvent to be a cloned version of UI5 event
			function fnDetermineAndSetContextPath(oEvent, oRouteConfig, sPath, oActivationInfo) {
				return new Promise(function(fnResolve, fnReject){
					fnAdaptLayout(true);
					var oRoutesAndPathPromise = fnDetermineRoutesAndPathes();
					oRoutesAndPathPromise.then(function(oRoutesAndPathes){
						var aActivationPromises = [];
						for (var sColumn in oRoutesAndPathes){
							var oColumnInfo = oRoutesAndPathes[sColumn];
							if (oColumnInfo.isVisible){
								aActivationPromises.push(activateView(oActivationInfo, oColumnInfo.path, oColumnInfo.route));
							}
						}
						fnAfterActivation(aActivationPromises).then(fnResolve, fnReject);
					});
				});
			}
			
			function fnHandleBeforeRouteMatched(oEvent){
				oEvent = jQuery.extend({}, oEvent); // as this handler works partially asynchronous and events are pooled by UI5, we create a defensive copy
				oLastRoute = {
					name: oEvent.getParameter("name"),
					arguments: oEvent.getParameter("arguments"),
					event: oEvent
				};
				
				var iViewLevel = oEvent.getParameter("config").viewLevel;
				var oQuery = oLastRoute.arguments["?query"];
				if (isInsideFCL(iViewLevel)){
					sCurrentLayout = (oQuery && oQuery.FCLLayout);
					if (!sCurrentLayout){
						switch (iViewLevel){
							case 0:
								var oColumnsVisibility = oFlexibleColumnLayoutSemanticHelper.getNextUIState(0).columnsVisibility;
								if (oColumnsVisibility.midColumn) {
									sCurrentLayout = oDefaultUiLayouts.defaultTwoColumnLayoutType;
								} else {
									// this is needed if we are in Master/Detail AND Device === Phone or desktop browser in size S
									sCurrentLayout = oDefaultUiLayouts.defaultLayoutType;
									if (getPreferedColumnCount(iViewLevel) > 1) { // this is the case if we have a desktop browser in size S
										fnReplaceLayoutInHash(oDefaultUiLayouts.defaultLayoutType,true);
									}
								}
								break;
							case 1:
								sCurrentLayout = oDefaultUiLayouts.defaultTwoColumnLayoutType;
								break;
							case 2:
								sCurrentLayout = oDefaultUiLayouts.defaultThreeColumnLayoutType;
						}
					}
				} else {
					sCurrentLayout = LayoutType.EndColumnFullScreen;
				}

				oFlexibleColumnLayout.setLayout(sCurrentLayout);
			}

			// we expect oEvent to be a cloned version of UI5 event
			// if oActivationInfo is truthy this function returns a Promise that indicates when the context pathes have been set for the columns
			// if oActivationInfo is faulty this method is called within a state change (see NavigationController for details).
			// In this case the context pathes remain unchanged. However, still some state must be adjusted.
			function fnHandleRouteMatched(oEvent, oRouteConfig, sPath, oActivationInfo) {
				iMessagePageColumn = -1;
				var iRouteLevel = oTemplateContract.oTemplatePrivateGlobalModel.getProperty("/generic/routeLevel");
				oRouteMatchedEventEndColumn = iRouteLevel === 2 ? oEvent : null;
				
				oLastRoute.path = sPath;
				oLastRoute.routeConfig = oRouteConfig;
				
				return oActivationInfo && fnDetermineAndSetContextPath(oEvent, oRouteConfig, sPath, oActivationInfo);
			}

			function getAppStateFromLayout(sLayout){
				return isLayoutDefault(sLayout) ? {}  : {
					FCLLayout: [sLayout]
				};
			}
			
			function isFullscreenLayout(sLayout){
				return sLayout === LayoutType.EndColumnFullScreen || sLayout === LayoutType.MidColumnFullScreen;
			}

			// returns a Promise that resolves to the parameter string for the given route. iLevel is the level of this route.
			function getAppStateParStringForNavigation(sRoute, iLevel, oAppStates) {
				if (!isInsideFCL(iLevel)) {
					return oNavigationControllerProxy.getParStringPromise(oAppStates, false);
				}				
				var sNextUiLayout = sStoredTargetLayout || oFlexibleColumnLayoutSemanticHelper.getNextUIState(iLevel).layout;		
				jQuery.extend(oAppStates, getAppStateFromLayout(sNextUiLayout));
				sStoredTargetLayout = null;
				if (isFullscreenLayout(sNextUiLayout)){
					return oNavigationControllerProxy.getParStringPromise(oAppStates, false);	
				}
				var oLevel1Promise; 
				if (iLevel === 2){
					var oTreeNode = oTemplateContract.mRoutingTree[sRoute];
					var routeViewLevel1Name = oTreeNode.parentRoute;
					oLevel1Promise = oNavigationControllerProxy.addUrlParameterInfoForRoute(routeViewLevel1Name, oAppStates);
				} else {
						oLevel1Promise = Promise.resolve();	
				}
				return new Promise(function(fnResolve){
					oLevel1Promise.then(function(){
						oNavigationControllerProxy.getParStringPromise(oAppStates, true).then(fnResolve);	
					});	
				});				
			}

			/******************************************
			 * begin: Event Handlers for common FCL Action Buttons
			 ******************************************/

			function onCloseMidColumnPressed() {
				sStoredTargetLayout = oUiState.actionButtonsInfo.midColumn.closeColumn;
				oNavigationControllerProxy.navigateToRoot(true);
			}

			function onCloseEndColumnPressed() {
				sStoredTargetLayout = oUiState.actionButtonsInfo.endColumn.closeColumn;
				var oRouteConfigEndColumn = oRouteMatchedEventEndColumn.getParameter("config");
				getMidColumnPathPromise(oRouteConfigEndColumn, oRouteMatchedEventEndColumn).then(function(sMidColumnPath){
					// TODO2: check whether DisplayMode can be determined in advance
					oNavigationControllerProxy.navigateToContext(sMidColumnPath, null, true, 0);
				});		
			}
			
			function fnNavigateByReplacingAppState(oAppStates, bAddLevel0Info){
				var sHash = oNavigationControllerProxy.oHashChanger.getHash() || "";
				sHash = sHash.split("?")[0];			
				var oParStringPromise = oNavigationControllerProxy.getParStringPromise(oAppStates, bAddLevel0Info);
				oNavigationControllerProxy.navigateToParStringPromise(sHash, oParStringPromise, undefined,  false, undefined, true);					
			}

			function getFullscreenLayout(iViewLevel){
				if (iViewLevel === 0 && isListAndFirstEntryLoadedOnStartup()){
					return LayoutType.OneColumn;
				} else if (iViewLevel === 1){
					return LayoutType.MidColumnFullScreen;
				} else if (iViewLevel === 2){
					return LayoutType.EndColumnFullScreen;
				} else {
					return "";
				}
			}
			
			function onFullscreenColumnPressed() {
				// we rely on the fact that fullScreen property is not null for exactly one column
				var sTargetLayout = oUiState.actionButtonsInfo.midColumn.fullScreen;
				var sRoute;
				if (sTargetLayout === null){
					sTargetLayout = oUiState.actionButtonsInfo.endColumn.fullScreen;
					var aComponents = oNavigationControllerProxy.getActiveComponents();
					for (var i = 0; i < aComponents.length; i++){
						var oRegistryEntry = oTemplateContract.componentRegistry[aComponents[i]];
						if (oRegistryEntry.viewLevel === 2){
							sRoute = oRegistryEntry.route;
							break;
						}
					}
				} else {
					var oRouteViewLevel1 = oNavigationControllerProxy.getAncestralRoute(oLastRoute.event, 1);
					sRoute = oRouteViewLevel1.name;
				}
				var oAppStates = getAppStateFromLayout(sTargetLayout);
				oNavigationControllerProxy.addUrlParameterInfoForRoute(sRoute, oAppStates).then(function(){
					fnNavigateByReplacingAppState(oAppStates, false);
				});
			}

			function onExitFullscreenColumnPressed() {
				// we rely on the fact that exitFullScreen property is not null for exactly one column
				var sTargetLayout = oUiState.actionButtonsInfo.midColumn.exitFullScreen;
				var oLevel2Promise;
				var oMidColumnPathPromise;
				if (sTargetLayout === null){
					sTargetLayout = oUiState.actionButtonsInfo.endColumn.exitFullScreen;
				}
				var oAppStates = getAppStateFromLayout(sTargetLayout);
				if (sTargetLayout === oUiState.actionButtonsInfo.endColumn.exitFullScreen){
					var aComponents = oNavigationControllerProxy.getActiveComponents();
					var sComponentId = aComponents[0];
					var oRegistryEntry = oTemplateContract.componentRegistry[sComponentId];
					if (oRegistryEntry){
						oLevel2Promise = oNavigationControllerProxy.addUrlParameterInfoForRoute(oRegistryEntry.route, oAppStates);
						oMidColumnPathPromise = getMidColumnPathPromise(oLastRoute.routeConfig, oLastRoute.event);
					}
				}
				(oLevel2Promise || oResolvedPromise).then(function(){
					(oMidColumnPathPromise || oResolvedPromise).then(function(sMidColumnPath){
						var oRouteViewLevel1 = oNavigationControllerProxy.getAncestralRoute(oLastRoute.event, 1);
						var oLevel1Promise = oNavigationControllerProxy.addUrlParameterInfoForRoute(oRouteViewLevel1.name, oAppStates, sMidColumnPath);
						oLevel1Promise.then(function(){
							fnNavigateByReplacingAppState(oAppStates, true);
						});
					});
				});
			}

			function getActionButtonHandlers(iViewLevel) {
				return isInsideFCL(iViewLevel) && {
					onCloseColumnPressed: iViewLevel === 1 ? onCloseMidColumnPressed : onCloseEndColumnPressed,
					onFullscreenColumnPressed: onFullscreenColumnPressed,
					onExitFullscreenColumnPressed: onExitFullscreenColumnPressed
				};
			}

			/******************************************
			 * end: Event Handlers for common FCL Action Buttons
			 *******************************************/
			 
			function getDraftSibling(oContext) {
				return oTemplateContract.oApplicationProxy.getDraftSiblingPromise(oContext);                         
			}
			
			function fnGetNoODataSuffix(oRouteConfigEndColumn){
				if (oRouteConfigEndColumn.routingSpec && oRouteConfigEndColumn.routingSpec.noOData){
					var sPattern = oRouteConfigEndColumn.pattern.replace("{?query}", "").split("/")[1];
					var sKey = oNavigationControllerProxy.getCurrentKeys(2)[2];
					return sPattern.replace("{keys2}", sKey);
				}
			}
			
			function fnNavigateToDraft(oDraftContextRootEntity) {
				// navigate to draft
				if (oTemplateContract.oTemplatePrivateGlobalModel.getProperty("/generic/FCL/highestViewLevel") === 2){
					var fnNav = function(sSuffix){
						var sContextPath = oDraftContextRootEntity.getPath() + "/" + sSuffix;
						sStoredTargetLayout = oUiState.layout;
						oNavigationControllerProxy.navigateToContext(sContextPath, null, true, 2, true);						
					};
					var oRouteConfigEndColumn = oRouteMatchedEventEndColumn.getParameter("config");
					var sSuffix = fnGetNoODataSuffix(oRouteConfigEndColumn);
					if (sSuffix){
						fnNav(sSuffix);
						return;
					}
					var oComponentPromise = oTemplateContract.mRouteToTemplateComponentPromise[removeQueryInRouteName(oRouteConfigEndColumn.name)];
					var oNavigationPromise = new Promise(function(fnResolveNavigation, fnRejectNavigation){
						oComponentPromise.then(function(oComponent){
							var oBindingContextEndColumn = oComponent.getBindingContext();
							var oDraftSiblingPromise = getDraftSibling(oBindingContextEndColumn, true);
							oDraftSiblingPromise.then(function(oDraftContext){
								onRoutingHelper(function(routingHelper) {
									var sNavigationProperty = oRouteConfigEndColumn.navigationProperty;
									fnNav(routingHelper.determineNavigationPath(oDraftContext, sNavigationProperty).path);
									fnResolveNavigation();
								});
							},  fnRejectNavigation);
						},  fnRejectNavigation);
					});
					oTemplateContract.oBusyHelper.setBusy(oNavigationPromise);
				} else {
					oNavigationControllerProxy.navigateToContext(oDraftContextRootEntity, null, true, 2, true);
				}
			 }
			
			function getTargetAfterCancelPromise(oActive){
				if (oTemplateContract.oTemplatePrivateGlobalModel.getProperty("/generic/FCL/highestViewLevel") !== 2){
					return Promise.resolve(oActive);
				}
				var oRouteConfigEndColumn = oRouteMatchedEventEndColumn.getParameter("config");
				var sSuffix = fnGetNoODataSuffix(oRouteConfigEndColumn);
				if (sSuffix){
					return Promise.resolve(oActive.getPath() + "/" + sSuffix);
				}
				var oRet = new Promise(function(fnResolve){
					var oComponentPromise = oTemplateContract.mRouteToTemplateComponentPromise[removeQueryInRouteName(oRouteConfigEndColumn.name)];
					oComponentPromise.then(function(oComponent){
						var oBindingContextEndColumn = oComponent.getBindingContext();
						var oDraftSiblingPromise = getDraftSibling(oBindingContextEndColumn, true);
						oDraftSiblingPromise.then(function(oDraftContext){
							if (!oDraftContext){
								fnResolve(oActive);
								return;
							}
							onRoutingHelper(function(routingHelper) {
								var sNavigationProperty = oRouteConfigEndColumn.navigationProperty;
								var sContextPath = oActive.getPath() + "/" + routingHelper.determineNavigationPath(oDraftContext, sNavigationProperty).path;
								fnResolve(sContextPath);
							});
						});
					});
				});
				oTemplateContract.oBusyHelper.setBusy(oRet);
				return oRet;
			}
			
			oTemplateContract.oTemplatePrivateGlobalModel.setProperty("/generic/FCL", { });
			
			// This function indicates if a new HistoryEntry is required.
			// A new HistoryEntry is only required if the user navigates to an object which will be displayed in a new column.
			// If the object will be displayed in a column which is already visible no HistoryEntry is required
			function isNewHistoryEntryRequired(oTarget){
				var iTargetLevel = oNavigationControllerProxy.getTargetLevel(oTarget);
				
				switch (iTargetLevel){
					case 1:
						return !oUiState.columnsVisibility.midColumn;
					case 2:
						return !oUiState.columnsVisibility.endColumn;
					default:
						return true;
				}
			}
			
			function fnCloseRightColumns(iViewLevel) {
				sCurrentLayout = oFlexibleColumnLayoutSemanticHelper.getNextUIState(iViewLevel).layout;
				oFlexibleColumnLayout.setLayout(sCurrentLayout);
			}
			
			function isAppTitlePrefered(){
				return !isVisuallyFullscreen();
			}
			
			function fnDisplayMessagePage(mParameters){
				iMessagePageColumn = tVL(mParameters.viewLevel);
				fnCloseRightColumns(mParameters.viewLevel);
				var oTargets = oNavigationControllerProxy.oRouter.getTargets();
				var sTarget = getTargetForMessagePage(mParameters.viewLevel);
				oTargets.display(sTarget);
				var aStaysVisible;
				if (mParameters.viewLevel === iMessagePageColumn){
					aStaysVisible = [];
					for (var i = 0; i < mParameters.viewLevel; i++){
						aStaysVisible.push(true);
					}
				}
				return aStaysVisible;
			}
			
			// Is the view on level iViewLevel displayed and is it not the MessagePage
			function isLevelActive(iViewLevel){
				if (iViewLevel < iMessagePageColumn || iMessagePageColumn < 0){
					return oUiState.columnsVisibility[getColumnForViewLevel(iViewLevel) + "Column"];
				}
				return false;
			}
			
			function fnAdaptBreadCrumbUrl(sHash, iViewLevel){
				if (!isInsideFCL(iViewLevel)){
					return sHash;
				}
				var sLayout = oFlexibleColumnLayoutSemanticHelper.getNextUIState(iViewLevel).layout;
				if (isLayoutDefault(sLayout)){
					return sHash;
				}
				return sHash + "?FCLLayout=" + sLayout;
			}

			function getMaxColumnCountInFCL(){
				return iMaxColumnCountInFCL;
			}

			function handleListReceived(oItem, fnNavigateToItem){
				if (!bLoadListAndFirstEntryOnStartup) {
					return;
				}
				var bNavigateToFirstListItem = false;
				var oColumnsVisibility = oFlexibleColumnLayoutSemanticHelper.getNextUIState(0).columnsVisibility;
				if (oColumnsVisibility.midColumn) {
					var iViewLevel = oLastRoute.event.getParameter("config").viewLevel;
					if (iViewLevel === 0) { // only ListReport is shown
						bNavigateToFirstListItem = true;
						if (isQueryRoute(oLastRoute)) {
							oLastRoute.arguments.query = oLastRoute.arguments["?query"];
							if (oLastRoute.arguments.query.FCLLayout === "OneColumn"){
								bNavigateToFirstListItem = false;	
							}
						}
					}
				}
				if (bNavigateToFirstListItem) {
					if (oItem) {
						fnNavigateToItem(oItem);
					} else {
						// closeSecondColumn
						oNavigationControllerProxy.navigateToRoot(true);
					}
				} else {
					return; // do nothing
				}
			}
			
			function isNextObjectLoadedAfterDelete(){
				return bDisplayNextObjectAfterDelete;
			}
			
			function isListAndFirstEntryLoadedOnStartup(){
				return bLoadListAndFirstEntryOnStartup;
			}
			
			function handleDataReceived(oTable, oState, oTemplateUtils) {
				var oItem;
				 // then the list was refreshed or the app has been started
				// store oTable in Application; this is needed to display the correct object after delete
				oItem = getFirstItemInTable(oTable);
				oTemplateContract.oApplicationProxy.setListReportTable(oTable);

				if (isListAndFirstEntryLoadedOnStartup && isListAndFirstEntryLoadedOnStartup()) {	
					handleListReceived(oItem, function() {
						setTimeout(function(){
							oTemplateUtils.oCommonEventHandlers.onListNavigate(oItem, oState);
						},0);
					});
				}
			}
			
			function setStoredTargetLayoutToOneColumn(){
				sStoredTargetLayout = LayoutType.OneColumn;
			}
			
			function setStoredTargetLayoutToFullscreen(iLevel){
				if (iLevel > 2){
					sStoredTargetLayout = "";
				} else {	
					sStoredTargetLayout = getFullscreenLayout(iLevel);
				}
			}
			
			function getFclProxyForView(iViewLevel) {
				return {
					oActionButtonHandlers: getActionButtonHandlers(iViewLevel),
					navigateToDraft: fnNavigateToDraft,
					getMaxColumnCountInFCL: getMaxColumnCountInFCL,
					handleListReceived: handleListReceived,
					handleDataReceived: handleDataReceived,
					isListAndFirstEntryLoadedOnStartup: isListAndFirstEntryLoadedOnStartup
				};
			}
	
			oFlexibleColumnLayout.attachStateChange(fnAdaptLayout.bind(null, false));
			
			return {
				adaptRoutingInfo: fnAdaptRoutingInfo,
				createMessagePageTargets: createMessagePageTargets,
				displayMessagePage: fnDisplayMessagePage,
				isLevelActive: isLevelActive,
				handleBeforeRouteMatched: fnHandleBeforeRouteMatched,
				handleRouteMatched: fnHandleRouteMatched,
				getAppStateParStringForNavigation: getAppStateParStringForNavigation,
				getActionButtonHandlers: getActionButtonHandlers,
				getTargetAfterCancelPromise: getTargetAfterCancelPromise,
				isNewHistoryEntryRequired: isNewHistoryEntryRequired,
				adaptBreadCrumbUrl: fnAdaptBreadCrumbUrl,
				isAppTitlePrefered: isAppTitlePrefered,
				getFullscreenLayout: getFullscreenLayout,
				getMaxColumnCountInFCL: getMaxColumnCountInFCL,
				isNextObjectLoadedAfterDelete: isNextObjectLoadedAfterDelete,
				getFclProxyForView: getFclProxyForView,
				setStoredTargetLayoutToOneColumn: setStoredTargetLayoutToOneColumn,
				isListAndFirstEntryLoadedOnStartup: isListAndFirstEntryLoadedOnStartup,
				setStoredTargetLayoutToFullscreen:setStoredTargetLayoutToFullscreen
			};
		}

		return BaseObject.extend("sap.suite.ui.generic.template.lib.FlexibleColumnLayoutHandler", {
			constructor: function(oFlexibleColumnLayout, oNavigationControllerProxy) {
				jQuery.extend(this, getMethods(oFlexibleColumnLayout, oNavigationControllerProxy));
			}
		});
	});