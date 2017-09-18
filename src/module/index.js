/**
 * @fileoverview An module computation node that simply copies its input data
 * to its output. This is to test the system's capability of treating each
 * computation node's output as unique data types.
 */

/**
 * @param {visflow.params.Node} params
 * @constructor
 * @abstract
 * @extends {visflow.ComputationNode}
 */
visflow.Module = function(params) {
  if (!params.ports) {
    visflow.error('ports must be specified for visflow.Module');
  }
  visflow.Module.base.constructor.call(this, params);

  /**
   * Attempts to use ports passed from params.
   * @type {!Object<!visflow.ComputationPort>}
   */
  this.ports = params.ports || {};
};

_.inherit(visflow.Module, visflow.ComputationNode);


/** @inheritDoc */
visflow.Module.prototype.init = function() {
  visflow.Module.base.init.call(this);
};

/**
 * Serializes the compute node.
 * @return {!Object}
 */
visflow.Module.prototype.serialize = function() {
  var result = visflow.Module.base.serialize.call(this);
  result.ports = this.ports;
  return result;
};

/**
 * Deserializes the compute node.
 * @param {!Object} save
 */
visflow.Module.prototype.deserialize = function(save) {
  visflow.Module.base.deserialize.call(this, save);
  this.fillOptions(this.options, this.moduleOptions());
};

/** @inheritDoc */
visflow.Module.prototype.processAsync = function(endProcess) {
  var inPort = this.getPort('in');
  var outPort = this.getPort('out');
  outPort.pack.copy(inPort.pack, true);
  outPort.changed(true);
  endProcess();
};

/** @inheritDoc */
visflow.Module.prototype.showDetails = function() {
  this.content.children().remove();
  $('<div></div>').text(this.label).appendTo(this.content);
};

/** @inheritDoc */
visflow.Module.prototype.hasPortSubset = function(id) {
  // DEVEL(bowen)
  if (this.label == 'Linear SVM' && !this.getPort(id).isInput) {
    return true;
  }
  return false;
};

/** @inheritDoc */
visflow.Module.prototype.getPortSubset = function(id) {
  var tabularData = visflow.parser.csv([
    'a,b,c',
    '33,1.25,xyz1',
    '44,2.55,xyz2',
    '55,3.75,xyz3'
  ].join('\n'));
  tabularData.file = 'pipeline output';
  tabularData.name = 'pipeline output';
  return new visflow.Subset(new visflow.Dataset(tabularData));
};