$(document).ready(function() {
	/*初始化数据连接*/
	var deviceWebSocket = new deviceWebSocketObj();
	deviceWebSocket.init();
	deviceWebSocket.WIFIinit();
	deviceWebSocket.APinit();
	/*管理弹窗*/
	$("#deviceUserManage").on("click", function(e) {
		e.preventDefault();
		e.stopPropagation();
		var absDis = $(this).siblings(".conShow_box_title_abs");
		if(absDis.css("display") == "block") {
			absDis.hide();
		} else {
			absDis.show();
		}
	});
	/*点击其他地方会关闭弹窗*/
	$(document).on("click", function() {
		$("#deviceUserManage").siblings(".conShow_box_title_abs").hide();
	})
	/*条件初始化*/
	$("#queryCriteriaBtn").click(function() {
		if($(this).hasClass("active")) {
			$(this).removeClass("active").html("开始过滤");
			deviceWebSocket.qc = "";
		} else {
			$(this).addClass("active").html("停止过滤");
			deviceWebSocket.qc = $("#queryCriteriaInput").val();
		}
	})
	$("#queryCriteriaInput").focus(function() {
		$("#queryCriteriaBtn").removeClass("active").html("开始过滤");
		deviceWebSocket.qc = "";
	})
	$("#queryCriteriaBtn_wifi").click(function() {
		if($(this).hasClass("active")) {
			$(this).removeClass("active").html("开始过滤");
			deviceWebSocket.wifiqc = "";
		} else {
			$(this).addClass("active").html("停止过滤");
			deviceWebSocket.wifiqc = $("#queryCriteriaInput_wifi").val();
		}
	})
	$("#queryCriteriaInput_wifi").focus(function() {
		$("#queryCriteriaBtn_wifi").removeClass("active").html("开始过滤");
		deviceWebSocket.wifiqc = "";
	})
	$("#queryCriteriaBtn_ap").click(function() {
		if($(this).hasClass("active")) {
			$(this).removeClass("active").html("开始过滤");
			deviceWebSocket.apqc = "";
		} else {
			$(this).addClass("active").html("停止过滤");
			deviceWebSocket.apqc = $("#queryCriteriaInput_ap").val();
		}
	})
	$("#queryCriteriaInput_ap").focus(function() {
		$("#queryCriteriaBtn_ap").removeClass("active").html("开始过滤");
		deviceWebSocket.apqc = "";
	})
	/*暂停*/
	$("#PauseReceive").click(function(e) {
		e.preventDefault();
		var _this = deviceWebSocket;
		/*暂停所有的WS*/
		for(var i = 0; i < _this.wsArr.length; i++) {
			_this.wsArr[i].close();
		};
		_this.deviceArr = [];
		$("#PauseReceive").hide();
		$("#conReceive").show();
	})
	/*继续*/
	$("#conReceive").click(function(e) {
		e.preventDefault();
		var _this = deviceWebSocket;
		_this.init();
		/*清空*/
		$("#deviceUl").find("li").remove();
		$("#device_dataUl_tbody").find("tr").remove();
		$("#DeviceDetailsDiv").find("div").remove();
		/*切换按钮*/
		$("#conReceive").hide();
		$("#PauseReceive").show();
	})
	/*ap暂停*/
	$("#PauseReceive_AP").click(function(e) {
		e.preventDefault();
		var _this = deviceWebSocket;
		/*暂停所有的WS*/
		for(var i = 0; i < _this.APdeviceArr.length; i++) {
			_this.APwsArr[i].close();
		};
		_this.APdeviceArr = [];
		$("#PauseReceive_AP").hide();
		$("#conReceive_AP").show();
	})
	/*ap继续*/
	$("#conReceive_AP").click(function(e) {
		e.preventDefault();
		var _this = deviceWebSocket;
		_this.APinit();
		/*清空*/
		$("#deviceUl_AP").find("li").remove();
		$("#device_dataUl_tbody_AP").find("tr").remove();
		$("#DeviceDetailsDiv_AP").find("div").remove();
		/*切换按钮*/
		$("#conReceive_AP").hide();
		$("#PauseReceive_AP").show();
	})
	/*wifi暂停*/
	$("#WIFIPauseReceive").click(function(e) {
		e.preventDefault();
		var _this = deviceWebSocket;
		/*暂停所有的WS*/
		for(var i = 0; i < _this.WIFIwsArr.length; i++) {
			_this.WIFIwsArr[i].close();
		};
		_this.WIFIdeviceArr = [];
		$("#WIFIPauseReceive").hide();
		$("#WIFIconReceive").show();
	})
	/*wifi继续*/
	$("#WIFIconReceive").click(function(e) {
		e.preventDefault();
		var _this = deviceWebSocket;
		_this.WIFIinit();
		/*清空*/
		$("#WIFIdeviceUl").find("li").remove();
		$("#WIFIdevice_dataUl_tbody").find("tr").remove();
		$("#WIFIDeviceDetailsDiv").find("div").remove();
		/*切换按钮*/
		$("#WIFIconReceive").hide();
		$("#WIFIPauseReceive").show();
	})
})

