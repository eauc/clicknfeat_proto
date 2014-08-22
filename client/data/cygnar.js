{
  "name": "Cygnar",
  "icon": "data/icons/cygnar_50.png",
  "models": {
    "jacks": {
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
