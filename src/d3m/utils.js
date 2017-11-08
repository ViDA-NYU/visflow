/**
 * @fileoverview D3M util functions.
 */


/**
 * Converts a camel-case string to its enum value in a dict. The dict keys are
 * assumed to be uppercase with underscores (like the enums above).
 * @param {!Object} enumDict
 * @param {string} str
 * @param {(function(string):string)=} opt_convert Function that maps key
 *     to its "natural" form. If not given, it will convert "UPPER_CASE" to
 *     "upperCase".
 * @return {number|string|null} null if str does not exists in enumDict.
 * @private
 */
d3m.enumKeyToNumber_ = function(enumDict, str, opt_convert) {
  for (var key in enumDict) {
    var convertedKey = opt_convert ? opt_convert(key) :
      $.camelCase(key.toLowerCase().replace('_', '-'));
    if (convertedKey == str) {
      return enumDict[key];
    }
  }
  return null;
};


/**
 * Converts an enum number back to its key. The dict keys are
 * assumed to be uppercase with underscores (like the enums above).
 * @param {!Object} enumDict
 * @param {string|number} num
 * @param {(function(string):string)=} opt_convert Function that maps key
 *     to its "natural" form. If not given, it will convert "UPPER_CASE" to
 *     "upperCase".
 * @return {?string} null if num is not present in the enum.
 * @private
 */
d3m.enumNumberToKey_ = function(enumDict, num, opt_convert) {
  for (var key in enumDict) {
    if (enumDict[key] == +num) {
      return opt_convert ? opt_convert(key) :
          $.camelCase(key.toLowerCase().replace('_', '-'));
    }
  }
  return null;
};

/**
 * Converts a task type string to its enum number.
 * @param {string} taskType
 * @return {number}
 */
d3m.taskTypeToNumber = function(taskType) {
  var result = d3m.enumKeyToNumber_(d3m.TaskType, taskType.toLowerCase());
  return result == null ? d3m.TaskType.TASK_TYPE_UNDEFINED : +result;
};

/**
 * Converts a task subtype string to its enum number.
 * @param {string} taskSubtype
 * @return {number}
 */
d3m.taskSubtypeToNumber = function(taskSubtype) {
  var result = d3m.enumKeyToNumber_(d3m.TaskSubtype, taskSubtype.toLowerCase());
  return result == null ? d3m.TaskSubtype.TASK_SUBTYPE_UNDEFINED : +result;
};

/**
 * Converts a metric to its enum number.
 * @param {string} metric
 * @return {number}
 */
d3m.metricToNumber = function(metric) {
  var result = d3m.enumKeyToNumber_(d3m.Metric, metric.toLowerCase(),
    function(key) {
      return key.replace(/_/g, '').toLowerCase();
    });
  return result == null ? d3m.Metric.METRIC_UNDEFINED : + result;
};

/**
 * Converts an output type to its enum number.
 * @param {string} outputType
 * @return {number}
 */
d3m.outputTypeToNumber = function(outputType) {
  var result = d3m.enumKeyToNumber_(d3m.OutputType, outputType);
  return result == null ? d3m.OutputType.OUTPUT_TYPE_UNDEFINED : +result;
};

/**
 * Converts an enum number to enum key.
 * @param {!Object<number>} enumDict
 * @param {number} num
 * @return {?string}
 */
d3m.enumToText = function(enumDict, num) {
  return d3m.enumNumberToKey_(enumDict, num);
};

/**
 * Remove task type from task subtype to reduce string length.
 * @param {string} taskType
 * @param {string} taskSubtype
 * @return {string}
 */
d3m.conciseTaskSubtype = function(taskType, taskSubtype) {
  var typeIndex = taskSubtype.toLowerCase().indexOf(taskType);
  if (typeIndex != -1) {
    taskSubtype = taskSubtype.substr(0, typeIndex);
  }
  return taskSubtype;
};

/**
 * Merges two CSVs by adding the second to the first.
 * @param {string} csv1
 * @param {string} csv2
 * @return {string} The merged CSV.
 * @private
 */
d3m.mergeCsv_ = function(csv1, csv2) {
  var lines1 = csv1.split(/[\r\n]+/);
  if (_.last(lines1) === '') {
    lines1.pop();
  }
  var lines2 = csv2.split(/[\r\n]+/);
  if (_.last(lines2) === '') {
    lines2.pop();
  }
  var d3mIndexToRow = {};
  var d3mIndex1 = lines1[0].indexOf(d3m.D3M_INDEX);
  var d3mIndex2 = lines2[0].indexOf(d3m.D3M_INDEX);
  lines1.forEach(function(line, rowIndex) {
    var tokens = line.split(',');
    d3mIndexToRow[tokens[d3mIndex1]] = rowIndex;
  });
  lines2.forEach(function(line) {
    var tokens = line.split(',');
    var d3mIndex = tokens[d3mIndex2];
    tokens.forEach(function(token, colIndex) {
      if (colIndex == d3mIndex2) {
        return;
      }
      lines1[d3mIndexToRow[d3mIndex]] += ',' + token;
    });
  });
  return lines1.join('\n');
};

/**
 * Merges the CSVs of data and targets into one CSV and creates a subset for it.
 * @param {string} data Train data CSV.
 * @param {string} targets Train targets CSV.
 * @param {string=} opt_results Predict results CSV.
 * @return {!visflow.Subset}
 */
d3m.mergeCsvDataAndTargets = function(data, targets, opt_results) {
  var mergedCsv = d3m.mergeCsv_(data, targets);

  var results = opt_results || '';
  if (results) {
    var lines = results.split(/[\r\n]+/);
    lines[0] = lines[0].split(',').map(function(token) {
      // Rename the columns other than "d3mIndex" so that we don't have conflict
      // column names with trainTargets.
      return token == d3m.D3M_INDEX ? token : 'result_' + token;
    }).join(',');
    results = lines.join('\n');
    mergedCsv = d3m.mergeCsv_(mergedCsv, results);
  }

  var tabularData = visflow.parser.csv(mergedCsv);
  tabularData.file = tabularData.name = 'ppl-' +
    (results ? 'results' : 'data');
  return new visflow.Subset(new visflow.Dataset(tabularData));
};
