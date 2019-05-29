import serialize from 'serialize-javascript'

function deserialize(serializedJavascript) {
    return eval('(' + serializedJavascript + ')');
}

const _VallinaDomLogKey = '_vanilla-dom-log-key'

export {
    serialize,
    deserialize,
    _VallinaDomLogKey
}