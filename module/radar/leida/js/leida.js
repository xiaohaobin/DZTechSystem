/**
 * 全局函数
 * @function _isNull 判断值为null的时候，重新赋信号强度随机值
 * @function _isNaN 判断值为NaN的时候，重新赋值，针对雷达动画信号定位渲染，随机赋值
 * @function getQueryString 获取地址url中指定的参数值
 * @function onloadTimers 定时器监听雷达界面信号超时清除和切换状态
 * @function backRssi 信号强度返回值,计算为百分比
 * @function dateTransverter yyyy-mm-dd hh-mm-ss标准日期格式转换时间戳格式
 * @function optionSgin 根据源数据切换信号状态和删除信号状态
 * @function writeTr 渲染rf数据表格函数
 * @function urgencyTableFn rf数据渲染紧急事件表格
 * 
 * 
 * */

/**
 * 雷达主要业务逻辑构造函数方法
 * @method webSocketEvent webSocket请求封装
 * @method initadjustEvent 调整雷达画布事件
 * @method animationTimer 动画计时器事件
 * @method initCanvas1 初始化画布数据
 * @method can1_dynamicEvent 绘制画布里面结构动画
 * @method toQueryParams 获取地址栏所有参数，返回json数据格式
 * @method runModelEvent 运行模式事件
 * @method monitorSearchEvent 页面打开检查地址栏ID,开始数据接收函数
 * @method dataReceiveEvent ws数据接收事件
 * @method commandSendingEvent ws数据命令发送
 * 
 * @method staDataHandle sta数据处理
 * @method staDataRenderEvent sta数据渲染表格
 * @method initSignalPoint 初始化STA信号点
 * @method drawSignalPoint 绘制STA信号点
 * 
 * @method create 创建SVG图形
 * @method changeSignalState 切换信号点状态
 * @method signalClickEvent 信号点击事件
 * 
 * @method rfDataHandle RF数据处理
 * @method rfDataRenderEvent rf数据渲染表格事件
 * @method initRFSignal 初始化RF信号点
 * @method drawRFSignal 绘制RF信号点
 * 
 * @method generateQRCodeEvent 生成二维码事件
 * @method switchPosition 切换信号点位置
 * @method countSpace 计算画布中心到边界的间隔
 * @method clickTrEvent 表格点击事件
 * */
var desTimer = null, //断开连接后执行的定时器变量
	cutStateTimer = null, //定时切换信号状态定时器
	delStateTimer = null, //定时删除信号定时器
	aSta = [], //存放sta数据数组
	aRf = [], //存放
	aUrgency = [], //rf,紧急数据
	nServerT = 0, //服务器初始时间戳值
	color_sta_1 = "#ffee00", //sta实时颜色值
	color_sta_2 = "#999999", //sta过期颜色值
	color_rf_1 = "#00dbdb", //rf颜色
	color_rf_2 = "#ee0000", //紧急rf颜色
	netStatue = true, //网络状态
	gAnimate = "", //全局动画
	nDelTime = 300, //删除信号时间秒数
	nOverTime = 150, //过期信号时间秒数
	nDelTime2 = 60, //专属装置过期时间
	bWsState = false, //ws链接状态,init false
	nIntensity = 127, //转化后的信号强度
	minRssi = -127, //最小rssi强度
	maxRssi = 0; //最大rssi强度

//浏览器监听网络
$(window).bind('online', function() {
	netStatue = true;
});
$(window).bind('offline', function() {
	netStatue = false;
});

