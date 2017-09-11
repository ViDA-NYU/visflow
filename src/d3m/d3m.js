/**
 * @fileoverview D3M task.
 */

/** @const */
visflow.d3m = {};

/** @private @const {string} */
visflow.d3m.NEW_TASK_ = './dist/html/d3m/new-d3m.html';

/**
 * D3M session id.
 * @type {string}
 */
visflow.d3m.sessionId = '';


/**
 * Initializes session start and end listeners.
 */
visflow.d3m.init = function() {
  visflow.d3m.startSession();
  window.onbeforeunload = function() {
    visflow.d3m.endSession();
  };
};

/**
 * Starts a D3M session.
 */
visflow.d3m.startSession = function() {
  $.post(visflow.url.D3M_SERVER, {
    fname: 'StartSession',
    pname: 'SessionRequest',
    message: {
      'user_agent': '',
      'version': ''
    }
  }).done(function(sessionId) {
      visflow.d3m.sessionId = sessionId;
      console.log('session created', sessionId);
    })
    .fail(function(res) {
      visflow.error(res.responseText);
    });
};

/**
 * Ends the current D3M session.
 */
visflow.d3m.endSession = function() {
  $.post(visflow.url.D3M_SERVER, {
    fname: 'EndSession',
    pname: 'SessionContext',
    message: {
      'session_id': visflow.d3m.sessionId
    }
  }).done(function(sessionId) {
      visflow.d3m.sessionId = sessionId;
      console.log('session created', sessionId);
    })
    .fail(function(res) {
      visflow.error(res.responseText);
    });
};

/**
 * Displays a new d3m modal and asks the user to choose a d3m.
 */
visflow.d3m.newTask = function() {
  visflow.dialog.create({
    template: visflow.d3m.NEW_TASK_,
    complete: function(dialog) {
      $.get(visflow.url.LIST_D3M_DATA,
        /**
         * @param {!Array<{id: string, size: number}>} dataList
         */
        function(dataList) {
          visflow.d3m.taskSelection_(dialog, dataList);
        });
    }
  });
};

/**
 * Initializes d3m selection dialog.
 * @param {!jQuery} dialog
 * @param {!Array<{id: string, size: number}>} dataList
 * @private
 */
visflow.d3m.taskSelection_ = function(dialog, dataList) {
  var table = dialog.find('table');
  var dt = table.DataTable({
    data: dataList,
    select: 'single',
    columns: [
      {title: 'Task Id', data: 'id'},
      {title: 'Size', data: 'size'}
    ],
    pageLength: 5,
    lengthMenu: [5, 10, 20],
    pagingType: 'full'
  });
  var taskId = '';
  var confirm = dialog.find('#confirm');
  dt.on('select.dt', function(event, dt, type, tableIndices) {
    var info = /** @type {DataTables} */(dt).row(tableIndices[0]).data();
    taskId = info.id;
    confirm.prop('disabled', false);
  }).on('deselect.dt', function() {
    taskId = '';
    confirm.prop('disabled', true);
  });

  confirm.click(function() {
    visflow.d3m.createPipelines(taskId);
  });
};

/**
 * Requests pipeline creation for the given d3m.
 * @param {string} taskId
 */
visflow.d3m.createPipelines = function(taskId) {
  // TODO(bowen)
  console.log('to create pipelines for', taskId);
};
