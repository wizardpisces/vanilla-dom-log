/* 
*  dom console mainly for development mobile and PC debug
*/

 import {
     formatLog
 } from './utils';
 
const CONSOLE_RESOURCE_MAP = {
    "error": {
        color: 'red'
    },
    "log": {
        color: "#000"
    }
}
const ORIGINAL_CONSOLE_METHOD_MAP = {}
const METHODS = Object.keys(CONSOLE_RESOURCE_MAP)
METHODS.forEach(method => {
    ORIGINAL_CONSOLE_METHOD_MAP[method] = console[method];
})
const _domLogKey = '_dom-log-key'

export default class DomConsole {
    constructor(options = {
        max_history_length: 10, //persist cache 10 logs
        customStyle: {
            position: 'fixed',
            top: 0,
            height:'400px',
            overflow:'scroll',
            // background: '#fff',
            zIndex: 9999,
            padding:'10px'
        }
    }) {
        this._historyLogs = new Proxy(this._getHistoryLogs(), {
            get(target, propKey) {
                return target[propKey]
            },
            set(target, key, val) {
                target[key] = val
                localStorage.setItem(_domLogKey, JSON.stringify(target.slice(-options.max_history_length)))
                return true;
            }
        });
        this._mountLogRoot(options.customStyle, _domLogKey);
        this.logRoot = document.getElementById(_domLogKey);
        this.logVisible = true;
        this._batchPaintLog(this._historyLogs)
    }

    delegate() {
        return this.undelegate = createProxyMap(this._proxyLog.bind(this));
    }

    _getHistoryLogs() {
        let cache = JSON.parse(localStorage.getItem(_domLogKey))
        return cache || [];
    }

    _batchPaintLog(logs) {
        let fragment = document.createDocumentFragment();
        logs.forEach((logParam) => {
            var li = document.createElement('li');
            li.textContent = formatLog(logParam.logs);
            li.style.color = CONSOLE_RESOURCE_MAP[logParam.method].color;
            fragment.appendChild(li);
        });
        this.logRoot.appendChild(fragment)
    }

    _paintLog(method, content) {
        let li = document.createElement('li')
        li.textContent = content;
        li.style.color = CONSOLE_RESOURCE_MAP[method].color;
        this.logRoot.appendChild(li)
    }

    _proxyLog(logParam) {
        this._historyLogs.push(logParam)
        this._paintLog(logParam.method, formatLog(logParam.logs))
    }

    _mountLogRoot(styleObj, id) {
        let ul = document.createElement('ul')

        ul.setAttribute('id', id)
        Object.keys(styleObj).map(attribute => {
            ul.style[attribute] = styleObj[attribute];
        })
        document.getElementsByTagName('body')[0].appendChild(ul)
    }
}




function createProxyMap(proxyFn) {
    METHODS.forEach(method => {
        console[method] = (...args) => {
            proxyFn({
                method,
                logs: args
            })
            ORIGINAL_CONSOLE_METHOD_MAP[method].apply(null, args)
        }
    })
    return function undelegate() {
        METHODS.forEach(method => {
            console[method] = ORIGINAL_CONSOLE_METHOD_MAP[method]
        })
    }
}