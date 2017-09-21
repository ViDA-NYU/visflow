/**
 * @fileoverview Computation node base class.
 */

/**
 * @param {visflow.params.Node} params
 * @extends {visflow.Node}
 * @abstract
 * @constructor
 */
visflow.ComputationNode = function(params) {
  if (params == null) {
    visflow.error('null params');
    return;
  }
  visflow.ComputationNode.base.constructor.call(this, params);
};

_.inherit(visflow.ComputationNode, visflow.Node);

/** @inheritDoc */
visflow.ComputationNode.prototype.init = function() {
  visflow.ComputationNode.base.init.call(this);
  this.container.addClass('computation');
};

/** @inheritDoc */
visflow.ComputationNode.prototype.initContextMenu = function() {
  visflow.ComputationNode.base.initContextMenu.call(this);
};

/**
 * Checks if the node has an output port connected with a subset node.
 * @return {boolean}
 */
visflow.ComputationNode.prototype.isConnectedToSubsetNode = function() {
  var nodes = this.outputTargetNodes();
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].IS_SUBSET_NODE) {
      return true;
    }
  }
  return false;
};

/**
 * Checks whether the port with given id is subsetizable.
 * @param {string} id
 * @return {boolean}
 */
visflow.ComputationNode.prototype.hasPortSubset = function(id) {
  return false;
};

/**
 * Serializes the given port's data to a subset. If the data is not serializable
 * to subset, the method should panic.
 * @param {string} id Port id.
 * @return {!visflow.Subset}
 */
visflow.ComputationNode.prototype.getPortSubset = function(id) {
  return new visflow.Subset();
};

/** @inheritDoc */
visflow.ComputationNode.prototype.showDetails = function() {};

/**
 * Draws the ports. Additionally highlights ports that are subsetizable.
 * @inheritDoc
 */
visflow.ComputationNode.prototype.updatePorts = function() {
  visflow.ComputationNode.base.updatePorts.call(this);

  _.each(this.ports, function(port) {
    if (port.IS_COMPUTATION_PORT) {
      port.getContainer()
        .toggleClass('subsetizable', this.hasPortSubset(port.id));
    }
  }.bind(this));
};
