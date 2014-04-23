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

function BaseObject() {
}

BaseObject.prototype.equals = function(obj) {
    var isEqual = true;
    $.each(this, function(property, value) {
        if(!_.isFunction(obj[property]) && property.indexOf("$") != 0) {
            isEqual &= _.isEqual(obj[property], value);
        }
    });
    return isEqual;
}

BaseObject.prototype.addProperty = function(property) {
    if(_.isUndefined(this[property.name])) {
        this[property.name] = new Array();
    }
    this[property.name].push(property);
}

BaseObject.prototype.removeProperty = function(property) {
    if(_.isUndefined(property)) {
        return;
    }
    if(!property instanceof BaseObject) {
        throw "This method only applicable for BaseObject type"; 
    }
    var propertyValue = _.reject(this[property.name], function(_property) {
        return _property.equals(property);
    });
    if(_.size(propertyValue) == 0) {
        delete this[property.name];
    } else {
        this[property.name] = propertyValue;
    }
}

BaseObject.prototype.getIndex = function(property) {
    var index = -1;
    if(_.isUndefined(property)) {
        return index;
    }
    $.each(this[property.name], function(key, _property) {
        if(_property.equals(property)) {
            index = key;
        }
    });
    return index;
}

BaseObject.prototype.isJSONProperty = function(propertyName, propertyValue) {
    return _.isArray(propertyValue);
}

BaseObject.prototype.getSortedProperty = function() {
    var obj = new Array();
    var baseObject = this;
    var propertyArray = new Array();
    $.each(this, function(propertyName, propertyValue) {
        if(baseObject.isJSONProperty(propertyName, propertyValue)) {
            $.each(propertyValue, function(key, _propertyValue) {
                propertyArray.push(_propertyValue);
            });
        }
    });
    
    var sortedPropertyArray = _.sortBy(propertyArray, function(arrayChild) {
        return arrayChild.weight;
    });
    return sortedPropertyArray;
}

BaseObject.prototype.getSortedJSON = function() {
    var obj = new Array();
    /*
        "100" : [{"name" : "100", "data": "test", "weight": 200}],
        "200" : [{"name" : "200", "data": "test2001", "weight": 300},{"name" : "200", "data": "test2002", "weight": 100}]
    */
    /*  
        [{"200": "test2002}, {"100": "test"}, {"200": "test2001"}]
    
    */
    $.each(this.getSortedProperty(), function(key, arrayChild) {
        obj.push(arrayChild.getJSON());
    });
    return obj;
}

BaseObject.prototype.moveUp = function(property) {
    var baseObject = this;
    $.each(this.getSortedProperty(), function(key, _property) {
        if(_property.equals(property) && key > 0) {
            var previous = baseObject.getSortedProperty()[key-1];
            previous.weight = previous.weight + 100;
            _property.weight = _property.weight - 100;
        }
    });
    return this;
}

BaseObject.prototype.moveDown = function(property) {

    var baseObject = this;
    $.each(this.getSortedProperty(), function(key, _property) {
        if(_property.equals(property) && key < _.size(baseObject.getSortedProperty())) {
            var next = baseObject.getSortedProperty()[key+1];
            next.weight = next.weight - 100;
            _property.weight = _property.weight + 100;
        }
    });
    return this;
}

Subfields.prototype = new BaseObject();
Subfields.prototype.constructor = Subfields;

function Subfields() {
    var weight = 0;
    var subfields = this;
    this.addSubfield = function(code, data) {
        this.addProperty(new Subfield(code, data, weight+=100));
    }
        
    this.removeSubfield = function(subfield) {
        this.removeProperty(subfield);
    }
    
    this.getJSON = function() {
        return this.getSortedJSON();
    }
        
    this.update = function(szSubfields) {
        var aszSubfield = szSubfields.split("|");
        $.each(aszSubfield, function(key, _szSubfield) {
            if(_.size(_szSubfield) > 0) {
                var code = _szSubfield.substring(0, 1);
                var data = _szSubfield.substring(1);
                subfields.addSubfield(code, data);
            }
        });
    }
    
    this.getData = function() {        
        var szSubfields = "";
        $.each(this.getSortedProperty(), function(key, arrayChild) {
            var subfield = "|" + arrayChild.name + arrayChild.data;
            szSubfields += subfield;
        });
        return szSubfields;
    }
}

Subfield.prototype = new BaseObject();
Subfield.prototype.constructor = Subfield;
function Subfield(name, data, weight) {
    this.name = name;
    this.data = data;
    this.weight = weight;
    
    this.getJSON = function() {
        var subfield = {};
        subfield[this.name] = this.data;    
        return subfield;
    }
}

DataField.prototype = new BaseObject();
DataField.prototype.constructor = DataField;

