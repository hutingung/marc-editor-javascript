'use strict';

var json2marc = function(marc) {
	if (marc) {
		
		console.log("leader:" + marc.leader);
		this.leader = marc.leader;
		this.variableFields = new VariableFields(marc.fields);
	} else {
		this.leader = '00000nam a2200000   4500';
		this.variableFields = new VariableFields([]);
	}
}

json2marc.prototype.toJson = function() {
	var json = {};

	json['leader'] = this.leader;

	var fields = [];
	var variableFields = this.variableFields;
	for(var index in variableFields) {
		var variableField = variableFields[index];
		if (variableField.tag) {
			var field = {};
			if (variableField.ind1) {
				field[variableField.tag] = {};
				field[variableField.tag]['ind1'] = variableField.ind1;
				field[variableField.tag]['ind2'] = variableField.ind2;
				field[variableField.tag]['subfields'] = splitSubfields(variableField.bib);
			} else {
				field[variableField.tag] = variableField.bib;
			}
			fields.push(field);
		}
	}
	json['fields'] = fields;
	
	return json;
};

var VariableFields = function(fields) {
	var variableFields = [];
	for(var index in fields) {
		var variableField = new VariableField(fields[index]);
		variableFields.push(variableField);
	}
	return variableFields;
};

var VariableField = function(varField) {
	for(var key in varField) {
		var field = varField[key];
		this.tag = key;
		if (field.hasOwnProperty('subfields')) {
			this.ind1 = field.ind1;
			this.ind2 = field.ind2;
			this.bib = joinSubfields(field.subfields);
		} else {
			this.bib = field;
		}
	}
};

function joinSubfields(subfields) {
	var s = '';
	for(var index in subfields) {
		var subfield = subfields[index];
		for(var key in subfield) {
			var value = subfield[key];
			s += '|' + key + value;
		}
	}
	return s;
}

function splitSubfields(bib) {
	var subfields = [];
	var parts = bib.split("|");
	for(var index in parts) {
		var part = parts[index];
		if (part.length > 0) {
			var code = part.substring(0, 1);
			var data = part.substring(1);
			var subfield = {};
			subfield[code] = data;
			subfields.push(subfield);
		}
	}
	return subfields;
}


var Subfield = function(data, weight) {
    this.weight = weight;
    this.data = data;

}

var DataField = function(ind1, ind2) {
    this.ind1 = ind1;
    this.ind2 = ind2;   
    var weight = 0;
   
    this.addSubfield = function(code, data) {
        if(angular.isUndefined(this[code])) {
           this[code] = new Array(); 
        }
        this[code].push(new Subfield(data, weight+=100));
    }
    
    this.isSubfield = function(code) {
        return (code != "ind1" && code != "ind2")
    }
    
    this.getWeight = function() {
    }
    
    this.removeSubfield = function(code, data) {
        var subfield = _.without(this[code], data);
        if(subfield.length == 0) {
            delete this[code];
        } else {
            this[code] = subfield;
        }
        
    }
    
    this.isEqual = function(target) {
        var isEqual = true;
        $.each(this, function(property, value) {
            isEqual = _.isEqual(target[property], value) || _.isFunction(target[property]); 
        });
        return isEqual;
    }
}


