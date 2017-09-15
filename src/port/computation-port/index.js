/**
 * @fileoverview VisFlow computation port.
 */

/**
 * @param {visflow.params.Port} params
 * @constructor
 * @extends {visflow.Port}
 */
visflow.ComputationPort = function(params) {
  var paramsApplied = _.extend(
    {
      isInput: false,
      text: 'computation port'
    },
    params
  );

  visflow.ComputationPort.base.constructor.call(this, paramsApplied);

  /**
   * If input is set, this is a copy of the input subset. Otherwise, the value
   * has no meaning.
   * @type {!visflow.Subset}
   */
  this.pack = new visflow.Subset();
};

_.inherit(visflow.ComputationPort, visflow.Port);


/** @inheritDoc */
visflow.ComputationPort.prototype.initContextMenu = function() {
  var contextMenu = visflow.ComputationPort.base.initContextMenu.call(this);

  visflow.listen(contextMenu, visflow.Event.EXPLORE, function() {
    var subset = this.node.getPortSubset(this.id);
    // TODO(bowen): visflow.upload.export(this.pack);
  }.bind(this));
  visflow.listen(contextMenu, visflow.Event.BEFORE_OPEN,
    function(event, menuContainer) {
    var explore = menuContainer.find('#explore');
    if (!this.node.hasPortSubset(this.id)) {
      explore.addClass('disabled');
      explore.children('span').first().text('No Result for Display');
    }
  }.bind(this));

  return contextMenu;
};

/** @inheritDoc */
visflow.ComputationPort.prototype.setContainer = function(container) {
  visflow.ComputationPort.base.setContainer.call(this, container);
  container.find('.port-icon').addClass('computation');
};

/** @inheritDoc */
visflow.ComputationPort.prototype.connectable = function(port) {
  var result = visflow.ComputationPort.base.connectable.call(this, port);

  if (!result.connectable) {
    // already failed due to graph topology
    return result;
  }
  if (port.IS_CONSTANT_PORT) {
    return {
      connectable: false,
      reason: 'cannot connect ComputationPort to ConstantPort'
    };
  }
  // computation port can connect to anything
  return result;
};

/** @inheritDoc */
visflow.ComputationPort.prototype.getSubset = function() {
  return this.node.getPortSubset(this.id);
};

/** @inheritDoc */
visflow.ComputationPort.prototype.info = function() {
  if (!this.node.hasPortSubset(this.id)) {
    return 'generic data';
  }
  var subset = this.getSubset();
  return '(' + subset.count() + ' items)';
};

/** @inheritDoc */
visflow.ComputationPort.prototype.onConnected = function(edge) {
  if (this.isInput) {
    // TODO(bowen): Check this. Right now we always try to subset-ize the input.
    this.pack = edge.sourcePort.getSubset();
  }
  edge.sourcePort.changed(true);
};

/**
 * Overrides dragging interaction so that connections cannot be made on
 * computation port.
 * @inheritDoc
 */
visflow.ComputationPort.prototype.interactionDrag = function() {};
