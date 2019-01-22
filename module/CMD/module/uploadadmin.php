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
header("Content-Type: text/html;charset=utf-8");


// 允许上传的图片后缀
define('ROOT',dirname(dirname(__FILE__)).'/');
if(isset($_FILES["file"]) && isset($_POST)){
try{
    $mysqli = mysqli_init();

    $mysqli->options(MYSQLI_OPT_CONNECT_TIMEOUT, 2);//设置超时时间
    $mysqli->real_connect('127.0.0.1', 'root', 'Dz20180611!', 'dataserver');

    $temp = explode(".", $_FILES["file"]["name"]);
    $filesize= $_FILES["file"]["size"];
    $extension = end($temp);     // 获取文件后缀名

    $sql = "select * from uploadbase WHERE `name`='{$_POST['frimware']}' AND filesize={$filesize}";
    $result = $mysqli->query($sql);
    if($result->num_rows>0)
    {
        echo json_encode(['returncode'=>'erro','uploadmsg'=>'已经存在此文件'],JSON_UNESCAPED_UNICODE);
        die;
    }
//
//    $sql = "select COUNT(*) as ct from uploadbase WHERE addtime BETWEEN UNIX_TIMESTAMP('".date('Y-m-d')." 00:00:01') AND UNIX_TIMESTAMP('".date('Y-m-d')." 23:00:00') ";
//    $result = $mysqli->query($sql);
//    $cnt=$result->fetch_array(MYSQLI_ASSOC)['ct'];
//    if($cnt>3)
//    {
//        echo json_encode(['returncode'=>'erro','uploadmsg'=>'每天上传文件不能超过3次'],JSON_UNESCAPED_UNICODE);
//        die;
//    }


    $errmsg='';
    $errcode='erro';
    if ($extension=='bin')
    {

        if ($_FILES["file"]["error"] > 0)
        {
            die( "错误: " . $_FILES["file"]["error"] );
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
            $newfilename=strtolower(make_randstr(5)) .time().".". $extension;
            $stored_path = ROOT.'/upload/'.$newfilename;

//            if(is_uploaded_file($_FILES['file']['tmp_name'])){

                if(move_uploaded_file($_FILES['file']['tmp_name'],$stored_path)){
//                    echo "Stored in: " . $stored_path;

                    $file=$uploadPath.$newfilename;

                    $fileMd5 =$_POST["md5"];
                    // md5_file($file);// //md5_file返回值：成功则返回md5散列，失败返回false；
                    //hash_file('md5', 'example.txt');//"md5"，"sha256"，"haval160,4"
                    //sha1_file() - 计算文件的 sha1 散列值

                    if((!file_exists($file) && !is_readable($file))  || $fileMd5<> $_POST["md5"]){
                        $errmsg= "文件上传失败";
                    }else
                    {
                        $filesize= abs(filesize($file));
                        $fmdata=array(
                            "md5"=>$fileMd5,
                            "mysoftver"=>$_POST["mysoftver"],
                            "prtver"=>$_POST['prtver'],
                            "softver"=>explode(',',trim($_POST['softver'])),
                            "hardver"=>explode(',',trim($_POST['hardver']))
                        );
                        $sql = " insert into uploadbase(`name`,`filename`,`filesize`,`fileinfo`,`baseinfo`,`script`, `addtime`) values('{$_POST['frimware']}','{$newfilename}',{$filesize}, '".json_encode($_FILES["file"])."', '".json_encode($fmdata)."','".$_POST['script']."',".time().")";

                      // die($sql);
                        $mysqli->set_charset("utf8");

                        $rst = $mysqli->query($sql);
                        if($rst)
                        {
                            $errcode='SUCCESS';
                            $errmsg.="SUCCESS ".$mysqli->insert_id;
                        }
                    }

                }else{
                    echo 'Stored failed:file save error';
                }
//            }else{
//                echo 'Stored failed:no post ';
//            }

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
}
catch (Exception $e){
   var_dump( $e);
}

}


function formatMac($mac)
{
    return implode(':', str_split(mb_strtoupper($mac), 2));;
}

function make_randstr($length = 8)
{
    // 密码字符集，可任意添加你需要的字符
    $chars = array('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
        'i', 'j', 'k', 'l','m', 'n', 'o', 'p', 'q', 'r', 's',
        't', 'u', 'v', 'w', 'x', 'y','z', 'A', 'B', 'C', 'D',
        'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L','M', 'N', 'O',
        'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y','Z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
    /*, '!',
        '@','#', '$', '%', '^', '&', '*', '(', ')', '-', '_',
        '[', ']', '{', '}', '<', '>', '~', '`', '+', '=', ',',
        '.', ';', ':', '/', '?', '|'*/
    // 在 $chars 中随机取 $length 个数组元素键名
    $keys = array_rand($chars, $length);
    $password = '';
    for($i = 0; $i < $length; $i++)
    {
        // 将 $length 个数组元素连接成字符串
        $password .= $chars[$keys[$i]];
    }
    return $password;
}
//不同环境下获取真实的IP
function get_ip(){
    /* //判断服务器是否允许$_SERVER
     if(isset($_SERVER)){
         if(isset($_SERVER[HTTP_X_FORWARDED_FOR])){
             $realip = $_SERVER[HTTP_X_FORWARDED_FOR];
         }elseif(isset($_SERVER[HTTP_CLIENT_IP])) {
             $realip = $_SERVER[HTTP_CLIENT_IP];
         }else{
             $realip = $_SERVER[REMOTE_ADDR];
         }
     }else{
         //不允许就使用getenv获取
         if(getenv("HTTP_X_FORWARDED_FOR")){
             $realip = getenv( "HTTP_X_FORWARDED_FOR");
         }elseif(getenv("HTTP_CLIENT_IP")) {
             $realip = getenv("HTTP_CLIENT_IP");
         }else{
             $realip = getenv("REMOTE_ADDR");
         }
     }*/
    $realip='0.0.0.0';
    return $realip;
}
