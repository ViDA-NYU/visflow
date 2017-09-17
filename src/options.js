/**
 * @fileoverview VisFlow system options and options namespace.
 */

/** @const */
visflow.options = {};

/**
 * Whether visualization mode is on.
 * @private {boolean}
 */
visflow.options.visMode_ = false;

/**
 * Whether to show the node labels.
 * @private {boolean}
 */
visflow.options.nodeLabel_ = true;

/**
 * Whether to show the node panel.
 * @private {boolean}
 */
visflow.options.nodePanel_ = true;

/**
 * Whether to show the pipeline panel.
 * @private {boolean}
 */
visflow.options.pipelinePanel_ = true;

/**
 * Whether to allow diagram editing.
 * @private {boolean}
 */
visflow.options.diagramEditable_ = true;

/**
 * Whether the currently loaded diagram is a D3M piepline.
 * @private {boolean}
 */
visflow.options.D3MPipeline_ = false;

/**
 * Checks whether node labels should be displayed.
 * @return {boolean}
 */
visflow.options.isInVisMode = function() {
  return visflow.options.visMode_;
};

/**
 * Checks whether node labels are visible.
 * @return {boolean}
 */
visflow.options.isNodeLabelVisible = function() {
  return visflow.options.nodeLabel_;
};

/**
 * Checks whether the panel is visible.
 * @return {boolean}
 */
visflow.options.isNodePanelVisible = function() {
  return visflow.options.nodePanel_;
};

/**
 * Checks whether diagram is editable now.
 * @return {boolean}
 */
visflow.options.isDiagramEditable = function() {
  return visflow.options.diagramEditable_;
};


/**
 * Toggles or sets the node label visibility.
 * @param {boolean=} opt_state
 */
visflow.options.toggleNodeLabel = function(opt_state) {
  var newState = opt_state != undefined ?
    opt_state : !visflow.options.nodeLabel_;
  if (newState != visflow.options.nodeLabel_) {
    visflow.options.nodeLabel_ = newState;

    visflow.signal(visflow.options, visflow.Event.NODE_LABEL, newState);
  }
};

/**
 * Toggles or sets the node panel visibility.
 * @param {boolean=} opt_state
 */
visflow.options.toggleNodePanel = function(opt_state) {
  var newState = opt_state != undefined ?
    opt_state : !visflow.options.nodePanel_;
  if (newState != visflow.options.nodePanel_) {
    visflow.options.nodePanel_ = newState;

    visflow.nodePanel.toggle(newState);

    visflow.signal(visflow.options, visflow.Event.NODE_PANEL, newState);
  }
};

/**
 * Toggles or sets the pipeline panel visibility.
 * @param {boolean=} opt_state
 */
visflow.options.togglePipelinePanel = function(opt_state) {
  var newState = opt_state != undefined ?
    opt_state : !visflow.options.pipelinePanel_;
  if (newState != visflow.options.pipelinePanel_) {
    visflow.options.pipelinePanel_ = newState;

    visflow.pipelinePanel.toggle(newState);

    visflow.signal(visflow.options, visflow.Event.PIPELINE_PANEL, newState);
  }
};

/**
 * Toggles or sets the D3M pipeline flag.
 * @param {boolean=} opt_state
 */
visflow.options.toggleD3MPipeline = function(opt_state) {
  var newState = opt_state != undefined ?
    opt_state : !visflow.options.D3MPipeline_;
  if (newState != visflow.options.D3MPipeline_) {
    visflow.options.D3MPipeline_ = newState;

    visflow.options.updateDiagramEditable_();

    visflow.signal(visflow.options, visflow.Event.D3M_PIPELINE, newState);
  }
};

/**
 * Toggles or sets the visualization mode.
 * @param {boolean=} opt_state
 */
visflow.options.toggleVisMode = function(opt_state) {
  var newState = opt_state != undefined ?
    opt_state : !visflow.options.visMode_;
  if (newState != visflow.options.visMode_) {
    visflow.options.visMode_ = newState;

    visflow.options.updateDiagramEditable_();

    visflow.signal(visflow.options, visflow.Event.VISMODE, newState);
  }
};

/**
 * Updates the state of diagram editing.
 * @private
 */
visflow.options.updateDiagramEditable_ = function() {
  var newState = !visflow.options.visMode_ && !visflow.options.D3MPipeline_;
  if (newState != visflow.options.diagramEditable_) {
    visflow.options.diagramEditable_ = newState;

    visflow.signal(visflow.options, visflow.Event.DIAGRAM_EDITABLE, newState);
  }
  visflow.signal(visflow.options, visflow.Event.D3M_PIPELINE, newState);
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
