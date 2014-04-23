var marc21json = {
    "leader":"01471cjm a2200349 a 4500",
    "fields":
    [
        {
            "001":"5674874"
        },
        {
            "008":"930331s1963    nyuppn              eng d"
        },
        {
            "100":
            {
                "subfields":
                [
                    {
                        "a":"Dylan, Bob,"
                    },
                    {
                        "d":"1941-"
                    }
                ],
                "ind1":"1",
                "ind2":"#"
            }
        }
    ]
}

function getTestsubfields() {
    var subfields = new Subfields();
    return subfields;
}

test("subfields - Add subfield", function() {
    var subfields = getTestsubfields();
    
    var code = "a";
    var data = "Dylan, Bob,";
    subfields.addSubfield(code, data);    
    deepEqual(subfields.a, [new Subfield(code, data, 100)], "test add one subfield");
    
    subfields = getTestsubfields();
    subfields.addSubfield(code, data);    
    subfields.addSubfield(code, data);    
    
    deepEqual(subfields.a, [new Subfield(code, data, 100), new Subfield(code, data, 200)], "test add two subfield with same code");
    
    subfields = getTestsubfields();
    subfields.addSubfield(code, data);    
    var code2 = "d";
    var data2 = "1941-";
    subfields.addSubfield(code2, data2);    
    
    deepEqual(subfields.a, [new Subfield(code, data, 100)], "test add two subfield with different code");
    deepEqual(subfields.d, [new Subfield(code2, data2,  200)], "test add two subfield with different code");
});


test("Data Field - Remove subfield", function() {
    var subfields = getTestsubfields(); 
    var code = "a";
    var data = "Dylan, Bob,";
    subfields.addSubfield(code, data);
    var subfield = new Subfield(code, data, 100);
    subfields.removeSubfield(subfield);
    equal(subfields.a, undefined, "expected to undefined because only one subfield");
    
    subfields = getTestsubfields(); 
    subfields.addSubfield(code, data);
    subfields.addSubfield(code, data);
    
    subfields.removeSubfield(subfield);
    deepEqual(subfields.a, [new Subfield(code, data, 200)], "expected to have one subfield remain");
});

test("Data Field - bind string to subfield", function() {
    var input = "|aDylan, Bob, |d1941-";
    var subfields = getTestsubfields(); 
    subfields.update(input);
    var expected = {
        "a": [new Subfield("a", "Dylan, Bob, ", 100)],
        "d": [new Subfield("d", "1941-", 200)]
    };
    deepEqual(subfields.a, expected.a);
    deepEqual(subfields.d, expected.d);
    
    input = "|aDylan, Bob, |d1941-|d1999-|aMartin Fowler";
    subfields = getTestsubfields(); 
    subfields.update(input);
    expected = {
        "a": [new Subfield("a", "Dylan, Bob, ", 100), new Subfield("a", "Martin Fowler", 400)],
        "d": [new Subfield("d", "1941-", 200),new Subfield("d", "1999-", 300)]
    };
    deepEqual(subfields.a, expected.a);
    deepEqual(subfields.d, expected.d);
    
});


test("Data Field - get subfields data", function() {
    var expected = "|aDylan, Bob, |d1941-";
    var subfields = getTestsubfields(); 
    subfields.addSubfield("a", "Dylan, Bob, ");
    subfields.addSubfield("d", "1941-");
    deepEqual(subfields.getData(), expected);
});

test("Sort field position", function() {
    var json = {
        "leader":"01471cjm a2200349 a 4500",
        "fields":
        [
            {
                "001":"5674874"
            },
            {
                "008":"930331s1963    nyuppn              eng d"
            },
            {
                "100":
                {
                    "subfields":
                    [
                        {
                            "a":"Dylan, Bob,"
                        },
                        {
                            "b":"2001"
                        },
                        {
                            "b":"2002"
                        },
                        {
                            "d":"1941-"
                        }
                    ],
                    "ind1":"1",
                    "ind2":"#"
                }
            }
        ]
    };
    var record = new Record(json);
    deepEqual(record.getMarcJSON(), json);
    record.moveUp(record["008"][0]);
    record.moveDown(record["008"][0]);
    deepEqual(record.getMarcJSON(), json);
    record["100"][0].subfields.moveUp(record["100"][0].subfields["b"][0]);
    record["100"][0].subfields.moveDown(record["100"][0].subfields["b"][0]);
    
    deepEqual(record.getMarcJSON(), json);
    
});

