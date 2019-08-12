/**
  * vanilla-dom-log v4.0.0
  * (c) 2019 wizardpisces
  * @license MIT
  */
'use strict';

/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

// Generate an internal UID to make the regexp pattern harder to guess.
var UID                 = Math.floor(Math.random() * 0x10000000000).toString(16);
var PLACE_HOLDER_REGEXP = new RegExp('"@__(F|R|D|M|S)-' + UID + '-(\\d+)__@"', 'g');

var IS_NATIVE_CODE_REGEXP = /\{\s*\[native code\]\s*\}/g;
var IS_PURE_FUNCTION = /function.*?\(/;
var UNSAFE_CHARS_REGEXP   = /[<>\/\u2028\u2029]/g;

var RESERVED_SYMBOLS = ['*', 'async'];

// Mapping of unsafe HTML and invalid JavaScript line terminator chars to their
// Unicode char counterparts which are safe to use in JavaScript strings.
var ESCAPED_CHARS = {
    '<'     : '\\u003C',
    '>'     : '\\u003E',
    '/'     : '\\u002F',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};

function escapeUnsafeChars(unsafeChar) {
    return ESCAPED_CHARS[unsafeChar];
}

var serializeJavascript = function serialize(obj, options) {
    options || (options = {});

    // Backwards-compatibility for `space` as the second argument.
    if (typeof options === 'number' || typeof options === 'string') {
        options = {space: options};
    }

    var functions = [];
    var regexps   = [];
    var dates     = [];
    var maps      = [];
    var sets      = [];

    // Returns placeholders for functions and regexps (identified by index)
    // which are later replaced by their string representation.
    function replacer(key, value) {
        if (!value) {
            return value;
        }

        // If the value is an object w/ a toJSON method, toJSON is called before
        // the replacer runs, so we use this[key] to get the non-toJSONed value.
        var origValue = this[key];
        var type = typeof origValue;

        if (type === 'object') {
            if(origValue instanceof RegExp) {
                return '@__R-' + UID + '-' + (regexps.push(origValue) - 1) + '__@';
            }

            if(origValue instanceof Date) {
                return '@__D-' + UID + '-' + (dates.push(origValue) - 1) + '__@';
            }

            if(origValue instanceof Map) {
                return '@__M-' + UID + '-' + (maps.push(origValue) - 1) + '__@';
            }

            if(origValue instanceof Set) {
                return '@__S-' + UID + '-' + (sets.push(origValue) - 1) + '__@';
            }
        }

        if (type === 'function') {
            return '@__F-' + UID + '-' + (functions.push(origValue) - 1) + '__@';
        }

        return value;
    }

    function serializeFunc(fn) {
      var serializedFn = fn.toString();
      if (IS_NATIVE_CODE_REGEXP.test(serializedFn)) {
          throw new TypeError('Serializing native function: ' + fn.name);
      }

      // pure functions, example: {key: function() {}}
      if(IS_PURE_FUNCTION.test(serializedFn)) {
          return serializedFn;
      }

      var argsStartsAt = serializedFn.indexOf('(');
      var def = serializedFn.substr(0, argsStartsAt)
        .trim()
        .split(' ')
        .filter(function(val) { return val.length > 0 });

      var nonReservedSymbols = def.filter(function(val) {
        return RESERVED_SYMBOLS.indexOf(val) === -1
      });

      // enhanced literal objects, example: {key() {}}
      if(nonReservedSymbols.length > 0) {
          return (def.indexOf('async') > -1 ? 'async ' : '') + 'function'
            + (def.join('').indexOf('*') > -1 ? '*' : '')
            + serializedFn.substr(argsStartsAt);
      }

      // arrow functions
      return serializedFn;
    }

    var str;

    // Creates a JSON string representation of the value.
    // NOTE: Node 0.12 goes into slow mode with extra JSON.stringify() args.
    if (options.isJSON && !options.space) {
        str = JSON.stringify(obj);
    } else {
        str = JSON.stringify(obj, options.isJSON ? null : replacer, options.space);
    }

    // Protects against `JSON.stringify()` returning `undefined`, by serializing
    // to the literal string: "undefined".
    if (typeof str !== 'string') {
        return String(str);
    }

    // Replace unsafe HTML and invalid JavaScript line terminator chars with
    // their safe Unicode char counterpart. This _must_ happen before the
    // regexps and functions are serialized and added back to the string.
    if (options.unsafe !== true) {
        str = str.replace(UNSAFE_CHARS_REGEXP, escapeUnsafeChars);
    }

    if (functions.length === 0 && regexps.length === 0 && dates.length === 0 && maps.length === 0 && sets.length === 0) {
        return str;
    }

    // Replaces all occurrences of function, regexp, date, map and set placeholders in the
    // JSON string with their string representations. If the original value can
    // not be found, then `undefined` is used.
    return str.replace(PLACE_HOLDER_REGEXP, function (match, type, valueIndex) {
        if (type === 'D') {
            return "new Date(\"" + dates[valueIndex].toISOString() + "\")";
        }

        if (type === 'R') {
            return regexps[valueIndex].toString();
        }

        if (type === 'M') {
            return "new Map(" + serialize(Array.from(maps[valueIndex].entries()), options) + ")";
        }

        if (type === 'S') {
            return "new Set(" + serialize(Array.from(sets[valueIndex].values()), options) + ")";
        }

        var fn = functions[valueIndex];

        return serializeFunc(fn);
    });
};

function isObjectLike(value) {
    return typeof value == 'object' && value !== null
}

function baseGetTag(value) {
    return Object.prototype.toString.call(value)
}

/**
 * Get the first item that pass the test
 * by second argument function
 *
 * @param {Array} list
 * @param {Function} f
 * @return {*}
 */

function find(list, f) {
    return list.filter(f)[0]
}

/**
 * Deep copy the given object considering circular structure.
 * This function caches nested objects and its copies.
 * Traverse the Object by DFS, keep track of object path with cache
 * If it detects circular structure, use cached copy to avoid infinite loop.
 *
 * @param {*} obj
 * @param {Boolean} replaceCircularReference //replace circular reference with string '[circular structure]' or not
 * @return {*}
 */

const deepCopyWithCircularReferenceReplaced = (function () {
    var cache = [];
    return function deepCopy(obj, replaceCircularReference = false) {
        // just return if obj is immutable value
        if (obj === null || typeof obj !== 'object') {
            return obj
        }

        // if obj is hit, it is in circular structure
        const hit = find(cache, c => c.original === obj);
        if (hit) {
            return replaceCircularReference && `[circular structure]` || hit.copy
        }

        const copy = Array.isArray(obj) ? [] : {};
        // put the copy into cache at first
        // because we want to refer it in recursive deepCopy
        cache.push({
            original: obj,
            copy
        });

        Object.keys(obj).forEach(key => {
            copy[key] = deepCopy(obj[key], replaceCircularReference);

        });
        
        replaceCircularReference && cache.pop(); //when you do not care about circular reference ,this could prevent duplicate copy 

        return copy
    }
})();


const _ = {
    deepCopyWithCircularReferenceReplaced,
    map(collection, iteratee) {
        let isArray = _.isArray(collection);
        return Object.keys(collection).map(keyOrIndex => {
            return iteratee(collection[keyOrIndex], isArray ? parseInt(keyOrIndex) : keyOrIndex )
        })
    },
    isArray(value) {
        return Array.isArray(value)
    },
    isPlainObject(value) {
        // 非object类型
        if (!isObjectLike(value) || baseGetTag(value) != '[object Object]') {
            return false
        }
        // 空对象，如Object.create(null)
        if (Object.getPrototypeOf(value) === null) {
            return true
        }
        let proto = value;

        /*  
            function Foo() {
            this.a = 1
            }
            
            isPlainObject(new Foo) // =>false 
        */

        while (Object.getPrototypeOf(proto) !== null) {
            // 给定对象的原型。如果没有继承属性，则返回 null 
            proto = Object.getPrototypeOf(proto);
        }
        return Object.getPrototypeOf(value) === proto
    },
    isInteger(value){
        return Number.isInteger(value);
    },
    isNumber(value){
        return typeof value === 'number'
    },
    isNull(value){
        return typeof value === 'null'
    },
    isString(value){
        return typeof value === 'string'
    }
};

function deserialize(serializedJavascript) {
    return eval('(' + serializedJavascript + ')');
}

const _VallinaDomLogKey = '_vanilla-dom-log-key';

// const createVNode = function (name, props, children) {
//     return {
//         name: name,
//         props: props,
//         children: children
//     }
// }

// export function h(name, props, children) {
//     return createVNode(name,props,children)
// }

/* 
todos : change to Vnode
*/

/* 
* https: //stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
 */
function isElement(obj) {
    try {
        //Using W3 DOM2 (works for FF, Opera and Chrome)
        return obj instanceof HTMLElement;
    } catch (e) {
        //Browsers not supporting W3 DOM2 don't have HTMLElement and
        //an exception is thrown and we end up here. Testing some
        //properties that all elements have (works on IE7)
        return (typeof obj === "object") &&
            (obj.nodeType === 1) && (typeof obj.style === "object") &&
            (typeof obj.ownerDocument === "object");
    }
}

// let eventNameRegx = /^(\:)(\w+)/

// function isEvent(name,value){
//     return eventNameRegx.test(name)
// }

const dom = new Proxy({}, {
    get(target, property) {
        return function (attrs = {}, children) {

            const el = document.createElement(property);

            for (let prop in attrs) {

                if(prop === 'style'){

                    Object.keys(attrs.style).map(attribute=>{
                        el.style[attribute] = attrs.style[attribute];
                    });

                } else if (prop === 'on' && typeof attrs[prop] === 'object') { //follow vue render function parse event
                    // el[prop.replace(eventNameRegx ,'on$2')] = attrs[prop]
                    Object.keys(attrs[prop]).map(event=>{
                        el['on' + event] = attrs[prop][event];
                    });

                }else{

                    el.setAttribute(prop, attrs[prop]);
                    
                }
            }
            for (let childKey in children) {

                let child = children[childKey];
                if ( !isElement(child) ) {
                    child = document.createTextNode(child);
                }
                
                el.appendChild(child);
            }

            return el;

        }
    }
});

function h(name, props = {}, children) {
    children = Array.isArray(children) ? children : [];
    return dom[name](props, children)
}

var cssText = `

.tree-view-wrapper {
  overflow: auto;
}

/* Find the first nested node and override the indentation */
.tree-view-item-root > .tree-view-item-leaf > .tree-view-item {
  margin-left: 0!important;
}

/* Root node should not be indented */
.tree-view-item-root {
  margin-left: 0!important;
}
`;

function transformValue(valueToTransform, keyForValue, isRootObject = false) {
    return {
        key: keyForValue,
        type: "value",
        isRoot: isRootObject,
        value: valueToTransform
    }
}

// Since we use lodash, the _.map method will work on
// both Objects and Arrays, returning either the Key as
// a string or the Index as an integer
function generateChildrenFromCollection(collection) {
    return _.map(collection, (value, keyOrIndex) => {
        if (isObject(value)) {
            return transformObject(value, keyOrIndex);
        }
        if (isArray(value)) {
            return transformArray(value, keyOrIndex);
        }
        if (isValue(value)) {
            return transformValue(value, keyOrIndex);
        }
    });
}

// Transformer for the Array type
function transformArray(arrayToTransform, keyForArray) {
    return {
        key: keyForArray,
        type: "array",
        children: generateChildrenFromCollection(arrayToTransform)
    }
}

// Transformer for the Object type
function transformObject(objectToTransform, keyForObject, isRootObject = false) {
    return {
        key: keyForObject,
        type: "object",
        isRoot: isRootObject,
        children: generateChildrenFromCollection(objectToTransform)
    }
}

function isObject(value){
    return _.isPlainObject(value)
}

function isArray(value){
    return _.isArray(value)
}

function isValue(value) {
    return !isObject(value) && !isArray(value);
}

function parsedData(data) {

    data = _.deepCopyWithCircularReferenceReplaced(data, [], true); //fix circular reference Maximum call stack size exceeded
    // Take the JSON data and transform
    // it into the Tree View DSL

    // Strings or Integers should not be attempted to be split, so we generate
    // a new object with the string/number as the value
    if (isValue(data)) {
        return transformValue(data, 'root', true);
    }

    // If it's an object or an array, transform as an object
    return transformObject(data, 'root', true);
}

class TreeView extends HTMLElement {
    constructor() {
        super();

        const shadowRoot = this.attachShadow({
            mode: 'open'
        });

        shadowRoot.append(h('style', {
            type: 'text/css'
        }, [cssText]));

        this.treeViewDom = h('div', {
            class: 'tree-view-wrapper'
        });

        shadowRoot.appendChild(this.treeViewDom);

    }

    connectedCallback() {
        this.render(this.data);
    }

    disconnectedCallback() {
        console.log('disconnected!');
    }

    get data(){
        if (!this.cached) {
            this.cached = deserialize(this.getAttribute('data'));
        }
        return this.cached;
    }

    // attributeChangedCallback(name, oldVal, newVal) {
    //     console.log(`Attribute: ${name} changed!`, oldVal, newVal, Object.prototype.toString.call(newVal));

    //     if (name === 'data') {
    //         this.render(newVal)

    //     }
    // }

    static get observedAttributes() {
        return ['data'];
    }

    render(data) {
        data = parsedData(data);
        this.treeViewDom.replaceWith(
            h('div', {
                class: 'tree-view-wrapper'
            }, [h('tree-view-item', {
                class: 'tree-view-item-root',
                data: serializeJavascript(data)
            })])
        );
    }

}

function isObject$1(value) {
    return value.type === 'object';
}

function isArray$1(value) {
    return value.type === 'array';
}

function isValue$1(value) {
    return value.type === 'value';
}

function getKey(value) {
    if (_.isInteger(value.key)) {
        return value.key + ":";
    } else {
        return "\"" + value.key + "\":";
    }
}

var cssText$1 = `
    .tree-view-item {
        font-family: monaco, monospace;
        font-size: 14px;
        margin-left: 18px;
    }

    .tree-view-item-node {
        cursor: pointer;
        position: relative;
        white-space: nowrap;
    }

    .tree-view-item-leaf {
        white-space: nowrap;
    }

    .tree-view-item-key {
        font-weight: bold;
    }

    .tree-view-item-key-with-chevron {
        padding-left: 14px;
    }


    .tree-view-item-key-with-chevron.opened::before {
        top:4px;
        transform: rotate(90deg);
        -webkit-transform: rotate(90deg);
    }

    .tree-view-item-key-with-chevron::before {
        color: #444;
        content: '${String.fromCodePoint(0X25b6)}';
        font-size: 10px;
        left: 1px;
        position: absolute;
        top: 3px;
        transition: -webkit-transform .1s ease;
        transition: transform .1s ease;
        transition: transform .1s ease, -webkit-transform .1s ease;
        -webkit-transition: -webkit-transform .1s ease;
    }

    .tree-view-item-hint {
        color: #ccc
    }
`;

class TreeViewItem extends HTMLElement {
    constructor() {
        super();

        this.open = false;

        const shadowRoot = this.attachShadow({
            mode: 'open'
        });

        shadowRoot.append(h('style', {
            type: 'text/css'
        }, [cssText$1]));

        this.template = h('div', {
            class: 'tree-view-item'
        });

        shadowRoot.appendChild(this.template);
    }

    connectedCallback() {
        this.render(this.data);
    }


    // attributeChangedCallback(name, oldVal, newVal) {
    //     console.log(`Attribute: ${name} changed!`, oldVal, newVal);

    //     if (name === 'data') {
    //         this.render(newVal)
    //     }
    // }

    static get observedAttributes() {
        return ['data'];
    }

    get data() {
        if (!this.cached) {
            this.cached = deserialize(this.getAttribute('data'));
        }
        return this.cached;
    }

    render(data) {
        this.template.replaceWith(this.template = h('div', { // change template for rerender
            class: 'tree-view-item'
        }, [
            this.getProperTreeViewItem(data)
        ]));
    }

    toggleOpen() {
        this.open = !this.open;
        this.render(this.data);
    }

    getProperTreeViewItem(data) {

        function getObjectTemplate(data) {
            let label = isObject$1(data) ? (data.children.length > 1 ? ' Object{...}' : 'Object') :
                (isArray$1(data) ? (data.children.length > 1 ? ` Array[...]` : 'Array') : '');

            return h('div', {
                class: 'tree-view-item-node',
                on: {
                    click: this.toggleOpen.bind(this)
                }
            }, [
                h('span', {
                    class: 'tree-view-item-key tree-view-item-key-with-chevron ' + (this.open ? 'opened' : '')
                }, [data.isRoot ? '' : getKey(data)]),

                 h('span', {
                    class: "tree-view-item-hint"
                }, [data.children.length + ' ' + label])

            ])
        }

        if (isObject$1(data) || isArray$1(data)) {

            let children = this.open ? data.children.map(child => h('tree-view-item', {
                    data: serializeJavascript(child)
                })) : [];

            return h('div', {
                class: 'tree-view-item-leaf'
            }, [
                getObjectTemplate.call(this, data),
                ...children
            ])
        }

        return isValue$1(data) ? h('tree-view-item-value', {
            class: 'tree-view-item-leaf',
            data: serializeJavascript(data)
        }) : '[ TreeViewBug ] :unknown_data_type'

    }
}

class TreeViewItem$1 extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({
            mode: 'open'
        });

        this.template = h('div', {
            class: 'tree-view-item-value'
        });

        shadowRoot.appendChild(this.template);
    }

    connectedCallback() {
        this.render(this.data);
    }

    static get observedAttributes() {
        return ['data'];
    }

    get data() {
        if (!this.cached) {
            this.cached = deserialize(this.getAttribute('data'));
        }
        return this.cached;
    }

    getValue(value) {
        if (_.isNumber(value)) {
            return value
        }
        if (_.isNull(value)) {
            return "null"
        }
        if (_.isString(value)) {
            return "\"" + value + "\"";
        }

        return value;
    }


    render(data) {
        this.template.replaceWith(h('div', {
            class: 'tree-view-item-value'
        }, [
            h('span', {
                class: 'tree-view-item-key'
            }, [
                data.isRoot ? '' : getKey(data)
            ]),
            h('span', {
                class: 'value'
            }, [this.getValue(data.value)])
        ]));
    }
}

