(function(win, doc, $) {
	function leiDa(options) {
		this._init(options);
		// requestAnimationFrame的向下兼容处理
		if(!win.requestAnimationFrame) {
			win.requestAnimationFrame = function(fn) {
				setTimeout(fn, 25);
			};
		}
	};
	$.extend(leiDa.prototype, {
		_init: function(options) {
			var self = this;
			self.options = {
				/*设备输入框*/
				textInput: "#isNumber",
				/*搜索按钮*/
				selBtn: "#isSelect",
				/*时间限制下拉框*/
				//timeSel: "#timeLimit",
				/*画布1：线圈、十字、圆心、动态*/
				canvas1: "#myCanvas1",
				/*画布2: 信号*/
				canvas2: "#mySVG",
				/*查询状态栏*/
				queryState: "#queryState",
				/*运行模式切换*/
				runModel: "#runModel",
				/*STA数据表格*/
				staTable: "#sta_table",
				/*RF数据表格*/
				rfTabel: "#rf_table",
				/*信息提示框*/
				fixedBox: "#fixedBox"
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
			/*搜索按钮对象*/
			self.$selBtn = $(opts.selBtn);
			/*时间限制下拉框对象*/
			//self.$timeSel = $(opts.timeSel);
			/*画布1对象*/
			self.$can1 = $(opts.canvas1)[0];
			self.ctx1 = self.$can1.getContext("2d");
			/*画布2对象*/
			self.$can2 = $(opts.canvas2)[0];
			//self.ctx2 = self.$can2.getContext("2d");
			/*查询状态栏对象*/
			self.$queryState = $(opts.queryState);
			/*运行模式对象*/
			self.$runModel = $(opts.runModel);
			/*STA表格对象*/
			self.$staTable = $(opts.staTable);
			/*RF表格对象*/
			self.$rfTabel = $(opts.rfTabel);
			/*信息提示框*/
			self.$fixedBox = $(opts.fixedBox);
			/*初始化事件绑定*/
			self._initDomBindEvent();
			/*初始化调整事件*/
			self.initadjustEvent();
			/*动画计时器*/
			self.lastTime = Date.now();
			self.deltaTime = 0;
			self.animationTimer();
			/*页面打开检查地址栏ID*/
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
			/*查询按钮事件绑定*/
			self.$selBtn.click(function(e) {
				e.preventDefault();
				self.editSearchParam();
			});
			/*输入框模糊查询事件绑定*/
			self.$textInput.on("keyup", function(event) {
				var value = $(this).val();
				if(value.length > 3 && value.length <= 18) {
					self.assignTask(value);
				};
				if(value.length <= 3) {
					$("#mylist").empty(); //清空
				};
				//回车按键
				if(event.which == 13) {
					self.editSearchParam();
				};
			});
			/*懒加载事件绑定*/
			$(".section_table").scroll(function() {
				var divHeight = $(this).height();
				var nScrollHeight = $(this)[0].scrollHeight;
				var nScrollTop = $(this)[0].scrollTop;
				if(nScrollTop + divHeight >= nScrollHeight) {
					self.loadingEvent();
				};
			});
			/*键盘操控事件*/
			$(document).on("keydown", function(event) {
				if($("#mylist").css("display") == "block") {
					var len = $("#mylist").find("li").length;
					if(flag) {
						var tmpTime = new Date;
						var fn = function(x) {
							if(x) {
								flag = true;
								return false;
							}
							if(event.which == 38) {
								$("#isNumber").blur();
								index = self.upIndex(index);
								for(var i = 0; i < len; i++) {
									$("#mylist").find("li")[i].className = (i == index ? "hover" : "");
								}
							}
							if(event.which == 40) {
								$("#isNumber").blur();
								index = self.downIndex(index);
								for(var i = 0; i < len; i++) {
									$("#mylist").find("li")[i].className = (i == index ? "hover" : "");
								}
							}
							if(event.which == 13) {
								var value = $("#mylist").find("li.hover").html();
								self.$textInput.val(value);
								self.editSearchParam();
							}
						}
						if(times && tmpTime - times < 100) { //100 ms
							setTimeout(function() {
								fn(true);
							}, 150);
							flag = false;
						} else {
							fn();
						}
						times = tmpTime;
					}
				}
			});
			/*运行模式切换事件绑定*/
			self.$runModel.click(function(e) {
				e.preventDefault();
				self.runModelEvent($(this));
			});
			/*Tab数据切换事件绑定*/
			$(".radar_ui").find("li").click(function() {
				var str = $(this).attr("data-id");
				if(str == "SweepData") {
					$(".article_abs_all_1").show();
					$(".article_abs_all_2").hide();
					self.commandSendingEvent("end2");
					self.commandSendingEvent("data");
				} else if(str == "RFData") {
					$(".article_abs_all_1").hide();
					$(".article_abs_all_2").show();
					self.commandSendingEvent("end");
					self.commandSendingEvent("data2");
				}
			});
			/*生成二维码*/
			$("#qrcode,#QRCode").click(function(e) {
				e.preventDefault();
				self.generateQRCodeEvent();
			});
			/*表格点击事件绑定*/
			self.$staTable.on("click", "tr", function(e) {
				e.stopPropagation();
				$(this).addClass("active");
				self.clickTrEvent(this);
			});
			self.$rfTabel.on("click", "tr", function(e) {
				e.stopPropagation();
				self.clickTrEvent(this);
			});
		},
		/**
		 * webSocket请求封装
		 * @param url 接口分支
		 * @param param 请求参数
		 * @param fn 接收回调
		 */
		webSocketEvent: function(url, param, fn) {
			if("WebSocket" in win) {
				var ws = new ReconnectingWebSocket(url);
				ws.onopen = function() {
					// Web Socket 已连接上，使用 send() 方法发送数据
					ws.send(JSON.stringify(param));
				};
				ws.onmessage = function(res) {
					fn(res.data);
				};
				ws.onclose = function() {
					// 关闭 websocket
					/*ws.close();*/
					console.log("连接已关闭...");
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
			self.space = self.countSpace(self.coreWidth, self.coreHeight, (self.canWidth - 10), (self.canHeight - 10), 100);
			/*初始化画布1数据*/
			self.initCanvas1();
		},
		/*动画计时器事件*/
		animationTimer: function() {
			var self = this;
			win.requestAnimationFrame(self.animationTimer.bind(this));
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
			var self = this;
			self.ctx1.fillStyle = "rgba(0,0,0,0.03)";
			self.ctx1.fillRect(0, 0, self.canWidth, self.canHeight);
			self.ctx1.strokeStyle = "rgba(0,255,0,0.2)";
			//声波
			self.ctx1.lineWidth = 1;
			for(var k = 0; k < 5; k++) {
				self.ctx1.beginPath();
				self.ctx1.arc(self.coreWidth, self.coreHeight, self.can1.r1 + k, 0, Math.PI * 2);
				self.ctx1.closePath();
				self.ctx1.stroke();
				self.ctx1.beginPath();
				if(!self.can1.bFirst)
					self.ctx1.arc(self.coreWidth, self.coreHeight, self.can1.r2 + k, 0, Math.PI * 2);
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
			};
			self.ctx1.rotate(self.can1.angle * Math.PI / 180);
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
		/*地址栏参数转换*/
		toQueryParams: function() {
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
		},
		/*运行模式事件*/
		runModelEvent: function(dom) {
			var self = this;
			var str = dom.html();
			if(str == "实时") {
				dom.html("性能");
				self.modelStatus = false;
			} else {
				dom.html("实时");
				self.modelStatus = true;
			};
		},
		/*模糊查询Ajax*/
		assignTask: function(did) {
			var self = this;
			$("#mylist").empty(); //清空
			$.ajax({
				url: "http://tan.qhs.cc/Autocomplete/index?query=" + did,
				type: "Get",
				error: function() {},
				success: function(data) {
					var data = JSON.parse(data);
					if(data != null && data.length != 0) {
						var lis = "";
						$.each(data, function(i, v) {
							lis += '<li>' + v.value + '</li>';
						});
						$("#mylist").html(lis).show();
					} else {
						$("#mylist").html("").hide();
					}
					$("#mylist").on("click", "li", function(e) {
						e.preventDefault();
						self.$textInput.val($(this).html());
						$("#mylist").hide();
						self.editSearchParam();
					});
				}
			});
		},
		/*初始监视地址栏是否有ID*/
		monitorSearchEvent: function() {
			var self = this;
			var obj = self.toQueryParams.call(location.search);
			if(obj.id != undefined) {
				var getDeviceID = obj.id.toUpperCase();
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
				location.search = "?id=" + value + a + b;
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
				} else {
					var wskUrl = "ws://123.58.43.17:9506";
				}
			};
			//var wskUrl = uip || "ws://103.251.36.122:9509";
			/*存放接收的数据对象*/
			self.dataArr_sta = [];
			self.dataArr_rf = [];
			/*规定渲染条数*/
			self.$length = 100;
			/*存放数据总条数*/
			self.$total = 0;
			/*运行模式状态*/
			self.modelStatus = true;
			self.runStaEvent = true;
			self.runRfEvent = true;
			/*查询是否在线命令*/
			var online = {
				type: "online",
				device: did
			};
			self.$queryState.stop().slideDown().html("<i class='glyphicon glyphicon-refresh'></i> 正在查询ID为：" + did + " 设备...");
			/*建立websocke连接:sta*/
			self.ws = self.webSocketEvent(wskUrl, online, function(res) {
				var msg = JSON.parse(res);
				if(msg.type == "online") {
					if(msg.data.length <= 0) {
						self.$queryState.stop().slideDown().html("<i class='glyphicon glyphicon-remove'></i> 未检测到相关设备!");
					} else {
						if(msg.data.status == 0) {
							self.$queryState.stop().slideDown().html("<i class='glyphicon glyphicon-remove'></i> 设备已断开...!");
						} else {
							$(".section_table_error").hide();
							self.$queryState.stop().slideUp().html("<i class='glyphicon glyphicon-remove'></i> 数据接收中...");
							$("#deviceName").html(did);
							/*如果在线继续发送接收历史命令*/
							self.commandSendingEvent("his", did);
						};
					};
				};
				/*接收数据总数 */
				if(msg.type == "historylist") {
					self.$total = msg.total;
				}
				/*历史数据处理*/
				if(msg.type == "history") {
					var hisdata = JSON.parse(msg.data);
					self.staDataHandle(hisdata);
				};
				/*接收到“历史结束”的命令则发送是数据请求*/
				if(msg.type == "historyend") {
					self.commandSendingEvent("data", did);
				};
				/*接收数据分类*/
				if(msg.type == "Data") {
					var data = msg.data;
					if(data.type == "a001") {
						/*STA数据处理*/
						self.staDataHandle(data);
					};
					if(data.type == "a002") {
						/*RF数据处理*/
						self.rfDataHandle(data);
					};
				};
			});
		},
		/*ws数据命令发送*/
		commandSendingEvent: function(order, did) {
			var self = this;
			/*如果没有ID则自动从地址栏获取*/
			if(did == undefined) {
				var obj = self.toQueryParams.call(location.search);
				var did = obj.id.toUpperCase();
			};
			//命令参数
			var his = {
				type: "history",
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
				device: did,
				total: self.$total
			};
			var end2 = {
				type: "dataEnd",
				datatype: "a002",
				device: did,
				total: self.$total
			};
			if(order == "his") {
				/*发送历史查询命令*/
				self.ws.send(JSON.stringify(his));
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
				self.$queryState.stop().slideDown().html("<i class='glyphicon glyphicon-remove'></i> 数据连接已断开...!");
			};
		},
		/*sta数据处理*/
		staDataHandle: function(data) {
			var self = this;
			if(data.find == false) {
				return false;
			};
			var keys = data.devkey;
			var maxShow = self.$length;
			/*初次没有数据之间导入*/
			var bool = true;
			var i = 0;
			if(self.dataArr_sta.length > 0) {
				/*检测储存数中是否有相同设备*/
				for(i; i < self.dataArr_sta.length; i++) {
					if(self.dataArr_sta[i].devkey == keys) {
						/*是否更新角度:如果再次获取的强度相差在5%内不改变角度*/
						var differ = Math.abs(self.dataArr_sta[i].rssi) - Math.abs(data.rssi);
						if(Math.abs(differ) > 5) {
							data.angle = Math.floor(Math.random() * 360);
							self.switchPosition(data);
						} else {
							data.angle = self.dataArr_sta[i].rssi;
						};
						data.history = 0;
						data.show = true;
						data.delTime = 300;
						/*删除旧信息*/
						self.dataArr_sta.splice(i, 1);
						/*更新信息*/
						self.dataArr_sta.unshift(data);
						/*不新增*/
						bool = false;
						/*断循环*/
						break;
					}
				};
			};
			if(bool) {
				data.delTime = 300;
				data.timers = (function() {
					var timers = setInterval(function() {
						if(self.dataArr_sta[i] != undefined) {
							self.dataArr_sta[i].delTime -= 1;
							/*时间经过150秒视为过期*/
							if(self.dataArr_sta[i].delTime <= 150) {
								self.dataArr_sta[i].timeOut = true;
								self.changeSignalState(self.dataArr_sta[i].devkey, "timeOut", true);
							} else {
								self.dataArr_sta[i].timeOut = false;
								self.changeSignalState(self.dataArr_sta[i].devkey, "timeOut", false);
							};
							/*时间经过300秒视为超时*/
							if(self.dataArr_sta[i].timeOut == true && self.dataArr_sta[i].delTime <= 0) {
								self.dataArr_sta[i].show = false;
								/*切换SVG点的状态*/
								self.changeSignalState(self.dataArr_sta[i].devkey, "del", true);
								clearInterval(timers);
								self.dataArr_sta.splice(i, 1);
								/*总数-1*/
								self.$total = parseInt(self.$total) - 1;
							} else if(self.dataArr_sta.length > 999) {
								/*切换SVG点的状态*/
								self.changeSignalState(self.dataArr_sta[i].devkey, "del", true);
								/*如果该数据超时，且本地存储数量过多，则该删除数据*/
								clearInterval(timers);
								self.dataArr_sta.splice(i, 1);
								/*总数-1*/
								self.$total = parseInt(self.$total) - 1;
							}
						};
					}, 1000);
				})();
				if(data.history == 1) {
					/*历史数据顺序调整*/
					data.delTime = 149;
					data.rssi = Math.floor(Math.random() * (100 - 40 + 1) + 40);
					self.dataArr_sta.push(data);
				} else {
					/*新增的标识*/
					data.history = 0;
					self.dataArr_sta.unshift(data);
					/*总数+1*/
					self.$total = parseInt(self.$total) + 1;
				}
			};
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
			/*数据渲染事件*/
			if(self.dataArr_sta.length > maxShow) {
				self.staDataRenderEvent(maxShow);
				/*更多数据提示*/
				$(".section_table_error").html("<p class='status'><i class='glyphicon glyphicon-download'></i> 加载更多数据</p>").show();
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
				var rssi = Math.abs(parseInt(arrs[i].rssi));
				if(rssi > 100) {
					var Intensity = 0;
				} else {
					var Intensity = 100 - rssi;
				};
				tds = "<td>" + arrs[i].time + "</td>" +
					"<td>" + arrs[i].dv_brand + "</td>" +
					"<td>" + arrs[i].devkey + "</td>" +
					"<td>" + Intensity + " %</td>" +
					"<td>" + arrs[i].find + "</td>";
				/*如果是历史数据修改样式*/
				if(arrs[i].history == 1) {
					trs += "<tr class='oldData' data-id='" + arrs[i].devkey + "'>" + tds + "</tr>";
				} else {
					trs += "<tr data-id='" + arrs[i].devkey + "'>" + tds + "</tr>";
				}
			};
			/*渲染表格*/
			self.$staTable.children("tbody").html(trs);
			/*表格区的数字*/
			$("#currentPop").html(arrs.length);
			$("#currentPop_five").html(self.$total);
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
						signal.setAttribute("cx", arrs[i].x);
						signal.setAttribute("cy", arrs[i].y);
						signal.setAttribute("r", 3);
						signal.setAttribute("data-type", "signal");
						signal.setAttribute("data-name", "sta");
						signal.setAttribute("data-click", "off");
						signal.setAttribute("data-id", arrs[i].devkey);
						if(arrs[i].timeOut == true) {
							signal.setAttribute("fill", "#999999");
						} else {
							signal.setAttribute("fill", "#ffee00");
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
					dom.attr("fill", "#999999");
				} else {
					dom.attr("fill", "#ffee00");
				}
			};
			if(action == "del") {
				if(state) {
					var dom = $("circle[data-id='" + id + "']");
					if(dom.attr("data-click") == "on" || dom.attr("data-name") == "rf") {
						self.$fixedBox.find(".content").html("");
						self.$fixedBox.hide();
					};
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
				bo.setAttribute("fill", "#00dbdb");
			} else {
				bo.setAttribute("fill", "#ffee00");
			};
			bo.setAttribute("data-type", "bo");
			bo.setAttribute("data-id", d);
			self.$can2.appendChild(bo);
			/*声波动画*/
			var fd = self.create("animate");
			fd.setAttribute("attributeType", "XML");
			fd.setAttribute("attributeName", "r");
			fd.setAttribute("from", 0);
			fd.setAttribute("to", 12);
			fd.setAttribute("dur", "1s");
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
			/*信息提示框*/
			var onoff = opt.getAttribute("data-click");
			if(onoff == "on") {
				self.$fixedBox.find(".content").html(d);
				self.countPopupPosition(x, y);
			} else {
				self.$fixedBox.find(".content").html("");
				self.$fixedBox.hide();
			}
		},
		/*RF数据处理*/
		rfDataHandle: function(data) {
			var self = this;
			var keys = data.devkey;
			/*初次没有数据之间导入*/
			var bool = true;
			var i = 0;
			if(self.dataArr_rf.length > 0) {
				/*检测储存数中是否有相同设备*/
				for(i; i < self.dataArr_rf.length; i++) {
					if(self.dataArr_rf[i].devkey == keys) {
						/*是否更新角度:如果再次获取的强度相差在5%内不改变角度*/
						var differ = Math.abs(self.dataArr_rf[i].rssi) - Math.abs(data.rssi);
						if(Math.abs(differ) > 5) {
							self.dataArr_rf[i].angle = Math.floor(Math.random() * 360);
							self.switchPosition(data);
						}
						/*更新信息*/
						self.dataArr_rf[i].delTime = 30
						self.dataArr_rf[i].time = data.time;
						self.dataArr_rf.unshift(self.dataArr_rf[i]);
						self.dataArr_rf.splice(i + 1, 1);
						/*不新增*/
						bool = false;
						/*断循环*/
						break;
					}
				};
			};
			if(bool) {
				data.delTime = 30;
				data.timers = (function() {
					var timers = setInterval(function() {
						if(self.dataArr_rf[i] != undefined) {
							self.dataArr_rf[i].delTime -= 1;
							/*时间经过30秒视为过期*/
							if(self.dataArr_rf[i].delTime <= 0) {
								clearInterval(timers);
								/*切换SVG点的状态*/
								self.changeSignalState(self.dataArr_rf[i].devkey, "del", true);
								self.dataArr_rf.splice(i, 1);
							};
						};
					}, 1000);
					/*表格数据过多,删除最早的数据*/
					var _tbody = self.$rfTabel.children("tbody tr");
					var trLegth = _tbody.length;
					if(trLegth > 300) {
						_tbody.last().remove();
					};
				})();
				if(data.history == 1) {
					/*历史数据顺序调整*/
					self.dataArr_rf.push(data);
				} else {
					/*新增的标识*/
					self.dataArr_rf.unshift(data);
				}
			};
			/*性能模式下，渲染完成之前不再次加载*/
			if(self.modelStatus == false && self.runRfEvent == false) {
				return false;
			};
			self.runRfEvent = false;
			win.setTimeout(function() {
				self.runRfEvent = true;
			}, 1000);
			/*数据渲染事件*/
			self.rfDataRenderEvent();
			/*初始化信号点*/
			self.initRFSignal();
			self.runRfEvent = true;
		},
		/*rf数据渲染事件*/
		rfDataRenderEvent: function() {
			var self = this;
			var arrs = self.dataArr_rf;
			var trs = "";
			for(var i = 0; i < arrs.length; i++) {
				/*接收到的rssi超过-100时，强制视为-100*/
				var rssi = Math.abs(parseInt(arrs[i].rssi));
				if(rssi > 100) {
					var Intensity = 0;
				} else {
					var Intensity = 100 - rssi;
				};
				/*监视设备状态*/
				if(arrs[i].urgentStatus == 1) {
					var urgentStatusStr = "<td class='error'>紧急</td>";
				} else {
					var urgentStatusStr = "<td class='succ'>正常</td>";
				};
				trs = "<tr data-id='" + arrs[i].devkey + "' data-name='rf'>" +
					"<td>" + arrs[i].time + "</td>" +
					"<td>" + arrs[i].devkey + "</td>" +
					"<td>" + Intensity + " %</td>" +
					urgentStatusStr + "</tr>";
			};
			/*渲染表格*/
			self.$rfTabel.children("tbody").prepend(trs);
			/*修改统计数量*/
			$("#findSig").html(arrs.length);
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
				for(var i = 0; i < arrs.length; i++) {
					if(arrs[i].exist == false) {
						var signal = self.create("circle");
						signal.setAttribute("cx", arrs[i].x);
						signal.setAttribute("cy", arrs[i].y);
						signal.setAttribute("r", 3);
						signal.setAttribute("data-type", "signal");
						signal.setAttribute("data-name", "rf");
						signal.setAttribute("data-click", "off");
						signal.setAttribute("data-id", arrs[i].devkey);
						if(arrs[i].urgentStatus == 1) {
							signal.setAttribute("fill", "#ee0000");
						} else {
							signal.setAttribute("fill", "#00dbdb");
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
				var rssi = Math.abs(parseInt(data.rssi));
				var l = rssi * self.space;
				/*x轴位置*/
				var x = Math.floor(self.coreWidth + l * Math.cos(angle * 3.14 / 180));
				/*y轴位置*/
				var y = Math.floor(self.coreHeight + l * Math.sin(angle * 3.14 / 180));
				/*改变位置*/
				dom.attr("cx", x);
				dom.attr("cy", y);
				if(dom.attr("data-click") == "on") {
					self.countPopupPosition(x, y);
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
		/*计算弹出框位置*/
		countPopupPosition: function(tx, ty) {
			var self = this;
			var canx = Math.round(self.canWidth / 3);
			var cany = Math.round(self.canHeight / 2);
			var width = parseInt(self.$fixedBox.css("width"));
			tx = parseInt(tx);
			ty = parseInt(ty);
			if(tx < canx) {
				var x = tx + 14;
				var y = ty - 11;
				var d = "left";
			} else if(tx > canx * 2) {
				var x = tx - width - 14;
				var y = ty - 11;
				var d = "right";
			} else if(ty < cany) {
				var x = tx - (width / 2);
				var y = ty + 14;
				var d = "top";
			} else {
				var x = tx - (width / 2);
				var y = ty - 37;
				var d = "bottom";
			}
			self.$fixedBox.css("left", x + "px");
			self.$fixedBox.css("top", y + "px");
			self.$fixedBox.find(".arrow").attr("class", "arrow " + d);
			self.$fixedBox.show();
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
				alert("该信号点以超时");
			} else {
				circles.trigger("click");
			}
		}
	});
	win.leiDa = leiDa;
})(window, document, jQuery);
new leiDa();