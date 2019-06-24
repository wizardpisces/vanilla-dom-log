function isObjectLike(value) {
    return typeof value == 'object' && value !== null
}

function baseGetTag(value) {
    return Object.prototype.toString.call(value)
}

/**
 * Get the first item that pass the test
 * by second argument function
 *
 * @param {Array} list
 * @param {Function} f
 * @return {*}
 */

function find(list, f) {
    return list.filter(f)[0]
}

/**
 * Deep copy the given object considering circular structure.
 * This function caches nested objects and its copies.
 * Traverse the Object by DFS, keep track of object path with cache
 * If it detects circular structure, use cached copy to avoid infinite loop.
 *
 * @param {*} obj
 * @param {Boolean} replaceCircularReference //replace circular reference with string '[circular structure]' or not
 * @return {*}
 */

export const deepCopyWithCircularReferenceReplaced = (function () {
    var cache = []
    return function deepCopy(obj, replaceCircularReference = false) {
        // just return if obj is immutable value
        if (obj === null || typeof obj !== 'object') {
            return obj
        }

        // if obj is hit, it is in circular structure
        const hit = find(cache, c => c.original === obj)
        if (hit) {
            return replaceCircularReference && `[circular structure]` || hit.copy
        }

        const copy = Array.isArray(obj) ? [] : {}
        // put the copy into cache at first
        // because we want to refer it in recursive deepCopy
        cache.push({
            original: obj,
            copy
        })

        Object.keys(obj).forEach(key => {
            copy[key] = deepCopy(obj[key], replaceCircularReference)

        })
        
        replaceCircularReference && cache.pop(); //when you do not care about circular reference ,this could prevent duplicate copy 

        return copy
    }
})()


const _ = {
    deepCopyWithCircularReferenceReplaced,
    map(collection, iteratee) {
        let isArray = _.isArray(collection);
        return Object.keys(collection).map(keyOrIndex => {
            return iteratee(collection[keyOrIndex], isArray ? parseInt(keyOrIndex) : keyOrIndex )
        })
    },
    isArray(value) {
        return Array.isArray(value)
    },
    isPlainObject(value) {
        // 非object类型
        if (!isObjectLike(value) || baseGetTag(value) != '[object Object]') {
            return false
        }
        // 空对象，如Object.create(null)
        if (Object.getPrototypeOf(value) === null) {
            return true
        }
        let proto = value;

        /*  
            function Foo() {
            this.a = 1
            }
            
            isPlainObject(new Foo) // =>false 
        */

        while (Object.getPrototypeOf(proto) !== null) {
            // 给定对象的原型。如果没有继承属性，则返回 null 
            proto = Object.getPrototypeOf(proto)
        }
        return Object.getPrototypeOf(value) === proto
    },
    isInteger(value){
        return Number.isInteger(value);
    },
    isNumber(value){
        return typeof value === 'number'
    },
    isNull(value){
        return typeof value === 'null'
    },
    isString(value){
        return typeof value === 'string'
    }
}

export default _