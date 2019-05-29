import {
    h
} from '../../createNode';
import {
    serialize,
    deserialize
} from '../../utils.js'

import _ from '../_'

function isObject(value) {
    return value.type === 'object';
}
function isArray(value) {
    return value.type === 'array';
}
function isValue(value) {
    return value.type === 'value';
}

export function getKey(value) {
    if (_.isInteger(value.key)) {
        return value.key + ":";
    } else {
        return "\"" + value.key + "\":";
    }
}

var cssText = `
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
`

export default class TreeViewItem extends HTMLElement {
    constructor() {
        super()

        this.open = false;

        const shadowRoot = this.attachShadow({
            mode: 'open'
        });

         shadowRoot.append(h('style', {
            type: 'text/css'
        }, [cssText]))

        this.template = h('div', {
            class: 'tree-view-item'
        })

        shadowRoot.appendChild(this.template)
    }

    connectedCallback() {
        this.render(this.data)
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
        return this.getAttribute('data')
    }

    render(data) {
        data = deserialize(data);
        this.template.replaceWith(h('div', {
            class: 'tree-view-item'
        }, [
            this.getProperTreeViewItem(data)
        ]))
    }

    toggleOpen () {
        this.open = !this.open;
        console.log(this.open)
    }

    getProperTreeViewItem(data){

        function getObjectTemplate(data){
            let label = isObject(data) ? (data.children.length > 1 ? 'properties' : 'property') : 
                        ( isArray(data) ? (data.children.length > 1 ? 'items' : 'item') : '')


            return h('div',{
                class: 'tree-view-item-node',
                ':click':this.toggleOpen.bind(this)
            },[
                h('span',{
                    class:'tree-view-item-key tree-view-item-key-with-chevron ' + (this.open ? 'opened' : '')
                },[getKey(data)]),
                    h('span', {
                        class: "tree-view-item-hint"
                    }, [ data.children.length + ' '+ label] )
                
            ])
        }

        if(isObject(data) || isArray(data)){

            return h('div',{
                class: 'tree-view-item-leaf'
            },[
                getObjectTemplate.call(this,data),
                ...data.children.map( child => h('tree-view-item', {data: serialize(child) }) )
            ])
        }

        return isValue(data) ? h('tree-view-item-value',{
            class : 'tree-view-item-leaf',
            data : serialize(data)
        }) : '[ TreeViewBug ] :unknown_data_type'

    }
}