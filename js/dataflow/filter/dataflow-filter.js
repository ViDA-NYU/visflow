
/*
 * dataflow-filter base class
 */

"use strict";

var extObject = {

  nullValueString: "{N/A}",

  initialize: function(para) {
    DataflowFilter.base.initialize.call(this, para);

    this.viewHeight = 90; // height + padding
    this.dimension = null;
  },

  serialize: function() {
    var result = DataflowFilter.base.serialize.call(this);
    result.dimension = this.dimension;
    return result;
  },

  deserialize: function(save) {
    DataflowFilter.base.deserialize.call(this, save);
    this.dimension = save.dimension;
  },

  show: function() {
    DataflowFilter.base.show.call(this);

    this.jqview
      .removeClass("dataflow-node-shape")
      .addClass("dataflow-node-shape-longflat");

 /*
    this.jqicon = $("<div></div>")
      .appendTo(this.jqview);
*/

    var node = this;
    this.dimensionList = $("<select><option/></select>")
      .addClass("dataflow-node-select")
      .appendTo(this.jqview)
      .select2({
        placeholder: "Select"
      })
      .change(function(event){
        node.dimension = event.target.value;
        node.process();

        // push dimension change to downflow
        core.dataflowManager.propagate(node);
      });
    this.prepareDimensionList();

    // show current selection, must call after prepareDimensionList
    this.dimensionList.select2("val", this.dimension);
  },

  prepareDimensionList: function() {
    var dims = this.ports["in"].pack.data.dimensions;
    for (var i in dims) {
      $("<option value='" + i + "'>" + dims[i] + "</option>")
        .appendTo(this.dimensionList);
    }
  },

  filter: function() {
    // filter the data by constraints
  }
};

var DataflowFilter = DataflowNode.extend(extObject);