var deviceWebSocketObj = function() {
	/*websocket地址*/
	this.wsUrl;
	this.WIFIwsUrl;
	this.APwsUrl;
	/*传入参数*/
	this.data;
	this.WIFIdata;
	this.APdata;
	/*储存设备ID*/
	this.deviceArr;
	this.WIFIdeviceArr;
	this.APdeviceArr;
	/*储存所有创建的WS*/
	this.wsArr;
	this.WIFIwsArr;
	this.APdeviceArr;
	this.i;
	this.WIFIi;
	this.APi;
	/*条件*/
	this.qc;
	this.wifiqc;
	this.apqc
	/*超出缓存标识*/
	this.dataMax;
	this.dataMax_wifi;
	this.dataMax_ap;
}
deviceWebSocketObj.prototype.init = function() {
	this.wsArr = [];
	/*初始化连接地址*/
	this.wsUrl = "ws://123.58.43.17:9501";
	/*初始化连接参数*/
	this.data = {
		type: "a002"
	};
	this.deviceArr = [];
	/*开启WS连接*/
	this.webSocket();
	this.i = 0;
	this.dataMax = false;
}

deviceWebSocketObj.prototype.WIFIinit = function() {
	this.WIFIwsArr = [];
	/*初始化连接地址*/
	this.WIFIwsUrl = "ws://123.58.43.17:9501";
	/*初始化连接参数*/
	this.WIFIdata = {
		type: "a001"
	};
	this.WIFIdeviceArr = [];
	/*开启WS连接*/
	this.WIFIwebSocket();
	this.WIFIi = 0;
	this.dataMax_wifi = false;
}

deviceWebSocketObj.prototype.APinit = function() {
	this.APwsArr = [];
	/*初始化连接地址*/
	this.APwsUrl = "ws://123.58.43.17:9501";
	/*初始化连接参数*/
	this.APdata = {
		type: "a000"
	};
	this.APdeviceArr = [];
	/*开启WS连接*/
	this.APwebSocket();
	this.APi = 0;
	this.dataMax_ap = false;
}

