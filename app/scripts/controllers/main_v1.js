'use strict';

var Record = function(json) {
    this.data = json;
    var record = this;
    this.init = function() {
        $.each(data.fields, function(key, field) {
            $.each(field, function(fieldName, fieldValue) {
                if(isControlField(fieldName)) {
                    record[fieldName] = fieldValue;
                } else {
                    if(angular.isUndefined(record[fieldName])) {
                        record[fieldName] = new Array();
                    }
                    var fieldObject = {
                        "ind1" : fieldValue.ind1,
                        "ind2" : fieldValue.ind2
                    };
                    $.each(fieldValue.subfields, function(key, subfield) {
                        $.each(subfield, function(subfieldName, subfieldValue) {
                            if(angular.isUndefined(fieldObject[subfieldName])) {
                                fieldObject[subfieldName] = new Array();
                            }
                            fieldObject[subfieldName].push(subfieldValue);
                        });
                    });
                    record[fieldName].push(fieldObject);
                }
            });
        });
    }
    
    this.getJson = function() {
            var record = {
                "leader" : this.data.leader,
                "fields" : []
            };
            $.each(this, function(fieldName, fieldValue) {
                if(fieldName.length != 3) {
                    return;
                }
                if(isControlField(fieldName)) {
                    var field = {};
                    field[fieldName] = fieldValue;
                    record.fields.push(field);
                } else {
                    $.each(fieldValue, function(key, _fieldValue) {
                        var field = {};
                        field[fieldName] = {
                            "ind1" : _fieldValue.ind1,
                            "ind2": _fieldValue.ind2,
                            "subfields": []
                        }
                        $.each(_fieldValue, function(subfieldName, subfieldValue){
                            var subfield = {};
                            if(subfieldName != "ind1" && subfieldName != "ind2") {
                                $.each(subfieldValue, function(key, _subfieldValue) {
                                    subfield[subfieldName] = _subfieldValue;
                                    field[fieldName].subfields.push(subfield);
                                });
                            }          
                        });
                        record.fields.push(field);
                    });
                }
            });
            return record;
        }
    
}


angular.module('marcEditorApp')
  .controller('MainCtrl', function ($scope, $http) {
    
    $http({method: 'GET', url: '/data/marcv1.json'}).success(function(data, status, headers, config) {
        function isControlField(fieldName) {
            var controlField = ["001","002","003","004","005","006","007","008","009","010"];
            return _.contains(controlField, fieldName);
        }
        $scope.record = {};
        var record = {"data": data};
        $.each(data.fields, function(key, field) {
            $.each(field, function(fieldName, fieldValue) {
                if(isControlField(fieldName)) {
                    record[fieldName] = fieldValue;
                } else {
                    if(angular.isUndefined(record[fieldName])) {
                        record[fieldName] = new Array();
                    }
                    var fieldObject = {
                        "ind1" : fieldValue.ind1,
                        "ind2" : fieldValue.ind2
                    };
                    $.each(fieldValue.subfields, function(key, subfield) {
                        $.each(subfield, function(subfieldName, subfieldValue) {
                            if(angular.isUndefined(fieldObject[subfieldName])) {
                                fieldObject[subfieldName] = new Array();
                            }
                            fieldObject[subfieldName].push(subfieldValue);
                        });
                    });
                    
                    record[fieldName].push(fieldObject);
                }
            });
        });
        record.getJson = function() {
            var record = {
                "leader" : this.data.leader,
                "fields" : []
            };
            $.each(this, function(fieldName, fieldValue) {
                if(fieldName.length != 3) {
                    return;
                }
                if(isControlField(fieldName)) {
                    var field = {};
                    field[fieldName] = fieldValue;
                    record.fields.push(field);
                } else {
                    $.each(fieldValue, function(key, _fieldValue) {
                        var field = {};
                        field[fieldName] = {
                            "ind1" : _fieldValue.ind1,
                            "ind2": _fieldValue.ind2,
                            "subfields": []
                        }
                        $.each(_fieldValue, function(subfieldName, subfieldValue){
                            var subfield = {};
                            if(subfieldName != "ind1" && subfieldName != "ind2") {
                                $.each(subfieldValue, function(key, _subfieldValue) {
                                    subfield[subfieldName] = _subfieldValue;
                                    field[fieldName].subfields.push(subfield);
                                });
                            }          
                        });
                        record.fields.push(field);
                    });
                }
            });
            return record;
        }
        
        $scope.record = record;
        console.log($scope.record);
        console.log(data);
        console.log("getJson", record.getJson());
        
        function isEqual(newRecord, oldRecord) {
            var equals = true;
            
            $.each(oldRecord.fields, function(key, field) {
                var found = _.find(newRecord.fields, function(_field) {
                    return _.isEqual(_field, field);
                });
                if(found == null || found.length == 0) {
                    equals = false;
                }
            });
            return equals;
            
        }
        
        $scope.$watch('record', function(newValue){
           console.log("equals, ", newValue.data, newValue.getJson(), "is equal", isEqual(newValue.data, newValue.getJson()));
        }, true);
        
        
    }).
    error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
  });
