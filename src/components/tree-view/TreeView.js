import {
    h
} from '../../createNode';

import {
    serialize,
    deserialize
} from '../../utils.js'

import cssText from '../css'

import parseData from '../parseData'

export default class TreeView extends HTMLElement {
    constructor() {
        super()

        const shadowRoot = this.attachShadow({
            mode: 'open'
        });

        shadowRoot.append(h('style', {
            type: 'text/css'
        }, [cssText]))

        this.treeViewDom = h('div', {
            class: 'tree-view-wrapper'
        })

        shadowRoot.appendChild(this.treeViewDom)

    }

    connectedCallback() {
        this.render(this.data)
    }

    disconnectedCallback() {
        console.log('disconnected!');
    }

    get data(){
        if (!this.cached) {
            this.cached = deserialize(this.getAttribute('data'))
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
        data = parseData(data);
        this.treeViewDom.replaceWith(
            h('div', {
                class: 'tree-view-wrapper'
            }, [h('tree-view-item', {
                class: 'tree-view-item-root',
                data: serialize(data)
            })])
        )
    }

}