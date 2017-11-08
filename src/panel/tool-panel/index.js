/**
 * @fileoverview Visflow tool panel.
 */

/** @const */
visflow.toolPanel = {};

/** @private {!jQuery} */
visflow.toolPanel.container_ = $();

/**
 * Initializes the tool panel to retrieve its container.
 */
visflow.toolPanel.init = function() {
  var container = visflow.toolPanel.container_ = $('#tool-panel');

  container.find('.to-tooltip').tooltip({
    delay: visflow.panel.TOOLTIP_DELAY
  });

  // Pipeline mode
  var pipeline = container.find('#pipeline');
  pipeline.click(function() {
    visflow.d3m.togglePipeline();
  });

  // Alt hold
  var alted = container.find('#alted');
  alted.click(function() {
    visflow.interaction.toggleAltHold();
  });

  // VisMode button
  var visMode = container.find('#vis-mode');
  visMode
    .click(function() {
      visflow.options.toggleVisMode();
    });

  // Data upload button
  var upload = container.find('#upload');
  upload.click(function() {
    visflow.upload.upload();
  });

  visflow.toolPanel.initEventListeners_();
};

/**
 * Creates event listeners for system-wide update.
 * @private
 */
visflow.toolPanel.initEventListeners_ = function() {
  visflow.listenMany(visflow.options, [
    {
      event: visflow.Event.VISMODE,
      callback: visflow.toolPanel.updateVisMode_
    },
    {
      event: visflow.Event.D3M_PIPELINE,
      callback: visflow.toolPanel.updateD3MPipeline_
    }
  ]);
  visflow.listen(visflow.interaction, visflow.Event.ALT,
    visflow.toolPanel.updateAlt_);

  var disableUpload = function() {
    visflow.toolPanel.container_.find('#upload')
      .prop('disabled', true)
      .attr('title', 'upload data (login required)')
      .tooltip('destroy')
      .tooltip({
        delay: visflow.panel.TOOLTIP_DELAY
      });
  };

  visflow.listenMany(visflow.user, [
    {
      event: visflow.Event.LOGOUT,
      callback: disableUpload
    },
    {
      event: visflow.Event.LOGIN,
      callback: function() {
        if (!visflow.user.writePermission()) {
          disableUpload();
          return;
        }
        visflow.toolPanel.container_.find('#upload')
          .prop('disabled', false)
          .attr('title', 'upload data')
          .tooltip('destroy')
          .tooltip({
            delay: visflow.panel.TOOLTIP_DELAY
          });
      }
    }
  ]);
};

/**
 * Updates the visMode button active state.
 * @private
 */
visflow.toolPanel.updateVisMode_ = function() {
  visflow.toolPanel.container_.find('#vis-mode')
    .toggleClass('active', visflow.options.isInVisMode());
};

/**
 * Updates the alt button's active class to reflect the system's alted state.
 * @private
 */
visflow.toolPanel.updateAlt_ = function() {
  visflow.toolPanel.container_.find('#alted')
    .toggleClass('active', visflow.interaction.isAlted());
};

/**
 * Updates the pipeline button's active class to show whether the system is
 * currently showing a pipeline.
 * @private
 */
visflow.toolPanel.updateD3MPipeline_ = function() {
  visflow.toolPanel.container_.find('#pipeline')
    .toggleClass('active', visflow.options.isD3MPipeline());
};