deviceWebSocketObj.prototype.webSocket = function() {
	if("WebSocket" in window) {
		var _this = this;
		var ws = new ReconnectingWebSocket(_this.wsUrl);
		_this.wsArr.push(ws);

		ws.onopen = function() {
			// Web Socket 已连接上，使用 send() 方法发送数据
			ws.send(JSON.stringify(_this.data));
		};

		ws.onmessage = function(evt) {
			var msg = JSON.parse(evt.data);
			/*数据处理*/
			if(msg.type == "a002") {
				/*隐藏正在加载*/
				$("#RFData .list_Prompt").hide();
				/*载入终端列表*/
				TerminalList(msg);
				/*总体上传信息*/
				UploadInfo(msg);
			}
		};

		ws.onclose = function() {
			// 关闭 websocket
			ws.close();
			console.log("连接已关闭...");
		};

		//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
		window.onbeforeunload = function() {
			ws.close();
		}

		function TerminalList(msg) {
			/*接收设备信息，防止重复*/
			var addBool = true;
			var deviceArrLegth = _this.deviceArr.length;
			for(var i = 0; i < deviceArrLegth; i++) {
				if(_this.deviceArr[i] == msg.tbmac) {
					addBool = false;
					break;
				}
			};
			if(addBool) {
				_this.deviceArr.push(msg.tbmac);
				var liStr = '<li>' +
					'<div class="icon"><i class="glyphicon glyphicon-hdd"></i></div>' +
					'<div class="deviceId">' +
					'<span class="title">设备ID：</span>' +
					'<span class="content">' + msg.tbmac + '</span>' +
					'</div>' +
					'</li>';
				$("#deviceUl").show().append(liStr);
				/*更新设备数量*/
				$("#urrentNumber").html(deviceArrLegth + 1);
				/*载入设备详情*/
				_this.DeviceDetails();
			}
		}

		function UploadInfo(msg) {
			/*过滤条件*/
			var bool = _this.queryCriteria(msg, _this.qc);
			if(bool) {
				if(msg.urgentStatus == 1) {
					var urgentStatusStr = "<td class='error'>紧急</td>";
				} else {
					var urgentStatusStr = "<td class='success'>正常</td>";
				}
				var tbodyStr = "<tr>" +
					"<td>" + msg.time + "</td>" +
					"<td>" + msg.tbmac + "</td>" +
					"<td>" + msg.deviceID + "</td>" +
					"<td>" + msg.battery + "</td>" +
					"<td>" + msg.sendRssi + "</td>" +
					urgentStatusStr + "</tr>";
				var trLegth = $("#device_dataUl_tbody").find("tr").length;
				if(trLegth > 1000) {
					_this.dataMax = true;
					$("#device_dataUl_tbody").find("tr").last().remove();
				}
				$("#device_dataUl_tbody").prepend(tbodyStr);
				_this.NewEffects($("#device_dataUl_tbody"), _this.dataMax);
			}
		}
	} else {
		console.log("游览器不支持WebSocket!")
	}
}
deviceWebSocketObj.prototype.WIFIwebSocket = function() {
	if("WebSocket" in window) {
		var _this = this;
		var ws = new ReconnectingWebSocket(_this.WIFIwsUrl);
		_this.WIFIwsArr.push(ws);

		ws.onopen = function() {
			// Web Socket 已连接上，使用 send() 方法发送数据
			ws.send(JSON.stringify(_this.WIFIdata));
		};

		ws.onmessage = function(evt) {
			var msg = JSON.parse(evt.data);
			/*数据处理*/
			if(msg.type == "a001") {
				/*隐藏正在加载*/
				$("#WIFIData .list_Prompt").hide();
				/*载入终端列表*/
				TerminalList(msg);
				/*总体上传信息*/
				UploadInfo(msg);
			}
		};

		ws.onclose = function() {
			// 关闭 websocket
			ws.close();
			console.log("连接已关闭...");
		};

		//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
		window.onbeforeunload = function() {
			ws.close();
		}

		function TerminalList(msg) {
			/*接收设备信息，防止重复*/
			var addBool = true;
			var deviceArrLegth = _this.WIFIdeviceArr.length;
			for(var i = 0; i < deviceArrLegth; i++) {
				if(_this.WIFIdeviceArr[i] == msg.tbmac) {
					addBool = false;
					break;
				}
			};
			if(addBool) {
				_this.WIFIdeviceArr.push(msg.tbmac);
				var liStr = '<li>' +
					'<div class="icon"><i class="glyphicon glyphicon-hdd"></i></div>' +
					'<div class="deviceId">' +
					'<span class="title">设备ID：</span>' +
					'<span class="content">' + msg.tbmac + '</span>' +
					'</div>' +
					'</li>';
				$("#WIFIdeviceUl").show().append(liStr);
				/*更新设备数量*/
				$("#WIFIurrentNumber").html(deviceArrLegth + 1);
				/*载入设备详情*/
				_this.WIFIDeviceDetails();
			}
		}

		function UploadInfo(msg) {
			/*过滤条件*/
			var bool = _this.queryCriteria(msg, _this.wifiqc);
			if(bool) {
				var tbodyStr = "<tr>" +
					"<td>" + msg.time + "</td>" +
					"<td>" + msg.tbmac + "</td>" +
					"<td>" + msg.mac + "</td>" +
					"<td>" + msg.dv_brand + "</td>" +
					"<td>" + msg.rssi + "</td>" +
					"<td>" + msg.Has_ap + "</td>" +
					"<td>" + msg.ApMac + "</td>" +
					"<td>" + msg.ap_brand + "</td>" +
					"</tr>";
				var trLegth = $("#WIFIdevice_dataUl_tbody").find("tr").length;
				if(trLegth > 1000) {
					_this.dataMax_wifi = true;
					/*去除*/
					$("#WIFIdevice_dataUl_tbody").find("tr").last().remove();
				}
				/*新增*/
				$("#WIFIdevice_dataUl_tbody").prepend(tbodyStr);
				/*新增特效*/
				_this.NewEffects($("#WIFIdevice_dataUl_tbody"), _this.dataMax_wifi);
			}
		};
	} else {
		console.log("游览器不支持WebSocket!")
	}
}
deviceWebSocketObj.prototype.APwebSocket = function() {
	if("WebSocket" in window) {
		var _this = this;
		var ws = new ReconnectingWebSocket(_this.APwsUrl);
		_this.APwsArr.push(ws);

		ws.onopen = function() {
			// Web Socket 已连接上，使用 send() 方法发送数据
			ws.send(JSON.stringify(_this.APdata));
		};

		ws.onmessage = function(evt) {
			var msg = JSON.parse(evt.data);
			/*数据处理*/
			if(msg.type == "a000") {
				/*隐藏正在加载*/
				$("#DataAP .list_Prompt").hide();
				/*载入终端列表*/
				TerminalList(msg);
				/*总体上传信息*/
				UploadInfo(msg);
			}
		};

		ws.onclose = function() {
			// 关闭 websocket
			ws.close();
			console.log("连接已关闭...");
		};

		//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
		window.onbeforeunload = function() {
			ws.close();
		}

		function TerminalList(msg) {
			/*接收设备信息，防止重复*/
			var addBool = true;
			var deviceArrLegth = _this.APdeviceArr.length;
			for(var i = 0; i < deviceArrLegth; i++) {
				if(_this.APdeviceArr[i] == msg.tbmac) {
					addBool = false;
					break;
				}
			};
			if(addBool) {
				_this.APdeviceArr.push(msg.tbmac);
				var liStr = '<li>' +
					'<div class="icon"><i class="glyphicon glyphicon-hdd"></i></div>' +
					'<div class="deviceId">' +
					'<span class="title">设备ID：</span>' +
					'<span class="content">' + msg.tbmac + '</span>' +
					'</div>' +
					'</li>';
				$("#deviceUl_AP").show().append(liStr);
				/*更新设备数量*/
				$("#urrentNumber_AP").html(deviceArrLegth + 1);
				/*载入设备详情*/
				_this.APDeviceDetails();
			}
		}

		function UploadInfo(msg) {
			/*过滤条件*/
			var bool = _this.queryCriteria(msg, _this.apqc);
			if(bool) {
				var tbodyStr = "<tr>" +
					"<td>" + msg.time + "</td>" +
					"<td>" + msg.tbmac + "</td>" +
					"<td>" + msg.bssid + "</td>" +
					"<td>" + msg.ssid + "</td>" +
					"<td>" + msg.ssid_len + "</td>" +
					"<td>" + msg.channel + "</td>" +
					"<td>" + msg.rssi + "</td>" +
					"<td>" + msg.is_hidden + "</td>" +
					"</tr>";
				var trLegth = $("#device_dataUl_tbody_AP").find("tr").length;
				if(trLegth > 1000) {
					_this.dataMax_wifi = true;
					/*去除*/
					$("#device_dataUl_tbody_AP").find("tr").last().remove();
				}
				/*新增*/
				$("#device_dataUl_tbody_AP").prepend(tbodyStr);
				/*新增特效*/
				_this.NewEffects($("#device_dataUl_tbody_AP"), _this.dataMax_wifi);
			}
		}
	} else {
		console.log("游览器不支持WebSocket!")
	}
}

