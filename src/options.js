/**
 * @fileoverview VisFlow system options and options namespace.
 */

/** @const */
visflow.options = {};

/**
 * Whether to show the node labels.
 * @type {boolean}
 */
visflow.options.nodeLabel = true;

/**
 * Whether the currently loaded diagram is a D3M piepline.
 * @type {boolean}
 */
visflow.options.showingD3MPipeline = false;

/**
 * Toggles or sets the node label visibility.
 * @param {boolean=} opt_state
 */
visflow.options.toggleNodeLabel = function(opt_state) {
  var newState = opt_state != null ? opt_state : !visflow.options.nodeLabel;
  if (newState != visflow.options.nodeLabel) {
    visflow.options.nodeLabel = newState;
  }
  visflow.signal(visflow.options, visflow.Event.CHANGE, {
    type: 'nodeLabel',
    value: newState
  });
};

/**
 * Toggles the D3M pipeline flag.
 * @param {boolean} state
 */
visflow.options.toggleD3MPipeline = function(state) {
  if (state != visflow.options.showingD3MPipeline) {
    visflow.options.showingD3MPipeline = state;
  }
  visflow.signal(visflow.options, visflow.Event.CHANGE, {
    type: visflow.Event.SHOW_D3M_PIPELINE,
    value: state
  });
};

/**
 * Checks if the flow diagram is editable based on current options.
 * @return {boolean}
 */
visflow.options.isDiagramEditable = function() {
  return !visflow.flow.visMode && !visflow.options.showingD3MPipeline;
};
