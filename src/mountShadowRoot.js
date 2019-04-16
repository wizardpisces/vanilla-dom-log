import {h} from './createNode';
import cssText from './style.css.js'
import {
    _VallinaDomLogKey
} from './utils.js'

export let logRootWrapper = h('ul',{
    class:_VallinaDomLogKey
})

export class DomShadowRoot extends HTMLElement {
    constructor() {
        super();
        // Create a shadow root
        var shadow = this.attachShadow({
            mode: 'open'
        });

        shadow.append(h('style', {
            type: 'text/css'
        }, [cssText]))

        shadow.append(logRootWrapper)
    }
}

customElements.define('dom-shadow-root', DomShadowRoot);

export const shadowRootDom = h('dom-shadow-root')

document.getElementsByTagName('body')[0].appendChild(shadowRootDom)