//默认ajax服务器
var serverParam = {
	"name":"数据服务器配置文档",
	"data":[
	        {
	        	"name":"16服务器",
	        	"wsIp":"123.58.43.16",
	        	"wsPort":"9501",
	        	"ajaxIp":"123.58.43.16",
	        	"ajaxPort":"9506"
	        },
	        {
	        	"name":"122服务器",
	        	"wsIp":"103.251.36.122",
	        	"wsPort":"9501",
	        	"ajaxIp":"103.251.36.122",
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

/**
 * 探霸管理首页函数配置
 * @method jumpPageEvent 设备列表-跳转雷达页面事件绑定
 * @method webSocketEvent webSocket请求
 * @method initWebSocketSrc 初始化WS地址
 * @method getOnlineDeviceList 获取在线设备列表
 * @method getData 向ws请求发送数据
 * @method queryCriteria 返回是否渲染数据表格的状态
 * @method suspendReception 暂停接收数据事件
 * */
(function(win, doc, $) {
	function dataPage(options) {
		this._init(options);
	}
	$.extend(dataPage.prototype, {
		_init: function(options) {
			var self = this;
			self.options = {
				deviceUl: ".device-ul", //设备列表
				repeat: "#repeat", //刷新按钮
				wifiFBtn: "#filter-btn", //过滤按钮
				wifiTable: "#data_table", //表格
				stopBtn: "#stop_btn", //暂停按钮
				serverSrcBtn: "#serverSrcBtn", //服务器地址修改按钮
				onlineTotal: "#online-total" //当前在线数量
			};
			self.wsArr = new Array;
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
			//webSocket地址
			self.initWebSocketSrc();
			//设备列表对象
			self.$deviceUl = $(opts.deviceUl);
			//刷新按钮对象
			self.$repeat = $(opts.repeat);
			//过滤按钮对象
			self.$wifiFBtn = $(opts.wifiFBtn);
			//表格对象
			self.$wifiTable = $(opts.wifiTable);
			//暂停按钮
			self.$stopBtn = $(opts.stopBtn);
			//当前在线对象
			self.$onlineTotal = $(opts.onlineTotal);
			//服务器地址修改按钮对象
			self.$serverSrcBtn = $(opts.serverSrcBtn);
			/*接收状态*/
			self.$stopRun = true;
			/*初始化*/
			self._initDomBindEvent();
			// 判断websocket连接成功的变量
			self.star = true;
			/*获取在线列表*/
			self.getOnlineDeviceList();
		},
		/**
		 * 初始化DOM绑定事件
		 * @return {[Object]} [this]
		 * */
		_initDomBindEvent: function() {
			var self = this;
			//点击输入框取消过滤事件绑定
			$(".queryCriteriaInput").focus(function(e) {
				e.preventDefault();
				$(this).siblings("#filter-btn").removeClass("active");
			});
			//过滤事件绑定
			self.$wifiFBtn.click(function(e) {
				e.preventDefault();
				$(this).toggleClass("active");
			});
			//设备列表-设备详情点击事件绑定
//			self.$deviceUl.on("dblclick", "li", function() {
//				self.listClickEvnt(this);
//			});
			//设备列表-跳转雷达页面事件绑定
			self.$deviceUl.on("click", ".device-li-leida", function(e) {
				e.stopPropagation();
				self.jumpPageEvent(this);
			});
			//选择tr样式
			$(".table-box table tbody").on("click", "tr", function() {
				$(this).toggleClass("click");
			});
			//刷新状态事件绑定
			self.$repeat.click(function(e) {
				e.preventDefault();
				layer.confirm('刷新会清除所有数据!', {
					btn: ['确定', '取消'] //按钮
				}, function() {
					for(var key in self.wsArr) {
						self.wsArr[key].close();
					}
					/*刷新页面*/
					window.location.reload(true);
				})
			});
			//服务器修改地址按钮事件绑定
			self.$serverSrcBtn.click(function(e) {
				e.preventDefault();
				// self.severSrcChangEvent();
                //将当前数据服务器地址存入缓存
                localStorage.setItem("currentServer",$(".currentServer").text());
                localStorage.dServer_src = self.$durl;
                //将当前配置服务器地址存入缓存
                localStorage.cServer_src = self.$curl;

                // 新增: 保存当前选择的地址, 用于弹窗显示
                var text = $("#remark_dSrc").text();
                localStorage.setItem("currentAddress",text);

                layer.open({
                    type: 2,
                    title: '修改服务器地址',
                    shade: 0,
                    area: ['460px', '250px'],
                    // maxmin: true,
                    // moveOut: true,
                    content: "wsEntrance.html",
                    end: function() {
                        self.initWebSocketSrc();
                        /*刷新页面*/
                        window.location.reload(true);
                    }
                });
			});
			/*暂停按钮事件绑定*/
			self.$stopBtn.click(function(e){
				e.preventDefault();
				self.suspendReception(this);
			});
		},
		/**
		 * webSocket请求
		 * @param {String} url 接口分支
		 * @param {Object} param 请求参数
		 * @param {Function} fn ws数据回调
		 */
		webSocketEvent: function(url, param, fn) {
			var self = this;
			if("WebSocket" in window) {
				var ws = new ReconnectingWebSocket(url);
				self.wsArr.push(ws);
				ws.onopen = function() {
					// Web Socket 已连接上，使用 send() 方法发送数据
					ws.send(JSON.stringify(param));
					// 重置star为true，这样重连就会继续发送请求数据
					self.star = true;
				};
				ws.onmessage = function(res) {
					fn(res.data);
				};
				ws.onclose = function() {
					// 关闭 websocket
					/*ws.close();*/
					console.log("连接已关闭...");
				};
				//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
				window.onbeforeunload = function() {
					ws.close();
				};
				return ws;
			} else {
				console.log("浏览器不支持WebSocket!")
			}
		},
		//初始化WS地址
		initWebSocketSrc: function() {
			var self = this;
			var dsrc = localStorage.getItem("dServer_src");//连接的数据服务器地址
			var currentServer = localStorage.getItem("currentServer");//连接的数据服务器名称
			if(dsrc == null) {
				currentServer = "122服务器";
				self.$durl = "ws://103.251.36.122:9501";
			} else {
				self.$durl = dsrc;
			};
			
			
			var csrc = localStorage.getItem("cServer_src");//配置服务器地址
			if(csrc == null) {
				self.$curl = "ws://103.251.36.122:9511";
			} else {
				self.$curl = csrc;
			};
			$("#remark_dSrc").html(self.$durl);
			$(".currentServer").text(currentServer);
		},
		//获取在线设备列表
		getOnlineDeviceList: function() {
			var self = this;
			var param = {
				type: "Status"
			};
			// 监听td 的点击事件
			$("#data_table tbody").on("click","td",function (){
				var _this = $(this);
				if (_this.hasClass('shrink')){
                    $("tr td:last-child").addClass('shrink');
                    _this.removeClass('shrink');
				}else{
                    _this.addClass('shrink');
				}
			});
			self.ws = self.webSocketEvent(self.$durl, param, function(res) {
				var obj = JSON.parse(res);
				var data = obj.data;
				if(self.$stopRun == false){
					return false;
				};
				if(obj.type == "clients"){
					var data = obj.data;
					if("counts1" in data){
						$("#olLookNum").children("span").html(data.counts1);//在线浏览人数
					}
				};
				if(obj.type == "Status") {
					for(var key in data) {
						if($("li[data-id='" + data[key].deviceID + "']").length > 0) {
							if(data[key].status == 1) {
								$("li[data-id='" + data[key].deviceID + "']").find(".device-li-tit span").html("在线").addClass("on-line").removeClass("off-line");
							} else {
								$("li[data-id='" + data[key].deviceID + "']").find(".device-li-tit span").html("离线").addClass("off-line").removeClass("on-line");
							}
						} 
						else {
							if(data[key].status == "1") {
								var span = '<span class="on-line">在线</span>';
							} else {
								var span = '<span class="off-line">离线</span>';
							}
							lis = '<li data-id="' + data[key].deviceID + '">' +
								'<div class="device-li-icon">' +
								'<i class="glyphicon glyphicon-hdd"></i>' +
								'</div>' +
								'<div class="device-li-detail">' +
								'<div class="device-li-tit">设备ID：' + span + '</div>' +
								'<div class="device-li-id">' + data[key].deviceID + '</div>' +
								'</div>' +
								'<div class="device-li-leida">' +
								'<i class="glyphicon glyphicon-dashboard"/></i>' +
								'</div>' +
								'</li>';
							self.$deviceUl.prepend(lis);
						}
					}
					//当前在线设备个数
					var len = $(".on-line").length;
					self.$onlineTotal.html(len);
					/*获取数据*/
					if(self.star) {
						self.getData();
						self.star = false;
					};
				};
				//渲染探霸主要探测的数据
				if(obj.type == "Data") {
					var bool = true;
					/*过滤*/
					if(self.$wifiFBtn.hasClass("active")) {
						var query = $("#wifi-filter-input").val().toLowerCase();
						//获取是否渲染数据表格的状态，true，继续渲染表格，false则不渲染
//						console.log(data);
						bool = self.queryCriteria(data, query);
					}
					if(bool) {
						var content = JSON.stringify(data); 
						var typeCont = "<tr class='text-primary'>";

						var trs = typeCont + "<td style='width:5%;'  class='text-center'>" + data.type + "</td>" +
							"<td style='width:15%;'  class='text-center'>" + data.time + "</td>" +
							"<td style='width:5%;'  class='text-center'>" + data.tbid + "</td>" +
							"<td style='width:15%;'  class='text-center'>" + data.tbmac + "</td>" +
							"<td style='width:12%;'  class='text-center'>" + data.devkey + "</td>" +
							"<td style='width:48%;' class='lastTd shrink'>" + content + "</td></tr>";
					
						self.$wifiTable.find("tbody").prepend(trs);
						if(self.$wifiTable.children("tbody").find("tr").length > 100) {
							self.$wifiTable.children("tbody").find("tr").last().remove();
						}
					}
				};
				//探霸设备状态改变
				if(obj.type == "StatusChange") {
					if(data.status == 1) {
						$("li[data-id='" + data.deviceID + "']").find(".device-li-tit span").html("在线").addClass("on-line").removeClass("off-line");
					} else {
						$("li[data-id='" + data.deviceID + "']").find(".device-li-tit span").html("离线").addClass("off-line").removeClass("on-line");
					}
				};
			});
			
		},
		//获取探霸探测到的主要数据
		getData: function() {
			var self = this;
			var param = {
				type: "getdata"
			};
			self.ws.send(JSON.stringify(param));
		},
		/**
		 * 返回是否渲染表格的状态(过滤原理便是根据需要过滤的字段，查询从后台接收到的数据，确认其中是否含有该字段，如有，进栈渲染表格，如没有，跳过)
		 * @param {Object} msg ws主要打data数据
		 * @param {String} query 过滤表单的值
		 * */
		queryCriteria: function(msg, query) {
			if(query == undefined || query == "") {
				return true;
			} else {
				console.log(JSON.stringify(msg).toLowerCase().indexOf(query));
				if(JSON.stringify(msg).toLowerCase().indexOf(query) != -1){
					return true;
				}else{
					return false;
				}
			}
		},
		//列表点击事件
		listClickEvnt: function(dom) {
			var deviceId = $(dom).attr("data-id");
			/*清除之前打开的*/
			localStorage.removeItem("deviceId");
			localStorage.removeItem("errorStr");
			/*获取新的ID*/
			localStorage.deviceId = deviceId;
			layer.open({
				type: 2,
				title: '设备：' + deviceId,
				shade: 0,
				area: ['90%', '646px'],
				maxmin: true,
				moveOut: true,
				content: "detail.html",
				success: function(layero, index) {
					layer.close(index - 1);
				},
				cancel: function() {
					localStorage.removeItem("deviceId");
					localStorage.removeItem("errorStr");
				}
			});
		},
		/**
		 * 列表跳转事件
		 * @param {Object} dom 设备列表中的雷达图标节点
		 * */
		jumpPageEvent: function(dom) {
			var self = this;
			var deviceId = $(dom).parent().attr("data-id");
			window.open(
					"../leida/login.html?id=" + deviceId + "&wsip=" + self.$durl +
					"&ajaxIp=" + (localStorage.getItem("ajaxIp") ? localStorage.getItem("ajaxIp") : ("http://"+serverParam.data[1].ajaxIp+":"+serverParam.data[1].ajaxPort)),
					"_blank"
			);
		},
		//暂停接收数据事件
		suspendReception:function(dom){
			var self = this;
			var has = $(dom).hasClass("active");
			if(has){
				self.$stopBtn.removeClass("active").html("暂停接收");
				self.$stopRun = true;
			}else{
				self.$stopBtn.addClass("active").html("继续接收");
				self.$stopRun = false;
			}
		}
	});
	win.dataPage = dataPage;
})(window, document, jQuery);

new dataPage();