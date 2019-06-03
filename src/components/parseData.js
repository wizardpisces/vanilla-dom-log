import _ from './_.js'

function transformValue(valueToTransform, keyForValue, isRootObject = false) {
    return {
        key: keyForValue,
        type: "value",
        isRoot: isRootObject,
        value: valueToTransform
    }
}

// Since we use lodash, the _.map method will work on
// both Objects and Arrays, returning either the Key as
// a string or the Index as an integer
function generateChildrenFromCollection(collection) {
    return _.map(collection, (value, keyOrIndex) => {
        if (isObject(value)) {
            return transformObject(value, keyOrIndex);
        }
        if (isArray(value)) {
            return transformArray(value, keyOrIndex);
        }
        if (isValue(value)) {
            return transformValue(value, keyOrIndex);
        }
    });
}

// Transformer for the Array type
function transformArray(arrayToTransform, keyForArray) {
    return {
        key: keyForArray,
        type: "array",
        children: generateChildrenFromCollection(arrayToTransform)
    }
}

// Transformer for the Object type
function transformObject(objectToTransform, keyForObject, isRootObject = false) {
    return {
        key: keyForObject,
        type: "object",
        isRoot: isRootObject,
        children: generateChildrenFromCollection(objectToTransform)
    }
}

function isObject(value){
    return _.isPlainObject(value)
}

function isArray(value){
    return _.isArray(value)
}

function isValue(value) {
    return !isObject(value) && !isArray(value);
}

function parsedData(data) {
    // Take the JSON data and transform
    // it into the Tree View DSL

    // Strings or Integers should not be attempted to be split, so we generate
    // a new object with the string/number as the value
    if (isValue(data)) {
        return transformValue(data, 'root', true);
    }

    // If it's an object or an array, transform as an object
    return transformObject(data, 'root', true);
}

export default parsedData