/*设备详情*/
deviceWebSocketObj.prototype.DeviceDetails = function() {
	var str = '';
	var arr = this.deviceArr;
	var i = this.i;
	str += '<div class="col-xs-12 col-sm-6">' +
		'<div class="conShow_box">' +
		'<div class="conShow_box_title">' +
		'<span>设备：' + (i + 1) + ' - 详情</span>' +
		'<span class="idName">ID：' + arr[i] + '</span>' +
		'</div>' +
		'<div class="conShow_box_content">' +
		'<table border="0" cellspacing="0" cellpadding="0">' +
		'<thead>' +
		'<tr>' +
		'<th class="Time">Time</th>' +
		'<th class="ID">ID</th>' +
		'<th class="Battery">Battery</th>' +
		'<th class="Rssi">Rssi</th>' +
		'<th class="State">State</th>' +
		'</tr>' +
		'</thead>' +
		'<tbody id="eachLink' + i + '"></tbody>' +
		'</table>' +
		'</div>' +
		'</div>' +
		'</div>';
	$("#DeviceDetailsDiv").append(str);
	/*载入对应websocket连接*/
	this.EachLink(i, arr[i]);
}
deviceWebSocketObj.prototype.WIFIDeviceDetails = function() {
	var str = '';
	var arr = this.WIFIdeviceArr;
	var i = this.WIFIi;
	str += '<div class="conShow_box">' +
		'<div class="conShow_box_title">' +
		'<span class="deviceID">设备ID：' + (i + 1) + ' - 详情</span>' +
		'<p class="idNumber">收到数据量：<span id="idNumber' + i + '">0</span><span class="idNumber-add"></span></p>' +
		'<span class="idName">ID：' + arr[i] + '</span>' +
		'</div>' +
		'<div class="conShow_box_content">' +
		'<table border="0" cellspacing="0" cellpadding="0">' +
		'<thead>' +
		'<tr>' +
		'<th class="Time">Time</th>' +
		'<th class="MAC">MAC</th>' +
		'<th class="Brand">Brand</th>' +
		'<th class="Rssi">Rssi</th>' +
		'<th class="Link">Link</th>' +
		'<th class="APMAC">AP-MAC</th>' +
		'<th class="APBrand">AP-Brand</th>' +
		'</tr>' +
		'</thead>' +
		'<tbody id="WIFIeachLink' + i + '"></tbody>' +
		'</table>' +
		'</div>' +
		'</div>';
	$("#WIFIDeviceDetailsDiv").append(str);
	/*载入对应websocket连接*/
	this.WIFIEachLink(i, arr[i]);
}
deviceWebSocketObj.prototype.APDeviceDetails = function() {
	var str = '';
	var arr = this.APdeviceArr;
	var i = this.APi;
	str += '<div class="conShow_box">' +
		'<div class="conShow_box_title">' +
		'<span>设备：' + (i + 1) + ' - 详情</span>' +
		'<span class="idName">ID：' + arr[i] + '</span>' +
		'</div>' +
		'<div class="conShow_box_content">' +
		'<table border="0" cellspacing="0" cellpadding="0">' +
		'<thead>' +
		'<tr>' +
		'<th class="Time">Time</th>' +
		'<th class="BSSID">BSSID</th>' +
		'<th class="SSID">SSID</th>' +
		'<th class="Length">Length</th>' +
		'<th class="Channel">Channel</th>' +
		'<th class="Rssi">Rssi</th>' +
		'<th class="Privacy">Privacy</th>' +
		'</tr>' +
		'</thead>' +
		'<tbody id="APeachLink' + i + '"></tbody>' +
		'</table>' +
		'</div>' +
		'</div>';
	$("#DeviceDetailsDiv_AP").append(str);
	/*载入对应websocket连接*/
	this.APEachLink(i, arr[i]);
}
/*每个设备的连接*/
deviceWebSocketObj.prototype.EachLink = function(i, idName) {
	var _this = this;
	if("WebSocket" in window) {
		var data = {
			type: "a002",
			deviceID: idName
		}
		var ws = new ReconnectingWebSocket(_this.wsUrl);
		_this.wsArr.push(ws);
		ws.onopen = function() {
			// Web Socket 已连接上，使用 send() 方法发送数据
			ws.send(JSON.stringify(data));
		};

		ws.onmessage = function(evt) {
			var msg = JSON.parse(evt.data);
			/*数据处理*/
			if(msg) {
				/*渲染上传信息*/
				UploadInfo(msg);
			}
		};

		ws.onclose = function() {
			// 关闭 websocket
			ws.close();
		};

		//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
		window.onbeforeunload = function() {
			ws.close();
		}

		function UploadInfo(msg) {
			var dom = "#eachLink" + i;
			/*过滤条件*/
			var bool = _this.queryCriteria(msg, _this.qc);
			if(bool) {
				if(msg.urgentStatus == 1) {
					var urgentStatusStr = "<td class='error'>紧急</td>";
				} else {
					var urgentStatusStr = "<td class='success'>正常</td>";
				}
				var tbodyStr = "<tr>" +
					"<td>" + msg.time + "</td>" +
					"<td>" + msg.deviceID + "</td>" +
					"<td>" + msg.battery + "</td>" +
					"<td>" + msg.sendRssi + "</td>" +
					urgentStatusStr + "</tr>";
				var trLegth = $(dom).find("tr").length;
				if(trLegth > 1000) {
					$(dom).find("tr").last().remove();
				}
				$(dom).prepend(tbodyStr);
				_this.NewEffects($(dom));
			}
		}
		this.i += 1;
	} else {
		console.log("游览器不支持WebSocket!")
	}
}
deviceWebSocketObj.prototype.WIFIEachLink = function(i, idName) {
	var _this = this;
	var num = 0;
	if("WebSocket" in window) {
		var data = {
			type: "a001",
			deviceID: idName,
			ismac: '1'
		}
		var ws = new ReconnectingWebSocket(_this.WIFIwsUrl);
		_this.WIFIwsArr.push(ws);
		ws.onopen = function() {
			// Web Socket 已连接上，使用 send() 方法发送数据
			ws.send(JSON.stringify(data));
		};

		ws.onmessage = function(evt) {
			var msg = JSON.parse(evt.data);
			/*数据处理*/
			if(msg) {
				/*渲染上传信息*/
				UploadInfo(msg);
			}
		};

		ws.onclose = function() {
			// 关闭 websocket
			ws.close();
		};

		//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
		window.onbeforeunload = function() {
			ws.close();
		}

		function UploadInfo(msg) {
			var dom = "#WIFIeachLink" + i;
			var numDom = "#idNumber" + i;
			$(numDom).siblings(".idNumber-add").html("+1");
			/*过滤条件*/
			var bool = _this.queryCriteria(msg, _this.wifiqc);
			if(bool) {
				var tbodyStr = "<tr>" +
					"<td>" + msg.time + "</td>" +
					"<td>" + msg.mac + "</td>" +
					"<td>" + msg.dv_brand + "</td>" +
					"<td>" + msg.rssi + "</td>" +
					"<td>" + msg.Has_ap + "</td>" +
					"<td>" + msg.ApMac + "</td>" +
					"<td>" + msg.ap_brand + "</td>" +
					"</tr>";
				var trLegth = $(dom).find("tr").length;
				if(trLegth > 1000) {
					$(dom).find("tr").last().remove();
				}
				$(dom).prepend(tbodyStr);
				num++;
				$(numDom).html(num);
				_this.NewEffects($(dom));
			}
		}
		this.WIFIi += 1;
	} else {
		console.log("游览器不支持WebSocket!")
	}
}
deviceWebSocketObj.prototype.APEachLink = function(i, idName) {
	var _this = this;
	if("WebSocket" in window) {
		var data = {
			type: "a000",
			deviceID: idName
		}
		var ws = new ReconnectingWebSocket(_this.APwsUrl);
		_this.APwsArr.push(ws);
		ws.onopen = function() {
			// Web Socket 已连接上，使用 send() 方法发送数据
			ws.send(JSON.stringify(data));
		};

		ws.onmessage = function(evt) {
			var msg = JSON.parse(evt.data);
			/*数据处理*/
			if(msg) {
				/*渲染上传信息*/
				UploadInfo(msg);
			}
		};

		ws.onclose = function() {
			// 关闭 websocket
			ws.close();
		};

		//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
		window.onbeforeunload = function() {
			ws.close();
		}

		function UploadInfo(msg) {
			if(msg.hasOwnProperty('data')) {
				var data = msg.data;
				var dom = "#APeachLink" + i;
				for(var j = 0; j < data.length; j++) {
					/*过滤条件*/
					var bool = _this.queryCriteria(msg, _this.apqc);
					if(bool) {
						var tbodyStr = "<tr>" +
							"<td>" + msg.time + "</td>" +
							"<td>" + data[j].bssid + "</td>" +
							"<td>" + data[j].ssid + "</td>" +
							"<td>" + data[j].ssid_len + "</td>" +
							"<td>" + data[j].channel + "</td>" +
							"<td>" + data[j].rssi + "</td>" +
							"<td>" + data[j].is_hidden + "</td>" +
							"</tr>";
						var trLegth = $(dom).find("tr").length;
						if(trLegth > 1000) {
							$(dom).find("tr").last().remove();
						}
						$(dom).prepend(tbodyStr);
						_this.NewEffects($(dom));
					}
				}
			}
		}
		this.APi += 1;
	} else {
		console.log("游览器不支持WebSocket!")
	}
}
/*查询条件*/
deviceWebSocketObj.prototype.queryCriteria = function(msg, query) {
	if(query == undefined || query == "") {
		return true;
	} else {
		var msgBool = false;
		for(var key in msg) {
			if(key == "deviceID") {
				if(msg[key].toString().indexOf(query) != -1) {
					msgBool = true;
					break;
				}
			} else {
				if(msg[key].toString().indexOf(query) != -1) {
					msgBool = true;
					break;
				}
			}
		};
		if(msgBool) {
			return true;
		} else {
			return false;
		};
	}
}
/*新增特效*/
deviceWebSocketObj.prototype.NewEffects = function(dom, bool) {
	var bool = bool || false;
	if(bool) {
		var FirstTr = dom.find("tr").first();
		FirstTr.css("background-color", "#fee");
		var outTime = setTimeout(function() {
			FirstTr.css("background-color", "transparent");
			window.clearTimeout(outTime);
		}, 500)
	} else {
		var FirstTr = dom.find("tr").first();
		FirstTr.css("background-color", "#eee");
		var outTime = setTimeout(function() {
			FirstTr.css("background-color", "transparent");
			window.clearTimeout(outTime);
		}, 250)
	}

	FirstTr.click(function() {
		if(FirstTr.hasClass("active")) {
			$(this).removeClass("active");
		} else {
			$(this).addClass("active");
		}
	})
}