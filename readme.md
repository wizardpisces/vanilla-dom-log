# vanilla-dom-log
vanilla dom log for development console debug
especially mobile device

* Support console.log and console.error proxy
* Support circular reference object log
* Isolated from project (Web component shadow root based)

## How to Use

```
npm install --save-dev vanilla-dom-log
```

```js
import domLog from 'vanilla-dom-log'

let domLog = domLog();

domLog.delegate();

console.log(1); // 1 would print in both chrome console and dom view console

/**
 * support different type structure 
 */

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


/**
 * circular reference
*/

var a = {b:1,c:2}; var circular = {a:a}
a.b = a;
circular.d = circular;
console.log(circular);//Object { a: Object { b: "[circular structure]", c: 2 }, d: "[circular structure]" }


domLog.undelegate();

console.log(2) // 2 would only print in chrome console
```

## Extra

default: cache recent 10 log in localStorage

## Todos

* add test cases
* object with open lazy calculate（despite fixed circular reference,console.log(thisvue.$router ) still stuck browser with 100% cpu usage）
* ts support
* Optimize web component json tree view UI
* extract json tree view as separate package
