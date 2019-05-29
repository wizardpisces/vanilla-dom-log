import {h} from './createNode';
import cssText from './style.css.js'
import './components'
import {
    serialize,
    _VallinaDomLogKey
} from './utils.js'

export let logRootWrapper = h('ul',{
    class:_VallinaDomLogKey
}, [h('tree-view', {
    data: serialize({
        test: 'test from mount shadow root!',
        fn: function(){return 0},
        info:{
            name : 'lz',
            list :[ 1,2,3]
        }
    })
})]);

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

export const shadowRootDom = h('dom-shadow-root')

document.getElementsByTagName('body')[0].appendChild(shadowRootDom)