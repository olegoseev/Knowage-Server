/*
Knowage, Open Source Business Intelligence suite
Copyright (C) 2016 Engineering Ingegneria Informatica S.p.A.

Knowage is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

Knowage is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function() {
angular.module('cockpitModule')
	.directive('cockpitSelectorWidget',function(cockpitModule_widgetServices,$mdDialog,$rootScope){
		return{
			templateUrl: baseScriptPath+ '/directives/cockpit-widget/widget/selectorWidget/templates/selectorWidgetTemplate.html',
			controller: cockpitSelectorWidgetControllerFunction,
			compile: function (tElement, tAttrs, transclude) {
				return {
					pre: function preLink(scope, element, attrs, ctrl, transclud) {
						element[0].classList.add("flex");
						element[0].classList.add("layout-column");
						element[0].classList.add("layout-fill");
					},
					post: function postLink(scope, element, attrs, ctrl, transclud) {
						//init the widget
						element.ready(function () {
							scope.initWidget();
						});
					}
				};
			}

		}
	})
	
	function cockpitSelectorWidgetControllerFunction(
			$scope,
			$mdDialog,
			$mdToast,
			$timeout,
			$mdPanel,
			$q,
			$filter,
			sbiModule_translate,
			sbiModule_restServices,
			cockpitModule_datasetServices,
			cockpitModule_widgetConfigurator,
			cockpitModule_widgetServices,
			cockpitModule_widgetSelection,
			cockpitModule_properties,
			accessibility_preferences,
			$rootScope){

		$scope.accessibilityModeEnabled = accessibility_preferences.accessibilityModeEnabled;
		if ($scope.ngModel && $scope.ngModel.dataset && $scope.ngModel.dataset.dsId){
			$scope.ngModel.dataset.isRealtime = cockpitModule_datasetServices.getDatasetById($scope.ngModel.dataset.dsId).isRealtime;
			$scope.ngModel.dataset.name = cockpitModule_datasetServices.getDatasetById($scope.ngModel.dataset.dsId).name;
		}
		$scope.parameter = "";
		$scope.selectedTab = {'tab' : 0};
		$scope.widgetIsInit=false;
		$scope.totalCount = 0;
		$scope.translate = sbiModule_translate;
		$scope.cockpitModule_widgetSelection = cockpitModule_widgetSelection;
		
		
		$scope.datasetRecords = {};	
		$scope.realTimeSelections = cockpitModule_widgetServices.realtimeSelections;
		//set a watcher on a variable that can contains the associative selections for realtime dataset
		var realtimeSelectionsWatcher = $scope.$watchCollection('realTimeSelections',function(newValue,oldValue,scope){
			if(scope.ngModel && scope.ngModel.dataset && scope.ngModel.dataset.dsId){
				var dataset = cockpitModule_datasetServices.getDatasetById(scope.ngModel.dataset.dsId);
				if(cockpitModule_properties.DS_IN_CACHE.indexOf(dataset.label)==-1 ){
	                cockpitModule_properties.DS_IN_CACHE.push(dataset.label);
	            }
				if(newValue != oldValue && newValue.length > 0){
					scope.itemList = scope.filterDataset(scope.itemList,scope.reformatSelections(newValue));
				}else{
					angular.copy(scope.savedRows, scope.itemList);
				}
			}
		});
	
		if(!$scope.ngModel.settings){
			$scope.ngModel.settings = {};
		}
	
		if(!$scope.ngModel.style){
			$scope.ngModel.style={};
		}
		if(!$scope.ngModel.settings.summary){
			$scope.ngModel.settings.summary={
					'enabled': false,
					'forceDisabled': false,
					'style': {}
			};
		}
		$scope.editWidget=function(index){
			var finishEdit=$q.defer();
			var config = {
					attachTo:  angular.element(document.body),
					controller: selectorWidgetEditControllerFunction,
					disableParentScroll: true,
					templateUrl: baseScriptPath+ '/directives/cockpit-widget/widget/selectorWidget/templates/selectorWidgetEditPropertyTemplate.html',
					position: $mdPanel.newPanelPosition().absolute().center(),
					fullscreen :true,
					hasBackdrop: true,
					clickOutsideToClose: false,
					escapeToClose: false,
					focusOnOpen: true,
					preserveScope: true,
					autoWrap:false,
					locals: {finishEdit: finishEdit, originalModel: $scope.ngModel, getMetadata: $scope.getMetadata, scopeFather: $scope},
	
			};
			$mdPanel.open(config);
			return finishEdit.promise;
		}
		
		$scope.init=function(element,width,height){
			$scope.refreshWidget();
			$timeout(function(){
				$scope.widgetIsInit=true;
			},500);
	
		}

		$scope.selections = [];
		var checkForSavedSelections = function (filtersParams,nature){

			$scope.selections.length = 0;
			if(filtersParams.hasOwnProperty($scope.ngModel.dataset.name)){
				$scope.selections = filtersParams[$scope.ngModel.dataset.name][$scope.ngModel.content.selectedColumn.aliasToShow][0].split(",");
				for (var i = 0; i < $scope.selections.length; i++) {
					$scope.selections[i] = $scope.selections[i].replace("')", "").replace("('", "").replace(/'/g,"")		
				}
			} 
			
			if($scope.selections.length==0){
				$scope.hasDefaultValue = true;
			}
			if( $scope.ngModel.settings.modalityValue=="multiValue"){
				$scope.defaultValue = [];
			} else {
				$scope.defaultValue = "";
			}
			if($scope.hasDefaultValue && nature == "refresh"){
				$scope.defaultValueString = true;
				
				switch($scope.ngModel.settings.defaultValue.toUpperCase()){
				case 'FIRST':
					if(Array.isArray($scope.defaultValue)){
						$scope.defaultValue.push( $scope.datasetRecords.rows[0].column_1)
					} else {
						$scope.defaultValue =  $scope.datasetRecords.rows[0].column_1;
					}
					
					break;
				case 'LAST':
					if(Array.isArray($scope.defaultValue)){
						$scope.defaultValue.push($scope.datasetRecords.rows[$scope.datasetRecords.rows.length-1].column_1);
					} else {
						$scope.defaultValue =  $scope.datasetRecords.rows[$scope.datasetRecords.rows.length-1].column_1;
					}
					break;
				case 'STATIC':
					if(Array.isArray($scope.defaultValue)){
						$scope.defaultValue.push($scope.ngModel.settings.staticValue)
					} else {
						$scope.defaultValue =  $scope.ngModel.settings.staticValue;
					}
					break;
				default:
					if(!Array.isArray($scope.defaultValue)){
						$scope.defaultValue = "";
					} 
					break;
				}
				var item = {};
				item.aggregated=false;
				item.columnName=$scope.ngModel.content.selectedColumn.aliasToShow;
				item.columnAlias=$scope.ngModel.content.selectedColumn.aliasToShow;
				item.ds=$scope.ngModel.dataset.name;
				if($scope.ngModel.settings.defaultValue!=""){
					$scope.doSelection($scope.ngModel.content.selectedColumn.aliasToShow,$scope.defaultValue);
				}
				
			} 
			else{
				$scope.defaultValueString = false; // array
				$scope.defaultValue =  angular.copy($scope.selections); 
			}
		}
		$scope.parameter = []
		var checkInitialSettings = function () {
			if($scope.ngModel.settings.modalityValue=="multiValue"){
				
				if($scope.ngModel.settings.modalityPresent=='COMBOBOX') {
					if(Array.isArray($scope.parameter)){
						$scope.parameter.length=0;
					
					} else {
						$scope.parameter = [];
					}
					Array.prototype.push.apply($scope.parameter, $scope.defaultValue);
					
				} else {
					//multivalue list of checkboxes$scope.parameter.length=0;
					$scope.multiValue.length=0;
					Array.prototype.push.apply($scope.multiValue, $scope.defaultValue);
				}
			} else {
				if(Array.isArray($scope.defaultValue)){
					$scope.parameter = $scope.defaultValue[0];
				} else {
					$scope.parameter = $scope.defaultValue;
				}
				
				
			}
		}
		
		var checkRefreshSettings = function () {
			if($scope.ngModel.settings.modalityValue=="multiValue"){
				
				if($scope.ngModel.settings.modalityPresent=='COMBOBOX') {
					if(Array.isArray($scope.parameter)){
						$scope.parameter.length=0;
					} else {
						$scope.parameter = [];
					}
					Array.prototype.push.apply($scope.parameter, $scope.defaultValue);
				} else {
					//multivalue list of checkboxes
					$scope.multiValue.length=0;

					Array.prototype.push.apply($scope.multiValue, $scope.defaultValue);
					//case from other widget, but not delete from selection || case when all are checked from selector widget
					
				}
			} else {
				if(Array.isArray($scope.defaultValue)){
					$scope.parameter = $scope.defaultValue[0] ? $scope.defaultValue[0]: "";
				} else {
					$scope.parameter = $scope.defaultValue;
				}
				
			}
		}
		
		$scope.refresh=function(element,width,height, datasetRecords,nature){
			if(!$scope.ngModel.dataset.name){
				$scope.ngModel.dataset.name = cockpitModule_datasetServices.getDatasetById($scope.ngModel.dataset.dsId).name;
			}
			$scope.filtersParams = angular.copy($scope.cockpitModule_widgetSelection.getCurrentFilters($scope.ngModel.dataset.name));		
			if(Object.keys($scope.filtersParams).length == 0){
				$scope.filtersParams = $scope.cockpitModule_widgetSelection.getCurrentFilters($scope.ngModel.dataset.name);
			}
			if(nature == 'gridster-resized' || nature == 'fullExpand' || nature == 'resize'){
				return;
			} 
			$scope.datasetRecords = datasetRecords;
			checkForSavedSelections($scope.filtersParams,nature);
			if(nature == "refresh"){
				checkInitialSettings();
			} else {
				checkRefreshSettings();
			}
		}
		
		$scope.multiValue = [];
		
		$scope.toggleCheckboxParameter = function(parVal) {
			$scope.hasDefaultValue = false;
			var index = $scope.multiValue.indexOf(parVal);
			
			if (index > -1) {
				$scope.multiValue.splice(index, 1);
			} else {
				$scope.multiValue.push(parVal);
				
			}
			
			if($scope.multiValue.length>0){
				$scope.doSelection($scope.ngModel.content.selectedColumn.aliasToShow,$scope.multiValue);
			} else {
				var item = {};
				item.aggregated=false;
				item.columnName=$scope.ngModel.content.selectedColumn.aliasToShow;
				item.columnAlias=$scope.ngModel.content.selectedColumn.aliasToShow;
				item.ds=$scope.ngModel.dataset.name;
				item.value=angular.copy($scope.parameter);
				$rootScope.$broadcast('DELETE_SELECTION',item);
			}
			
			
		};
		
		$scope.toggleRadioParameter = function(parVal ) {
			$scope.hasDefaultValue = false;
			var item = {};
			item.aggregated=false;
			item.columnName=$scope.ngModel.content.selectedColumn.aliasToShow;
			item.columnAlias=$scope.ngModel.content.selectedColumn.aliasToShow;
			item.ds=$scope.ngModel.dataset.name;
			
			if($scope.parameter != parVal){
				$scope.parameter = parVal;
				$scope.doSelection($scope.ngModel.content.selectedColumn.aliasToShow,parVal);
			} else {
				item.value=angular.copy($scope.parameter);
				$rootScope.$broadcast('DELETE_SELECTION',item);
			}
		}
		$scope.searchParamText = "";
	    
	    $scope.clearParamSearch = function() {
			
			$scope.searchParamText = "";
		};
		$scope.toggleComboParameter = function(parVal) {
			$scope.hasDefaultValue = false;
			
			
			var item = {};
			item.aggregated=false;
			item.columnName=$scope.ngModel.content.selectedColumn.aliasToShow;
			item.columnAlias=$scope.ngModel.content.selectedColumn.aliasToShow;
			item.ds=$scope.ngModel.dataset.name;
		
			if(Array.isArray($scope.parameter)){
				var index = $scope.parameter.indexOf(parVal);
				
				if (index > -1) {
					$scope.parameter.splice(index, 1);
				} else {
					$scope.parameter.push(parVal);
					
				}
				
				if($scope.parameter.length>0){
					$scope.doSelection($scope.ngModel.content.selectedColumn.aliasToShow,angular.copy($scope.parameter));
				} else {
					item.value=angular.copy($scope.parameter);
					$rootScope.$broadcast('DELETE_SELECTION',item);
				}
			} else {
				//signle
				if($scope.parameter != parVal){
					$scope.parameter = parVal;
					$scope.doSelection($scope.ngModel.content.selectedColumn.aliasToShow,$scope.parameter);
				} else {
					item.value=angular.copy($scope.parameter);
					$rootScope.$broadcast('DELETE_SELECTION',item);
				}
			}					

		}
		
		$scope.comboParameterExists = function (record) {
			for (var i = 0; i < $scope.parameter.length; i++) {
				return $scope.parameter.indexOf(record) > -1;
			}
		}
		
		$scope.checkboxParameterExists = function (parVal) {
			for (var i = 0; i < $scope.multiValue.length; i++) {
				return $scope.multiValue.indexOf(parVal) > -1;
			}			
	    };
	};
	
	function selectorWidgetEditControllerFunction(
			$scope,
			finishEdit,
			sbiModule_translate,
			$mdDialog,
			originalModel,
			mdPanelRef,
			getMetadata,
			scopeFather,
			$mdToast){
		$scope.translate=sbiModule_translate;

		$scope.getMetadata = getMetadata;

		$scope.model = {};
		angular.copy(originalModel,$scope.model);
		
		$scope.saveConfiguration=function(){
			if($scope.model.dataset == undefined || $scope.model.dataset.dsId == undefined ){
				$scope.showAction($scope.translate.load('sbi.cockpit.table.missingdataset'));
				return;
			}
			if($scope.model.content.columnSelectedOfDataset == undefined || $scope.model.content.columnSelectedOfDataset.length==0){
				$scope.showAction($scope.translate.load('sbi.cockpit.table.nocolumns'));
				return;
			}

			angular.copy($scope.model,originalModel);
			mdPanelRef.close();
			mdPanelRef.destroy();

			if(!scopeFather.ngModel.isNew){
				scopeFather.refreshWidget();
			}
			$scope.$destroy();
			if($scope.model.content.columnSelectedOfDataset == undefined || $scope.model.content.columnSelectedOfDataset.length==0){
				$scope.showAction($scope.translate.load('sbi.cockpit.table.nocolumns'));
			}
			finishEdit.resolve();
		}
		
		$scope.cancelConfiguration=function(){
			mdPanelRef.close();
			mdPanelRef.destroy();
			$scope.$destroy();
			finishEdit.reject();
		}
	};
	
	addWidgetFunctionality("selector",{'initialDimension':{'width':20, 'height':20},'updateble':true,'cliccable':true});

})();