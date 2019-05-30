# vanilla-dom-log
simple  dom log for development debug, especially mobile device
support console.log and console.error proxy

## How to Use

```
npm install --save-dev vanilla-dom-log
```

```js
import domLog from 'vanilla-dom-log'

let domLog = domLog();

domLog.delegate();

console.log(1); // 1 would print in both chrome console and dom view console

console.log({
    string:'lz',
    list:[1, 2, [2, 3]],
    number: Math.random(),
    fn :function () {
        var a = 1
    },
    regx : /^\s/g,
    date : new Date()
})

domLog.undelegate();

console.log(2) // 2 would only print in chrome console
```

## Extra

default: cache recent 10 log in localStorage

## Todos

* Optimize web component json tree view ( optimize UI and extract web component json tree view as separate package )
* Support recursive object log 
* ts support
