$(function() {
	/*初始化数据*/
	var getDeviceID = "";
	var deviceWebSocket = new deviceWebSocketObj();
	/*到URL地址获取ID*/
	var obj = toQueryParams.call(location.search);
	if(obj.id) {
		getDeviceID = obj.id.toUpperCase();
	};
	if(getDeviceID == "") {
		/*如果URL获取不到则到本地获取ID*/
		getDeviceID = sessionStorage.getItem("deviceID");
	};
	if(getDeviceID != "") {
		$("#queryState").stop().slideDown().html("<i class='glyphicon glyphicon-refresh'></i> 正在查询ID为：" + getDeviceID + " 设备...");
		$("#deviceID").html(getDeviceID);
		deviceWebSocket.deviceID = getDeviceID;
		deviceWebSocket.init();
	};
	/*把地址参数转成对象的方法*/
	function toQueryParams() {
		var search = this.replace(/^\s+/, '').replace(/\s+$/, '').match(/([^?#]*)(#.*)?$/); //提取location.search中'?'后面的部分
		if(!search) {
			return {};
		}
		var searchStr = search[0];
		var searchHash = searchStr.split('&');

		var ret = {};
		for(var i = 0, len = searchHash.length; i < len; i++) { //这里可以调用each方法
			var pair = searchHash[i];
			if((pair = pair.split('='))[0]) {
				var key = decodeURIComponent(pair.shift());
				var value = pair.length > 1 ? pair.join('=') : pair[0];

				if(value != undefined) {
					value = decodeURIComponent(value);
				}
				if(key in ret) {
					if(ret[key].constructor != Array) {
						ret[key] = [ret[key]];
					}
					ret[key].push(value);
				} else {
					ret[key] = value;
				}
			}
		}
		return ret;
	};

	/*切换设备*/
	$("#isSelect").on("click", function() {
		IdCut()
	});
	$("#isNumber").on("keydown", function(event) {
		if(event.which == 13) {
			IdCut()
		}
	});

	function IdCut() {
		var value = $("#isNumber").val().replace(/\s/g, "").toUpperCase();
		if(value) {
			/*修改URL*/
			location.search = "?id=" + value;
			$("#queryState").stop().slideDown().html("<i class='glyphicon glyphicon-refresh'></i> 正在查询ID为：" + value + " 设备...");
			deviceWebSocket.deviceID = value;
			deviceWebSocket.init();
		}
	};

	/*设备重启*/
	$("#restart").on("click", function() {
		deviceWebSocket.restart();
	});
})

var deviceWebSocketObj = function() {
	/*websocket地址*/
	this.wsUrl;
	/*传入参数*/
	this.data;
	this.deviceID;
	this.wsCon;
	/*图表信息*/
	this.temperature;
	this.fanStatus;
	this.doSetTimeOut;
	this.webScoketDate;
}
deviceWebSocketObj.prototype.init = function() {
	/*初始化信息*/
	this.temperature = 0;
	this.fanStatus = 0;
	/*初始化连接地址*/
	this.wsUrl = "ws://123.58.43.17:9501/";
	/*初始化连接参数*/
	this.data = {
		"type": "command",
		"data": {
			"deviceid": this.deviceID,
			"msg": "status"
		}
	};
	if(this.wsCon) {
		this.wsCon.close();
	}
	this.ws();
}
deviceWebSocketObj.prototype.ws = function() {
	var _this = this;
	if("WebSocket" in window) {
		var ws = new ReconnectingWebSocket(_this.wsUrl);
		_this.wsCon = ws;
		ws.onopen = function() {
			console.log("请求中...");
			// Web Socket 已连接上，使用 send() 方法发送数据
			ws.send(JSON.stringify(_this.data));
			/*检测超时*/
			clearTimeout(_this.doSetTimeOut);
			_this.doSetTimeOut = setTimeout(function() {
				if(typeof this.webScoketDate != "object") {
					$("#queryState").stop().slideDown().html("<i class='glyphicon glyphicon-remove'></i> 网络连接超时！");
					ws.close();
				}
			}, 30000);
		};

		ws.onmessage = function(evt) {
			this.webScoketDate = JSON.parse(evt.data);
			if(this.webScoketDate) {
				var deviceID = this.webScoketDate.deviceID;
				/*获取扫描数据*/
				if(deviceID) {
					$("#queryState").stop().slideUp();
					$("#deviceID").html(deviceID);
					$("#restart").show();
					UploadInfo(this.webScoketDate);
					sessionStorage.setItem("deviceID", deviceID);
				}
			}
		};

		ws.onclose = function() {
			// 关闭 websocket
			ws.close();
			console.log('关闭');
		};

		//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
		window.onbeforeunload = function() {
			ws.close();
		}

		function UploadInfo(msg) {
			var data = msg.data;
			/*联网方式*/
			var netWork;
			switch(data.netWork) {
				case 0:
					netWork = "未知";
					break;
				case 1:
					netWork = "WiFi";
					break;
				case 2:
					netWork = "网卡";
					break;
				case 3:
					netWork = "GPRS";
					break;
				case 4:
					netWork = "3G";
					break;
				case 5:
					netWork = "4G";
					break;
				default:
					netWork = "其他";
			}
			$("#networking").html(netWork);
			/*温度*/
			_this.temperature = data.workTem - 127;
			_this.temperatureFn();
			/*风扇*/
			_this.fanStatus = data.fanStatus;
			_this.fanFn();
		}
	} else {
		console.log("游览器不支持WebSocket!")
	}
}

deviceWebSocketObj.prototype.temperatureFn = function() {
	/*温度*/
	var temperature_value = this.temperature;
	var temperature_option = {
		title: {
			x: "center",
			bottom: 110,
			subtext: '当前设备温度'
		},
		tooltip: {
			formatter: "{a} <br/>{b} : {c} ℃"
		},
		series: [{
			name: '温度',
			type: 'gauge',
			axisLine: {
				show: true,
				lineStyle: {
					width: 15,
					shadowBlur: 0,
					color: [
						[0.1, '#ff4500'],
						[0.4, '#ffa500'],
						[0.8, '#009900'],
						[1, '#87ceeb']
					]
				}
			},
			axisLabel: {
				formatter: function(e) {
					switch(e + "") {
						case "-50":
							return "低温";
						case "200":
							return "高温";
						default:
							return "";
					}
				},
				textStyle: {
					fontSize: 11
				}
			},
			startAngle: 140,
			endAngle: -140,
			max: -127,
			min: 128,
			axisTick: {
				splitNumber: 5,
				length: 5
			},
			splitLine: {
				length: 15
			},
			radius: '100%',
			detail: {
				formatter: '{value} ℃',
				textStyle: {
					fontSize: 12
				}
			},
			data: [{
				value: temperature_value
			}]
		}]
	};
	var temperature_Div = echarts.init(document.getElementById('temperature'));
	temperature_Div.setOption(temperature_option);
}

deviceWebSocketObj.prototype.fanFn = function() {
	var cpuValue = this.fanStatus;
	var cpuName = '';
	switch(cpuValue) {
		case 0:
			cpuName = "不存在";
			break;
		case 1:
			cpuName = "关闭";
			break;
		case 2:
			cpuName = "低速运行";
			break;
		case 3:
			cpuName = "中速运行";
			break;
		case 4:
			cpuName = "高速运行";
			break;
		case 5:
			cpuName = "全速运行";
			break;
		default:
			netWork = "不存在";
	}
	/*风扇*/
	var cpu_option = {
		title: {
			"text": '风扇状态',
			"x": '50%',
			"y": '45%',
			subtext: cpuName,
			textAlign: "center",
			"textStyle": {
				"fontWeight": 'normal',
				"fontSize": 16
			},
			"subtextStyle": {
				"fontWeight": 'bold',
				"fontSize": 16,
				"color": '#3ea1ff'
			}
		},
		series: [{
				"name": ' ',
				"type": 'pie',
				"radius": ['70%', '95%'],
				"avoidLabelOverlap": false,
				"startAngle": 225,
				"color": ["#9f8fc1", "transparent"],
				"hoverAnimation": false,
				"legendHoverLink": false,
				"label": {
					"normal": {
						"show": false,
						"position": 'center'
					},
					"emphasis": {
						"show": true,
						"textStyle": {
							"fontSize": '30',
							"fontWeight": 'bold'
						}
					}
				},
				"labelLine": {
					"normal": {
						"show": false
					}
				},
				"data": [{
					"value": 75,
					"name": '1'
				}, {
					"value": 25,
					"name": '2'
				}]
			},
			{
				"name": '',
				"type": 'pie',
				"radius": ['72%', '93%'],
				"avoidLabelOverlap": false,
				"startAngle": 317,
				"color": ["#fff", "transparent"],
				"hoverAnimation": false,
				"legendHoverLink": false,
				"clockwise": false,
				"itemStyle": {
					"normal": {
						"borderColor": "transparent",
						"borderWidth": "20"
					},
					"emphasis": {
						"borderColor": "transparent",
						"borderWidth": "20"
					}
				},
				"z": 10,
				"label": {
					"normal": {
						"show": false,
						"position": 'center'
					},
					"emphasis": {
						"show": true,
						"textStyle": {
							"fontSize": '30',
							"fontWeight": 'bold'
						}
					}
				},
				"labelLine": {
					"normal": {
						"show": false
					}
				},
				"data": [{
					"value": (100 - cpuValue) * 266 / 360,
					"name": ''
				}, {
					"value": 100 - (100 - cpuValue) * 266 / 360,
					"name": ''
				}]
			}
		]
	};

	var cpu_Div = echarts.init(document.getElementById('cpu'));
	cpu_Div.setOption(cpu_option);
}

deviceWebSocketObj.prototype.restart = function() {
	var _this = this;
	if("WebSocket" in window) {
		var ws = new ReconnectingWebSocket(_this.wsUrl);
		ws.onopen = function() {
			// Web Socket 已连接上，使用 send() 方法发送数据
			ws.send('{"type": "command","data": {"deviceid": ' + _this.deviceID + ',"msg": "restart"}}');
			$("#queryState").stop().slideDown().html("<i class='glyphicon glyphicon-off'></i> 重启设备中...");
		};

		ws.onmessage = function(evt) {
			var msg = JSON.parse(evt.data);
			var queryStr;
			switch(msg.data) {
				case 1:
					queryStr = "成功";
					break;
				case 2:
					queryStr = "失败";
					break;
				case 3:
					queryStr = "命令不支持";
					break;
				default:
					queryStr = "命令不支持";
			}
			$("#queryState").stop().html("<i class='glyphicon glyphicon-off'></i> " + queryStr);
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
	} else {
		console.log("游览器不支持WebSocket!")
	}
}