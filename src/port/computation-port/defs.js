/**
 * @fileoverview ComputationPort defs.
 */

/** @const {boolean} */
visflow.ComputationPort.prototype.IS_COMPUTATION_PORT = true;

/**
 * Returns an array of port contextmenu items.
 * @return {!Array<!visflow.contextMenu.Item>}
 */
visflow.ComputationPort.prototype.contextMenuItems = function() {
  return [
    //{id: 'disconnect', text: 'Disconnect',
    //  icon: 'glyphicon glyphicon-minus-sign'},
    {id: visflow.Event.EXPLORE, text: 'Explore Data',
      icon: 'glyphicon glyphicon-open'}
  ];
};
