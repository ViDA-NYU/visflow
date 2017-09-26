/**
 * @fileoverview Pipeline panel for selecting D3M pipeline.
 */

visflow.pipelinePanel = {};


/** @private @const {number} */
visflow.pipelinePanel.WRAPPER_HEIGHT_ = 100;

/** @private @const {number} */
visflow.pipelinePanel.MAX_HEIGHT_ = 250;

/** @private @const {number} */
visflow.pipelinePanel.THEAD_TR_HEIGHT_ = 35;

/** @private @const {number} */
visflow.pipelinePanel.TBODY_TR_HEIGHT_ = 24;

/** @private @const {number} */
visflow.pipelinePanel.NUM_PIPELINES_PER_PAGE_ = 5;

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

/** @private {!jQuery} */
visflow.pipelinePanel.tableTemplate_ = $();

/** @private {?DataTables} */
visflow.pipelinePanel.dataTable_ = null;

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
  visflow.pipelinePanel.initPanel_(visflow.pipelinePanel.show_);
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
  }
};

/**
 * Shows the pipeline panel.
 * @private
 */
visflow.pipelinePanel.show_ = function() {
  visflow.pipelinePanel.container_.stop()
    .slideDown(visflow.pipelinePanel.TRANSITION_DURATION_,
      visflow.pipelinePanel.update);
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
 * @param {Function=} opt_callback Callback after panel HTML is loaded.
 * @private
 */
visflow.pipelinePanel.initPanel_ = function(opt_callback) {
  var container = visflow.pipelinePanel.container_
    .resizable({
      maxHeight: visflow.pipelinePanel.MAX_HEIGHT_
    })
    .draggable()
    .resize(visflow.pipelinePanel.resize_);
  var content = container.find('.content');
  content.load(visflow.pipelinePanel.TEMPLATE_, function() {
    visflow.pipelinePanel.tableTemplate_ = container.find('table').clone();
    visflow.pipelinePanel.initPipelineDropdown_();
    if (opt_callback) {
      opt_callback();
    }
  });
};

/**
 * Initializes the pipeline dropdown. Creates click listeners.
 * @private
 */
visflow.pipelinePanel.initPipelineDropdown_ = function() {
  var container = visflow.pipelinePanel.container_;
  container.click(visflow.pipelinePanel.updatePipelineDropdown_);

  var exploreBtn = container.find('#explore');
  exploreBtn.click(function() {
    var subset = visflow.d3m.pipelinesToSubset();
    visflow.upload.export(subset, function(fileParams) {
      visflow.options.toggleD3MPipeline(false);
      visflow.diagram.newSingleDataSource(fileParams.fileName);
    });
  });

  var exportBtn = container.find('#export');
  exportBtn.click(function() {
    if (!visflow.d3m.pipelineId) {
      visflow.warning('please select a pipeline');
      return;
    }
    visflow.d3m.exportPipeline(visflow.d3m.pipelineId);
  });
};

/**
 * Updates the enabled states of pipeline dropdown buttons.
 * @private
 */
visflow.pipelinePanel.updatePipelineDropdown_ = function() {
  var container = visflow.pipelinePanel.container_;
  container.find('#export').toggleClass('disabled', !visflow.d3m.pipelineId);
};

/**
 * Updates the pipeline list table.
 */
visflow.pipelinePanel.update = function() {
  var container = $(visflow.pipelinePanel.container_);
  if (visflow.pipelinePanel.dataTable_) {
    visflow.pipelinePanel.dataTable_.destroy(true); // redraw every time
    visflow.pipelinePanel.tableTemplate_.clone().appendTo(
      container.find('.table-container'));
  }

  var tableData = visflow.d3m.pipelinesToTable();
  var table = container.find('table');
  var dt = table.DataTable({
    data: tableData.rows,
    select: {
      style: 'single',
      info: false
    },
    stateSave: true,
    columns: tableData.columns,
    pageLength: visflow.pipelinePanel.NUM_PIPELINES_PER_PAGE_,
    lengthMenu: false,
    pagingType: 'full',
    scrollX: true,
    searching: false,
    lengthChange: false,
    createdRow: function(row, data) {
      $(row).toggleClass(visflow.const.DATATABLE_SELECTED,
        data.id == visflow.d3m.pipelineId);
    },
    initComplete: function() {
      visflow.pipelinePanel.resize_();
    }
  });

  /**
   * Hack: didn't find a way to stop the deselect event.
   * Clears selected styles for all rows and add selected style for the selected
   * row.
   */
  var highlightSelectedPipeline = function() {
    var unselected = [];
    var selected = -1;
    visflow.d3m.pipelines.forEach(function(pipeline, index) {
      if (pipeline.id == visflow.d3m.pipelineId) {
        selected = index;
      } else {
        unselected.push(index);
      }
    });
    $(visflow.pipelinePanel.dataTable_.rows(unselected).nodes())
      .removeClass(visflow.const.DATATABLE_SELECTED);
    $(visflow.pipelinePanel.dataTable_.row(selected).node())
      .addClass(visflow.const.DATATABLE_SELECTED);
  };

  dt.on('select.dt', function(event, dt, type, tableIndices) {
    var pipeline = dt.row(tableIndices[0]).data();
    if (pipeline.id != visflow.d3m.pipelineId) {
      visflow.d3m.loadPipeline(pipeline.id);
      visflow.d3m.pipelineId = pipeline.id;
    }
    highlightSelectedPipeline();
  }).on('deselect.dt', function() {
    highlightSelectedPipeline();
  });
  visflow.pipelinePanel.dataTable_ = dt;
};

/**
 * Sets the current task for the panel.
 * @param {d3m.Dataset} problem
 */
visflow.pipelinePanel.setTask = function(problem) {
  $(visflow.pipelinePanel.container_).find('.task').text([
    problem.id,
    problem.schema.taskType + '/' +
        d3m.conciseTaskSubtype(problem.schema.taskType,
            problem.schema.taskSubType)
  ].join(' '));
};

/**
 * Handles panel resize event.
 * @private
 */
visflow.pipelinePanel.resize_ = function() {
  var container = visflow.pipelinePanel.container_;
  var height = container.height() -
    container.find('.dataTables_scrollHead').height() -
    visflow.const.DATATABLE_WRAPPER_HEIGHT;
  container.find('.dataTables_scrollBody')
    .css('max-height', height)
    .css('height', height);

  var needHeight = visflow.pipelinePanel.TBODY_TR_HEIGHT_ +
    visflow.pipelinePanel.TBODY_TR_HEIGHT_ *
      Math.min(visflow.pipelinePanel.NUM_PIPELINES_PER_PAGE_,
        visflow.d3m.pipelines.length) +
    visflow.pipelinePanel.WRAPPER_HEIGHT_;
  if (needHeight > container.height()) {
    container.height(needHeight);
  }
};
