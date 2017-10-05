/**
 * D3M name space, used to define global D3M constants.
 * @const
 */
var d3m = {};

/** @const {string} */
d3m.DATA_PATH = '/data/d3m';

/** @const {string} */
d3m.D3M_INDEX = 'd3mIndex';

/** @const {string} */
d3m.URI_PREFIX = ''; // 'file://';

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
  EXECUTION_TIME: 14,
  MEAN_SQUARED_ERROR: 15
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
  GET_DATAFLOW_RESULTS: 'GetDataflowResults',
  EXPORT_PIPELINE: 'ExportPipeline'
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

/** @enum {number} */
d3m.ModuleStatus = {
  PENDING: 0,
  RUNNING: 1,
  DONE: 2,
  ERROR: 3
};

/** @enum {number} */
d3m.OutputType = {
  OUTPUT_TYPE_UNDEFINED: 0,
  CLASS_LABEL: 1,
  PROBABILITY: 2,
  REAL: 3,
  NODE_ID: 4,
  VECTOR_CLASS_LABEL: 5,
  VECTOR_STOCHASTIC: 6,
  VECTOR_REAL: 7,
  FILE: 8
};

/**
 * @typedef {{
 *   problemId: string,
 *   metric: string,
 *   taskType: string,
 *   taskSubType: string,
 *   outputType: string,
 *   descriptionFile: string,
 *   target: {
 *     field: string
 *   }
 * }}
 */
d3m.ProblemSchema;

/**
 * @typedef {{
 *   numSamples: number,
 *   trainData: !Array<{
 *     varName: string,
 *     varRole: string,
 *     varType: string
 *   }>
 * }}
 */
d3m.DataSchema;

/**
 * @typedef {{
 *   datasetId: string,
 *   testDataSchemaMirrorsTrainDataSchema: boolean,
 *   testData: d3m.DataSchema,
 *   trainData: d3m.DataSchema
 * }}
 */
d3m.DatasetSchema;

/**
 * Dataset descriptor returned by d3m-list-data.php.
 * @typedef {{
 *   id: string,
 *   size: (number|undefined),
 *   problemSchema: d3m.ProblemSchema,
 *   datasetSchema: d3m.DatasetSchema
 * }}
 */
d3m.Problem;

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
 *   scores: !Array<d3m.Score>,
 *   predictResultUri: (string|undefined)
 * }}
 */
d3m.Pipeline;

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   type: string
 * }}
 */
d3m.Module;


/**
 * @typedef {{
 *   from_module_id: string,
 *   from_output_name: string,
 *   to_module_id: string,
 *   to_input_name: string
 * }}
 */
d3m.Connection;

/**
 * @typedef {{
 *   pipeline_id: string,
 *   modules: !Array<d3m.Module>,
 *   connections: !Array<d3m.Connection>
 * }}
 */
d3m.Dataflow;

/**
 * @typedef {{
 *   output_name: string,
 *   value: string
 * }}
 */
d3m.ModuleOutput;

/**
 * @typedef {{
 *   module_id: string,
 *   status: d3m.ModuleStatus,
 *   progress: number,
 *   outputs: !Array<d3m.ModuleOutput>,
 *   execution_time: number
 * }}
 */
d3m.ModuleResult;

/**
 * @typedef {{
 *   configJson: {
 *     dataset_schema: string,
 *     problem_schema: string,
 *     training_data_root: string,
 *     pipeline_logs_root: string,
 *     exeutables_root: string,
 *     temp_storage_root: string,
 *     test_data_root: string,
 *     results_path: string
 *   },
 *   problemSchema: d3m.ProblemSchema,
 *   datasetSchema: d3m.DatasetSchema
 * }}
 */
d3m.Config;

/** @type {?d3m.Config} */
d3m.config = null;

/**
 * Gets the train data root.
 * @return {string}
 */
d3m.trainingDataRoot = function() {
  return d3m.URI_PREFIX + (d3m.config ?
    d3m.config.configJson['training_data_root'] :
    d3m.DATA_PATH + '/' + visflow.d3m.problem.id + '/data'
  );
};

/**
 * Gets the result path.
 * @return {string}
 */
d3m.resultsPath = function() {
  return d3m.config ? d3m.URI_PREFIX + d3m.config.configJson['results_path'] :
    d3m.trainingDataRoot();
};

/**
 * Gets the executables root directory.
 * @return {string}
 */
d3m.executablesRoot = function() {
  return d3m.URI_PREFIX + (
    d3m.config ? d3m.config.configJson['executables_root'] : '');
};

/**
 * Opens the D3M instruction PDF in a new tab.
 */
d3m.instruction = function() {
  window.open(visflow.url.D3M_INSTRUCTION);
};