test("Record", function() {
    var json = {
        "leader":"01471cjm a2200349 a 4500",
        "fields":
        [
            {
                "001":"5674874"
            },
            {
                "008":"930331s1963    nyuppn              eng d"
            },
            {
                "100":
                {
                    "subfields":
                    [
                        {
                            "a":"Dylan, Bob,"
                        },
                        {
                            "d":"1941-"
                        }
                    ],
                    "ind1":"1",
                    "ind2":"#"
                }
            }
        ]
    };
    var record = new Record(json);
    deepEqual(record.getMarcJSON(), json);
    json = {
        "leader":"01471cjm a2200349 a 4500",
        "fields":
        [
            {
                "001":"5674874"
            },
            {
                "005":"20030305110405.0"
            },
            {
                "007":"sdubsmennmplu"
            },
            {
                "007":"sdubsmennmplu"
            },
            {
                "008":"930331s1963    nyuppn              eng d"
            },
            {
                "035":
                {
                    "subfields":
                    [
                        {
                            "9":"(DLC)   93707283"
                        }
                    ],
                    "ind1":" ",
                    "ind2":" "
                }
            },
            {
                "906":
                {
                    "subfields":
                    [
                        {
                            "a":"7"
                        },
                        {
                            "b":"cbc"
                        },
                        {
                            "g":"y-soundrec"
                        },
                        {
                            "c":"copycat"
                        },
                        {
                            "d":"4"
                        },
                        {
                            "e":"ncip"
                        },
                        {
                            "f":"19"
                        }
                    ],
                    "ind1":" ",
                    "ind2":" "
                }
            },
            {
                "010":
                {
                    "subfields":
                    [
                        {
                            "a":"   93707283 "
                        }
                    ],
                    "ind1":" ",
                    "ind2":" "
                }
            },
            {
                "028":
                {
                    "subfields":
                    [
                        {
                            "a":"CS 8786"
                        },
                        {
                            "b":"Columbia"
                        }
                    ],
                    "ind1":"0",
                    "ind2":"2"
                }
            },
            {
                "035":
                {
                    "subfields":
                    [
                        {
                            "a":"(OCoLC)13083787"
                        }
                    ],
                    "ind1":" ",
                    "ind2":" "
                }
            },
            {
                "040":
                {
                    "subfields":
                    [
                        {
                            "a":"OClU"
                        },
                        {
                            "c":"DLC"
                        },
                        {
                            "d":"DLC"
                        }
                    ],
                    "ind1":" ",
                    "ind2":" "
                }
            },
            {
                "041":
                {
                    "subfields":
                    [
                        {
                            "d":"eng"
                        },
                        {
                            "g":"eng"
                        }
                    ],
                    "ind1":"0",
                    "ind2":" "
                }
            },
            {
                "042":
                {
                    "subfields":
                    [
                        {
                            "a":"lccopycat"
                        }
                    ],
                    "ind1":" ",
                    "ind2":" "
                }
            },
            {
                "050":
                {
                    "subfields":
                    [
                        {
                            "a":"Columbia CS 8786"
                        }
                    ],
                    "ind1":"0",
                    "ind2":"0"
                }
            },
            {
                "100":
                {
                    "subfields":
                    [
                        {
                            "a":"Dylan, Bob,"
                        },
                        {
                            "d":"1941-"
                        }
                    ],
                    "ind1":"1",
                    "ind2":" "
                }
            },
            {
                "245":
                {
                    "subfields":
                    [
                        {
                            "a":"The freewheelin' Bob Dylan"
                        },
                        {
                            "h":"[sound recording]."
                        }
                    ],
                    "ind1":"1",
                    "ind2":"4"
                }
            },
            {
                "245":
                {
                    "subfields":
                    [
                        {
                            "a":"The freewheelin' Bob Dylan"
                        },
                        {
                            "h":"[sound recording]."
                        }
                    ],
                    "ind1":"1",
                    "ind2":"4"
                }
            },
            {
                "260":
                {
                    "subfields":
                    [
                        {
                            "a":"[New York, N.Y.] :"
                        },
                        {
                            "b":"Columbia,"
                        },
                        {
                            "c":"[1963]"
                        }
                    ],
                    "ind1":" ",
                    "ind2":" "
                }
            },
            {
                "300":
                {
                    "subfields":
                    [
                        {
                            "a":"1 sound disc :"
                        },
                        {
                            "b":"analog, 33 1/3 rpm, stereo. ;"
                        },
                        {
                            "c":"12 in."
                        }
                    ],
                    "ind1":" ",
                    "ind2":" "
                }
            },
            {
                "500":
                {
                    "subfields":
                    [
                        {
                            "a":"Songs."
                        }
                    ],
                    "ind1":" ",
                    "ind2":" "
                }
            },
            {
                "511":
                {
                    "subfields":
                    [
                        {
                            "a":"The composer accompanying himself on the guitar ; in part with instrumental ensemble."
                        }
                    ],
                    "ind1":"0",
                    "ind2":" "
                }
            },
            {
                "500":
                {
                    "subfields":
                    [
                        {
                            "a":"Program notes by Nat Hentoff on container."
                        }
                    ],
                    "ind1":" ",
                    "ind2":" "
                }
            },
            {
                "505":
                {
                    "subfields":
                    [
                        {
                            "a":"Blowin' in the wind -- Girl from the north country -- Masters of war -- Down the highway -- Bob Dylan's blues -- A hard rain's a-gonna fall -- Don't think twice, it's all right -- Bob Dylan's dream -- Oxford town -- Talking World War III blues -- Corrina, Corrina -- Honey, just allow me one more chance -- I shall be free."
                        }
                    ],
                    "ind1":"0",
                    "ind2":" "
                }
            },
            {
                "650":
                {
                    "subfields":
                    [
                        {
                            "a":"Popular music"
                        },
                        {
                            "y":"1961-1970."
                        }
                    ],
                    "ind1":" ",
                    "ind2":"0"
                }
            },
            {
                "650":
                {
                    "subfields":
                    [
                        {
                            "a":"Blues (Music)"
                        },
                        {
                            "y":"1961-1970."
                        }
                    ],
                    "ind1":" ",
                    "ind2":"0"
                }
            },
            {
                "856":
                {
                    "subfields":
                    [
                        {
                            "3":"Preservation copy (limited access)"
                        },
                        {
                            "u":"http://hdl.loc.gov/loc.mbrsrs/lp0001.dyln"
                        }
                    ],
                    "ind1":"4",
                    "ind2":"1"
                }
            },
            {
                "952":
                {
                    "subfields":
                    [
                        {
                            "a":"New"
                        }
                    ],
                    "ind1":" ",
                    "ind2":" "
                }
            },
            {
                "953":
                {
                    "subfields":
                    [
                        {
                            "a":"TA28"
                        }
                    ],
                    "ind1":" ",
                    "ind2":" "
                }
            },
            {
                "991":
                {
                    "subfields":
                    [
                        {
                            "b":"c-RecSound"
                        },
                        {
                            "h":"Columbia CS 8786"
                        },
                        {
                            "w":"MUSIC"
                        }
                    ],
                    "ind1":" ",
                    "ind2":" "
                }
            }
        ]
    }

    record = new Record(json);
    
    deepEqual(record.getMarcJSON(), json);
});


