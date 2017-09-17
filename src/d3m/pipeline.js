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
      onReady: onNodeReady
    });
    node.setLabel(module.label);
    modules[module.id] = node;
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
