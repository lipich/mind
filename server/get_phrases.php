<?php
include("config.php");

$file = $storage . "/data.csv";
if ($file === "") exit(0);  

// Кэшируем ответ, пока файл данных не менялся — данные обновляются редко,
// нет смысла парсить CSV заново при каждом визите
if (file_exists($file)) {
	$mtime = filemtime($file);
	$etag = '"' . md5($mtime . $file) . '"';

	header('Cache-Control: public, max-age=3600');
	header('ETag: ' . $etag);
	header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $mtime) . ' GMT');

	$ifNoneMatch = isset($_SERVER['HTTP_IF_NONE_MATCH']) ? $_SERVER['HTTP_IF_NONE_MATCH'] : '';
	if ($ifNoneMatch === $etag) {
		http_response_code(304);
		exit;
	}
}

header('Content-Type: application/json; charset=utf-8');

list($arrDataList, $res) = GetPhrases($file);

echo json_encode(array('data' => $arrDataList, 'res' => $res));

// получить список рядов из файла
function GetPhrases($file)
{
	if (!file_exists($file) || !is_readable($file)) {
		return array(null, "Файл данных не найден или недоступен для чтения.");
	}

	$handle = fopen($file, "r");
	if ($handle === false) {
		return array(null, "Не удалось открыть файл данных.");
	}

	$arrBuf = array();
	$i = 0;

	try {
		// пропускаем только строку заголовка (Тема;Автор;Выражение)
		$header = fgetcsv($handle, 0, ";", "\"", "\\");

		while (($row = fgetcsv($handle, 0, ";", "\"", "\\")) !== false) {
			// пропускаем пустые строки (fgetcsv возвращает [null] на пустой строке)
			if ($row === array(null)) continue;
			$arrBuf[$i] = $row;
			$i += 1;
		}

		return array($arrBuf, null);
	}
	catch (Exception $e)
	{
		return array(null, "Ошибка загрузки пословиц. Подробнее: " . $e->getMessage());
	}
	finally
	{
		fclose($handle);
	}
}
?>
