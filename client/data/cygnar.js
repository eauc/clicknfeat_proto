{
  "name": "Cygnar",
  "icon": "data/icons/cygnar_50.png",
  "models": {
    "jacks": {
      "grenadier": {
        "name": "Grenadier",
        "type": "jack",
        "base": "medium",
        "width": 60,
        "height": 60,
        "img": {
          "x": 0.2,
          "y": -0.2,
          "link": "data/cygnar/jacks/Grenadier.png"
        },
        "damage": {
          "type": "jack",
          "1": [ null, null,  "b",  "b",  "l", null ],
          "2": [ null, null,  "b",  "l",  "l",  "m" ],
          "3": [ null,  "b",  "b",  "b",  "m",  "m" ],
          "4": [ null,  "b",  "b",  "b",  "c",  "c" ],
          "5": [ null, null,  "b",  "r",  "r",  "c" ],
          "6": [ null, null,  "b",  "b",  "r", null ]
        }
      },
      "hammersmith": {
        "name": "Hammersmith",
        "type": "jack",
        "base": "large",
        "width": 60,
        "height": 60,
        "img": {
          "x": 0.2,
          "y": -0.2,
          "link": "data/cygnar/jacks/Hammersmith.png"
        },
        "damage": {
          "type": "jack",
          "1": [ null,  "b",  "b",  "b",  "l", null ],
          "2": [ null,  "b",  "b",  "l",  "l",  "m" ],
          "3": [  "b",  "b",  "b",  "b",  "m",  "m" ],
          "4": [  "b",  "b",  "b",  "b",  "c",  "c" ],
          "5": [ null,  "b",  "b",  "r",  "r",  "c" ],
          "6": [ null,  "b",  "b",  "b",  "r", null ]
        }
      },
      "stormwall": {
        "name": "Stormwall",
        "type": "jack",
        "base": "huge",
        "width": 116.667,
        "height": 116.667,
        "img": {
          "x": 0,
          "y": 0,
          "link": "data/cygnar/jacks/Stormwall.png"
        },
        "damage": {
          "type": "colossal",
          "L1": [ null, null,  "b",  "b",  "l",  "l" ],
          "L2": [ null, null,  "b",  "l",  "l",  "c" ],
          "L3": [ null, null,  "b",  "l",  "c",  "m" ],
          "L4": [ null,  "b",  "b",  "l",  "c",  "m" ],
          "L5": [ null,  "b",  "s",  "s",  "c",  "m" ],
          "L6": [  "b",  "b",  "s",  "c",  "c",  "m" ],
          "R1": [  "b",  "b",  "s",  "c",  "c",  "m" ],
          "R2": [ null,  "b",  "s",  "s",  "c",  "m" ],
          "R3": [ null,  "b",  "b",  "r",  "c",  "m" ],
          "R4": [ null, null,  "b",  "r",  "c",  "m" ],
          "R5": [ null, null,  "b",  "r",  "r",  "c" ],
          "R6": [ null, null,  "b",  "b",  "r",  "r" ]
        }
      }
    },
    "units": {
      "trencher_infantry": {
        "name": "Trencher Infantry",
        "grunt": {
          "name": "Trencher Infantry Grunt",
          "ranges": [1, 6, 10],
          "type": "warrior",
          "base": "small",
          "width": 60,
          "height": 60,
          "img": {
            "x": 0.2,
            "y": -0.5,
            "link": "data/cygnar/units/Trencher_Grunt.png"
          },
          "damage": {
            "type": "warrior",
            "n": 1
          }
        },
        "wa": {
          "grenadier": {
            "name": "Trencher Infantry Grenadier",
            "ranges": [1, 2],
            "type": "warrior",
            "base": "small",
            "width": 60,
            "height": 60,
            "img": {
              "x": 0.2,
              "y": -0.5,
              "link": "data/cygnar/units/Trencher_Grenade_Porter.png"
            },
            "damage": {
              "type": "warrior",
              "n": 1
            }
          }
        },
        "ua": {
          "officer": {
            "name": "Trencher Infantry Officer",
            "type": "warrior",
            "base": "small",
            "width": 60,
            "height": 60,
            "img": {
              "x": 0.2,
              "y": -0.5,
              "link": "data/cygnar/units/Trencher_Officer.png"
            },
            "damage": {
              "type": "warrior",
              "n": 5
            }
          },
          "sniper": {
            "name": "Trencher Infantry Sniper",
            "type": "warrior",
            "base": "small",
            "width": 60,
            "height": 60,
            "img": {
              "x": 0.2,
              "y": -0.5,
              "link": "data/cygnar/units/Trencher_Sharpshooter.png"
            },
            "damage": {
              "type": "warrior",
              "n": 1
            }
          }
        }
      }      
    },
    "solos": {
      "stormwall_pod": {
        "name": "Stormwall Pod",
        "type": "warrior",
        "base": "small",
        "width": 60,
        "height": 60,
        "img": {
          "x": 0.2,
          "y": -0.5,
          "link": "data/cygnar/solos/Stormwall_Pod.png"
        },
        "damage": {
          "type": "warrior",
          "n": 18
        }
      }
    }
  }
}
