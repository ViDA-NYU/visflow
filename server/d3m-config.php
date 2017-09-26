<?php

include 'file.php';

$d3m_config = json_decode(file_get_contents(D3M_CONFIG_PATH));
$problem_schema = json_decode(file_get_contents($d3m_config->problem_schema));
$dataset_schema = json_decode(file_get_contents($d3m_config->dataset_schema));

contentType('json');

$result = array(
  'config' => $d3m_config,
  'problemSchema' => $problem_schema,
  'datasetSchema' => $dataset_schema
);

contentType('json');
echo json_encode($result);

?>
