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

/**
 * Id of the selected pipeline.
 * @type {string}
 */
visflow.d3m.pipelineId = '';

/**
 * Problem specification for the current problem.
 * @type {d3m.Problem}
 */
visflow.d3m.problem = /** @type {d3m.Problem} */({});

/** @private @const {number} */
visflow.d3m.SOCKET_WAIT_INTERVAL_ = 1000;

/** @private @const {number} */
visflow.d3m.DEFAULT_MAX_PIPELINES_ = 3;

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
 * @param {Function=} opt_callback Callback to be called on a response.
 */
visflow.d3m.sendMessage = function(fname, msg, opt_callback) {
  var rid = visflow.utils.randomString(6);
  console.log('[send]', msg);
  visflow.d3m.socket.send(JSON.stringify({
    // Request id is used to distinguish responses of different messages.
    rid: rid,
    fname: fname,
    object: msg
  }));
  visflow.d3m.expects_[rid] = {
    rid: rid,
    fname: fname,
    callback: opt_callback
  };
};

/**
 * Handles socket response messages.
 * @param {{data: *}} event
 * @param {Function=} opt_callback Callback for receiving a response
s */
visflow.d3m.socket.onmessage = function(event, opt_callback) {
  var data = /** @type {{
    rid: string,
    object: !Object
  }} */(JSON.parse(/** @type {string} */(event.data)));

  var rid = data.rid;
  var res = data.object;
  console.log('[receive]', res);
  if (!(rid in visflow.d3m.expects_)) {
    visflow.error(rid, 'not expected but received');
  }
  var callback = visflow.d3m.expects_[rid].callback;

  var responseInfo = res['response_info'];
  if (responseInfo && responseInfo.status &&
    (responseInfo.status.code == d3m.StatusCode.UNAVAILABLE ||
     responseInfo.status.code == d3m.StatusCode.UNIMPLEMENTED)) {
    console.warn('TA2 does not support ' + visflow.d3m.expects_[rid].fname);
    return;
  }

  switch (visflow.d3m.expects_[rid].fname) {
    case d3m.Rpc.START_SESSION:
      visflow.d3m.sessionId = res.context['session_id'];
      break;
    case d3m.Rpc.CREATE_PIPELINES:
      var pipelineInfo = res['pipeline_info'];
      var pipeline = {
        id: res['pipeline_id'],
        status: responseInfo && responseInfo.status ?
          responseInfo.status.code : d3m.StatusCode.UNKNOWN,
        progress: res['progress_info'],
        predictResultUri: pipelineInfo && pipelineInfo['predict_result_uris'] &&
          pipelineInfo['predict_result_uris'][0] || undefined,
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
      visflow.d3m.loadPipelineAsDiagram(/** @type {d3m.Dataflow} */(res));
      break;
    case d3m.Rpc.GET_DATAFLOW_RESULTS:
      if (callback) { // updateDataflowResults
        callback(res);
      }
      break;
    case d3m.Rpc.EXPORT_PIPELINE:
      if (res.status.code == d3m.StatusCode.OK) {
        visflow.success('executable for pipeline ' + visflow.d3m.pipelineId +
          ' exported successfully');
      } else {
        visflow.error('cannot export pipeline executable');
      }
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
  visflow.d3m.initEventListeners_();
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
        'version': '2017.9.11'
      });
    } else {
      visflow.warning('waiting for D3M server connection');
      timePassed += visflow.d3m.SOCKET_WAIT_INTERVAL_;
      if (timePassed > visflow.d3m.SOCKET_MAX_WAIT_) {
        visflow.error('D3M socket to TA2 is unavailable');
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
         * @param {!Array<d3m.Problem>} dataList
         */
        function(dataList) {
          visflow.d3m.taskSelection_(dialog, dataList);
        });
    }
  });
};

/**
 * Selects the task that is defined in the config file.
 */
visflow.d3m.newTaskFromConfig = function() {
  $.get(visflow.url.D3M_CONFIG,
    /**
     * @param {d3m.Config} config
     */
     function(config) {
       d3m.config = config;
       visflow.d3m.createPipelines({
         id: config.problemSchema.problemId.replace('_problem', ''),
         problemSchema: config.problemSchema,
         datasetSchema: config.datasetSchema
       });
     });
};

/**
 * Initializes d3m selection dialog.
 * @param {!jQuery} dialog
 * @param {!Array<d3m.Problem>} problemList
 * @private
 */
