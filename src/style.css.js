import {
    _VallinaDomLogKey
} from './utils.js'

let rootClass = _VallinaDomLogKey

export default `
.${rootClass}{
    position: fixed;
    top: 0;
    height: 400px;
    overflow: scroll;
    z-index: 9999;
    padding: 10px;
}
.${rootClass} li {
     display: flex;
     border-bottom:0.5px solid #ccc;
 }
`