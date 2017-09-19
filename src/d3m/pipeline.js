/**
 * @fileoverview D3M pipeline that bridges the pipeline with the VisFlow
 * diagram.
 */

/** @private @const {number} */
visflow.d3m.LAYOUT_STEP_X_ = 180;

/** @private @const {number} */
visflow.d3m.LAYOUT_MIN_X_ = 200;

/** @private @const {number} */
visflow.d3m.LAYOUT_STEP_Y_ = 120;

/** @private @const {number} */
visflow.d3m.LAYOUT_MIN_Y_ = 300;

/**
 * Loads the D3M pipeline as a flow diagram.
 * @param {d3m.Dataflow} pipeline
 */
visflow.d3m.loadPipelineAsDiagram = function(pipeline) {
  visflow.flow.clearFlow();
  var nodeCounter = pipeline.modules.length;
  var modules = {};

  visflow.flow.deserializing = true;

  var onNodeReady = function() {
    if (--nodeCounter == 0) {
      // Create edges.
      pipeline.connections.forEach(function(conn) {
        visflow.flow.createEdge(
          modules[conn['from_module_id']].getPort(conn['from_output_name']),
          modules[conn['to_module_id']].getPort(conn['to_input_name'])
        );
      });

      visflow.flow.deserializing = false;

      visflow.d3m.layoutPipeline_(modules);
    }
  };

  pipeline.modules.forEach(function(module) {
    // Create ports for the nodes.
    var ports = {};
    if (module.inputs) {
      module.inputs.forEach(function(input) {
        ports[input.name] = new visflow.ComputationPort({
          id: /** @type {string} */(input.name),
          isInput: true
        });
      });
    }
    if (module.outputs) {
      module.outputs.forEach(function(output) {
        ports[output.name] = new visflow.ComputationPort({
          id: /** @type {string} */(output.name)
        });
      });
    }

    var node = visflow.flow.createNode('module', {
      id: module.id,
      ports: ports,
      onReady: function() {
        node.showProgress();
        onNodeReady();
      }
    });
    modules[module.id] = node;

    node.setLabel(module.label);
  });

  // Set global system flag.
  visflow.options.toggleD3MPipeline(true);
};

/**
 * Roughly makes a layout for the pipeline DAG.
 * @param {!Object<!visflow.Node>} modules
 * @private
 */
visflow.d3m.layoutPipeline_ = function(modules) {
  var order = [];
  var visited = {};
  var inDegree = {};
  _.each(modules, function(module) {
    inDegree[module.id] = 0;
  });
  _.each(modules, function(module) {
    module.outputTargetNodes().forEach(function(node) {
      inDegree[node.id]++;
    });
  });
  var depth = {};
  _.each(modules, function(module) {
    if (inDegree[module.id] == 0) {
      visflow.utils.traverse(module, visited, order);
      depth[module.id] = 0;
    }
  });
  order.reverse();
  var depthY = {};
  order.forEach(function(module) {
    if (!(module.id in depth)) {
      depth[module.id] = Infinity;
    }
    module.inputSourceNodes().forEach(function(node) {
      depth[module.id] = Math.min(depth[module.id], depth[node.id] + 1);
    });

    var d = depth[module.id];
    depthY[d] = d in depthY ? depthY[d] + visflow.d3m.LAYOUT_STEP_Y_ :
      visflow.d3m.LAYOUT_MIN_Y_;

    module.moveTo(visflow.d3m.LAYOUT_STEP_X_ * d + visflow.d3m.LAYOUT_MIN_X_,
      depthY[d]);
  });

  visflow.flow.autoLayoutAll();
};


/**
 * Converts list of pipelines info to a user-readable table. Pipelines with
 * unknown metric values will be filled with N/A.
 * @return {{
 *   rows: !Array<!Array<string|number>>,
 *   columns: !Array<{title: string, data: string}>
 * }}
 *   rows: Table values.
 *   columns: Columns list used for DataTables.
 */
visflow.d3m.pipelinesToTable = function() {
  var metrics = {};
  /**
   * Pipeline id to object of metric scores. Metric score is from metric enum
   * to score values.
   * @type {!Object<!Object<number>>}
   */
  var pipelineMetrics = {};
  visflow.d3m.pipelines.forEach(function(pipeline) {
    if (!(pipeline.id in pipelineMetrics)) {
      pipelineMetrics[pipeline.id] = {};
    }
    if (pipeline.scores) {
      pipeline.scores.forEach(function(score) {
        metrics[score.metric] = true;
        pipelineMetrics[pipeline.id][score.metric] = score.value;
      });
    }
  });
  var rows = visflow.d3m.pipelines.map(function(pipeline) {
    var row = {
      id: pipeline.id,
      status: pipeline.status ?
        d3m.enumToText(d3m.StatusCode, pipeline.status) : 'N/A',
      progress: pipeline.progress ?
        d3m.enumToText(d3m.Progress, pipeline.progress) : 'N/A'
    };
    for (var metric in metrics) {
      row['score' + metric] = pipelineMetrics[pipeline.id][+metric] || 'N/A';
    }
    return row;
  });
  var columns = [
    {title: 'Pipeline Id', data: 'id'},
    {title: 'Status', data: 'status'},
    {title: 'Progress', data: 'progress'}
  ];
  // Push the metric columns dynamically.
  for (var metric in metrics) {
    columns.push({
      title: visflow.utils.uppercaseFirstLetter(
        /** @type {string} */(d3m.enumToText(d3m.Metric, +metric))),
      data: 'score' + metric
    });
  }

  return {
    rows: rows,
    columns: columns
  };
};

/**
 * Converts list of pipelines info to a subset to be explored.
 * @return {!visflow.Subset}
 */
visflow.d3m.pipelinesToSubset = function() {
  var tableData = visflow.d3m.pipelinesToTable();
  var tabularData = visflow.parser.csv(
    tableData.columns.map(function(column) {
      return column.title;
    }).join(',') + '\n' +
    tableData.rows.map(
      /** @param {!Object} pipeline */
      function(pipeline) {
        return tableData.columns.map(function(col) {
          return col.data in pipeline ? pipeline[col.data] : 'N/A';
        }).join(',');
      }).join('\n')
  );
  tabularData.file = 'pipeline results';
  tabularData.name = 'pipeline results';
  return new visflow.Subset(new visflow.Dataset(tabularData));
};