customElements.define('tree-view-item-value', TreeViewItem$1);
customElements.define('tree-view-item', TreeViewItem);
customElements.define('tree-view', TreeView);

function renderJsonTree(data){
    return h('tree-view', {
        data: serializeJavascript(data)
    })
}

let rootClass = _VallinaDomLogKey;

var cssText$2 = `
.${rootClass}{
    position: fixed;
    top: 0;
    height: 400px;
    overflow: scroll;
    z-index: 9999;
    padding: 10px;
}
.${rootClass} li {
     display: flex;
     border-bottom:0.5px solid #ccc;
 }
`;

let logRootWrapper = h('ul',{
    class:_VallinaDomLogKey
});

class DomShadowRoot extends HTMLElement {
    constructor() {
        super();
        // Create a shadow root
        let shadowRoot = this.attachShadow({
            mode: 'open'
        });

        shadowRoot.append(h('style', {
            type: 'text/css'
        }, [cssText$2]));


        shadowRoot.append(logRootWrapper);
    }
}

customElements.define('dom-shadow-root', DomShadowRoot);

document.getElementsByTagName('body')[0].appendChild(h('dom-shadow-root'));

/* 
 *  dom console mainly for development mobile and PC debug
 */

const CONSOLE_RESOURCE_MAP = {
    "error": {
        color: 'red'
    },
    "log": {
        color: "#000"
    }
};

