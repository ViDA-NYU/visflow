/**
 * @fileoverview D3M util functions.
 */


/**
 * Converts a camel-case string to its enum value in a dict. The dict keys are
 * assumed to be uppercase with underscores (like the enums above).
 * @param {!Object} enumDict
 * @param {string} str
 * @return {number|string|null} null if str does not exists in enumDict.
 * @private
 */
d3m.enumKeyToNumber_ = function(enumDict, str) {
  for (var key in enumDict) {
    var camelKey = $.camelCase(key.toLowerCase().replace('_', '-'));
    if (camelKey == str) {
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
 * @return {?string} null if num is not present in the enum.
 * @private
 */
d3m.enumNumberToKey_ = function(enumDict, num) {
  for (var key in enumDict) {
    var camelKey = $.camelCase(key.toLowerCase().replace('_', '-'));
    if (enumDict[key] == +num) {
      return camelKey;
    }
  }
  return null;
};

/**
 * Converts a task type string to its enum number.
 * @param {string} taskType
 * @return {number|null}
 */
d3m.taskTypeToNumber = function(taskType) {
  var result = d3m.enumKeyToNumber_(d3m.TaskType, taskType);
  return result == null ? null : +result;
};

/**
 * Converts a task subtype string to its enum number.
 * @param {string} taskSubtype
 * @return {number|null}
 */
d3m.taskSubtypeToNumber = function(taskSubtype) {
  var result = d3m.enumKeyToNumber_(d3m.TaskSubtype, taskSubtype);
  return result == null ? null : +result;
};
