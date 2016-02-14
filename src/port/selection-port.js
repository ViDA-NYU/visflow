/**
 * @fileoverview VisFlow selection port.
 */

'use strict';

/**
 * @param {visflow.Port.Params} params
 * @constructor
 * @extends {visflow.Port}
 */
visflow.SelectionPort = function(params) {
  var paramsApplied = _.extend(
    {
      isInput: false,
      isConstants: false,
      text: 'selected'
    },
    params
  );
  visflow.SelectionPort.base.constructor.call(this, paramsApplied);
};

visflow.utils.inherit(visflow.SelectionPort, visflow.MultiplePort);

/** @inheritDoc */
visflow.SelectionPort.prototype.setContainer = function(container) {
  visflow.SelectionPort.base.setContainer.call(this, container);
  container.find('.port-icon').addClass('selection');
};