function DataField (name, ind1, ind2, weight) {
    this.name = name;
    this.ind1 = ind1;
    this.ind2 = ind2;
    this.weight = weight;
    this.subfields = new Subfields();
    this.data;
    this.getJSON = function() {
        var dataField = {};
        dataField[this.name] = {
            "subfields": this.subfields.getJSON(),
            "ind1": this.ind1,
            "ind2": this.ind2
        };
        return dataField;
    }
    
    this.getData = function() {
    
        var szData = new String(this.data);
        this.updateSubfields();
        if(!szData.endsWith("|")) {
            this.data = this.subfields.getData();
        }
        return this;
    }
    
    
    this.updateSubfields = function() {
        var szData = new String(this.data);
        if(_.size(this.data) > 0) {
            this.subfields = new Subfields();
            this.subfields.update(this.data);
        }
        return this;
    }
    
}
//TODO - should put under utiliy
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

ControlField.prototype = new BaseObject();
ControlField.prototype.constructor = ControlField;

function ControlField(name, data, weight) {
    this.name = name;
    this.data = data;
    this.weight = weight;
    
    this.getJSON = function() {
        var controlField = {};
        controlField[this.name] = this.data;
        return controlField;
    }
    
    this.getData = function() {
        if(!_.isUndefined(this['ind1'])) {
            delete this['ind1'];
        }
        if(!_.isUndefined(this['ind2'])) {
            delete this['ind2'];
        }
        return this;
    }
}

Record.prototype = new BaseObject();
Record.prototype.constructor = Record;
function Record(data, schema) {
    this.data = data;
    this.schema = schema;
    var record = this;
    var weight = 0;
    this.isControlField = function (fieldName) {
        var controlField = ["001","002","003","004","005","006","007","008","009"];
        return _.contains(controlField, fieldName);
    }
    
    this.addField = function(data) {
        this.addProperty(data);
        this.validate();
        if(this.isErrorAddedField(data)) {
            this.removeField(data);
        }
    }
    
    this.removeField = function(data) {
        this.removeProperty(data);
    }
    
    this.addControlField = function(tag) {
        var controlField = new ControlField(tag, "", weight+=100);
        this.addField(controlField);
    }
    
    
    this.addDataField = function(tag) {
        var dataField = new DataField(tag, "", "", weight+=100);
        this.addField(dataField);
    }
    
    this.init = function() {
        if(_.isUndefined(this.data)) {
            //throw "You must defined json data."; 
            return ;
        }
        this.leader = this.data.leader;
        $.each(this.data.fields, function(key, field) {
            $.each(field, function(fieldName, fieldValue) {
                var data;
                if(record.isControlField(fieldName)) {
                    data = new ControlField(fieldName, fieldValue, weight+=100);
                } else {
                    data = new DataField(fieldName, fieldValue.ind1, fieldValue.ind2, weight +=100);
                    $.each(fieldValue.subfields, function(key, subfield) {
                        $.each(subfield, function(subfieldName, subfieldValue) {
                            data.subfields.addSubfield(subfieldName, subfieldValue);
                        });
                    });
                }
                record.addField(data);
            });
        });
    }
    
    
    this.getData = function() {
        var tags = [];
        $.each(this.getSortedProperty(), function(key, arrayChild) {
            tags.push(arrayChild.getData());
        });
        return tags;
    }
    
    this.getJSON = function() {
        this.getData();//make sure binding is working TODO
        var szJsonRecord = JSON.stringify(this);
        var jsonRecord = JSON.parse(szJsonRecord);
        delete jsonRecord.data;
        delete jsonRecord.schema;
        delete jsonRecord.$errors;
        return jsonRecord;
    }
    
    this.getMarcJSON = function() {
        this.getData();//make sure binding is working TODO
        var jsonRecord = {
            "leader" : this.data.leader,
            "fields" : this.getSortedJSON()
        };
        return jsonRecord;
    }
    this.isEqual = function(oldRecord) {
        return _.isEqual(this.getMarcJSON(), oldRecord);
    }
    
    this.isChanged = function() {
        return !record.isEqual(this.data);
    }
    
    this.validate = function() {
        if(_.isUndefined(this.schema)) {
            return;
        }
        this.$errors = tv4.validateMultiple(this.getJSON(), this.schema, true, true);
        //this.$errors = Validator.validate(this.getJSON(), this.schema);
    }
    
    this.getPath = function(property) {
        var path = "/" + property.name + "/" + this.getIndex(property);
        //path = property.name + "[" + this.getIndex(property) + "]";
        return path;
        
    }
    
    this.isErrorAddedField = function(property) {
        var path = "/" + property.name;
        if(_.isUndefined(this.$errors)) {
            return {};
        }
        var errors = _.filter(this.$errors.errors, function(_error) {
            //return (_error.property.indexOf(path) == 0);
            return (_error.dataPath == path);
        });
        return errors.length > 0;
    }
    
    this.isError = function(property) {
        return (this.getError(property).length > 0);
    }
    
    this.getError = function(property) {
        return this.getErrorByPath(this.getPath(property));
    }
    
    this.getErrorByPath = function(path) {
        if(_.isUndefined(this.$errors)) {
            return {};
        }
        var errors = _.filter(this.$errors.errors, function(_error) {
            //return (_error.property.indexOf(path) == 0);
            return (_error.dataPath.indexOf(path) == 0);
        });
        return errors;
    }
    
    this.version = function() {
        return "1.0";
    }
    
    this.init();
}