visflow.d3m.taskSelection_ = function(dialog, problemList) {
  var table = dialog.find('table');
  problemList.map(function(problem) {
    // Flatten the schema object into dataset descriptor.
    problem.metric = problem.problemSchema.metric;
    problem.taskType = problem.problemSchema.taskType;
    problem.taskSubtype = d3m.conciseTaskSubtype(problem.taskType,
      problem.problemSchema.taskSubType || 'none');
    problem.numTrainSamples = problem.datasetSchema.trainData.numSamples;
  });
  var dt = table.DataTable({
    data: problemList,
    select: 'single',
    scrollX: true,
    columns: [
      {title: 'Task Id', data: 'id'},
      {title: 'TaskType', data: 'taskType'},
      {title: 'TaskSubtype', data: 'taskSubtype'},
      {title: 'Metric', data: 'metric'},
      {title: '#TrainSamples', data: 'numTrainSamples'},
      {title: 'Size', data: 'size'}
    ],
    columnDefs: [
      {
        type: 'data-size',
        render: function(size) {
          return visflow.utils.fileSizeDisplay(size);
        },
        targets: 5
      }
    ],
    pageLength: 5,
    lengthMenu: [5, 10, 20],
    pagingType: 'full'
  });
  var problem = null;
  var confirm = dialog.find('#confirm');
  dt.on('select.dt', function(event, dt, type, tableIndices) {
    problem = problemList[tableIndices[0]];
    visflow.d3m.problem = problem;
    confirm.prop('disabled', false);
  }).on('deselect.dt', function() {
    problem = null;
    confirm.prop('disabled', true);
  });

  confirm.click(function() {
    d3m.config = null;
    visflow.d3m.createPipelines(/** @type {!d3m.Problem} */(problem));
  });
};

/**
 * Requests pipeline creation for the given d3m.
 * @param {d3m.Problem} problem
 */
visflow.d3m.createPipelines = function(problem) {
  // Clear previous pipelines.
  visflow.d3m.reset();

  visflow.pipelinePanel.setTask(problem);

  var problemSchema = problem.problemSchema;
  visflow.d3m.sendMessage(d3m.Rpc.CREATE_PIPELINES, {
    'context': {
      'session_id': visflow.d3m.sessionId
    },
    'task': d3m.taskTypeToNumber(problemSchema.taskType),
    'task_subtype': problemSchema.taskSubType ?
      d3m.taskSubtypeToNumber(d3m.conciseTaskSubtype(problemSchema.taskType,
          problemSchema.taskSubType)) :
      d3m.TaskSubtype.NONE,
    'task_description': problemSchema.descriptionFile,
    'metrics': [d3m.metricToNumber(problemSchema.metric)],
    'output': d3m.outputTypeToNumber(problemSchema.outputType),
    'train_features': visflow.d3m.allTrainFeatures(),
    'target_features': [{
      'feature_id': problemSchema.target.field,
      'data_uri': d3m.trainingDataRoot()
    }],
    'max_pipelines': visflow.d3m.DEFAULT_MAX_PIPELINES_
  });
};

/**
 * Loads a session and its pipelines.
 * @param {string} sessionId
 */
visflow.d3m.loadSession = function(sessionId) {
  visflow.d3m.sessionId = sessionId;
  visflow.d3m.sendMessage(d3m.Rpc.LIST_PIPELINES, {
    'context': {
      'session_id': sessionId
    }
  });
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

  visflow.d3m.sendMessage(d3m.Rpc.GET_DATAFLOW_RESULTS, {
    'context': {
      'session_id': visflow.d3m.sessionId
    },
    'pipeline_id': pipelineId
  }, function(res) {
    if (pipelineId == visflow.d3m.pipelineId) {
      visflow.d3m.updateDataflowResults(/** @type {d3m.ModuleResult} */(res));
    }
  });
};

/**
 * Updates the newest dataflow pipeline results.
 * @param {d3m.ModuleResult} result
 */
visflow.d3m.updateDataflowResults = function(result) {
  if (!visflow.options.isD3MPipeline()) {
    return;
  }
  var node = visflow.flow.getNode(result['module_id']);
  if (result.status != d3m.ModuleStatus.DONE) {
    node.showProgress(0);
  } else {
    node.hideProgress();
  }
  if (result.progress != undefined) {
    node.setProgress(result.progress);
  }
};

/**
 * Resets the d3m pipelines.
 */
visflow.d3m.reset = function() {
  visflow.d3m.pipelines = [];
  visflow.d3m.pipelineId = '';
  visflow.flow.clearFlow();
  visflow.pipelinePanel.update();
};

/**
 * Initializes event listeners for D3M related options.
 * @private
 */
visflow.d3m.initEventListeners_ = function() {
  visflow.listen(visflow.options, visflow.Event.D3M_PIPELINE,
    function(event, state) {
    });
};

/**
 * Toggles the state of showing D3M pipeline by menu button.
 */
visflow.d3m.togglePipeline = function() {
  visflow.flow.clearFlow();
  if (visflow.options.isD3MPipeline()) {
    visflow.options.toggleD3MPipeline(false);
  } else {
    visflow.options.toggleD3MPipeline(true);
    if (visflow.d3m.pipelineId) {
      visflow.d3m.loadPipeline(visflow.d3m.pipelineId);
    }
  }
};