var Record = function(json) {
    this.data = json;
    var record = this;
    this.isControlField = function (fieldName) {
        var controlField = ["001","002","003","004","005","006","007","008","009"];
        return _.contains(controlField, fieldName);
    }
    
    this.addField = function(tag, data) {
        if(angular.isUndefined(this[tag])) {
            this[tag] = new Array();
        }
        this[tag].push(data);
    }
    this.removeField = function(tag, data) {
        if(angular.isUndefined(this[tag])) {
            return;
        }
        var field = _.clone(this[tag]);
        if(this.isControlField(tag)) {
            field = _.without(this[tag], data);
        } else {
            var index = 0;
            $.each(this[tag], function(key, value) {
                if(value.isEqual(data)) {
                    field.splice(index, 1);
                } else {
                    index++;
                }        
            });
        }
        if(field.length == 0) {
            delete this[tag];
        } else {
            this[tag] = field;
        }
    }
    
    this.init = function() {
        if(angular.isUndefined(this.data)) {
            return;
        }
        this.leader = this.data.leader;
        $.each(this.data.fields, function(key, field) {
            $.each(field, function(fieldName, fieldValue) {
                var data;
                if(record.isControlField(fieldName)) {
                    data = fieldValue;
                } else {
                    data = new DataField(fieldValue.ind1, fieldValue.ind2);
                    $.each(fieldValue.subfields, function(key, subfield) {
                        $.each(subfield, function(subfieldName, subfieldValue) {
                            data.addSubfield(subfieldName, subfieldValue);
                        });
                    });
                }
                record.addField(fieldName, data);
            });
        });
    }
    
    this.getJSON = function() {
        var jsonRecord = {
            "leader" : this.data.leader,
            "fields" : []
        };
        $.each(this, function(fieldName, fieldValue) {
            if(_.isFunction(this[fieldName]) || fieldName.length != 3) {
                return;
            }
            $.each(fieldValue, function(key, _fieldValue) {
                if(record.isControlField(fieldName)) {                   
                    var field = {};
                    field[fieldName] = _fieldValue;
                } else {
                    var field = {};
                    field[fieldName] = {
                        "ind1" : _fieldValue.ind1,
                        "ind2": _fieldValue.ind2,
                        "subfields": []
                    }
                    var subfields = new Array();
                    /*
                    $.each(_fieldValue, function(subfieldName, subfieldValue){
                        var subfield = {};
                        if(subfieldName != "ind1" && subfieldName != "ind2") {
                            $.each(subfieldValue, function(key, _subfieldValue) {
                                subfield[subfieldName] = _subfieldValue;            
                                field[fieldName].subfields.push(subfield);
                            });
                        }
                    });*/
                    var subfields = new Array();
                    $.each(_fieldValue, function(fieldArray, fieldArrayValue) {
                        if(fieldArray != "ind1" && fieldArray != "ind2") {
                            $.each(fieldArrayValue, function(field, fieldValue) {
                                fieldValue.field = fieldArray;
                                subfields.push(fieldValue);
                            });
                        }
                    });
                    var sortedSubfields = _.sortBy(subfields, function(subfield) {
                        return subfield.weight;
                    });
                    $.each(sortedSubfields, function(key, sortedSubfield) {
                        var subfield = {};
                        subfield[sortedSubfield.field] = sortedSubfield.data;            
                        field[fieldName].subfields.push(subfield);
                    });
                    
                }
                jsonRecord.fields.push(field);
            });
        });
        return jsonRecord;
    }
    this.isEqual = function(oldRecord) {
        /*
        var equals = true;
        var newRecord = this.getJSON();
        $.each(oldRecord.fields, function(key, field) {
            var found = _.find(newRecord.fields, function(_field) {
                return _.isEqual(_field, field);
            });
            if(found == null || found.length == 0) {
                equals = false;
            }
        });
        return equals;*/
        return _.isEqual(this.getJSON(), oldRecord);
    }
    
    this.isChanged = function() {
        return !record.isEqual(this.data);
    }
    
    this.init();
}

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
                    $.each(value.subf, function(subfKey, subfValue){
                        var subfSchema = new Schema(subfValue.desc, "array");
                        var subfItems = new Schema("", "string");
                        if(subfValue.repeatable) {
                            subfSchema.addItem(subfItems, 0, 99);
                        } else {
                            subfSchema.addItem(subfItems, 0, 1);
                        }
                        items.addProperty(subfKey, subfSchema);
                    });
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
    
    var testRecord = {
          
          "h": [
            {
              "weight": 200,
              "data": "[sound recording]."
            }
          ],
          "a": [
            {
              "weight": 100,
              "data": "The freewheelin' Bob Dylan"
            },
            {
              "weight": 300,
              "data": "The freewheelin' Bob Dylan2"
            }
          ]
        }
    console.log(testRecord);
    var subfields = new Array();
    $.each(testRecord, function(fieldArray, fieldArrayValue) {
        $.each(fieldArrayValue, function(field, fieldValue) {
            console.log(field, fieldValue);
            subfields.push(fieldValue);
        });
    });
    var sortedSubfields = _.sortBy(subfields, function(subfield) {
        return subfield.weight;
    });
    console.log(subfields, sortedSubfields);
    
    
    
    $http({method: 'GET', url: '/data/marcv1.json'}).success(function(data, status, headers, config) {
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