const ORIGINAL_CONSOLE_METHOD_MAP = {};
const METHODS = Object.keys(CONSOLE_RESOURCE_MAP);
METHODS.forEach(method => {
    ORIGINAL_CONSOLE_METHOD_MAP[method] = console[method];
});

class VanillaDomConsole {
    constructor(options = {
        max_history_length: 10, //persist cache 10 logs
        customStyle: {},
        logRoot: logRootWrapper
    }) {
        this._historyLogs = new Proxy(this._getHistoryLogs(), {
            get(target, propKey) {
                return target[propKey]
            },
            set(target, key, val) {
                target[key] = val;
                //replace JSON.stringify to serialize to prevent type function regex ... not correctly stored
                localStorage.setItem(_VallinaDomLogKey, serializeJavascript(target.slice(-options.max_history_length)));
                return true;
            }
        });

        this.logRoot = options.logRoot;
        this._batchPaintLog(this._historyLogs);
    }

    delegate() {
        return this.undelegate = createProxyMap(this._proxyLog.bind(this));
    }

    _getHistoryLogs() {
        let cache = deserialize(localStorage.getItem(_VallinaDomLogKey));
        return cache || [];
    }

    _batchPaintLog(historyLogRecords) {
        let fragment = document.createDocumentFragment();
        historyLogRecords.forEach((logParam) => {
            fragment.appendChild(
                h('li', {
                    color: CONSOLE_RESOURCE_MAP[logParam.method].color
                }, formatLog(...logParam.logs))
            );
        });
        // debugger
        this.logRoot.appendChild(fragment);
    }

    _paintLog(logParam) {
        this.logRoot.appendChild(
            h('li', {
                color: CONSOLE_RESOURCE_MAP[logParam.method].color
            }, formatLog(...logParam.logs))
        );
    }

    _proxyLog(logParam) {
        this._historyLogs.push(logParam);
        this._paintLog(logParam);
    }
}


function createProxyMap(proxyFn) {
    METHODS.forEach(method => {
        console[method] = (...args) => {
            proxyFn({
                method,
                logs: args.map(arg => _.deepCopyWithCircularReferenceReplaced(arg, true)) //fix circular reference Maximum call stack size exceeded
            });
            ORIGINAL_CONSOLE_METHOD_MAP[method].apply(null, args);
        };
    });
    return function undelegate() {
        METHODS.forEach(method => {
            console[method] = ORIGINAL_CONSOLE_METHOD_MAP[method];
        });
    }
}

function formatLog(...logs) {
    return logs.map(log => {
            return renderJsonTree(log)
    })
}

function getInstance() {
    let instance = null;
    return (options) => {

        if (!instance) {
            instance = new VanillaDomConsole(options);
        }
        return instance;
    }
}

var index = getInstance();

module.exports = index;
