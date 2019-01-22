<?php
/**
 * ajax接口
 * User: xiebaoxin@163.com
 * Date: 2017/12/1
 * Time: 13:26
 */
header( "Access-Control-Allow-Origin:*");
header('Access-Control-Allow-Methods:POST');
header('Access-Control-Allow-Headers:x-requested-with,content-type');

// 允许上传的图片后缀
define('ROOT',dirname(dirname(__FILE__)).'/');
if(isset($_FILES["file"])){

    $temp = explode(".", $_FILES["file"]["name"]);
    $filesize= $_FILES["file"]["size"];
    $extension = end($temp);     // 获取文件后缀名
    $errmsg='';
    $errcode='erro';
    if ($extension=='bin' || $extension=='txt')
    {

        if ($_FILES["file"]["error"] > 0)
        {
            $errmsg.= "错误：: " . $_FILES["file"]["error"] ."|";
        }
        else
        {
//        $errmsg .= "上传文件名: " . $_FILES["file"]["name"] . "|";
//        $errmsg .=  "文件类型: " . $_FILES["file"]["type"] . "|";
//        $errmsg .=  "文件大小: " . ($_FILES["file"]["size"] / 1024) . " kB"."|";
//        $errmsg .=  "文件临时存储的位置: " . $_FILES["file"]["tmp_name"] . "|";

            // 判断当期目录下的 upload 目录是否存在该文件
            // 如果没有 upload 目录，你需要创建它，upload 目录权限为 777
            $uploadPath= ROOT."/upload/";
            if (! file_exists ( $uploadPath )) {
                mkdir ( $uploadPath, 0777, true );
                chmod ( $uploadPath, 0777 );
            }

            if(is_uploaded_file($_FILES['file']['tmp_name'])){
                $stored_path = ROOT.'/upload/'.basename($_FILES['file']['name']);

                if(move_uploaded_file($_FILES['file']['tmp_name'],$stored_path)){
                    echo "Stored in: " . $stored_path;
                    $errcode='success';
                    $file=$uploadPath. $_FILES["file"]["name"];

                    if (!file_exists($file) && !is_readable($file)){
                        $errmsg= "文件上传失败";
                    }else
                        $filesize= abs(filesize($file));

                }else{
                    echo 'Stored failed:file save error';
                }
            }else{
                echo 'Stored failed:no post ';
            }

        }
    }
    else
    {
        $errmsg.= "非法的文件格式";
    }

    $data['returncode'] = $errcode;
    $data['filesize'] =  $filesize;
    $data['uploadmsg'] = $errmsg;
    echo json_encode($data,JSON_UNESCAPED_UNICODE);
}else{
    echo json_encode(['returncode'=>'erro','uploadmsg'=>'文件类型错误'],JSON_UNESCAPED_UNICODE);
}



function formatMac($mac)
{
    return implode(':', str_split(mb_strtoupper($mac), 2));;
}
/*
$where = " 1 = 1 ";

if (isset($_GET['mac']) && $_GET['mac']) {
    $mac = str_replace(':', '', $_GET['mac']);
    $where .= " AND mac = '{$mac}'";
} else {
    echo 0;
    exit();
}

if (isset($_GET['mindate']) && $_GET['mindate'] && isset($_GET['maxdate']) && $_GET['maxdate']) {
    $mindate = strtotime($_GET['mindate']);
    $maxdate = strtotime($_GET['maxdate']);
    $where .= " AND createat BETWEEN {$mindate} AND {$maxdate}";
}

if (isset($_GET['mindate']) && $_GET['mindate'] && !isset($_GET['maxdate'])) {
    $mindate = strtotime($_GET['mindate']);
    $where .= " AND createat >= {$mindate}";
}

if (isset($_GET['maxdate']) && $_GET['maxdate'] && !isset($_GET['mindate'])) {
    $maxdate = strtotime($_GET['maxdate']);
    $where .= " AND createat <= {$maxdate}";
}

$db = mysqli_init();
$db->connect('123.58.43.17', 'duzun', '123456', 'baoan');
$sql = "SELECT `mac`, `company`, `rssi`, `hasap`, `apmac`, (SELECT COUNT(*) FROM `sta` AS `s2` WHERE {$where}) AS `find`, FROM_UNIXTIME(`createat`, '%Y-%m-%d %H:%i:%s') AS `createat` FROM `sta` AS `s1` WHERE {$where} ORDER BY `s1`.`id` DESC LIMIT 1";
$data = $db->query($sql)->fetch_array(1);
if (empty($data)) $data = 0;
if ($data) {
    $data['mac'] = formatMac($data['mac']);
    $data['apmac'] = formatMac($data['apmac']);
}
echo json_encode($data);
*/