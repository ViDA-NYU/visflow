/**
 * @fileoverview VisFlow data source.
 */

'use strict';


/**
 * @param params
 * @constructor
 * @extends {visflow.Node}
 */
visflow.DataSource = function(params) {
  visflow.DataSource.base.constructor.call(this, params);


  /**
   * Data array.
   * @type {!Array<visflow.DataSource.Data>}
   */
  this.data = [];

  /**
   * Copy of parsed data, used for switching between non-crossing and crossing.
   * @private {!Array<!visflow.TabularData>}
   */
  this.rawData_ = [];

  /**
   * Created DataTable.
   * @private {DataTable}
   */
  this.table_;

  /** @inheritDoc */
  this.ports = {
    out: new visflow.MultiplePort({
      node: this,
      id: 'out',
      isInput: false,
      isConstants: false,
      fromPort: ''
    })
  };
};

/**
 * @typedef {{
 *   name: string,
 *   file: string,
 *   isServerData: boolean
 * }}
 *   name: Data name.
 *   file: File location. If it is online data, then this is the URL.
 */
visflow.DataSource.Data;

visflow.utils.inherit(visflow.DataSource, visflow.Node);

/** @inheritDoc */
visflow.DataSource.prototype.NODE_CLASS = 'data-source';
/** @inheritDoc */
visflow.DataSource.prototype.NODE_NAME = 'Data Source';
/** @inheritDoc */
visflow.DataSource.prototype.TEMPLATE = './src/data-source/data-source.html';
/** @inheritDoc */
visflow.DataSource.prototype.PANEL_TEMPLATE =
    './src/data-source/data-source-panel.html';
/** @inheritDoc */
visflow.DataSource.prototype.MIN_HEIGHT = 40;
/** @inheritDoc */
visflow.DataSource.prototype.MAX_HEIGHT = 40;

/**
 * Maximum data names length shown in the node.
 * @private {number}
 */
visflow.DataSource.prototype.DATA_NAMES_LENGTH_ = 100;

/** @inheritDoc */
visflow.DataSource.prototype.DEFAULT_OPTIONS = {
  // Whether to use data crossing.
  crossing: false,
  // Dimensions used for crossing. -1 is index.
  crossingDims: [],
  // Name for the attribute column in crossing.
  crossingName: 'attributes',
  // Whether to user server data set in the UI.
  useServerData: true
};

/** @inheritDoc */
visflow.DataSource.prototype.serialize = function() {
  var result = visflow.DataSource.base.serialize.call(this);
  result.data = this.data;
  return result;
};

/** @inheritDoc */
visflow.DataSource.prototype.deserialize = function(save) {
  visflow.DataSource.base.deserialize.call(this, save);

  if (save.dataSelected != null) {
    visflow.warning('older version data storage found, auto fixed');
    save.dataFile = save.dataSelected;
    save.data = [
      {file: save.dataSelected, name: 'data name', isServerData: true}
    ]
  }
  if (save.data == null) {
    save.data = [
      {
        file: save.dataFile,
        name: save.dataName,
        isServerData: save.useServerData
      }
    ];
  }
  this.data = save.data;
  // Start loading data.
  this.loadData();
};

/** @inheritDoc */
visflow.DataSource.prototype.showDetails = function() {
  visflow.DataSource.base.showDetails.call(this);
  if (this.dataName != null) {
    this.content.children('#data-name').text(this.dataName);
  }
};

/** @inheritDoc */
visflow.DataSource.prototype.interaction = function() {
  visflow.DataSource.base.interaction.call(this);

  this.content.children('button').click(this.loadDataDialog_.bind(this));
};

