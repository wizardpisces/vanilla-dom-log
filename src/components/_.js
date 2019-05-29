function isObjectLike(value) {
    return typeof value == 'object' && value !== null
}

function baseGetTag(value) {
    return Object.prototype.toString.call(value)
}

const _ = {
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

        // function Foo() {
        //   this.a = 1
        // }
        // 
        // isPlainObject(new Foo) // =>false
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