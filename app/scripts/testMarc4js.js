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
    deepEqual(record.getJSON(), json);
    record.moveUp(record["008"][0]);
    record.moveDown(record["008"][0]);
    deepEqual(record.getJSON(), json);
    record["100"][0].subfields.moveUp(record["100"][0].subfields["b"][0]);
    record["100"][0].subfields.moveDown(record["100"][0].subfields["b"][0]);
    
    deepEqual(record.getJSON(), json);
    
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
    deepEqual(record.getJSON(), json);
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
    
    deepEqual(record.getJSON(), json);
});


