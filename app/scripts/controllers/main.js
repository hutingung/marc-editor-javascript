'use strict';
var Schema = function(title, type, description) {
    var schema = this;
    if(!angular.isUndefined(title) && title.length != 0) {
        this.title = title;
    }
    this.type = type;
    if(!angular.isUndefined(description) && description.length != 0) {
        this.description = description;
    }
    
    this.addProperty = function(field, schema) {
        if(angular.isUndefined(this.properties)) {
            this.properties = {};
        }
        if(this.type != "object") {
            throw new Error("Only object type allow to add property");
        }
        this.properties[field] = schema;
    }
    
    this.addEnum = function(_enum) {
        if(angular.isUndefined(this.enum)) {
            this.enum = [];
        }        
        this.enum.push(_enum);
    }
    
    this.addItem = function(schema, min, max) {
        if(this.type != "array") {
             throw new Error("Only array type allow to add items");
        }
        this.items = schema;
        this.minItems = min;
        this.maxItems = max;
    }
}

var Options = function(label) {
    if(!angular.isUndefined(label)) {
        this.label = label;
    }
    this.addOption = function(field, option) {
        if(angular.isUndefined(this.fields)) {
            this.fields = {};
        }
        this.fields[field] = option;
    }
    this.addArrayOption = function(option) {
        this.fields = option;
    }
    
    
    this.addItem = function(option) {
        this.item = option;
    }
    this.addOptionLabel = function(optionLabel) {
        if(angular.isUndefined(this.optionLabels)) {
            this.optionLabels = [];
        }
        this.optionLabels.push(optionLabel);
    }
}

var OptionsFactory = function() {
    this.parse = function(json) {
        var options = new Options()
        $.each(json, function(key, value) {
            var record = new Record();
            var fieldOption = new Options();
            if(!record.isControlField(key)) {
                var ind1 = new Options();
                if(!angular.isUndefined(value.ind1)) {
                    $.each(value.ind1, function(ind1Value, ind1label) {
                        ind1.addOptionLabel(ind1label);
                    });
                }
                var ind2 = new Options();
                if(!angular.isUndefined(value.ind2)) {
                    $.each(value.ind2, function(ind2Value, ind2label) {
                        ind2.addOptionLabel(ind2label);
                    });
                }
                var arrayOptions = new Options();
                arrayOptions.addOption("ind1", ind1);
                arrayOptions.addOption("ind2", ind2);
                fieldOption.addItem(arrayOptions);
                
            }
            var fieldArrayOption = new Options();
            fieldArrayOption.addArrayOption(fieldOption);
            options.addOption(key, fieldArrayOption);            
        });
        return options;
    }
}

var SchemaFactory = function() {
    this.parse = function(json) {
        var schema = new Schema("Marc 21", "object", "http://www.loc.gov/marc/bibliographic/ecbdhome.html");
        
        schema.addProperty("leader", new Schema("leader", "string"));
        $.each(json, function(key, value) {
            var record = new Record();
            var fieldSchema = new Schema(value.desc, "array", value.referenceUrl);
            var items = new Schema("", "object");
            items.addProperty("name", new Schema("name", "string"));
            items.addProperty("weight", new Schema("weight", "integer"));
            items.addProperty("data", new Schema("data", "string"));
            if(!record.isControlField(key)) {
                
                var ind1 = new Schema("indicator 1", "string");
                if(!angular.isUndefined(value.ind1)) {
                    $.each(value.ind1, function(ind1Value, ind1label) {
                        if(ind1Value == "#") {
                            ind1Value = " ";
                        }
                        ind1.addEnum(ind1Value);
                    });
                    items.addProperty("ind1", ind1);
                }
                var ind2 = new Schema("indicator 2", "string");
                if(!angular.isUndefined(value.ind2)) {
                    $.each(value.ind2, function(ind2Value, ind2label) {
                        if(ind2Value == "#") {
                            ind2Value = " ";
                        }
                        ind2.addEnum(ind2Value);
                    });
                    items.addProperty("ind2", ind2);
                }
                
                if(!angular.isUndefined(value.subf)) {
                    var subfieldsSchema = new Schema("Subfields", "object");
                    $.each(value.subf, function(subfKey, subfValue){
                        var subfSchema = new Schema(subfValue.desc, "array");
                        var subfItems = new Schema("", "object");
                        subfItems.addProperty("data", new Schema("", "string"));
                        subfItems.addProperty("name", new Schema("name", "string"));
                        subfItems.addProperty("weight", new Schema("weight", "integer"));
                        if(subfValue.repeatable) {
                            subfSchema.addItem(subfItems, 0, 99);
                        } else {
                            subfSchema.addItem(subfItems, 0, 1);
                        }

                        subfieldsSchema.addProperty(subfKey, subfSchema);
                        
                    });
                    items.addProperty("subfields", subfieldsSchema);
                }
                
                
            }
            if(value.repeatable) {
                fieldSchema.addItem(items, 0, 99);
            } else {
                fieldSchema.addItem(items, 0, 1);
            }
            schema.addProperty(key, fieldSchema);
        });
        return schema;
    }
}
angular.module('marcEditorApp')
  .controller('MainCtrl', function ($scope, $http) {
    $http({method: 'GET', url: '/data/marcsimple.json'}).success(function(data, status, headers, config) {
        var record = new Record(data);
        $scope.record = record;
        $scope.DataField = function(ind1, ind2) {
            return new DataField(ind1, ind2);
        }
        
        $scope.$watch('record', function(newRecord){
            if(!angular.isUndefined(newRecord)) {
                $scope.jsonRecord = newRecord.getMarcJSON();
            }
        }, true);
        
        //remove for the purpose for display - should not remove in production.
        //delete $scope.record.data;
        
        //$scope.json2marc = new json2marc(data);
        //console.log($scope.json2marc);
    }).
    error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
    
    $scope.save = function() {
        console.log($scope.record.getMarcJSON());
    }
  });
