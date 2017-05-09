# Netatmo

Receives data from __Netatmo Weather Station__. Each station has to be authorized first. __IMPORTANT__: `input` has to be MAC address from your Netatmo station.

### How to obtain MAC address?

Open https://my.netatmo.com/app/station and click on the settings. There is your MAC address. For example `70:ee:50:12:95:f2`.

### Output example

```json
[
  {
    "altitude": 362,
    "lat": 19.158087,
    "lng": 48.728146,
    "name": "mSirkovci",
    "humidity": 51,
    "co2": 1671,
    "temperature": 23.3,
    "temperaturetrend": "stable",
    "noise": 43,
    "pressure": 1017,
    "pressuretrend": "up",
    "indoor": [],
    "outdoor": [
      {
        "temperaturetrend": "up",
        "temperature": 3.8,
        "humidity": 89,
        "temperaturemin": 3.4,
        "temperaturemax": 15.2,
        "battery": 72,
        "name": "Module"
      }
    ]
  }
]
```