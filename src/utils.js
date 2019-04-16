export function deserialize(serializedJavascript) {
    return eval('(' + serializedJavascript + ')');
}

export const _VallinaDomLogKey = '_vanilla-dom-log-key'
