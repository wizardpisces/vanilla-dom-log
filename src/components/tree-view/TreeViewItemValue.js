import {
    h
} from '../../createNode';
import {
    deserialize
} from '../../utils.js'

import _ from '../_'

import {
    getKey
} from './TreeViewItem'

export default class TreeViewItem extends HTMLElement {
    constructor() {
        super()
        const shadowRoot = this.attachShadow({
            mode: 'open'
        });

        this.template = h('div', {
            class: 'tree-view-item-value'
        })

        shadowRoot.appendChild(this.template)
    }

    connectedCallback() {
        this.render(this.data)
    }

    static get observedAttributes() {
        return ['data'];
    }

    get data() {
        if (!this.cached) {
            this.cached = deserialize(this.getAttribute('data'))
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
                getKey(data)
            ]),
            h('span', {
                class: 'value'
            }, [this.getValue(data.value)])
        ]))
    }
}