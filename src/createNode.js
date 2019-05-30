import { isArray } from "util";

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

export const dom = new Proxy({}, {
    get(target, property) {
        return function (attrs = {}, children) {

            const el = document.createElement(property);

            for (let prop of Object.keys(attrs)) {

                if(prop === 'style'){

                    Object.keys(attrs.style).map(attribute=>{
                        el.style[attribute] = attrs.style[attribute];
                    })

                } else if (prop === 'on' && typeof attrs[prop] === 'object') { //follow vue render function parse event
                    // el[prop.replace(eventNameRegx ,'on$2')] = attrs[prop]
                    Object.keys(attrs[prop]).map(event=>{
                        el['on' + event] = attrs[prop][event]
                    })

                }else{

                    el.setAttribute(prop, attrs[prop]);
                    
                }
            }
            for (let child of children) {

                if ( !isElement(child) ) {
                    child = document.createTextNode(child);
                }
                
                el.appendChild(child);
            }

            return el;

        }
    }
});

export function h(name, props = {}, children) {
    children = isArray(children) ? children : []
    return dom[name](props, children)
}