angular.module('marcEditorApp')
  .controller('SchemaCtrl', function ($scope, $http) {
    $http({method: 'GET', url: '/data/rules.json'}).success(function(data, status, headers, config) {
        console.log(data);
        var schemaFactory = new SchemaFactory();
        
        $scope.schema = schemaFactory.parse(data);
    }).
    error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
    
  });
angular.module('marcEditorApp')
  .controller('OptionsCtrl', function ($scope, $http) {
    $http({method: 'GET', url: '/data/rules.json'}).success(function(data, status, headers, config) {
        console.log(data);
        var optionsFactory = new OptionsFactory();
        $scope.options = optionsFactory.parse(data);
    }).
    error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
  });
  
  
angular.module('marcEditorApp')
  .controller('FormsCtrl', function ($scope, $http) {
    
    $http({method: 'GET', url: '/data/rules.json'}).success(function(data, status, headers, config) {
        console.log(data);
        var schemaFactory = new SchemaFactory();
        
        $scope.schema = schemaFactory.parse(data);
    }).
    error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
  
    $http({method: 'GET', url: '/data/marcsimple.json'}).success(function(data, status, headers, config) {
        var record = new Record(data, $scope.schema);
        $scope.record = record;
        $scope.DataField = function(ind1, ind2) {
            return new DataField(ind1, ind2);
        }
        //remove for the purpose for display - should not remove in production.
        delete $scope.record.data;
        renderForm();
    }).
    error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
    function renderForm() {
        $http({method: 'GET', url: '/data/rules.json'}).success(function(data, status, headers, config) {
            var schemaFactory = new SchemaFactory();
            $scope.schema = schemaFactory.parse(data);
            var optionsFactory = new OptionsFactory();
            $scope.options = optionsFactory.parse(data);
            function postRenderCallback() {
                console.log("render");
            }
            $("#form").alpaca({
                "data": $scope.record,
                "schema": $scope.schema,
                "options": $scope.options,
                "postRender": postRenderCallback,
                "ui": "bootstrap"
            });
        }).
        error(function(data, status, headers, config) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        });
    }
    $scope.$watch('record', function(newVal) {
        console.log("record changed", newVal);
    });
    
  });
  
