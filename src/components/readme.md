mainly reference [vue-json-tree-view](https://github.com/michaelfitzhavey/vue-json-tree-view)
but in web component version

## usage

```
h('tree-view', {
    data: serialize({
        test: 'test from mount shadow root!',
        fn: function(){return 0},
        info:{
            name : 'lz',
            list :[ 1,2,3]
        }
    })
})
```