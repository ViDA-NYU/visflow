/**
 * @fileoverview D3M defs, tasks and methods.
 */

/**
 * D3M name space, used to define global D3M constants.
 * @const
 */
var d3m = {};

/**
 * Function names for TA2/3 API.
 * @enum {string}
 */
d3m.Rpc = {
  CREATE_PIPELINES: 'CreatePipelines',
  EXECUTE_PIPELINE: 'ExecutePipeline',
  LIST_PIPELINES: 'ListPipelines',
  DELETE_PIPELINES: 'DeletePipelines',
  GET_CREATE_PIPELINE_RESULTS: 'GetCreatePipelineResults',
  GET_EXECUTE_PIPELINE_RESULTS: 'GetExecutePiplineResults',
  UPDATE_PROBLEM_SCHEMA: 'UpdateProblemSchema', // unsupported
  START_SESSION: 'StartSession',
  END_SESSION: 'EndSession'
};


/** @const */
visflow.d3m = {};

/** @private @const {string} */
visflow.d3m.NEW_TASK_ = './dist/html/d3m/new-d3m.html';

/**
 * D3M session id.
 * @type {string}
 */
visflow.d3m.sessionId = '';

/** @private @const {number} */
visflow.d3m.SOCKET_WAIT_INTERVAL_ = 1000;

/**
 * Maximum wait time for socket connection.
 * @private {number}
 */
visflow.d3m.SOCKET_MAX_WAIT_ = 5000;

/**
 * @type {!WebSocket}
 */
visflow.d3m.socket = new WebSocket(visflow.url.D3M_SOCKET);

/**
 * Keeps track of sent messages and responses to expect. Key is request id
 * (rid).
 * @private {!Object<{
 *   rid: string,
 *   fname: string
 * }>}
 */
visflow.d3m.expects_ = {};

/**
 * Sends a message through the D3M socket.
 * @param {d3m.Rpc} fname Function name of the message.
 * @param {*} msg
 */
visflow.d3m.sendMessage = function(fname, msg) {
  var rid = visflow.utils.randomString(6);
  visflow.d3m.socket.send(JSON.stringify({
    // Request id is used to distinguish responses of different messages.
    rid: rid,
    fname: fname,
    object: msg
  }));
  visflow.d3m.expects_[rid] = {
    rid: rid,
    fname: fname
  };
};

/**
 * Handles socket response messages.
 * @param {{data: *}} event
 */
visflow.d3m.socket.onmessage = function(event) {
  var data = /** @type {{
    rid: string,
    object: !Object
  }} */(event.data);

  var rid = data.rid;
  var res = data.object;
  if (!(rid in visflow.d3m.expects_)) {
    visflow.error(res.rid, 'not expected but received');
  }

  // TODO(bowen): ask to send stream end message.
  switch (visflow.d3m.expects_[rid].fname) {
    case d3m.Rpc.START_SESSION:
      visflow.d3m.sessionId = res['session_id'];
      break;
    case d3m.Rpc.CREATE_PIPELINES:
      break;
    case d3m.Rpc.EXECUTE_PIPELINE:
      break;
    case d3m.Rpc.LIST_PIPELINES:
      break;
    case d3m.Rpc.GET_CREATE_PIPELINE_RESULTS:
      break;
    case d3m.Rpc.GET_EXECUTE_PIPELINE_RESULTS:
      break;
  }
};

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
  var timePassed = 0;
  var wait = setInterval(function() {
    if (visflow.d3m.socket.readyState == 1) {
      clearInterval(wait);
      visflow.d3m.sendMessage(d3m.Rpc.START_SESSION, {
        'user_agent': '',
        'version': ''
      });
    } else {
      visflow.warning('waiting for D3M server connection');
      timePassed += visflow.d3m.SOCKET_WAIT_INTERVAL_;
      if (timePassed > visflow.d3m.SOCKET_MAX_WAIT_) {
        visflow.error('D3M server is unavailable');
        clearInterval(wait);
      }
    }
  }, visflow.d3m.SOCKET_WAIT_INTERVAL_);
};

/**
 * Ends the current D3M session.
 */
visflow.d3m.endSession = function() {
  if (visflow.d3m.sessionId === '') {
    // No session has been ever created. Just exit.
    return;
  }
  visflow.d3m.sendMessage(d3m.Rpc.END_SESSION, {
    'session_id': visflow.d3m.sessionId
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
  console.log('to create pipelines for', taskId);
};
