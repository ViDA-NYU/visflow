<?php

include 'file.php';

$datasets = scandir(D3M_DATA_PATH);
$data_list = array();

foreach ($datasets as $dataset) {
  if ($dataset[0] == '.')
    continue;

  $dataset_path = D3M_DATA_PATH . $dataset;
  $size_output = `du -s $dataset_path`;
  preg_match('/(\d+)\s.*/', $size_output, $match);

  $problem_schema = json_decode(
    file_get_contents(D3M_DATA_PATH . $dataset . '/problemSchema.json'));

  array_push($data_list, array(
    'id' => $dataset,
    'size' => $match[1],
    'schema' => $problem_schema
  ));
}
contentType('json');
echo json_encode($data_list);

?>