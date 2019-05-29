import TreeView from './tree-view/TreeView.js'
import TreeViewItem from './tree-view/TreeViewItem.js'
import TreeViewItemValue from './tree-view/TreeViewItemValue.js'


customElements.define('tree-view-item-value', TreeViewItemValue);
customElements.define('tree-view-item', TreeViewItem);
customElements.define('tree-view', TreeView);

export default TreeView