<?php

include 'response.php';
include 'common.php';

$pid = trim(file_get_contents(PID_PATH));

$out = shell_exec('kill ' . $pid . '; echo $?');

if ($out)
  abort('cannot kill process ' . $pid);

status(200);

?>