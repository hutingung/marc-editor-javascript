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
        this.items.minItems = min;
        this.items.maxItems = max;
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
        $.each(json, function(key, value) {
            var record = new Record();
            var fieldSchema = new Schema(value.desc, "array", value.referenceUrl);
            var items;
            if(!record.isControlField(key)) {
                items = new Schema("", "object");
                var ind1 = new Schema("indicator 1", "string");
                if(!angular.isUndefined(value.ind1)) {
                    $.each(value.ind1, function(ind1Value, ind1label) {
                        ind1.addEnum(ind1Value);
                    });
                    items.addProperty("ind1", ind1);
                }
                var ind2 = new Schema("indicator 2", "string");
                if(!angular.isUndefined(value.ind2)) {
                    $.each(value.ind2, function(ind2Value, ind2label) {
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
                        if(subfValue.repeatable) {
                            subfSchema.addItem(subfItems, 0, 99);
                        } else {
                            subfSchema.addItem(subfItems, 0, 1);
                        }
                        subfieldsSchema.addProperty(subfKey, subfSchema);
                    });
                    items.addProperty("subfields", subfieldsSchema);
                }
                
                
            } else {
                items = new Schema("", "string");
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
        console.log("data", data, " json", record.getJSON());
        console.log("record", record);
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
        console.log($scope.record.getJSON());
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
  
    $http({method: 'GET', url: '/data/marcsimple.json'}).success(function(data, status, headers, config) {
        var record = new Record(data);
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
