/**
 * @fileoverview Pipeline panel for selecting D3M pipeline.
 */

visflow.pipelinePanel = {};


/**
 * Pipeline panel container.
 * @private {!jQuery}
 */
visflow.pipelinePanel.container_ = $();

/**
 * Pipeline panel visibility state.
 * @type {boolean}
 */
visflow.pipelinePanel.isOpen = true;

/** @private @const {number} */
visflow.pipelinePanel.HEIGHT_ = 400;

/** @private @const {number} */
visflow.pipelinePanel.TOP_ = 40;

/** @private @const {string} */
visflow.pipelinePanel.TEMPLATE_ =
  './dist/html/panel/pipeline-panel/pipeline-panel.html';

/** @private @const {number} */
visflow.pipelinePanel.TRANSITION_DURATION_ = 50;
/** @private @const {number} */
visflow.pipelinePanel.INIT_DELAY_ = 50;

/**
 * Initializes the pipeline panel and its interaction.
 */
visflow.pipelinePanel.init = function() {
  var container = $('#pipeline-panel');
  visflow.pipelinePanel.container_ = container;
  visflow.pipelinePanel.show_();
};

/**
 * Toggles the visibility of the pipeline panel.
 * @param {boolean=} opt_state
 */
visflow.pipelinePanel.toggle = function(opt_state) {
  var newState = opt_state == undefined ?
    !visflow.pipelinePanel.isOpen : opt_state;
  if (newState != visflow.pipelinePanel.isOpen) {
    visflow.pipelinePanel.isOpen = newState;
    if (newState) {
      visflow.pipelinePanel.show_();
    } else {
      visflow.pipelinePanel.hide_();
    }
    visflow.signal(visflow.pipelinePanel, visflow.Event.CHANGE, newState);
  }
};

/**
 * Shows the pipeline panel.
 * @private
 */
visflow.pipelinePanel.show_ = function() {
  var content = visflow.pipelinePanel.container_.find('.content');
  content.load(visflow.pipelinePanel.TEMPLATE_, function() {
    visflow.pipelinePanel.container_.stop()
      .slideDown(visflow.pipelinePanel.TRANSITION_DURATION_,
        visflow.pipelinePanel.initPanel_);
  });
};

/**
 * Hides the pipeline panel.
 * @private
 */
visflow.pipelinePanel.hide_ = function() {
  visflow.pipelinePanel.container_.stop()
    .slideUp(visflow.pipelinePanel.TRANSITION_DURATION_);
};

/**
 * Initializes pipeline panel interaction.
 * @private
 */
visflow.pipelinePanel.initPanel_ = function() {
  // TODO(bowen)
  $(visflow.pipelinePanel.container_)
    .resizable()
    .draggable();
};
