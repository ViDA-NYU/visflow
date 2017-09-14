/**
 * @fileoverview Module defs.
 */

/** @inheritDoc */
visflow.Module.prototype.NODE_CLASS = 'module';

/** @inheritDoc */
visflow.Module.prototype.DEFAULT_LABEL = 'Module';

/**
 * Module mimics async data processing.
 * @inheritDoc
 */
visflow.Module.prototype.isAsyncProcess = true;

/** @const {number} */
visflow.Module.prototype.MIN_WIDTH = 120;

/** @const {number} */
visflow.Module.prototype.MIN_HEIGHT = 60;

/**
 * Module nodes specific options.
 * @return {!visflow.options.Node}
 */
visflow.Module.prototype.moduleOptions = function() {
  return new visflow.options.Node({});
};

/** @inheritDoc */
visflow.Module.prototype.contextMenuItems = function() {
  var items = visflow.Module.base.contextMenuItems();
  return items.filter(function(item) {
    return item.id != 'visMode';
  });
};

