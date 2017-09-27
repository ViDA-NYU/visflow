<?php

include 'file.php';

if (!isset($_POST['trainingDataRoot']))
  abort('trainingDataRoot not set');

$training_data_root = $_POST['trainingDataRoot'];
$train_data_csv = $training_data_root . '/trainData.csv';
$train_targets_csv = $training_data_root . '/trainTargets.csv';

contentType('json');
echo json_encode(array(
  'trainData' => file_get_contents($train_data_csv),
  'trainTargets' => file_get_contents($train_targets_csv),
));

?>