angular.module('marcEditorApp').controller('EditorCtrl', function ($scope, $http, $timeout) {
    
    var ErrorMessagesDefault = {
        INVALID_TYPE: "invalid type: {type} (expected {expected})",
        ENUM_MISMATCH: "{value} is not allowed",
        ANY_OF_MISSING: "Data does not match any schemas from \"anyOf\"",
        ONE_OF_MISSING: "Data does not match any schemas from \"oneOf\"",
        ONE_OF_MULTIPLE: "Data is valid against more than one schema from \"oneOf\": indices {index1} and {index2}",
        NOT_PASSED: "Data matches schema from \"not\"",
        // Numeric errors
        NUMBER_MULTIPLE_OF: "Value {value} is not a multiple of {multipleOf}",
        NUMBER_MINIMUM: "Value {value} is less than minimum {minimum}",
        NUMBER_MINIMUM_EXCLUSIVE: "Value {value} is equal to exclusive minimum {minimum}",
        NUMBER_MAXIMUM: "Value {value} is greater than maximum {maximum}",
        NUMBER_MAXIMUM_EXCLUSIVE: "Value {value} is equal to exclusive maximum {maximum}",
        // String errors
        STRING_LENGTH_SHORT: "String is too short ({length} chars), minimum {minimum}",
        STRING_LENGTH_LONG: "String is too long ({length} chars), maximum {maximum}",
        STRING_PATTERN: "String does not match pattern: {pattern}",
        // Object errors
        OBJECT_PROPERTIES_MINIMUM: "Too few properties defined ({propertyCount}), minimum {minimum}",
        OBJECT_PROPERTIES_MAXIMUM: "Too many properties defined ({propertyCount}), maximum {maximum}",
        OBJECT_REQUIRED: "Missing required property: {key}",
        OBJECT_ADDITIONAL_PROPERTIES: "Additional properties not allowed",
        OBJECT_DEPENDENCY_KEY: "Dependency failed - key must exist: {missing} (due to key: {key})",
        // Array errors
        ARRAY_LENGTH_SHORT: "Array is too short ({length}), minimum {minimum}",
        ARRAY_LENGTH_LONG: "Non repeatable.",
        ARRAY_UNIQUE: "Array items are not unique (indices {match1} and {match2})",
        ARRAY_ADDITIONAL_ITEMS: "Additional items not allowed",
        // Format errors
        FORMAT_CUSTOM: "Format validation failed ({message})",
        // Schema structure
        CIRCULAR_REFERENCE: "Circular $refs: {urls}",
        // Non-standard validation options
        UNKNOWN_PROPERTY: "Unknown tag / subfields inserted. "
    };

    tv4.addLanguage('en-us', ErrorMessagesDefault);
    tv4.language('en-us');
    $http({method: 'GET', url: '/data/rules.json'}).success(function(data, status, headers, config) {
        var schemaFactory = new SchemaFactory();
        
        $scope.schema = schemaFactory.parse(data);
        renderGrid();
    }).
    error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
    
    var cellTemplate = '<div ng-class="{green: record.getError(row.entity).length > 0}"><div class="ngCellText"><span ng-cell-text="" class="ng-binding">{{row.getProperty(col.field)}}</span></div></div>';
    cellTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text ng-class="{green: record.getError(row.entity).length > 0}">{{COL_FIELD}}</span></div>';
    $scope.selectedItems = [];
    $scope.record = {};
    $scope.gridOptions = {
        data: 'myData',
        multiSelect: false,
        enableCellEdit: true,
        enableCellSelection: true,
        columnDefs: [{ field: "name", width: 80, sortable: true, enableCellEdit: false, cellTemplate: cellTemplate},
                    { field: "ind1", width: 40, sortable: false},
                    { field: "ind2", width: 40, sortable: false, cellTemplate: cellTemplate },
                    { field: "data", width: 590, sortable: false, cellTemplate: cellTemplate }],
        selectedItems: $scope['selectedItems']
	        
    };
    //<span>{{row.getProperty("getMarcJSON()")}}</span>
    //{{record.getError(row.entity)}}
    //row.entity - to get current row value
    
    function renderGrid() {
        $http({method: 'GET', url: '/data/marcv1.json'}).success(function(data, status, headers, config) {
            var record = new Record(data, $scope.schema);
            $scope.record = record;
            $scope.myData = $scope.record.getData();
            //delete $scope.record.data;
            //delete $scope.record.leader;
            console.log($scope.record);
            $scope.DataField = function(ind1, ind2) {
                return new DataField(ind1, ind2);
            }
            
            $scope.jsonRecord = record.getMarcJSON();
            
            $scope.$watch('record', function(newRecord, oldRecord){
                if(!angular.isUndefined(newRecord) && !newRecord.equals(oldRecord)) {
                    $scope.jsonRecord = newRecord.getMarcJSON();
                    $scope.myData = $scope.record.getData();
                    newRecord.validate();   
                }
            }, false);
            $scope.lastValidationTime = new Date();
            $scope.refresh = function() {
                $scope.myData = $scope.record.getData();
            }
            
            var interval = 5;
            
            $scope.interval = interval;
            
            var refreshValidation = function() {
                if($scope.interval == 0) {
                    $scope.record.validate();
                    $scope.interval = interval;
                } 
                $scope.interval--;
                
                $timeout(refreshValidation, 1000);
            }
            $timeout(refreshValidation, 1000);
        }).
        error(function(data, status, headers, config) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        });
    }
});

