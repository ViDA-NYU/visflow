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
  if ((this.id == 'module_4' || this.id == 'module_5') &&
    !this.getPort(id).isInput) {
      return true;
    }
  return false;
};

/** @inheritDoc */
visflow.Module.prototype.getPortSubset = function(id) {
  var tabularData = visflow.parser.csv(
    'true_class,pred_class,probability_class_0,probability_class_1,' +
      'probability_class_2\n' +
    '1,1,0.0161807263296,0.910071845204,0.0737474284665\n' +
    '1,1,0.0315428054308,0.942190884143,0.0262663104263\n' +
    '2,2,0.0102648068066,0.041738461257,0.947996731936\n' +
    '0,0,0.943000051183,0.0389754838705,0.0180244649461\n' +
    '1,1,0.0333098365126,0.953923947976,0.0127662155119\n' +
    '0,0,0.950036864284,0.0316688665529,0.0182942691635\n' +
    '0,0,0.958315308142,0.0258669742281,0.01581771763\n' +
    '2,2,0.0246316165535,0.527480953402,0.447887430044\n' +
    '1,2,0.0266599310407,0.3668562735,0.606483795459\n' +
    '0,0,0.955083456175,0.0282371833465,0.0166793604782\n');
  tabularData.file = 'pipeline output';
  tabularData.name = 'pipeline output';
  return new visflow.Subset(new visflow.Dataset(tabularData));
};

/**
 * Explores the subset from the given port.
 * @param {string} id
 */
visflow.Module.prototype.explorePortSubset = function(id) {
  var subset = this.getPortSubset(id);
  visflow.upload.export(subset, function(fileParams) {
    visflow.options.toggleD3MPipeline(false);
    visflow.diagram.newSingleDataSource(fileParams.fileName);
  });
};

/** @inheritDoc */
visflow.Module.prototype.initContextMenu = function() {
  visflow.Module.base.initContextMenu.call(this);
  visflow.listen(this.contextMenu, visflow.Event.BEFORE_OPEN,
    function(event, menuContainer) {
      var del = menuContainer.find('#' + visflow.Event.DELETE);
      del.toggleClass('disabled', !visflow.options.isDiagramEditable());
      // TODO(bowen): execute
    });
};
