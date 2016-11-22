/**
 * Knowage, Open Source Business Intelligence suite
 * Copyright (C) 2016 Engineering Ingegneria Informatica S.p.A.
 * 
 * Knowage is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Knowage is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var app =angular.module('chartDesignerManager', ['chart-directives','ChartDesignerService'])

app.config(['$mdThemingProvider', function($mdThemingProvider) {
    $mdThemingProvider.theme('knowage')
    $mdThemingProvider.setDefaultTheme('knowage');
}]);

app.controller("ChartDesignerController", ["sbiModule_translate","$scope","sbiModule_config", ChartDesignerFunction]);

function ChartDesignerFunction(sbiModule_translate,$scope,sbiModule_config) {
	
	$scope.translate = sbiModule_translate;
	$scope.previewButtonEnabled = false;
	$scope.selectedChartType = "";
	
	$scope.saveChartTemplate = function() {
		$scope.showStructureDetails = true;
		$scope.structurePreviewFlex = 25;
	}
	
	$scope.goBackFromDesigner = function() {
		$scope.showStructureDetails = false;
		$scope.structurePreviewFlex = 50;
		 var url= sbiModule_config.protocol+"://"+sbiModule_config.host+":"+sbiModule_config.port+sbiModule_config.externalBasePath;
		 url+= "/servlet/AdapterHTTP?PAGE=DetailBIObjectPage&SBI_ENVIRONMENT=DOCBROWSER&LIGHT_NAVIGATOR_DISABLED=FALSE&MESSAGEDET=DETAIL_SELECT&OBJECT_ID="+docId;
		 window.parent.location.href=url;
	}
	
	// The chart template (beneath the CHART tag, i.e. property)
	
	var parseTemplateforBinding = function(template) {
		console.log(template)
		if( Object.keys(template).length != 0){
			
		Object.keys(template.CHART).forEach(function (key) {
			
			
		    if( template.CHART[key] != ''   && !isNaN(template.CHART[key])){
		    	template.CHART[key] = parseInt(template.CHART[key]);
		    }
		    if(template.CHART[key] === 'true' || template.CHART[key] === 'false'){
		    	
		    	template.CHART[key] = JSON.parse(template.CHART[key])
		    }
		});
		
		Object.keys(template.CHART.LEGEND).forEach(function (key) {
			
			
		    if( template.CHART.LEGEND[key] != ''   && !isNaN(template.CHART.LEGEND[key])){
		    	template.CHART.LEGEND[key] = parseInt(template.CHART.LEGEND[key]);
		    }
		    if(template.CHART.LEGEND[key] === 'true' || template.CHART.LEGEND[key] === 'false'){
		    	
		    	template.CHART.LEGEND[key] = JSON.parse(template.CHART.LEGEND[key])
		    }
		});
			return template.CHART;
		}else{
			return null;
		}
	}
	$scope.chartTemplate = parseTemplateforBinding(jsonTemplate);
	console.log("chart template: ",$scope.chartTemplate);
	
	
	// Needed for the preview of the chart (calling the Highcharts exporter
	$scope.exporterContextName = exporterContextName;
	
	$scope.allMeasures = [];
	$scope.allAttributes = [];
	
	$scope.categoriesExist = false;
	
	$scope.categoriesContainer = [];
	$scope.seriesContainer = [];
	
}