(function(win, doc, $) {
	function leiDa(options) {
		this._init(options);
		
	};
	$.extend(leiDa.prototype, {
		_init: function(options) {
			var self = this;
			self.options = {
				
				/*画布1：线圈、十字、圆心、动态*/
				canvas1: "#myCanvas1",
				/*画布2: 信号*/
				canvas2: "#mySVG",
				/*查询状态栏*/
				queryState: "#queryState span",
				/*运行模式切换*/
				runModel: "#runModel",
				/*STA数据表格*/
				staTable: "#sta_table",
				/*RF数据表格*/
				rfTabel: "#rf_table",
				/*信息提示框*/
				//				fixedBox: "#fixedBox",
				/*sta数据接口*/
				staInlet: "#sta_Inlet",
				/*rf数据接口*/
				rfInlet: "#rf_Inlet",

			};
			$.extend(true, self.options, options || {});
			self._initDomEvent();
			return self;
		},
		/**
		 * 初始化DOM引用
		 * @method _initDomEvent
		 * @return {CusScrollBar}
		 */
		_initDomEvent: function() {
			var self = this;
			var opts = this.options;
			/*设备ID输入框对象*/
			self.$textInput = $(opts.textInput);
			
			/*画布1对象*/
			self.$can1 = $(opts.canvas1)[0];
			self.ctx1 = self.$can1.getContext("2d");
			/*画布2对象*/
			self.$can2 = $(opts.canvas2)[0];
			/*查询状态栏对象*/
			self.$queryState = $(opts.queryState);
			/*运行模式对象*/
			self.$runModel = $(opts.runModel);
			/*STA表格对象*/
			self.$staTable = $(opts.staTable);
			/*RF表格对象*/
			self.$rfTabel = $(opts.rfTabel);
			
			/*STA入口对象*/
			self.$staInlet = $(opts.staInlet);
			/*RF入口对象*/
			self.$rfInlet = $(opts.rfInlet);
			/*初始化事件绑定*/
			self._initDomBindEvent();
			/*初始化调整事件*/
			self.initadjustEvent();
			/*动画计时器*/
			self.lastTime = Date.now();
			self.deltaTime = 0;
			self.animationTimer();
			/*页面打开检查地址栏ID,开始数据接收函数*/
			self.monitorSearchEvent();

		},

		/**
		 * 初始化DOM绑定事件
		 * @return {[Object]} [this]
		 * */
		_initDomBindEvent: function() {
			var self = this;
			var times;
			var index = -1;
			var flag = true;

			/*运行模式切换事件绑定*/
			self.$runModel.click(function(e) {
				e.preventDefault();
				self.runModelEvent($(this));
			});
			/*Tab数据切换事件绑定*/
			$(".quickChange").find("button").click(function(e) {
				e.stopPropagation();
				var id = $(this).attr("id");
				if(id == "quick_sta_btn") {
					self.dtp = "s";
					$(this).addClass("active");
					$(this).siblings("button").removeClass("active");
					self.commandSendingEvent("end2");
					self.commandSendingEvent("data");
					$("#sta_li").children("a").trigger("click");
				} else if(id == "quick_rf_btn") {
					self.dtp = "r";
					$(this).addClass("active");
					$(this).siblings("button").removeClass("active");
					self.commandSendingEvent("end");
					self.commandSendingEvent("data2");
					$("#rf_li").children("a").trigger("click");
				}
			});
			/*生成二维码*/
			$("#QRCode,#menuBtn").click(function(e) {
				e.preventDefault();
				self.generateQRCodeEvent();
			});
			/*表格点击事件绑定*/
			self.$staTable.on("click", "tr", function(e) {
				e.stopPropagation();
				$(this).addClass("active");
				self.clickTrEvent(this);
				$(this).siblings().removeClass("active");
			});

			self.$rfTabel.on("click", "tr", function(e) {
				e.stopPropagation();
				$(this).addClass("active");
				self.clickTrEvent(this);
				$(this).siblings().removeClass("active");
			});

		},
		/**
		 * webSocket请求封装
		 * @param url 接口分支
		 * @param param 请求参数
		 * @param fn 接收回调
		 */
		webSocketEvent: function(url, param, fn) {
			console.log(getQueryString('id'));
			console.log(url);
			if("WebSocket" in win) {
				var ws = new ReconnectingWebSocket(url);
				ws.onopen = function() {
					// Web Socket 已连接上，使用 send() 方法发送数据
					console.log();
					console.log(JSON.stringify(param));
					ws.send(JSON.stringify(param));
					sessionStorage.setItem('orderParam', JSON.stringify(param));
					//重置是否已发送历史命令为false
					self.hasSendHistory = false;
				};
				ws.onmessage = function(res) {
					fn(res.data);
				};
				ws.onclose = function() {
					$('#queryState').html("<i class='glyphicon glyphicon-remove'></i> 数据连接已断开...!").removeClass("hide");
					cancelAnimationFrame(gAnimate);
				};
				return ws;
			} else {
				console.log("游览器不支持WebSocket!")
			}
		},
		/*调整事件*/
		initadjustEvent: function() {
			var self = this;
			/*获取canvas父元素自适应后的宽度*/
			var parentWidth = $(".canvas_Box").width();
			/*强制设置成正方形*/
			$(".canvas_Box").height(parentWidth);
			/*调整蒙板大小*/
			$(".mask-box").width(parentWidth);
			$(".mask-box").height(parentWidth);
			/*调整数据表格高度*/
			$(".section_table").height(parentWidth);
			/*调整画布大小*/
			self.$can1.width = parentWidth;
			self.$can2.style.width = parentWidth;
			self.$can1.height = parentWidth;
			self.$can2.style.height = parentWidth;
			/*保存调整后画布宽高*/
			self.canWidth = self.$can1.width;
			self.canHeight = self.$can1.height;
			/*确定画布中心位置*/
			self.coreWidth = self.canWidth * 0.5;
			self.coreHeight = self.canHeight * 0.5;
			/*计算画布中心到边界的间隔*/
			self.space = self.countSpace(self.coreWidth, self.coreHeight, (self.canWidth - 10), (self.canHeight - 10), nIntensity);
			/*初始化画布1数据*/
			self.initCanvas1();
		},
		/*动画计时器事件*/
		animationTimer: function() {
			var self = this;
			gAnimate = win.requestAnimationFrame(self.animationTimer.bind(this));

			var now = Date.now();
			self.deltaTime = now - self.lastTime;
			self.lastTime = now;
			/*适配最低性能*/
			if(self.deltaTime > 25 || self.deltaTime < 20) {
				self.deltaTime = 25;
			};
			/*do something:*/
			/*绘制画布1动态内容*/
			self.can1_dynamicEvent();
		},
		/*画布1事件:初始化数据*/
		initCanvas1: function() {
			var self = this;
			/*初始化动态内容*/
			self.can1 = {};
			self.can1.R = Math.sqrt(Math.pow(self.coreWidth, 2) + Math.pow(self.coreHeight, 2));
			self.can1.r1 = 0;
			self.can1.r2 = self.can1.R / 2;
			self.can1.bFirst = true;
			self.can1.l = 0;
			self.can1.num = 0;
			self.can1.angle = 0;
			/*更具画布宽高生成对应环数和距离*/
			if(self.canWidth > self.canHeight) {
				self.can1.l = parseInt(self.canHeight / 12);
				self.can1.num = parseInt(self.canHeight / 20);
			} else {
				self.can1.l = parseInt(self.canWidth / 12);
				self.can1.num = parseInt(self.canWidth / 20);
			};
		},
		/*画布1事件:绘制*/
		can1_dynamicEvent: function() {
			//			console.log(this);
			var self = this;
			self.ctx1.fillStyle = "rgba(0,0,0,0.03)";
			self.ctx1.fillRect(0, 0, self.canWidth, self.canHeight);
			self.ctx1.strokeStyle = "rgba(0,255,0,0.2)";
			//声波
			self.ctx1.lineWidth = 1;
			for(var k = 0; k < 5; k++) {
				self.ctx1.beginPath();
				self.ctx1.arc(self.coreWidth, self.coreHeight, self.can1.r1 + k, 0, Math.PI * 2); //声波
				self.ctx1.closePath();
				self.ctx1.stroke();
				self.ctx1.beginPath();
				if(!self.can1.bFirst)
					self.ctx1.arc(self.coreWidth, self.coreHeight, self.can1.r2 + k, 0, Math.PI * 2); //声波
				self.ctx1.closePath();
				self.ctx1.stroke();
			};
			if(self.can1.r1 > self.can1.R) {
				self.can1.r1 = 0;
			};
			if(self.can1.r2 > self.can1.R) {
				self.can1.r2 = 0;
				if(self.can1.bFirst == true) {
					self.can1.bFirst = false;
				}
			};
			self.can1.r1 += 2;
			self.can1.r2 += 2;
			//扫描
			self.ctx1.lineWidth = 5;
			self.ctx1.strokeStyle = "rgba(0,255,0,0.6)";
			self.ctx1.save();
			self.ctx1.translate(self.coreWidth, self.coreHeight);
			self.can1.angle = self.can1.angle + (-self.deltaTime * 0.05);
			if(self.can1.angle < -360) {
				self.can1.angle = -1;
			}
			self.ctx1.rotate(self.can1.angle * Math.PI / 180); //雷达扫描针
			self.ctx1.beginPath();
			self.ctx1.moveTo(0, 0);
			self.ctx1.lineTo(self.canWidth, 0);
			self.ctx1.closePath();
			self.ctx1.stroke();
			self.ctx1.restore();
			/*雷达准心线*/
			self.ctx1.save();
			self.ctx1.beginPath();
			self.ctx1.lineWidth = 1;
			self.ctx1.moveTo(self.coreWidth, 0);
			self.ctx1.lineTo(self.coreWidth, self.canHeight);
			self.ctx1.moveTo(0, self.coreHeight);
			self.ctx1.lineTo(self.canWidth, self.coreHeight);
			self.ctx1.closePath();
			self.ctx1.strokeStyle = "#060";
			self.ctx1.stroke();
			self.ctx1.restore();
			/*雷达线圈*/
			self.ctx1.save();
			self.ctx1.translate(self.coreWidth, self.coreHeight);
			self.ctx1.lineWidth = 1;
			self.ctx1.strokeStyle = "#060";
			for(var i = 0; i < self.can1.num; i++) {
				self.ctx1.beginPath();
				self.ctx1.arc(0, 0, self.can1.l * i, 0, 2 * Math.PI);
				self.ctx1.closePath();
				self.ctx1.stroke();
			};
			/*雷达准心点*/
			self.ctx1.beginPath();
			self.ctx1.shadowBlur = 20;
			self.ctx1.shadowColor = "#060";
			self.ctx1.arc(0, 0, 4, 0, 2 * Math.PI);
			self.ctx1.closePath();
			self.ctx1.strokeStyle = "#060";
			self.ctx1.stroke();
			self.ctx1.fillStyle = "#333";
			self.ctx1.fill();
			self.ctx1.restore();
		},
		/*获取地址栏所有参数，返回json数据格式*/
		toQueryParams: function() {

			var search = this.replace(/^\s+/, '').replace(/\s+$/, '').match(/([^?#]*)(#.*)?$/); //提取location.search中'?'后面的部分//			
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
			console.log(ret);
			return ret;
		},
		/*运行模式事件*/
		runModelEvent: function(dom) {

			var self = this;
			var str = dom.html();
			if(str == "接收") {
				var cLay = layer.confirm(
					"当前为接收模式，是否切换到暂停模式？切换到暂停模式，可停止接收后台数据！", {
						btn: ["是", "否"]
					},
					function() {
						dom.html("暂停");
						self.modelStatus = false;
						layer.close(cLay);
					},
					function() {
						layer.close(cLay);
						return false;
					}
				);

			} else {
				var cLay = layer.confirm(
					"当前为暂停模式，是否切换到接收模式？切换到接收模式，可继续接收后台数据！", {
						btn: ["是", "否"]
					},
					function() {
						dom.html("接收");
						self.modelStatus = true;
						layer.close(cLay);
					},
					function() {
						layer.close(cLay);
						return false;
					}
				);

			};
		},

		/*初始监视地址栏是否有ID*/
		monitorSearchEvent: function() {
			var self = this;
			var obj = self.toQueryParams.call(location.search);
			if(obj.dtp != undefined) {
				self.dtp = obj.dtp;
				if(self.dtp == "s") {
					$("#quick_sta_btn").addClass("active");
					$("#sta_li").children("a").trigger("click");
				} else if(self.dtp == "r") {
					$("#quick_rf_btn").addClass("active");
					$("#rf_li").children("a").trigger("click");
				}
			} else {
				self.dtp = "";
				layer.open({
					open: 0,
					content: "请先选择数据类型",
					btnAlign: 'c'
				});
			};
			if(obj.id != undefined) {
				var getDeviceID = obj.id;
			};
			if(obj.wsip != undefined) {
				var getUip = obj.wsip;
			};
			if(obj.dzkj != undefined) {
				self.wsip = true;
			} else {
				self.wsip = false;
			};
			/*如果有数据进入搜索*/
			if(getDeviceID && getUip) {
				self.dataReceiveEvent(getDeviceID, getUip);
			} else if(getDeviceID) {
				self.dataReceiveEvent(getDeviceID);
			};
			/*窗口退出事件*/
			window.onbeforeunload = function(event) {
				self.commandSendingEvent("end", getDeviceID);
				self.commandSendingEvent("end2", getDeviceID);
				//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
				self.ws.close();
			};
		},
		/*修改地址栏参数*/
		editSearchParam: function() {
			var self = this;
			var value = self.$textInput.val().replace(/\s/g, "").toUpperCase();
			if(value) {
				var obj = self.toQueryParams.call(location.search);
				if(obj.wsip != undefined) {
					/*修改URL*/
					var a = "&wsip=" + obj.wsip;
				} else {
					var a = "";
				};
				if(obj.dzkj != undefined) {
					/*修改URL*/
					var b = "&dzkj=" + obj.dzkj;
				} else {
					var b = "";
				};
				if(obj.dtp != undefined) {
					/*修改URL*/
					var c = "&dtp=" + obj.dtp;
				} else {
					var c = "";
				};
				location.search = "?id=" + value + a + b + c;
			}
		},
		/*ws数据接收事件*/
		dataReceiveEvent: function(did, uip) {
			var self = this;
			/*数据服务器*/
			if(uip) {
				if(self.wsip) {
					var wskUrl = uip + "?dcdlzd=" + did;
				} else {
					var wskUrl = uip;
				}
			} else {
				if(self.wsip) {
					var wskUrl = "ws://123.58.43.17:9506?dcdlzd=" + did;
					console.log(wskUrl);
				} else {
					var wskUrl = "ws://123.58.43.17:9506";
				}
			};
			/*存放接收的数据对象*/
			self.dataArr_sta = [];
			self.dataArr_rf = [];
			/*规定渲染条数*/
			self.$length = 100;
			/*运行模式状态*/
			self.modelStatus = true;
			self.runStaEvent = true;
			self.runRfEvent = true;
			// 设置是否已经发送过历史命令
			self.hasSendHistory = false;
			/*查询是否在线命令*/
			var online = {
				type: "online",
				device: did
			};
			self.$queryState.html("<i class='glyphicon glyphicon-refresh'></i> 正在查询ID为：" + did + " 设备...").removeClass("hide");
			/*建立websocke连接:sta*/
			self.ws = self.webSocketEvent(wskUrl, online, function(res) {
				//				console.log(res);
				if($('#queryState').text().indexOf('数据连接已断开') != -1) {
					$('#queryState').html("数据接收中...").addClass("hide");
				}
				var msg = JSON.parse(res);
				$("#deviceName").html(did);
				if(msg.type == "erro") {
					bWsState = false;
					if(msg.data.length == 0) {
						self.$queryState.html("<i class='glyphicon glyphicon-remove'></i> 未检测到相关设备!").removeClass("hide");
						layer.msg("未检测到相关设备!");
					}
					cancelAnimationFrame(gAnimate);
				}
				if(msg.type == "online") {
					sessionStorage.setItem('tbmac', msg.data.deviceID);
					nServerT = msg.time;
					if(msg.data.status != 1) {
						bWsState = false;
						self.$queryState.html("<i class='glyphicon glyphicon-remove'></i> 设备已离线...!").removeClass("hide");
						$("#queryState").removeClass("hide");
						layer.msg("设备已离线,正在努力重连中，请稍等..");
						cancelAnimationFrame(gAnimate);
					} else {
						bWsState = true;
						clearInterval(cutStateTimer); //停止切换信号状态定时器
						clearInterval(delStateTimer); //停止删除信号状态定时器
						console.log("调用了定时器");
						onloadTimers();
						cancelAnimationFrame(gAnimate);
						gAnimate = win.requestAnimationFrame(self.animationTimer.bind(self));

						$(".section_table_error").hide();
						self.$queryState.html("数据接收中...").addClass("hide");
						/*如果在线继续发送接收历史命令*/
						if(self.dtp == "s") {
							self.commandSendingEvent("his", did);
						} else if(self.dtp == "r") {
							self.commandSendingEvent("his2", did);
						};
						self.hasSendHistory = true;
					};

				}
				if(msg.type == "Status" && msg.data[0].deviceID == did) {
					if(msg.data[0].status != 1) {
						bWsState = false;
						self.$queryState.html("<i class='glyphicon glyphicon-remove'></i> 设备已离线...!").removeClass("hide");
						cancelAnimationFrame(gAnimate);

					} else {
						bWsState = true;
						clearInterval(cutStateTimer); //停止切换信号状态定时器
						clearInterval(delStateTimer); //停止删除信号状态定时器
						console.log('信号删除和切换状态定时器stop');

						//在线状态开始计时
						console.log("再次调用了定时器");
						onloadTimers();

						cancelAnimationFrame(gAnimate);
						gAnimate = win.requestAnimationFrame(self.animationTimer.bind(self));

						$(".section_table_error").hide();
						self.$queryState.html("数据接收中...").addClass("hide");

						// 如果没有发送过历史命令
						if(!self.hasSendHistory) {
							if(self.dtp == "s") {
								self.commandSendingEvent("his", did);
							} else if(self.dtp == "r") {
								self.commandSendingEvent("his2", did);
							};
							self.hasSendHistory = true;
						}
					}
				}

				if(msg.type == "history") { /*历史数据处理*/
					var hisdata = msg.data;
					hisdata.isHis = true; //是否历史数据
					hisdata.trFind = false; //是否被搜索状态
					if(hisdata.type == "a001") {
						self.staDataHandle(hisdata);
					} else if(hisdata.type == "a002") {
						self.rfDataHandle(hisdata);
					}
				}
				if(msg.type == "historyend") { /*接收到“历史结束”的命令则发送是数据请求*/
					if(self.dtp == "s") {
						self.commandSendingEvent("data", did);
					} else if(self.dtp == "r") {
						self.commandSendingEvent("data2", did);
					}
				}
				//				console.log(msg.type);
				if(msg.type == "Data") { /*接收数据分类*/
					var data = msg.data;
					data.isHis = false;
					data.trFind = false;
					if(data.type == "a001") {
						/*STA数据处理*/

						self.staDataHandle(data);
					} else if(data.type == "a002") {
						/*RF数据处理*/
						self.rfDataHandle(data);
					}
					//					console.log(data);
				}
				if(msg.type == "rfurgent") {
					$('.urgencyTable tbody tr').each(function() {
						if($(this).children('.urgencyDevkey').text() == msg.devmac) $(this).remove();
						layer.msg("id为" + msg.devmac + "的专属装置的紧急事件，被探霸" + msg.tbmac + "处理了！", {
							time: 3000
						});
					});
				}
			});
		},
		/*ws数据命令发送*/
		commandSendingEvent: function(order, did) {
			var self = this;
			/*如果没有ID则自动从地址栏获取*/
			if(did == undefined) {
				var obj = self.toQueryParams.call(location.search);
				if(obj.id) {
					var did = obj.id.toUpperCase();
				} else {
					return false;
				};
			};
			//命令参数
			var his = {
				type: "history",
				datatype: "a001",
				device: did
			};
			var his2 = {
				type: "history",
				datatype: "a002",
				device: did
			};
			var data = {
				type: "getdata",
				datatype: "a001",
				device: did
			};
			var data2 = {
				type: "getdata",
				datatype: "a002",
				device: did
			};
			var end = {
				type: "dataEnd",
				datatype: "a001",
				device: did
			};
			var end2 = {
				type: "dataEnd",
				datatype: "a002",
				device: did
			};
			if(order == "his") {
				/*发送sta历史查询命令*/
				self.ws.send(JSON.stringify(his));
			} else if(order == "his2") {
				/*发送rf历史查询命令*/
				self.ws.send(JSON.stringify(his2));
			} else if(order == "data") {
				/*发送STA查询命令 */
				self.ws.send(JSON.stringify(data));
			} else if(order == "data2") {
				/*发送RF查询命令 */
				self.ws.send(JSON.stringify(data2));
			} else if(order == "end") {
				/*发送结束命令 */
				self.ws.send(JSON.stringify(end));
			} else if(order == "end2") {
				/*发送结束命令 */
				self.ws.send(JSON.stringify(end2));
			};
			self.ws.onclose = function() {
				self.$queryState.show().html("<i class='glyphicon glyphicon-remove'></i> 数据连接已断开...!");
			};
		},
		/*sta数据处理*/
		staDataHandle: function(data) {
			//强制转化超过最小rssi强度的值为最小rssi强度
			//			console.log(data);
			if(data.rssi < minRssi) data.rssi = minRssi;

			var self = this;
			//发现次数
			if(data.find == false) {
				data.find = 1;
			};
			var keys = data.devkey;
			var maxShow = self.$length;
			/*初次没有数据之间导入*/
			var bool = true;
			if(self.dataArr_sta.length > 0 && data.devkey) {
				/*检测储存数中是否有相同设备*/
				for(var i = 0; i < self.dataArr_sta.length; i++) {
					if(self.dataArr_sta[i].devkey == keys) {
						/*是否更新角度:如果再次获取的强度相差在5%内不改变角度*/
						var differ = Math.abs(self.dataArr_sta[i].rssi) - Math.abs(data.rssi);
						if(Math.abs(differ) > 5) {
							data.angle = Math.floor(Math.random() * 360);
							self.switchPosition(data);
						} else {
							data.angle = self.dataArr_sta[i].rssi;
						};
						if(self.dataArr_sta[i].trFind == true) {
							data.trFind = true;
						}
						data.history = 0;
						data.show = true;
						data.delTime = 300;

						/*删除旧信息*/
						self.dataArr_sta.splice(i, 1);
						/*不新增*/
						bool = false;
						/*断循环*/
						break;
					}
				};

				/*更新信息*/
				self.dataArr_sta.unshift(data);
			}

			if(bool) {
				if(data.history == 1 && data.devkey) {
					/*历史数据顺序调整*/
					data.delTime = 150;
					data.rssi = Math.floor(Math.random() * (100 - 40 + 1) + 40);
					for(var key in self.dataArr_sta) {
						if(self.dataArr_sta[key].devkey == data.devkey) {
							self.dataArr_sta.splice(key, 1);
						}
					}
					self.dataArr_sta.push(data);
				} else if(data.devkey) {
					data.delTime = 300;
					/*新增的标识*/
					data.history = 0;
					for(var key in self.dataArr_sta) {
						if(self.dataArr_sta[key].devkey == data.devkey) {
							self.dataArr_sta.splice(key, 1);
						}
					}
					self.dataArr_sta.unshift(data);
				}

			}
			self.dataArr_sta = _.uniqBy(self.dataArr_sta, 'devkey');
			/*性能模式下(false)，渲染完成之前不再次加载*/
			if(self.modelStatus == false) {
				self.runStaEvent = false;
				win.setTimeout(function() {
					self.runStaEvent = true;
				}, 1000);
				if(self.runStaEvent == false) {
					return false;
				};
			};

			//			console.log(self.dataArr_sta);
			/*数据渲染事件*/
			if(self.dataArr_sta.length > maxShow) {
				self.staDataRenderEvent(maxShow);
			} else {
				self.staDataRenderEvent(self.dataArr_sta.length);
				/*更多数据提示*/
				$(".section_table_error").html("").hide();
			};
			/*初始化信号点*/
			self.initSignalPoint();
		},
		/*数据渲染事件*/
		staDataRenderEvent: function(length) {
			var self = this;
			var arrs = self.dataArr_sta;
			var trs = "";
			var tds = "";
			for(var i = 0; i < length; i++) {
				/*接收到的rssi超过-100时，强制视为-100*/
				if(self.wsip) {
					var devkey = arrs[i].devkey;
				} else {
					var devkey = arrs[i].devkey.slice(0, 10);
				};
				tds = "<td>" + arrs[i].time + "</td>" +
					"<td>" + arrs[i].dv_brand + "</td>" +
					"<td>" + devkey + "</td>" +
					"<td>" + (backRssi(arrs[i].rssi) * 1 > 100 ? 100 : backRssi(arrs[i].rssi)) + " %</td>" +
					"<td>" + arrs[i].find + "</td>";
				/*如果是历史数据修改样式*/
				if(arrs[i].history == 1) {
					trs += "<tr class='oldData " + (arrs[i].trFind == true ? "trFind" : "noFind") + "' data-id='" + arrs[i].devkey + "'>" + tds + "</tr>";
				} else {
					trs += "<tr data-id='" + arrs[i].devkey + "' class='" + (arrs[i].trFind == true ? "trFind" : "noFind") + "'>" + tds + "</tr>";
				}
			};
			/*渲染表格*/
			self.$staTable.children("tbody").html(trs);
			var sTr = $("#sta_table tbody tr.trFind").clone();
			$("#sta_table tbody tr.trFind").remove();
			$("#sta_table tbody").prepend(sTr);
		},
		/*初始化STA信号点*/
		initSignalPoint: function() {
			var self = this;
			var arrs = self.dataArr_sta;
			for(var i = 0; i < arrs.length; i++) {
				if(arrs[i].show == undefined) {
					/*角度*/
					arrs[i].angle = Math.floor(Math.random() * 360);
					/*距离*/
					var rssi = Math.abs(parseInt(arrs[i].rssi));
					arrs[i].l = rssi * self.space;
					/*x轴位置*/
					arrs[i].x = Math.floor(self.coreWidth + arrs[i].l * Math.cos(arrs[i].angle * 3.14 / 180));
					/*y轴位置*/
					arrs[i].y = Math.floor(self.coreHeight + arrs[i].l * Math.sin(arrs[i].angle * 3.14 / 180));
					/*是否显示*/
					arrs[i].show = true;
					/*是否生成*/
					arrs[i].exist = false;
					/*是否历史*/
					if(arrs[i].history == 1) {
						arrs[i].timeOut = true;
					} else {
						arrs[i].timeOut = false;
					};
				};
			};
			/*将处理完成的数据返回*/
			self.dataArr_sta = arrs;
			/*STA*/
			self.drawSignalPoint(self.dataArr_sta);
		},
		/*绘制STA信号点*/
		drawSignalPoint: function(arrss) {
			var self = this;
			if(arrss) {
				var arrs = arrss;
				var starSignal = document.getElementById("signal");
				for(var i = 0; i < arrs.length; i++) {
					if(arrs[i].exist == false) {
						var signal = self.create("circle");
						signal.setAttribute("cx", _isNaN(arrs[i].x));
						signal.setAttribute("cy", _isNaN(arrs[i].y));
						signal.setAttribute("r", 3);
						signal.setAttribute("data-type", "signal");
						signal.setAttribute("data-name", "sta");
						signal.setAttribute("data-click", "off");
						signal.setAttribute("data-id", arrs[i].devkey);
						signal.setAttribute("data-time", arrs[i].time);
						if(arrs[i].timeOut == true) {
							signal.setAttribute("fill", color_sta_2);
						} else {
							signal.setAttribute("fill", color_sta_1);
						};
						signal.onclick = function(e) {
							e.stopPropagation();
							e.preventDefault();
							if($(this).attr("data-click") == "on") {
								$(this).attr("data-click", "off");
							} else {
								$(this).attr("data-click", "on");
							};
							$(this).siblings("circle").attr("data-click", "off");
							self.signalClickEvent(this);
						};
						self.$can2.appendChild(signal);
						self.dataArr_sta[i].exist = true;
					}
				};
			};
		},
		/*创建SVG图形*/
		create: function(name) {
			var self = this;
			var shape = document.createElementNS("http://www.w3.org/2000/svg", name);
			return shape;
		},
		/*切换信号点状态*/
		changeSignalState: function(id, action, state) {
			var self = this;
			var dom = $("circle[data-id='" + id + "'][data-type='signal']");
			if(action == "timeOut") {
				if(state) {
					dom.attr("fill", color_sta_2);
				} else {
					dom.attr("fill", color_sta_1);
				}
			} else if(action == "del") {
				if(state) {
					var dom = $("circle[data-id='" + id + "']");				
					dom.remove();
				}
			};
		},
		/*信号点击事件*/
		signalClickEvent: function(opt) {

			var self = this;
			var arrs = $("circle[data-type='bo']");
			if(arrs.length > 0) {
				arrs.remove();
			};

			var x = opt.getAttribute("cx");
			var y = opt.getAttribute("cy");
			var d = opt.getAttribute("data-id");
			var n = opt.getAttribute("data-name");
			/*绘制声波*/
			var bo = self.create("circle");
			bo.setAttribute("cx", x);
			bo.setAttribute("cy", y);
			bo.setAttribute("r", 0);
			if(n == "rf") {
				bo.setAttribute("fill", color_rf_1);
			} else {
				bo.setAttribute("fill", color_sta_1);
			};
			bo.setAttribute("data-type", "bo");
			bo.setAttribute("data-id", d);
			self.$can2.appendChild(bo);
			/*声波动画*/

			var fd = self.create("animate");
			fd.setAttribute("attributeType", "XML");
			fd.setAttribute("attributeName", "r");
			fd.setAttribute("from", 5);
			fd.setAttribute("to", 18);
			fd.setAttribute("dur", "2s");
			fd.setAttribute("repeatCount", "indefinite");
			bo.appendChild(fd);
			var xs = self.create("animate");
			xs.setAttribute("attributeType", "XML");
			xs.setAttribute("attributeName", "opacity");
			xs.setAttribute("from", 1);
			xs.setAttribute("to", 0);
			xs.setAttribute("dur", "1s");
			xs.setAttribute("repeatCount", "indefinite");
			bo.appendChild(xs);
			//3s后清楚信号动画
			var clearAnimateSign = setTimeout(function() {
				$("#mySVG circle:last-child animate").remove();
				clearTimeout(clearAnimateSign);
			}, 3000);
			
		},
		/*RF数据处理*/
		rfDataHandle: function(data) {
			data.rssi = data.sendRssi;
			//强制转化超过最小rssi强度的值为最小rssi强度
			if(data.rssi < minRssi) data.rssi = minRssi;
			var self = this;
			var keys = data.devkey;
			//			console.log(data);
			/*初次没有数据之间导入*/
			var bool = true;
			var i = 0;
			if(self.dataArr_rf.length > 0 && data.devkey) {
				//				console.log("去重");
				/*检测储存数中是否有相同设备*/
				for(i; i < self.dataArr_rf.length; i++) {
					if(self.dataArr_rf[i].devkey == keys) {
						/*是否更新角度:如果再次获取的强度相差在5%内不改变角度*/
						var differ = Math.abs(self.dataArr_rf[i].rssi) - Math.abs(data.rssi);
						if(Math.abs(differ) > 5) {
							data.angle = Math.floor(Math.random() * 360);
							self.switchPosition(data);
						} else {
							data.angle = self.dataArr_rf[i].rssi;
						}

						if(self.dataArr_rf[i].trFind == true) {
							data.trFind = true;
						}
						/*更新信息*/
						data.show = true;
						self.dataArr_rf[i].delTime = 300
						self.dataArr_rf[i].time = data.time;
						self.dataArr_rf[i].urgentStatus = data.urgentStatus;
						self.dataArr_rf.splice(i, 1);
						/*不新增*/
						bool = false;
						/*断循环*/
						break;
					}
				};
				self.dataArr_rf.unshift(data);

			}

			if(bool) {
				data.delTime = 300;
				data.timers = (function() {

					/*表格数据过多,删除最早的数据*/
					var _tbody = self.$rfTabel.children("tbody tr");
					var trLegth = _tbody.length;
					if(trLegth > 300) {
						_tbody.last().remove();
					};
				})();
				if(data.history == 1 && data.devkey) {
					/*历史数据顺序调整*/
					self.dataArr_rf.push(data);
				} else if(data.devkey) {
					/*新增的标识*/
					self.dataArr_rf.unshift(data);
				}
			}
			//去重
			self.dataArr_rf = _.uniqBy(self.dataArr_rf, 'devkey');

			/*性能模式下(false)，渲染完成之前不再次加载*/
			if(self.modelStatus == false) {
				self.runRfEvent = false;
				win.setTimeout(function() {
					self.runRfEvent = true;
				}, 1000);
				if(self.runRfEvent == false) {
					return false;
				};
			};

			/*数据渲染事件*/
			self.rfDataRenderEvent();
			/*初始化信号点*/
			self.initRFSignal();
			self.runRfEvent = true;
		},
		/*rf数据渲染表格事件*/
		rfDataRenderEvent: function() {
			var self = this;
			var arrs = self.dataArr_rf;
			writeTr(arrs, self.$rfTabel.children("tbody"));
		},
		/*初始化RF信号点*/
		initRFSignal: function() {
			var self = this;
			var arrs = self.dataArr_rf;
			for(var i = 0; i < arrs.length; i++) {
				if(arrs[i].show == undefined) {
					/*角度*/
					arrs[i].angle = Math.floor(Math.random() * 360);
					/*距离*/
					var rssi = Math.abs(parseInt(arrs[i].rssi));
					arrs[i].l = rssi * self.space;
					/*x轴位置*/
					arrs[i].x = Math.floor(self.coreWidth + arrs[i].l * Math.cos(arrs[i].angle * 3.14 / 180));
					/*y轴位置*/
					arrs[i].y = Math.floor(self.coreHeight + arrs[i].l * Math.sin(arrs[i].angle * 3.14 / 180));
					/*是否显示*/
					arrs[i].show = true;
					/*是否生成*/
					arrs[i].exist = false;
				};
			};
			/*将处理完成的数据返回*/
			self.dataArr_rf = arrs;
			/*RF*/
			self.drawRFSignal();
		},
		/*绘制RF信号点*/
		drawRFSignal: function() {
			var self = this;
			if(self.dataArr_rf) {
				var arrs = self.dataArr_rf;
				//渲染紧急信号

				for(var i = 0; i < arrs.length; i++) {
					$('#mySVG circle').each(function(j) {
						if($(this).attr("data-id") == arrs[i].devkey && arrs[i].urgentStatus == 1) {
							$(this).attr("fill", color_rf_2);
							return false;
						}
						if($(this).attr("data-id") == arrs[i].devkey && arrs[i].urgentStatus != 1) {
							$(this).attr("fill", color_rf_1);
						}
					});
					if(arrs[i].exist == false) {
						var signal = self.create("circle");
						arrs[i].x = _isNaN(arrs[i].x);
						arrs[i].y = _isNaN(arrs[i].y);
						signal.setAttribute("cx", arrs[i].x);
						signal.setAttribute("cy", arrs[i].y);
						signal.setAttribute("r", 3);
						signal.setAttribute("data-type", "signal");
						signal.setAttribute("data-name", "rf");
						signal.setAttribute("data-click", "off");
						signal.setAttribute("data-id", arrs[i].devkey);
						signal.setAttribute("data-time", arrs[i].time);
						if(arrs[i].urgentStatus == 1) {
							signal.setAttribute("fill", color_rf_2);
						} else {
							signal.setAttribute("fill", color_rf_1);
						};
						signal.onclick = function(e) {
							e.stopPropagation();
							e.preventDefault();
							if($(this).attr("data-click") == "on") {
								$(this).attr("data-click", "off");
							} else {
								$(this).attr("data-click", "on");
							};
							$(this).siblings("circle").attr("data-click", "off");
							self.signalClickEvent(this);
						};
						self.$can2.appendChild(signal);
						self.dataArr_rf[i].exist = true;
					}
				};
			};
		},
		/*生成二维码事件*/
		generateQRCodeEvent: function() {
			var self = this;
			/*容器盒子*/
			var modelBox = $("<div class='modelBox'></div>");
			/*蒙板*/
			var mask = $("<div></div>").css({
				"width": "100%",
				"height": "100%",
				"position": "fixed",
				"top": "0",
				"left": "0",
				"z-index": "900",
				"backgroundColor": "rgba(0,0,0,0.8)"
			});
			/*二维码区*/
			var QRCode = $("<div></div>").css({
				"width": "300px",
				"height": "300px",
				"backgroundColor": "#fff",
				"position": "fixed",
				"top": "50%",
				"left": "50%",
				"z-index": "999",
				"marginTop": "-150px",
				"marginLeft": "-150px"
			});
			$(modelBox).append(mask);
			$(modelBox).append(QRCode);
			/*生成LOGO*/
			var logo = $("<img src='img/96.png'>").css({
				"width": "96px",
				"height": "96px",
				"position": "fixed",
				"top": "50%",
				"left": "50%",
				"z-index": "1000",
				"marginTop": "-48px",
				"marginLeft": "-48px"
			});
			$(QRCode).append(logo);
			/*获取地址栏地址*/
			var src = location.href;
			/*生成二维码*/
			$(QRCode).qrcode({
				render: "canvas",
				text: src,
				width: "300", //二维码的宽度
				height: "300", //二维码的高度
				correctLevel: 0,
				background: "#ffffff", //二维码的后景色
				foreground: "#000000", //二维码的前景色
			});
			var myCanvas = $(QRCode).children("canvas")[0];
			var myImg = self.convertCanvasToImage(myCanvas);
			myCanvas.style.display = "none";
			$(QRCode).append(myImg);
			/*添加进页面*/
			$("body").append(modelBox);
			modelBox.click(function() {
				modelBox.remove();
			});
		},
		/*切换信号点位置*/
		switchPosition: function(data) {
			var self = this;
			var mac = data.devkey;
			var dom = $("circle[data-id='" + mac + "']");
			if(dom.length != 0) {
				/*角度*/
				var angle = Math.floor(Math.random() * 360);
				/*距离*/
				var rssi = Math.abs(parseInt(_isNull(data.rssi)));
				var l = rssi * self.space;
				/*x轴位置*/
				var x = Math.floor(self.coreWidth + l * Math.cos(angle * 3.14 / 180));
				/*y轴位置*/
				var y = Math.floor(self.coreHeight + l * Math.sin(angle * 3.14 / 180));
				/*改变位置*/
				dom.attr("cx", x);
				dom.attr("cy", y);
				if(dom.attr("data-click") == "on") {
					//					self.countPopupPosition(x, y);
				};
			};
		},
		/*从canvas提取图片*/
		convertCanvasToImage: function(canvas) {
			//新Image对象，可以理解为DOM
			var image = new Image();
			// canvas.toDataURL 返回的是一串Base64编码的URL，当然,浏览器自己肯定支持
			// 指定格式 PNG
			image.src = canvas.toDataURL("image/png");
			return image;
		},
		
		/*将画布中心到画布边界按比率等分*/
		countSpace: function(sx, sy, ex, ey, d) {
			var self = this;
			var r1 = self.calculation(sx, sy, ex, sy);
			var r2 = self.calculation(sx, sy, sx, ey);
			var r = r1 > r2 ? r2 : r1;
			return r / d;
		},
		/*计算两个点之间的距离*/
		calculation: function(x1, y1, x2, y2) {
			var xdiff = x2 - x1;
			var ydiff = y2 - y1;
			return Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5);
		},
		/*下方向键事件*/
		downIndex: function(index) {
			var len = $("#mylist").find("li").length;
			index = (index >= len - 1 ? 0 : index + 1);
			return index;
		},
		/*上方向键事件*/
		upIndex: function(index) {
			var len = $("#mylist").find("li").length;
			index = (index <= 0 ? len : index - 1);
			return index;
		},
		/*加载事件*/
		loadingEvent: function() {
			var self = this;
			if(self.dataArr_sta) {
				var arrs = self.dataArr_sta;
				if(arrs.length > self.$length) {
					self.$length += 50;
				}
			}
		},
		/*表格点击事件*/
		clickTrEvent: function(dom) {
			var self = this;
			var mac = dom.getAttribute("data-id");
			var circles = $("circle[data-id='" + mac + "'][data-type='signal']");
			if(circles.length == 0) {
				layer.alert("该信号点以超时");
			} else {
				circles.trigger("click");

			}
		}
	});
	win.leiDa = leiDa;
})(window, document, jQuery);
var oLD = new leiDa();

//判断值为null的时候，重新赋值
function _isNull(tmp) {
	if(!tmp && typeof(tmp) != "undefined" && tmp != 0) {
		return $.randNum(40, nIntensity);
	} else {
		return tmp;
	}
}

//判断值为NaN的时候，重新赋值
function _isNaN(n) {
	if(isNaN(n)) {
		return $.randNum(150, 300);
	} else {
		return n;
	}
}
//判断查询的入口为sta或者rf
if(sessionStorage.getItem('portType')) {
	if(sessionStorage.getItem('portType') == 'sta') {
		$(".article_abs_all_2").hide();
		$(".article_abs_all_1").show();
	} else {
		$(".article_abs_all_2").show();
		$(".article_abs_all_1").hide();
	}
} else {
	if(getQueryString('dtp') == "s") {
		$(".article_abs_all_2").hide();
		$(".article_abs_all_1").show();

	} else {
		$(".article_abs_all_2").show();
		$(".article_abs_all_1").hide();

	}
}

//js获取url中的参数值
function getQueryString(name) {
	var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	var r = window.location.search.substr(1).match(reg);
	if(r != null) {
		return unescape(r[2]);
	}
	return null;
}

//侧边栏鼠标悬菜单功能
$(".aside_li a").hover(
	function() {
		layer.tips(
			$(this).parent().attr("title"),
			$(this), {
				tips: [4, '#78BA32']
			}
		);
	},
	function() {
		layer.close();
	}
);

//判断手机或者pc
isMoblie(
	function() {
		//渲染状态
		$('.mainDataType-mobile').show();
		$('.mainDataType-pc').hide();

	},
	function() {
		//渲染状态		
		$('.mainDataType-mobile').hide();
		$('.mainDataType-pc').show();

		if(getQueryString('dtp') == 'r') {
			$('#selectId').parent().hide();
		}
	}
);
//判断数据类型：sta识别码，sta mac，rf
if(getQueryString('dtp') == "s") {
	if(getQueryString('dzkj')) {
		$('.mainDataType-mobile,.mainDataType-pc').text('(2.4g数据)');
		CssReset();
	} else {
		$('.mainDataType-mobile,.mainDataType-pc').text('(识别码数据)');
		$('.isNumber_div').hide();
		CssReset();
	}
	$("#SweepData").show();
	$("#RFData").hide();
} else {
	$('.mainDataType-mobile,.mainDataType-pc').text('(专属装置数据)');
	//	$('.isNumber_div').hide();
	CssReset();
	$("#SweepData").hide();
	$("#RFData").show();
}

//移动端.mainDataType-mobile样式重新渲染
function CssReset() {
	$('.mainDataType-mobile').css({
		"float": "left",
		"marginRight": 0,
		"marginLeft": "20px"
	});
}

//离线五分钟后递减信号点,总数慢慢置零，直至再次链接
function decreaseFn() {
	signalLen = $("#mySVG circle").length;
	if(getQueryString('dtp') == "s") {
		$("#currentPop").text(signalLen);
		($("#currentPop").text() == 0) && clearTimeout(desTimer);
	} else if(getQueryString('dtp') == "r") {
		$("#findSig").text(signalLen);
		($("#findSig").text() == 0) && clearTimeout(desTimer);
	}
	desTimer = setTimeout(decreaseFn, 3000);
}

//定时器监听雷达界面信号超时清除和切换状态
function onloadTimers() {
	//信号切换状态定时器函数
	cutStateTimer = setInterval(
		function() {
			if(nServerT > 0) {
				nServerT += 2;
				//从数组入手切换信号状态和删除信号状态
				optionSgin();
			}
			//断网就停止动画
			!netStatue && cancelAnimationFrame(gAnimate);
			//断开链接情况下，信号为0，清除定时器
			(bWsState == false && $('#mySVG circle').length == 0) && clearInterval(cutStateTimer);
		},
		2000
	);

}
//信号强度返回值,计算为百分比
function backRssi(str) {
	var rssi = Math.abs(parseInt(_isNull(str)));
	if(rssi == 0) {
		return 100;
	} else if(rssi > 0 && rssi < nIntensity) {
		return Math.ceil((nIntensity - rssi) / 127 * 100);
	} else if(rssi == nIntensity) {
		return 0;
	}
}

/**
 * yyyy-mm-dd hh-mm-ss标准日期格式转换时间戳格式
 * @param {String} s yyyy-mm-dd hh-mm-ss标准日期格式
 * return {Number}
 * */
function dateTransverter(s) {
	if(s) {
		var date = new Date(s.replace(/-/g, '/'));
		return Date.parse(date) / 1000;
	}
}

//从数组入手切换信号状态和删除信号状态
function optionSgin() {
	if(getQueryString('dtp') == "s") {
		for(var k in oLD.dataArr_sta) {
			oLD.dataArr_sta[k].delTime -= 2;
			if(Math.abs(nServerT - dateTransverter(oLD.dataArr_sta[k].time)) >= nOverTime) {
				oLD.dataArr_sta[k].timeout = true;
				$('#mySVG circle[data-id="' + oLD.dataArr_sta[k].devkey + '"]').attr('fill', color_sta_2);
			} else if(Math.abs(nServerT - dateTransverter(oLD.dataArr_sta[k].time)) < nOverTime) {
				oLD.dataArr_sta[k].timeout = false;
				$('#mySVG circle[data-id="' + oLD.dataArr_sta[k].devkey + '"]').attr('fill', color_sta_1);
			}
			if(Math.abs(nServerT - dateTransverter(oLD.dataArr_sta[k].time)) >= nDelTime) {
				oLD.dataArr_sta[k].show = false;
				$('#mySVG circle[data-id="' + oLD.dataArr_sta[k].devkey + '"]').remove();
				oLD.dataArr_sta.splice(k, 1);
			} else if(oLD.dataArr_sta.length > 999) {
				oLD.dataArr_sta.splice(k, 1);
				$('#mySVG circle[data-id="' + oLD.dataArr_sta[k].devkey + '"]').remove();
			}

		}
		$('#currentPop').text(oLD.dataArr_sta.length);
		//		console.log("sta：" + oLD.dataArr_sta.length + "，信号点：" + $('#mySVG circle').length+ '表格长度：'+$('#sta_table tbody tr').length);	
	} else if(getQueryString('dtp') == "r") {
		for(var k in oLD.dataArr_rf) {
			if(Math.abs(nServerT - dateTransverter(oLD.dataArr_rf[k].time)) >= nDelTime2) {
				$('#mySVG circle[data-id="' + oLD.dataArr_rf[k].devkey + '"]').remove();
				oLD.dataArr_rf.splice(k, 1);
			}
			if(oLD.dataArr_rf.length > 999) {
				oLD.dataArr_rf.splice(k, 1);
				$('#mySVG circle[data-id="' + oLD.dataArr_rf[k].devkey + '"]').remove();
			}
		}
		$('#findSig').text(oLD.dataArr_rf.length);
		//		console.log("rf："+oLD.dataArr_rf.length+ "，信号点：" + $('#mySVG circle').length + '表格长度：'+$('#rf_table tbody tr').length);

	}

}

//渲染rf数据表格函数
function writeTr(arr, container) {
	//rf
	($('#rf_table tbody tr').length >= 100) && container.html("");
	if(getQueryString('dtp') == "r") {
		var trs = "";
		for(var k in arr) {
			if(arr[k].urgentStatus == 1) {
				var urgentStatusStr = "<td class='error'>紧急</td>";
				$(".rfCrit").addClass('borderAnimate');
				//处理紧急数据
				$(".rfCrit").on("click", function() {
					$("#urgencyModal").modal('show');
					urgencyTableFn(oLD.dataArr_rf, $('.urgencyTable'));
				});
			} else {
				var urgentStatusStr = "<td class='succ'>正常</td>";
			};
			trs += "<tr data-id='" + arr[k].devkey + "' data-name='rf' class='" + (arr[k].trFind == true ? "trFind" : "noFind") + "'>" +
				"<td>" + arr[k].time + "</td>" +
				"<td>" + arr[k].devkey + "</td>" +
				"<td>" + (backRssi(arr[k].rssi) * 1 > 100 ? 100 : backRssi(arr[k].rssi)) + " %</td>" +
				urgentStatusStr + "</tr>";
		}
		container.html(trs);

		var sTr = $("#rf_table tbody tr.trFind").clone();
		$("#rf_table tbody tr.trFind").remove();
		$("#rf_table tbody").prepend(sTr);
	}

}

/*
 渲染紧急事件表格
 arr紧急数据数组
 container紧急数据表格
 * */
function urgencyTableFn(arr, container) {
	if(getQueryString('dtp') == "r" && arr.length > 0) {
		container.children('tbody').html("");
		$.each(arr, function(i, v) {
			if(v.urgentStatus == 1) {
				sTr = '<tr >' +
					'<td class="hidden-xs">' + v.time + '</td>' +
					'<td class="urgencyDevkey">' + v.devkey + '</td>' +
					'<td>' +
					'<button type="button" class="btn btn-success btn-todo btn-xs">处理</button>' +
					//					  '<button type="button" class="btn btn-default btn-nodo btn-xs">忽略</button>'+
					'</td>' +
					'</tr>';
				container.children('tbody').append($(sTr));
			}

		});
	}

}

//处理紧急数据函数
$('body').delegate('.btn-todo', 'click', function() {
	var _this = $(this);
	var sDevkey = $(this).parent().siblings('.urgencyDevkey').text();
	fnAjax.method_4(
		//		localStorage.getItem("ajaxIp"),
		getQueryString("ajaxIp"), {
			"do": "setugtstop",
			"tbmac": $('#deviceName').text(),
			"devmac": sDevkey
		},
		'get',
		function(data) {
			if(data.ResultCode == 'SUCCESS') {
				for(var k in oLD.dataArr_rf) {
					(oLD.dataArr_rf[k].devkey == sDevkey) && (oLD.dataArr_rf[k].urgentStatus = 0)
				}
				_this.parents('tr').remove();
				$('#mySVG circle').each(function(i) {
					($(this).attr("data-id") == sDevkey) && $(this).attr('fill', color_rf_1);
				});
				layer.msg("id为" + sDevkey + "的专属装置的紧急事件，被探霸" + $('#deviceName').text() + "处理了！", {
					time: 3000
				});
				if($('.urgencyTable tbody tr').length == 0) {
					$(".rfCrit").removeClass('borderAnimate');
					$('#urgencyModal').modal('hide');
				}

			} else {
				layer.alert('参数报错');
			}

		}
	);
});

//忽略紧急数据函数
//$('body').delegate('.btn-nodo','click',function(){
//	$(this).parents('tr').remove();
//});

//模糊搜索高亮
$('#isNumber').keyup(function(event) {
	var _this = $(this);
	$.debounce(function() { //延时加载
		if(getQueryString('dtp') == "s") {
			$("#sta_table tbody tr td:contains(" + _this.val() + ")").parent().addClass("trFind").siblings().removeClass("trFind");
			for(var nKey in oLD.dataArr_sta) {
				if(oLD.dataArr_sta[nKey].devkey == _this.val()) {
					oLD.dataArr_sta[nKey].trFind = true;
				} else {
					oLD.dataArr_sta[nKey].trFind = false;
				}
			}
			var sTr = $("#sta_table tbody tr.trFind").clone();
			$("#sta_table tbody tr.trFind").remove();
			$("#sta_table tbody").prepend(sTr);
		} else if(getQueryString('dtp') == "r") {
			$("#rf_table tbody tr td:contains(" + _this.val() + ")").parent().addClass("trFind").siblings().removeClass("trFind");
			for(var nKey in oLD.dataArr_rf) {
				if(oLD.dataArr_rf[nKey].devkey == _this.val()) {
					oLD.dataArr_rf[nKey].trFind = true;
				} else {
					oLD.dataArr_rf[nKey].trFind = false;
				}
			}
			var sTr = $("#rf_table tbody tr.trFind").clone();
			$("#rf_table tbody tr.trFind").remove();
			$("#rf_table tbody").prepend(sTr);
		}

	}, 1000);
});
//复制粘贴模拟键盘事件
$('#isNumber').on("paste", function() {
	$('#isNumber').trigger('keyup');
});

//每半个钟刷新一次
var pageReloadT = setTimeout(function() {
	location.reload();
}, 1000 * 60 * 30);
$('#isNumber').focus(function() {
	clearTimeout(pageReloadT);
	var pageReloadT = setTimeout(function() {
		location.reload();
	}, 1000 * 60 * 30);
});

sessionStorage.setItem('deviceid', $("#deviceName").text());

//监听查询按钮事件，查询mac信息
$("#isSelect").click(function() {
	searchMAC();
});

//监听页面enter键盘事件，查询mac信息
document.onkeydown = function(event) {
	var e = event || window.event || arguments.callee.caller.arguments[0];
	if(e && e.keyCode == 13) {
		if($('#isNumber').val() == "") {
			return false;
		} else {
			searchMAC();
		}

	}
};

//搜索电子设备mac，查看该mac的相关数据
function searchMAC() {
	var v = $('#isNumber').val();
	v = v.toLowerCase();
	if(v.replace(/^\s+|\s+$/g, '') == '') {
		layer.alert('请输入电子设备mac');
	} else {
		sessionStorage.setItem('devMAC', v);
		if(getQueryString('dtp') == "r") {
			sessionStorage.setItem('devtype', 'a002');
		} else if(getQueryString('dtp') == "s") {
			sessionStorage.setItem('devtype', 'a001');
		}
		window.location.href = "search.html?" + "&ajaxIp=" + getQueryString("ajaxIp") + "&wsIp=" + getQueryString("wsip");
	}
}

//js获取url中的参数值
function getQueryString(name) {
	var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	var r = window.location.search.substr(1).match(reg);
	if(r != null) {
		return unescape(r[2]);
	}
	return null;
}