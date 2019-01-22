var serverParam = {
	"name":"数据服务器配置文档",
	"data":[	        
	        {
	        	"name":"122服务器",
	        	"wsIp":"103.251.36.122",
	        	"wsPort":"9501",
	        	"ajaxIp":"103.251.36.122",
	        	"ajaxPort":"9506"
	        },
	        {
	        	"name":"16服务器",
	        	"wsIp":"123.58.43.16",
	        	"wsPort":"9501",
	        	"ajaxIp":"123.58.43.16",
	        	"ajaxPort":"9506"
	        },
	        {
	        	"name":"122考勤服务器",
	        	"wsIp":"103.251.36.122",
	        	"wsPort":"9801",
	        	"ajaxIp":"103.251.36.122",
	        	"ajaxPort":"9806"
	        },
	        {
	        	"name":"122新协议服务器",
	        	"wsIp":"103.251.36.122",
	        	"wsPort":"9701",
	        	"ajaxIp":"103.251.36.122",
	        	"ajaxPort":"9706"
	        },
	         {
	        	"name":"本地服务器",
	        	"wsIp":"zhangnan.xicp.net",
	        	"wsPort":"9501",
	        	"ajaxIp":"zhangnan.xicp.net",
	        	"ajaxPort":"9506"
	        },
	         {
	        	"name":"本地23测试",
	        	"wsIp":"10.10.10.23",
	        	"wsPort":"9501",
	        	"ajaxIp":"10.10.10.23",
	        	"ajaxPort":"9506"
	        },
	        {
	        	"name":"本地22测试",
	        	"wsIp":"10.10.10.22",
	        	"wsPort":"9501",
	        	"ajaxIp":"10.10.10.22",
	        	"ajaxPort":"9506"
	        },
	        {
				"name": "罗湖外语服务器",
				"wsIp": "zhangnan.xicp.net",
				"wsPort": "9525",
				"ajaxIp": "zhangnan.xicp.net",
				"ajaxPort": "9523"
			},
	 ],
};


//配置函数，获取各个服务器相关参数
$.each(serverParam.data, function(i,v) {
	var sOption = '<option value="'+ v.name +'" data-wsIp="'+ v.wsIp +'" data-wsPort="'+ v.wsPort +'" data-ajaxIp="'+ v.ajaxIp +'" data-ajaxPort="'+ v.ajaxPort +'">'+ v.name +'</option>';
	$("#select").append($(sOption));				
});

//监听配置
$("#select").change(function(){
	// if($(this).val() != "0"){
		var oOpt = $(this).find("option:selected");
		$(".src").val(oOpt.attr("data-wsIp"));
		$(".port").val(oOpt.attr("data-wsPort"));
		$(".ajaxSrc").val(oOpt.attr("data-ajaxIp"));
		$(".ajaxPort").val(oOpt.attr("data-ajaxPort"));
	// }
	
});

/*
var server = sessionStorage.getItem("currentServer");
var address = sessionStorage.getItem("currentAddress");
var addressArr = address.replace("ws://","").split(":");

for(var i = 0; i<serverParam.data.length; i++){
    if (serverParam.data[i].name == server){
        console.log(serverParam.data[i].name);
        $(".ajaxPort").val(serverParam.data[i].ajaxPort);
        $(".ajaxIp").val(serverParam.data[i].ajaxIp);
        // $("#select").val(serverParam.data[i].name);
        $("#select option").each(function (i,v){
            console.log($(v).val());
            if ($(v).val() == serverParam.data[i].name){
                $(v).attr("selected",true);
                console.log("true");
                return false;
            }
        });

        break;
    }
}
*/

//默认设置122服务器，并且设置回显ajax的端口号码
if(!localStorage.getItem("selectVal")){	
	$("#select").val(serverParam.data[0].name);
	$(".ajaxPort").val(serverParam.data[0].ajaxPort);
	$(".ajaxIp").val(serverParam.data[0].ajaxIp);
	localStorage.setItem("selectVal",$("#select").val());
}
else{
	for(var k in serverParam.data){
		if(serverParam.data[k].name == localStorage.getItem("selectVal")){
			$(".ajaxPort").val(serverParam.data[k].ajaxPort);
		}
	}
}

