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
 * @return {?number}
 */
d3m.taskTypeToNumber = function(taskType) {
  var result = d3m.enumKeyToNumber_(d3m.TaskType, taskType);
  return result == null ? null : +result;
};

/**
 * Converts a task subtype string to its enum number.
 * @param {string} taskSubtype
 * @return {?number}
 */
d3m.taskSubtypeToNumber = function(taskSubtype) {
  var result = d3m.enumKeyToNumber_(d3m.TaskSubtype, taskSubtype);
  return result == null ? null : +result;
};

/**
 * Converts a metric to its enum number.
 * @param {string} metric
 * @return {?number}
 */
d3m.metricToNumber = function(metric) {
  var result = d3m.enumKeyToNumber_(d3m.Metric, metric.toLowerCase(),
    function(key) {
      return key.replace('_', '').toLowerCase();
    });
  return result == null ? null : + result;
};

/**
 * Converts an output type to its enum number.
 * @param {string} outputType
 * @return {?number}
 */
d3m.outputTypeToNumber = function(outputType) {
  var result = d3m.enumKeyToNumber_(d3m.OutputType, outputType);
  return result == null ? null : +result;
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