test("Record", function() {
    var json = {
        "leader":"01471cjm a2200349 a 4500",
        "fields":
        [
            {
                "001":"5674874"
            },
            {
                "008":"930331s1963    nyuppn              eng d"
            },
            {
                "100":
                {
                    "subfields":
                    [
                        {
                            "a":"Dylan, Bob,"
                        },
                        {
                            "d":"1941-"
                        }
                    ],
                    "ind1":"1",
                    "ind2":"#"
                }
            }
        ]
    };
    var record = new Record(json);
    var json = {
          "100": [
            {
              "name": "100",
              "ind1": "1",
              "ind2": "#",
              "weight": 300,
              "subfields": {
                "a": [
                  {
                    "name": "a",
                    "data": "Dylan, Bob,",
                    "weight": 100
                  }
                ],
                "d": [
                  {
                    "name": "d",
                    "data": "1941-",
                    "weight": 200
                  }
                ]
              },
              "data": "|aDylan, Bob,|d1941-"
            }
          ],
          "leader": "01471cjm a2200349 a 4500",
          "001": [
            {
              "name": "001",
              "data": "5674874",
              "weight": 100
            }
          ],
          "008": [
            {
              "name": "008",
              "data": "930331s1963    nyuppn              eng d",
              "weight": 200
            }
          ]
        }
    deepEqual(record.getJSON(), json);
});

