# Flagdage (Flag Days)

This is a library for getting information about flag days for busses in the greater Copenhagen area. It provides a list of known flag days for the current year as well as utilities for finding upcoming or previous flag days based on a given date.

## Use

```
npm install flagdage --save
```

Simply require this package:

```javascript
const { FlagDag, flagDays, getFlagDay, getNextFlagDay, getPreviousFlagDay } = require(flagdage);

// Use the list of known flag days
console.log(flagDays[0].name); // output: "Nytårsdag"

// Get the flag day for a certain date
console.log(getFlagDay('2018-04-16').name); // output: "Dronning Margrethes fødselsdag"

// Get the next flag day from a certain date (passing no argument defaults to the current day)
console.log(getNextFlagDay('2018-05-04').name) // output: 'Europadag'
```

## TODO
* Allow localizing `FlagDay` names.

## Acknowledgements

The core of this was extracted from [this project](https://github.com/JamieMagee/flagdage) by @JamieMagee which uses a scheduled azure function to check if it is a flag day and tweets it out.