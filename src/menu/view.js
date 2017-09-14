/**
 * @fileoverview VisFlow views menu.
 */

/** @const */
visflow.view = {};

/**
 * Initializes view dropdown.
 * @param {!jQuery} navbar
 */
visflow.view.initDropdown = function(navbar) {
  var view = navbar.find('#view');
  view.find('#show-pipeline-panel').click(function() {
    visflow.pipelinePanel.toggle();
  });
  view.find('#show-node-label').click(function() {
    visflow.options.toggleNodeLabel(); // TODO(bowen): check visflow.options
  });
  view.find('#show-node-panel').click(function() {
    visflow.nodePanel.toggle();
  });

  visflow.view.initListeners_(view);
};

/**
 * Initializes listeners for view dropdown.
 * @param {!jQuery} view Menu view dropdown.
 * @private
 */
visflow.view.initListeners_ = function(view) {
  // update pipeline panel check mark
  visflow.listen(visflow.pipelinePanel, visflow.Event.CHANGE,
    function(event, value) {
      view.find('#show-pipeline-panel > i').toggleClass('glyphicon-ok', value);
    });

  // update node panel check mark
  visflow.listen(visflow.nodePanel, visflow.Event.CHANGE,
    function(event, value) {
      view.find('#show-node-panel > i').toggleClass('glyphicon-ok', value);
    });

  //  update node label check mark
  visflow.listen(visflow.options, visflow.Event.CHANGE, function(event, data) {
    // Here we need to parse data.value and data.type is because visflow.options
    // may fire different types of option changes.
    var value = data.value;
    switch (data.type) {
      case 'nodeLabel':
        view.find('#show-node-label > i').toggleClass('glyphicon-ok', value);
        visflow.flow.updateNodeLabels();
        break;
      case visflow.Event.SHOW_D3M_PIPELINE:
        view.find('#show-node-panel > i').toggleClass('glyphicon-ok', !value);
        break;
    }
  });
};
