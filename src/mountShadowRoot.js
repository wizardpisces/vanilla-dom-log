import {h} from './createNode';
import cssText from './style.css.js'
import './components'
import {
    serialize,
    _VallinaDomLogKey
} from './utils.js'

export let logRootWrapper = h('ul',{
    class:_VallinaDomLogKey
});

export class DomShadowRoot extends HTMLElement {
    constructor() {
        super();
        // Create a shadow root
        let shadowRoot = this.attachShadow({
            mode: 'open'
        });

        shadowRoot.append(h('style', {
            type: 'text/css'
        }, [cssText]))


        shadowRoot.append(logRootWrapper)
    }
}

customElements.define('dom-shadow-root', DomShadowRoot);

document.getElementsByTagName('body')[0].appendChild(h('dom-shadow-root'))

export default logRootWrapper
