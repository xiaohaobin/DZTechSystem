//引入静态样式和库资源
var sBoots = '<link rel="stylesheet" type="text/css" href="../lib/bootstrap/css/bootstrap.min.css"/>' +
	'<link rel="stylesheet" type="text/css" href="../css/common_childrenPage.css"/>' +
	'<script src="../lib/bootstrap/js/bootstrap.min.js" type="text/javascript" charset="utf-8"></script>' +
	'<script src="../../../js/reconnecting-websocket.min.js" type="text/javascript" charset="utf-8"></script>'+
	'<link rel="stylesheet" type="text/css" href="../../../lib/layer/2.4/skin/layer.css"/>' +
	'<script src="../../../lib/layer/2.4/layer.js" type="text/javascript" charset="utf-8"></script>';
$("head").append(sBoots);

//后台响应公共数据格式
var appData = {
	//result类型数据
	result: {
		dvlantype: null,
		temperature: 0,
		temperature2: 0,
		before: null,
		after: null,
		time: 0,
		token: null,
		msg: null,
		raw_data: null,
		from_fd: 0,
		command: null,
		cost: 0,
		client_name: null,
		type: "result"
	},
	//send类型数据
	send: {
		before: null,
		after: null,
		time: 0,
		token: null,
		msg: null,
		from_fd: 0,
		command: null,
		client_name: null,
		type: "send"
	}
};

//探霸设备ID
var deviceId = localStorage.getItem("currTB") || null;
if(!deviceId) layer.msg("探霸设备ID缺省，请重新选择探霸");

//探霸设备发送命令的请求地址
var wsUrl = localStorage.getItem("serverVal") || null;

if(!wsUrl) {
	layer.alert("服务器异常.请重新选择服务器");
}

//子页公共数据模块
//ws接收到信息 
function responseFn(data) {
//	if(data) {
//		var sTitle = $('title').text();
//		$('#menu-article li a', window.parent.document).each(function() {
//			if(sTitle == $(this).attr("data-title")) {
//				$(this).addClass("fontAnimate");
//			}
//		});
//	}
}

//所有子页面同步添加
$("#deviceid").attr("readonly", "readonly");
$("body").on("click", "button[type='submit']", function() {
	var _this = $(this);
	$(this).addClass("disabled");
	var timer = setTimeout(function() {
		_this.removeClass("disabled");
		clearTimeout(timer);
	}, 1000);
});

/**
 * 对象拓展函数,如果为数组，数组为哈希数组才有效
 * @param {Boolean} deep 是否深拷贝
 * @param {Object||Array} target 目标对象或者数组
 * @param {Object||Array} options 要并集的对象或者数组
 * */
function _extend(deep, target, options) {
	for(name in options) {
		copy = options[name];
		if(deep && copy instanceof Array) {
			target[name] = $.extend(deep, [], copy);
		} else if(deep && copy instanceof Object) {
			target[name] = $.extend(deep, {}, copy);
		} else {
			target[name] = options[name];
		}
	}
	return target;
}

/**
 * 循环多ws连接
 * @param {Object} obj vue对象
 * @param {String} wsurl ws请求地址
 * @param {Object} sdata 后台发送的数据，包含type，command，option
 * @param {Function} fn ws请求成功回调函数，带参数
 * */
function _moreConnect(obj, wsurl, sdata, fn) {

	var _this = obj;
	if(_this.form.deviceid) {
		var tbId = _this.form.deviceid.split(",");
		for(var i = 0; i < tbId.length; i++) {

			//设置发送参数
			var opts = _extend(
				true, {
					type: "command",
					client_name: tbId[i]
				},
				sdata
			);

			//ws请求
			_webSocket(
				wsurl,
				opts,
				function(res) {
					var data = JSON.parse(res.data);
					if(data.code != 0){
						layer.alert("后台数据响应错误");
						return;
					} 
					var data = data.data;
					fn(data);
				}
			);
		}
	} else {
		layer.alert("没有获取到设备ID，请求失败，请检查参数设置");
	}
}

/**
 * 单个ws连接
 * @param {Object} obj vue对象
 * @param {String} wsurl ws请求地址
 * @param {Object} sdata 后台发送的数据，包含type，command，option
 * @param {Function} fn ws请求成功回调函数，带参数
 * */
function _oneConnect(obj, wsurl, sdata, fn) {
	var _this = obj;
	if(_this.form.deviceid) {
		var tbId = _this.form.deviceid.split(",");

		//设置发送参数
		var opts = _extend(
			true, {
				type: "command",
				client_name: tbId
			},
			sdata
		);

		//ws请求
		_webSocket(
			wsurl,
			opts,
			function(res) {
				fn(res);
			}
		);

	} else {
		layer.alert("没有获取到设备ID，请求失败，请检查参数设置");
	}
}

/**
 * web socket(可断开重连)
 * @param {String} wsurl ws地址
 * @param {Object} sdata 发送数据
 * @param {Function} fn 后台数据响应的回调函数，带参数
 * @depend reconnecting-websocket.min.js 断开重连插件库
 * */
function _webSocket(wsurl, sdata, fn) {
	try {
		if("WebSocket" in window) {
			var ws = new ReconnectingWebSocket(wsurl); //实例化断开重连的ws对象
			ws.onopen = function() {
				ws.send(JSON.stringify(sdata));
			};
			ws.onmessage = function(res) {
				fn(res);
			};
			ws.onclose = function() {
				layer.alert("连接已关闭,请重新刷新页面");
			};
			ws.onerror = function(e) {
				layer.alert('连接服务器失败...');
			}
			return ws;
		} else {
			layer.alert("浏览器不支持WebSocket!请更新到最新版本的浏览器！")
		}
	} catch(e) {
		console.error("错误类型：" + 　e);
	}

}