/**
 * @fileoverview Node defs.
 */

/**
 * Node template common template file, containing the popup, background, etc.
 * @protected {string}
 */
visflow.Node.prototype.COMMON_TEMPLATE = './dist/html/node/node.html';

/**
 * Node content template file.
 * @protected {string}
 */
visflow.Node.prototype.TEMPLATE = '';

/**
 * Node control panel common template file, containing the panel header.
 * @protected {string}
 */
visflow.Node.prototype.COMMON_PANEL_TEMPLATE =
  './dist/html/node/node-panel.html';

/**
 * Node control panel template file.
 * @protected {string}
 */
visflow.Node.prototype.PANEL_TEMPLATE = '';

/**
 * Class that defines the node type.
 * @protected {string}
 */
visflow.Node.prototype.NODE_CLASS = '';

/**
 * Node name used for label.
 * @protected {string}
 */
visflow.Node.prototype.DEFAULT_LABEL = 'Node';


/**
 * Whether the node should use asynchronous process. This is usually set for
 * a whole class of nodes. But it can also be changed based on ENV if the node
 * can be either sync or async.
 * @type {boolean}
 */
visflow.Node.prototype.isAsyncProcess = false;


// Minimum/maximum size of resizable.
/** @protected {number} */
visflow.Node.prototype.MIN_WIDTH = 120;
/** @protected {number} */
visflow.Node.prototype.MIN_HEIGHT = 60;
/** @protected {number} */
visflow.Node.prototype.MAX_WIDTH = Infinity;
/** @protected {number} */
visflow.Node.prototype.MAX_HEIGHT = Infinity;

/** @protected {number} */
visflow.Node.prototype.MAX_LABEL_LENGTH = 14;

/**
 * Whether the node is resizable.
 * @protected {boolean}
 */
visflow.Node.prototype.RESIZABLE = true;

/** @const {number} */
visflow.Node.prototype.TOOLTIP_DELAY = 500;

/** @const {number} */
visflow.Node.prototype.PORT_HEIGHT = 15;

/** @const {number} */
visflow.Node.prototype.PORT_GAP = 1;

/** @protected @const {number} */
visflow.Node.FOCUS_ALPHA = 2;

/** @protected @const {number} */
visflow.Node.FOCUS_BETA = 5;

/** @protected @const {number} */
visflow.Node.FOCUS_GAMMA = 500;


/**
 * ContextMenu entries.
 * @return {!Array<visflow.contextMenu.Item>}
 */
visflow.Node.prototype.contextMenuItems = function() {
  return [
    {id: visflow.Event.MINIMIZE, text: 'Minimize',
      icon: 'glyphicon glyphicon-resize-small'},
    {id: visflow.Event.VISMODE, text: 'Visualization Mode',
      icon: 'glyphicon glyphicon-facetime-video'},
    {id: visflow.Event.PANEL, text: 'Control Panel',
      icon: 'glyphicon glyphicon-th-list'},
    //{id: visflow.Event.FLOWSENSE, text: 'FlowSense',
    //  icon: 'glyphicon glyphicon-comment'},
    {id: visflow.Event.DELETE, text: 'Delete',
      icon: 'glyphicon glyphicon-remove'}
  ];
};

/**
 * Default options that shall be set by the node.
 * This is specific to a node type that is a leaf in the inheriting tree.
 * The options written here will be checked and filled during de-serialization.
 * If a class is an inner node of an inheriting tree (e.g. Visualization), it
 * needs to define separate options object and fill it during its inheriting
 * de-serialize function.
 * @return {!visflow.options.Node}
 * @protected
 */
visflow.Node.prototype.defaultOptions = function() {
  return new visflow.options.Node({
    minimized: false, // is not minimized by default
    label: false, // does not show label by default
    visMode: false // is not in visualization mode by default
  });
};

/**
 * Messages to be displayed as popup.
 * @enum {string}
 */
visflow.Node.Message = {
  PROCESSING: 'processing',
  EMPTY_DATA: 'empty data',
  WAITING: 'waiting'
};
