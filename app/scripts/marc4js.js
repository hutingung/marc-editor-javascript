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
        if(!_.isFunction(obj[property])) {
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

BaseObject.prototype.isJSONProperty = function(propertyName, propertyValue) {
    return _.isArray(propertyValue);
}

BaseObject.prototype.getSortedObject = function() {
    /*
        "100" : [{"name" : "100", "data": "test", "weight": 200}],
        "200" : [{"name" : "200", "data": "test2001", "weight": 300},{"name" : "200", "data": "test2002", "weight": 100}]
    */
    /*  
        [{"200": "test2002}, {"100": "test"}, {"200": "test2001"}]
    
    */
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
    $.each(sortedPropertyArray, function(key, arrayChild) {
        obj.push(arrayChild.getJSON());
    });
    return obj;
}

Subfields.prototype = new BaseObject();

function Subfields() {
    var weight = 0;
    this.addSubfield = function(code, data) {
        this.addProperty(new Subfield(code, data, weight+=100));
    }
        
    this.removeSubfield = function(subfield) {
        this.removeProperty(subfield);
    }
    
    this.getJSON = function() {
        return this.getSortedObject();
    }
}

Subfield.prototype = new BaseObject();
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
function DataField (name, ind1, ind2, weight) {
    this.name = name;
    this.ind1 = ind1;
    this.ind2 = ind2;
    this.weight = weight;
    this.subfields = new Subfields();
    
    this.getJSON = function() {
        var dataField = {};
        dataField[this.name] = {
            "subfields": this.subfields.getJSON(),
            "ind1": this.ind1,
            "ind2": this.ind2
        };
        return dataField;
    }
}

ControlField.prototype = new BaseObject();
function ControlField(name, data, weight) {
    this.name = name;
    this.data = data;
    this.weight = weight;
    
    this.getJSON = function() {
        var controlField = {};
        controlField[this.name] = this.data;
        return controlField;
    }
}

Record.prototype = new BaseObject();

function Record(json) {
    this.data = json;
    var record = this;
    var weight = 0;
    this.isControlField = function (fieldName) {
        var controlField = ["001","002","003","004","005","006","007","008","009"];
        return _.contains(controlField, fieldName);
    }
    
    this.addField = function(data) {
        this.addProperty(data);
    }
    
    this.addControlField = function(tag) {
        var controlField = new ControlField(tag, "", weight+=100);
        this.addField(controlField);
    }
    
    
    this.addDataField = function(tag) {
        var dataField = new DataField(tag, "", "", weight+=100);
        this.addField(dataField);
    }
    
    this.removeField = function(data) {
        this.removeProperty(data);
    }
    
    this.init = function() {
        if(_.isUndefined(this.data)) {
            return;
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
    
    this.getJSON = function() {
        var jsonRecord = {
            "leader" : this.data.leader,
            "fields" : this.getSortedObject()
        };
        return jsonRecord;
    }
    this.isEqual = function(oldRecord) {
        return _.isEqual(this.getJSON(), oldRecord);
    }
    
    this.isChanged = function() {
        return !record.isEqual(this.data);
    }
    
    this.init();
}


