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

function isDom(ele){
    return ele instanceof HTMLElement
}

export const dom = new Proxy({}, {
    get(target, property) {
        return function (attrs = {}, children) {

            const el = document.createElement(property);

            for (let prop of Object.keys(attrs)) {

                if(prop === 'style'){
                    Object.keys(attrs.style).map(attribute=>{
                        el.style[attribute] = attrs.style[attribute];
                    })
                }else{
                    el.setAttribute(prop, attrs[prop]);
                }
            }
            for (let child of children) {

                if (typeof child === 'string') {
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