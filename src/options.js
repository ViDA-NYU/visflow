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
visflow.options.showingD3MPipeline = true;

/**
 * Whether the current mode is subset flow.
 * @type {boolean}
 */
visflow.options.isSubsetFlow = false;

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
  visflow.options.showingD3MPipeline = state;
  visflow.options.updateSubsetFlow_();
};

/**
 * Checks if the flow diagram is editable based on current options.
 * @return {boolean}
 */
visflow.options.isDiagramEditable = function() {
  return !visflow.flow.visMode && !visflow.options.showingD3MPipeline;
};

/**
 * Updates subset flow state.
 * @private
 */
visflow.options.updateSubsetFlow_ = function() {
  var newState = !visflow.flow.visMode &&
    !visflow.options.showingD3MPipeline;
  visflow.options.isSubsetFlow = newState;
  visflow.signal(visflow.options, visflow.Event.SUBSET_FLOW, newState);
};