/**
 * Exports the selected pipeline to an executable.
 * @param {string} pipelineId
 */
visflow.d3m.exportPipeline = function(pipelineId) {
  visflow.d3m.sendMessage(d3m.Rpc.EXPORT_PIPELINE, {
    'context': {
      'session_id': visflow.d3m.sessionId
    },
    'pipeline_id': pipelineId,
    'pipeline_exec_uri': d3m.executablesRoot()
  });
};

/**
 * Starts visual exploration of the pipeline data. Fetches the data with targets
 * from the server and uploads it as tabular dataset for exploration.
 * @param {d3m.Problem} problem
 */
visflow.d3m.explorePipelineData = function(problem) {
  $.post(visflow.url.D3M_DATA, {
    trainingDataRoot: d3m.trainingDataRoot()
  }, function(result) {
    /**
     * @type {{
     *   trainData: string,
     *   trainTargets: string
     * }}
     */
    var res = /** @type {?} */(result);
    var subset = d3m.mergeCsvDataAndTargets(res.trainData, res.trainTargets);
    visflow.upload.export(subset, function(fileParams) {
      visflow.options.toggleD3MPipeline(false);
      visflow.diagram.newSingleDataSource(fileParams.fileName);
    });
  });
};

/**
 * Checks if the selected pipeline has completed.
 * @return {boolean}
 */
visflow.d3m.pipelineCompleted = function() {
  if (!visflow.d3m.pipelineId) {
    return false;
  }
  var completed = false;
  visflow.d3m.pipelines.forEach(function(pipeline) {
    if (pipeline.id == visflow.d3m.pipelineId &&
      pipeline.progress == d3m.Progress.COMPLETED) {
      completed = true;
    }
  });
  return completed;
};

/**
 * Checks if the predict results are ready for the currently selected pipeline.
 * If so, returns the path to the results. Otherwise returns empty string.
 * @return {string}
 */
visflow.d3m.predictResultsPath = function() {
  if (!visflow.d3m.pipelineCompleted()) {
    return '';
  }
  var resultsPath = '';
  visflow.d3m.pipelines.forEach(function(pipeline) {
    if (pipeline.id == visflow.d3m.pipelineId) {
      resultsPath = /** @type {string} */(pipeline.predictResultUri);
    }
  });
  return resultsPath;
};

/**
 * Starts visual exploration of the pipeline result. Fetches the data with
 * results from the server and uploads it as tabular dataset for exploration.
 * @param {d3m.Problem} problem
 */
visflow.d3m.explorePipelineResult = function(problem) {
  console.warn(visflow.d3m.predictResultsPath());
  $.post(visflow.url.D3M_RESULT, {
    trainingDataRoot: d3m.trainingDataRoot(),
    resultsPath: visflow.d3m.predictResultsPath() || ''
  }, function(result) {
    /**
     * @type {{
     *   trainData: string,
     *   trainTargets: string,
     *   predictResults: string
     * }}
     */
    var res = /** @type {?} */(result);
    var subset = d3m.mergeCsvDataAndTargets(res.trainData, res.trainTargets,
      res.predictResults);
    visflow.upload.export(subset, function(fileParams) {
      visflow.options.toggleD3MPipeline(false);
      visflow.diagram.newSingleDataSource(fileParams.fileName);
    });
  });
};

/**
 * Explores the pipeline list as a table.
 */
visflow.d3m.explorePipelineList = function() {
  var subset = visflow.d3m.pipelinesToSubset();
  visflow.upload.export(subset, function(fileParams) {
    visflow.options.toggleD3MPipeline(false);
    visflow.diagram.newSingleDataSource(fileParams.fileName);
  });
};


/**
 * Gets all the train features given by the data schema.
 * @return {!Array<{
 *   feature_id: string,
 *   data_uri: string
 * }>}
 */
visflow.d3m.allTrainFeatures = function() {
  /**
   * @type {Array<{
   *   varName: string,
   *   varType: string,
   *   varRole: string
   * }>}
   */
  var trainData = null;
  if (d3m.config) { // use config file
    trainData = d3m.config.datasetSchema.trainData.trainData;
  } else { // use manually selected problem
    if (!visflow.d3m.problem.id) { // no problem specified
      return [];
    }
    trainData = visflow.d3m.problem.datasetSchema.trainData.trainData;
  }

  var features = [];
  trainData.forEach(function(column) {
    if (column.varName == d3m.D3M_INDEX) {
      return;
    }
    features.push({
      feature_id: column.varName,
      data_uri: d3m.trainingDataRoot()
    });
  });
  return features;
};

/**
 * Exits VisFlow and kills the D3M process.
 */
visflow.d3m.exit = function() {
  $.get(visflow.url.EXIT).done(function() {
    visflow.success('VisFlow shutdown completed. ' +
      'You may now close the browser.');
  }).fail(function(res) {
    visflow.error(res.responseText + '; shutdown failed');
  });
};