/** @inheritDoc */
visflow.DataSource.prototype.initPanel = function(container) {
  container.find('#data-name').text(this.dataName);
  container.find('#add-data').click(this.loadDataDialog_.bind(this));
  container.find('#clear-data').click(this.clearData_.bind(this));

  this.createPanelDataList_(container);

  var crossingToggle = new visflow.Checkbox({
    container: container.find('#crossing'),
    value: this.options.crossing,
    title: 'Crossing'
  });
  $(crossingToggle).on('visflow.change', function(event, value) {
    this.options.crossing = value;
    this.updateCrossing_();
  }.bind(this));

  var dimensionList = this.rawData_[0] != null ?
      this.getDimensionList(this.rawData_[0], true) : [];
  var crossingDimsSelect = new visflow.EditableList({
    container: container.find('#crossing-dims'),
    list: dimensionList,
    listTitle: 'Key(s)',
    addTitle: 'Add Dimension',
    selected: this.options.crossingDims,
    allowClear: false
  });
  $(crossingDimsSelect).on('visflow.change', function(event, dims) {
    this.options.crossingDims = dims;
    if (this.options.crossing) {
      this.updateCrossing_();
    }
  }.bind(this));

  var crossingNameInput = new visflow.Input({
    container: container.find('#crossing-name'),
    value: this.options.crossingName,
    title: 'Column Name'
  });
  $(crossingNameInput).on('visflow.change', function(event, value) {
    this.options.crossingName = value;
    if (this.options.crossing) {
      this.updateCrossing_();
    }
  }.bind(this));

  if (!this.options.crossing) {
    container.find('#crossing-section').hide();
  }
};

/**
 * Deletes a dataset from the data list.
 * @param {number} dataIndex
 * @private
 */
visflow.DataSource.prototype.deleteData_ = function(dataIndex) {
  this.data.splice(dataIndex, 1);
  this.rawData_.splice(dataIndex, 1);
  this.process();
};

/**
 * Creates a data list in the panel according to the currently loaded data.
 * @param {!jQuery} container
 */
visflow.DataSource.prototype.createPanelDataList_ = function(container) {
  var ul = container.find('#data-list ul');
  var template = container.find('#data-template');
  ul.children('li').remove();

  var hasData = false;
  this.rawData_.forEach(function(rawData, dataIndex) {
    if (rawData == null) {
      visflow.error('null rawData to be listed');
      return;
    }
    hasData = true;

    var li = template.clone()
      .show()
      .appendTo(ul);
    li.children('.close').click(function() {
      this.deleteData_(dataIndex);
      li.remove();
    }.bind(this));

    var data = this.data[dataIndex];
    var text = data.isServerData ?
      data.name + ' (' + data.file + ') ' : data.file + ' (online)';
    li.children('span').text(text);
  }, this);

  if (hasData) {
    container.find('#no-data').hide();
  } else {
    container.find('#no-data').show();
  }
};

/**
 * Shows the data list both in panel and in node.
 * @private
 */
visflow.DataSource.prototype.showDataList_ = function() {
  if (visflow.optionPanel.isOpen) {
    this.createPanelDataList_(visflow.optionPanel.contentContainer());
  }
  // Show data list in node.
  var dataName = this.content.find('#data-name');
  var text = this.data.length == 0 ? 'No Data' :
    this.data.map(function(data) {
      return data.name;
    }).join(', ');
  if (text.length > this.DATA_NAMES_LENGTH_) {
    text = text.substr(0, this.DATA_NAMES_LENGTH_ - 3) + '...';
  }
  dataName.text(text).show();
  this.content.find('#data-error').hide();
};

/**
 * Updates the data crossing option.
 * @private
 */
visflow.DataSource.prototype.updateCrossing_ = function() {
  if (visflow.optionPanel.isOpen) {
    var panelContainer = visflow.optionPanel.contentContainer();
    if (!this.options.crossing) {
      panelContainer.find("#crossing-section").hide();
    }
    panelContainer.find("#crossing-section").show();
  }
  this.process();
};

/**
 * Updates the active section in the dialog based on server/online data is used.
 * @param {!jQuery} dialog
 * @private
 */
visflow.DataSource.prototype.updateActiveSections_ = function(dialog) {
  var server = dialog.find('.server');
  var online = dialog.find('.online');
  var btnServer = dialog.find('#btn-server');
  var btnOnline = dialog.find('#btn-online');
  if (this.options.useServerData) {
    server.removeClass('disabled');
    btnServer.hide();
    online.addClass('disabled');
    btnOnline.show();
  } else {
    online.removeClass('disabled');
    btnServer.show();
    server.addClass('disabled');
    btnOnline.hide();
  }
};

