/**
 * D3M name space, used to define global D3M constants.
 * @const
 */
var d3m = {};

/** @enum {number} */
d3m.StatusCode = {
  UNKNOWN: 0,
  OK: 1,
  CANCELLED: 2,
  SESSION_UNKNOWN: 3,
  SESSION_ENDED: 4,
  SESSION_EXPIRED: 5,
  INVALID_ARGUMENT: 6,
  RESOURCE_EXHAUSTED: 7,
  UNAVAILABLE: 8,
  FAILED_PRECONDITION: 9,
  OUT_OF_RANGE: 10,
  UNIMPLEMENTED: 11,
  INTERNAL: 12,
  ABORTED: 13
};

/** @enum {number} */
d3m.Progress = {
  SUBMITTED: 0,
  RUNNING: 1,
  UPDATED: 2,
  COMPLETED: 3
};

/** @enum {number} */
d3m.Metric = {
  METRIC_UNDEFINED: 0,
  ACCURACY: 1,
  F1: 2,
  F1_MICRO: 3,
  F1_MACRO: 4,
  ROC_AUC: 5,
  ROC_AUC_MICRO: 6,
  ROC_AUC_MACRO: 7,
  ROOT_MEAN_SQUARED_ERROR: 8,
  ROOT_MEAN_SQUARED_ERROR_AVG: 9,
  MEAN_ABSOLUTE_ERROR: 10,
  R_SQUARED: 11,
  NORMALIZED_MUTUAL_INFORMATION: 12,
  JACCARD_SIMILARITY_SCORE: 13,
  EXECUTION_TIME: 14
};

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
  END_SESSION: 'EndSession',
  DESCRIBE_DATAFLOW: 'DescribeDataflow',
  GET_DATAFLOW_RESULTS: 'GetDataflowResults'
};


/** @enum {number} */
d3m.TaskType = {
  TASK_TYPE_UNDEFINED: 0,
  CLASSIFICATION: 1,
  REGRESSION: 2,
  SIMILARITY_MATCHING: 3,
  LINK_PREDICTION: 4,
  VERTEX_NOMINATION: 5,
  COMMUNITY_DETECTION: 6,
  GRAPH_MATCHING: 7,
  TIMESERIES_FORECASTING: 8,
  COLLABORATIVE_FILTERING: 9
};

/** @enum {number} */
d3m.TaskSubtype = {
  TASK_SUBTYPE_UNDEFINED: 0,
  NONE: 1,
  BINARY: 2,
  MULTICLASS: 3,
  MULTILABEL: 4,
  UNIVARIATE: 5,
  MULTIVARIATE: 6,
  OVERLAPPING: 7,
  NONOVERLAPPING: 8
};

/**
 * Dataset descriptor returned by list-d3m-data.php.
 * @typedef {{
 *   id: string,
 *   size: number,
 *   schema: {
 *     metric: string,
 *     taskType: string,
 *     taskSubType: string,
 *     descriptionFile: string,
 *     target: {
 *       field: string
 *     }
 *   }
 * }}
 */
d3m.Dataset;

/**
 * D3M metric score.
 * @typedef {{
 *   metric: d3m.Metric,
 *   value: number
 * }}
 */
d3m.Score;

/**
 * D3M pipeline descriptor. This is what is shown in the pipeline list.
 * @typedef {{
 *   status: (d3m.StatusCode|undefined),
 *   progress: (d3m.Progress|undefined),
 *   id: string,
 *   scores: !Array<d3m.Score>
 * }}
 */
d3m.Pipeline;