test("Record Validation", function() {
    var schema = {
      "title": "Marc 21",
      "type": "object",
      "description": "http://www.loc.gov/marc/bibliographic/ecbdhome.html",
      "properties": {"100": {
      "title": "Main Entry-Personal Name",
      "type": "array",
      "description": "http://www.loc.gov/marc/bibliographic/concise/bd100.html",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "title": "name",
            "type": "string"
          },
          "weight": {
            "title": "weight",
            "type": "integer"
          },
          "data": {
            "title": "data",
            "type": "string"
          },
          "ind1": {
            "title": "indicator 1",
            "type": "string",
            "enum": [
              "0",
              "1",
              "3"
            ]
          },
          "ind2": {
            "title": "indicator 2",
            "type": "string",
            "enum": [
              "#"
            ]
          },
          "subfields": {
            "title": "Subfields",
            "type": "object",
            "properties": {
              "0": {
                "title": "Authority record control number",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 99
                }
              },
              "4": {
                "title": "Relator code",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 99
                }
              },
              "6": {
                "title": "Linkage",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 1
                }
              },
              "8": {
                "title": "Field link and sequence number",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 99
                }
              },
              "a": {
                "title": "Personal name",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 1
                }
              },
              "b": {
                "title": "Numeration",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 1
                }
              },
              "c": {
                "title": "Titles and words associated with a name",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 99
                }
              },
              "d": {
                "title": "Dates associated with a name",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 1
                }
              },
              "e": {
                "title": "Relator term",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 99
                }
              },
              "f": {
                "title": "Date of a work",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 1
                }
              },
              "g": {
                "title": "Miscellaneous information",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 1
                }
              },
              "j": {
                "title": "Attribution qualifier",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 99
                }
              },
              "k": {
                "title": "Form subheading",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 99
                }
              },
              "l": {
                "title": "Language of a work",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 1
                }
              },
              "n": {
                "title": "Number of part/section of a work",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 99
                }
              },
              "p": {
                "title": "Name of part/section of a work",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 99
                }
              },
              "q": {
                "title": "Fuller form of name",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 1
                }
              },
              "t": {
                "title": "Title of a work",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 1
                }
              },
              "u": {
                "title": "Affiliation",
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "string"
                    },
                    "name": {
                      "title": "name",
                      "type": "string"
                    },
                    "weight": {
                      "title": "weight",
                      "type": "integer"
                    }
                  },
                  "minItems": 0,
                  "maxItems": 1
                }
              }
            }
          }
        },
        "minItems": 0,
        "maxItems": 1
      }
    }
        
      }
    }
    
    var data = {
        "fields":
        [   
            {
                "100":
                {
                    "subfields":
                    [
                        {
                            "a":"Dylan, Bob,"
                        },
                        {
                            "d":"1941-"
                        }
                    ],
                    "ind1":"1",
                    "ind2":"2"
                }
            }
        ]
    };

    var record = new Record(data, schema);
    record.validate();
    equal(_.size(record.$errors.errors), 1);
});

test("json path", function() {
    var data = {
        "100": [{
            "ind2": "2",
            "subfields": {
                "z": "123"
            }
        }]
    }
    var errors = {
      "errors": [
        {
          "message": "No enum match for: \"a\"",
          "code": 1,
          "dataPath": "/100/0/ind2",
          "schemaPath": "/properties/100/items/properties/ind2/type",
          "subErrors": null
        },
        {
          "message": "Unknown property (not in schema)",
          "code": 1000,
          "dataPath": "/100/0/subfields/z",
          "schemaPath": "",
          "subErrors": null
        }
      ]
    }
    
    
    $.each(errors.errors, function(key, error) {
        var selectors = error.dataPath.substring(1).split("/");
        switch(_.size(selectors) - 1) {
            case 1: 
                data[selectors[0]].error = error;
                break;
            case 2: 
                data[selectors[0]][selectors[1]].error = error;
                break;
            case 3: 
                data[selectors[0]][selectors[1]][selectors[2]].error = error;
                break;
            case 4: 
                data[selectors[0]][selectors[1]][selectors[2]][selectors[3]].error = error;
                break;
        }
        
    });
    ok(true);
    
    var path = "/100/0/ind2";
    var error = _.find(errors.errors, function(_error) {
        return (_error.dataPath == path);
    });
});


test("get array index", function() {
    var data = {
        "fields":
        [   
            {
                "100":
                {
                    "subfields":
                    [
                        {
                            "a":"Dylan, Bob,"
                        },
                        {
                            "d":"1941-"
                        }
                    ],
                    "ind1":"1",
                    "ind2":"2"
                }
            }
        ]
    };

    var record = new Record(data);
    ok(true);
});