/**
 * Creates the load data dialog.
 * @private
 */
visflow.DataSource.prototype.loadDataDialog_ = function() {
  visflow.dialog.create({
    template: './src/data-source/select-data.html',
    complete: function(dialog) {

      dialog.find('.to-tooltip').tooltip({
        delay: this.TOOLTIP_DELAY_
      });

      var select = dialog.find('select');

      var dataFile = '';
      var dataName = '';
      var dataURL = '';
      var confirm = dialog.find('#confirm');

      // Checks whether upload options have been all set.
      var uploadable = function() {
        var allSet;
        if (this.options.useServerData) {
          allSet = dataFile !== '' && dataName !== '';
        } else {
          allSet = dataURL !== '' && dataName !== '';
        }
        confirm.prop('disabled', !allSet);
      }.bind(this);

      confirm.click(function() {
        this.data.push({
          name: dataName,
          file: this.options.useServerData ? dataFile : dataURL,
          isServerData: this.options.useServerData
        });
        this.loadData(this.data.length - 1);
      }.bind(this));

      $.get('./server/list-data.php')
        .done(function(res) {
          if (!res.success) {
            visflow.error('cannot list server data:', res.msg);
            return;
          }
          var table = dialog.find('table');
          this.listDataTable_(table, res.filelist);
          table
            .on('select.dt', function() {
              dataName = table.find('tr.selected').children()
                .first().text();
              dataFile = table.find('tr.selected').children()
                .first().next().text();
              uploadable();
            })
            .on('deselect.dt', function() {
              dataName = '';
              dataFile = '';
              uploadable();
            });
        }.bind(this))
        .fail(function() {
          visflow.error('cannot list server data');
        });

      dialog.find('.online #data-name').keyup(function(event) {
        dataName = $(event.target).val();
        uploadable();
      }.bind(this));
      dialog.find('.online #url').keyup(function(event) {
        dataURL = $(event.target).val();
        uploadable();
      }.bind(this));

      dialog.find('#btn-server').click(function() {
        this.options.useServerData = true;
        this.updateActiveSections_(dialog);
        uploadable();
      }.bind(this));
      dialog.find('#btn-online').click(function() {
        this.options.useServerData = false;
        this.updateActiveSections_(dialog);
        uploadable();
      }.bind(this));
      this.updateActiveSections_(dialog);

      dialog.find('#btn-upload').click(function(event) {
        event.stopPropagation();
        visflow.upload.setComplete(this.loadDataDialog_.bind(this));
        visflow.upload.dialog();
      }.bind(this));
    }.bind(this)
  });
};

/**
 * Clears the currently loaded data.
 * @private
 */
visflow.DataSource.prototype.clearData_ = function() {
  this.data = [];
  this.rawData_ = [];
  this.showDataList_();
  this.process();
};

/**
 * Loads the data specified in the data array.
 * @param {number=} opt_index If specified, then force data at this index to be
 *     reloaded.
 */
visflow.DataSource.prototype.loadData = function(opt_index) {
  if (opt_index != null) {
    this.rawData_[opt_index] = null;
  }

  var counter = 0;
  // Check if all data has been loaded, if so we process and propagate.
  var complete = function() {
    if (counter > 0) {
      return;
    }
    this.process();
  }.bind(this);
  this.data.forEach(function(data, dataIndex) {
    if (this.rawData_[dataIndex]) {
      // Skip already loaded data.
      return;
    }
    counter++;
    var url = data.isServerData ?
      './server/data/' + data.file : visflow.utils.standardURL(data.file);
    $.get(url)
      .done(function(result) {
        visflow.assert(result != null);
        // CSV parser will report error itself.
        result = visflow.parser.csv(result);

        // Store a copy of parsed data, so that we can switch between crossing
        // and non-crossing.
        this.rawData_[dataIndex] = result;

        --counter;
        complete();
      }.bind(this))
      .fail(function(res, msg, error){
        visflow.error('cannot get data', msg,
          error.toString().substr(0, this.ERROR_LENGTH_));

        --counter;
        complete();
      }.bind(this));
  }, this);
};

