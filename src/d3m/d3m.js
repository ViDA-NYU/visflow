/**
 * @fileoverview VisFlow D3M defs, tasks and methods.
 */


/** @const */
visflow.d3m = {};

/** @private @const {string} */
visflow.d3m.NEW_TASK_ = './dist/html/d3m/new-task.html';

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
 * Pipelines created for the current task (problem). These are listed in the
 * pipeline list.
 * @type {!Array<d3m.Pipeline>}
 */
visflow.d3m.pipelines = [];

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
  }} */(JSON.parse(/** @type {string} */(event.data)));

  var rid = data.rid;
  var res = data.object;
  console.log('socket message', res);
  if (!(rid in visflow.d3m.expects_)) {
    visflow.error(rid, 'not expected but received');
  }

  // TODO(bowen): ask to send stream end message.
  switch (visflow.d3m.expects_[rid].fname) {
    case d3m.Rpc.START_SESSION:
      visflow.d3m.sessionId = res.context['session_id'];
      break;
    case d3m.Rpc.CREATE_PIPELINES:
      var pipelineInfo = res['pipeline_info'];
      var pipeline = {
        id: res['pipeline_id'],
        progress: res['progress_info'],
        status: res['response_info'].status.code,
        result_uris: pipelineInfo && pipelineInfo['predict_result_uris'] ||
        undefined,
        scores: pipelineInfo && pipelineInfo.scores
      };
      var existing = false;
      for (var i = 0; i < visflow.d3m.pipelines.length && !existing; i++) {
        if (visflow.d3m.pipelines[i].id == pipeline.id) {
          $.extend(visflow.d3m.pipelines[i], pipeline);
          existing = true;
        }
      }
      if (!existing) {
        visflow.d3m.pipelines.push(pipeline);
      }
      visflow.pipelinePanel.update();
      break;
    case d3m.Rpc.EXECUTE_PIPELINE:
      break;
    case d3m.Rpc.LIST_PIPELINES:
      break;
    case d3m.Rpc.GET_CREATE_PIPELINE_RESULTS:
      break;
    case d3m.Rpc.GET_EXECUTE_PIPELINE_RESULTS:
      break;
    case d3m.Rpc.DESCRIBE_DATAFLOW:
      break;
    case d3m.Rpc.GET_DATAFLOW_RESULTS:
      break;
    default:
      visflow.error('unrecognized response from D3M socket');
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
        'user_agent': 'visflow',
        'version': 'v0.3'
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
         * @param {!Array<d3m.Dataset>} dataList
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
 * @param {!Array<d3m.Dataset>} dataList
 * @private
 */
visflow.d3m.taskSelection_ = function(dialog, dataList) {
  var table = dialog.find('table');
  dataList.map(function(dataset) {
    // Flatten the schema object into dataset descriptor.
    dataset.metric = dataset.schema.metric;
    dataset.taskType = dataset.schema.taskType;
    dataset.taskSubtype = d3m.conciseTaskSubtype(dataset.taskType,
      dataset.schema.taskSubType || 'none'); //
  });
  var dt = table.DataTable({
    data: dataList,
    select: 'single',
    columns: [
      {title: 'Task Id', data: 'id'},
      {title: 'TaskType', data: 'taskType'},
      {title: 'TaskSubtype', data: 'taskSubtype'},
      {title: 'Metric', data: 'metric'},
      {title: 'Size', data: 'size'}
    ],
    pageLength: 5,
    lengthMenu: [5, 10, 20],
    pagingType: 'full'
  });
  var problem = null;
  var confirm = dialog.find('#confirm');
  dt.on('select.dt', function(event, dt, type, tableIndices) {
    problem = dataList[tableIndices[0]];
    confirm.prop('disabled', false);
  }).on('deselect.dt', function() {
    problem = null;
    confirm.prop('disabled', true);
  });

  confirm.click(function() {
    visflow.d3m.createPipelines(/** @type {!d3m.Dataset} */(problem));
  });
};

/**
 * Requests pipeline creation for the given d3m.
 * @param {d3m.Dataset} problem
 */
visflow.d3m.createPipelines = function(problem) {
  visflow.pipelinePanel.setTask(problem);
  var request = {
    'context': {
      'session_id': visflow.d3m.sessionId
    },
    'task': d3m.taskTypeToNumber(problem.schema.taskType),
    'task_subtype': problem.schema.taskSubtype ?
        d3m.taskSubtypeToNumber(problem.schema.taskSubtype) :
        d3m.TaskSubtype.NONE,
    'task_description': problem.schema.descriptionFile,
    'metrics': [d3m.metricToNumber(problem.schema.metric)],
    'target_features': [{
      'feature_id': problem.schema.target.field
    }]
  };
  visflow.d3m.sendMessage(d3m.Rpc.CREATE_PIPELINES, request);
};

/**
 * Loads a pipeline data flow description.
 * @param {string} pipelineId
 */
visflow.d3m.loadPipeline = function(pipelineId) {
  console.log('load pipeline', pipelineId);
  visflow.d3m.sendMessage(d3m.Rpc.DESCRIBE_DATAFLOW, {
    'context': {
      'session_id': visflow.d3m.sessionId
    },
    'pipeline_id': pipelineId
  });
};
