<?php

include 'file.php';

if (!isset($_POST['trainingDataRoot']))
  abort('trainingDataRoot not set');

if (!isset($_POST['resultsPath']))
  abort('resultsPath not set');

$training_data_root = $_POST['trainingDataRoot'];
$train_data_csv = $training_data_root . '/trainData.csv';
$train_targets_csv = $training_data_root . '/trainTargets.csv';
$predict_results_csv = $_POST['resultsPath'];

contentType('json');
echo json_encode(array(
  'trainData' => file_get_contents($train_data_csv),
  'trainTargets' => file_get_contents($train_targets_csv),
  'predictResults' => file_get_contents($predict_results_csv),
));

?>