/**
 * Sets empty data to be propagated.
 * @param {boolean=} opt_isError
 * @private
 */
visflow.DataSource.prototype.useEmptyData_ = function(opt_isError) {
  if (opt_isError) {
    this.content.find('#data-name').hide();
    this.content.find('#data-error').show();
  }
  // No data. Create empty package and propagate.
  $.extend(this.ports['out'].pack, new visflow.Package());
  visflow.flow.propagate(this);
};

/**
 * Automatically finds a string dimension for crossing.
 * @return {!Array<number>} Dimension index.
 */
visflow.DataSource.prototype.findCrossingDims = function() {
  if (this.data.length == 0) {
    return [];
  }
  var data = _(this.rawData_).first();
  for (var dim = 0; dim < data.dimensionTypes.length; dim++) {
    if (data.dimensionTypes[dim] == visflow.ValueType.STRING &&
        !data.dimensionDuplicate[dim]) {
      return [dim];
    }
  }
  return [visflow.data.INDEX_DIM];
};

/**
 * Processes all data sets and produces output.
 */
visflow.DataSource.prototype.process = function() {
  var values = [];
  var mismatched = {};
  var type;
  var firstDataIndex = null;
  this.rawData_.forEach(function(data, dataIndex) {
    if (firstDataIndex == null) {
      firstDataIndex = dataIndex;
      type = data.type;
    } else if (data.type != type) { // Data type mismatch.
      visflow.error('data type mismatch');
      mismatched[dataIndex] = true;
      return;
    }
    values = values.concat(data.values);
  });

  if (firstDataIndex == null) {
    this.useEmptyData_();
    return;
  }

  for (var dataIndex in mismatched) {
    this.data.splice(dataIndex, 1);
    this.rawData_.splice(dataIndex, 1);
  }
  var finalData = $.extend({}, this.rawData_[firstDataIndex]);
  finalData.values = values;

  this.showDataList_();

  // Apply crossing.
  if (this.options.crossing) {
    if (this.options.crossingDims.length == 0) {
      this.options.crossingDims = this.findCrossingDims();
      console.log(this.options.crossingDims);
    }
    var result = visflow.parser.cross(finalData, this.options.crossingDims,
      this.options.crossingName);
    if (!result.success) {
      visflow.error('failed to cross data:', result.msg);
      this.useEmptyData_(true);
      return;
    }
    finalData = result.data;
  }

  var lengthSuffix = this.data.length > 3 ? '...' : '';
  var firstThreeData = this.data.slice(0, 3);
  var finalName = firstThreeData.map(function(data) {
    return data.name;
  }).join(',') + lengthSuffix;
  var finalFile = firstThreeData.map(function(data) {
    return data.file;
  }).join(',') + lengthSuffix;

  _(finalData).extend({
    name: finalName,
    file: finalFile
  });

  var data = new visflow.Data(finalData);
  if (data.type !== '') {
    visflow.flow.registerData(data);
  }
  // Overwrite data object (to keep the same reference).
  $.extend(this.ports['out'].pack, new visflow.Package(data));
  visflow.flow.propagate(this);
};

/**
 * Shows a table with list of data sets stored on the server.
 * @param {!jQuery} table
 * @param {!Array<{filename: string, mtime: number}>} fileList
 * @private
 */
visflow.DataSource.prototype.listDataTable_ = function(table, fileList) {
  if (this.table_) {
    this.table_.destroy();
  }
  this.table_ = table.DataTable({
    data: fileList,
    select: 'single',
    pagingType: 'full',
    pageLength: 5,
    lengthMenu: [5, 10, 20],
    order: [
      [2, 'desc']
    ],
    columns: [
      {title: 'Data Name', data: 'dataname'},
      {title: 'File Name', data: 'filename'},
      {title: 'Last Modified', data: 'mtime'}
    ],
    columnDefs: [
      {
        render: function (lastModified) {
          return (new Date(lastModified)).toLocaleString();
        },
        targets: 2
      }
    ]
  });
};
