var tanba = new Vue({
	el: "#tanba",
	data: {
		TB_device: [], //探霸设备列表
		client_online: 0, //在线浏览人数
		TB_data: [], //探霸主要数据
		connect: { //连接服务器相关
			serverName: localStorage.getItem("currentServer") || "122服务器", //当前连接（缓存）的服务器名称
			wsServerUrl: localStorage.getItem("dServer_src") || "ws://103.251.36.122:9501", //当前连接（缓存）的服务器地址（ws）
			httpServerUrl: localStorage.getItem("ajaxIp") || "http://103.251.36.122:9506", //当前连接（缓存）的服务器地址（http）
			ws: null, //ws连接对象
		},
		isReceive: true, //是否暂停显示数据
		isFilter: false, //是否过滤
		filterTxt: "",
		n: 0,
		aSaveLocal:[],//存储的数据
	},
	created: function() {
		var _this = this;
		//初始化ws连接，并请求服务器列表数据
		if("WebSocket" in window) {
			_this.connect.ws = new ReconnectingWebSocket(_this.connect.wsServerUrl); //实例化断开重连的ws对象
			_this.connect.ws.onopen = function() {
				//获取设备列表
				_this.connect.ws.send(JSON.stringify({
					type: "list",
					do:"client"
				}));
				//获取主要数据
				_this.connect.ws.send(JSON.stringify({
					type: "list",
					do:"data"
				}));
			};
			_this.connect.ws.onmessage = function(res) {
				var d = (typeof res.data == "object") ? res.data : JSON.parse(res.data);
				if(d.code == 1){
					layer.alert("请求参数出错，请检查前后端通讯参数！");
					return;
				}
				var d = d.data;
				//设备列表
				switch(d.type) {
					//设备数据
					case "list":
						if(d.client.length > 0) _this.TB_device = d.client;
						break;
						//浏览人数
					case "client":
						_this.client_online = d.counts;
						break;
						//设备状态变化
					case "change":
						if(d.client.length > 0) _this.statusChange(d.client)
						break;
						//设备状态变化
					case "data":
						_this.mainDataToSave(d.data);
						break;
					default:
						break;
				}

			};

			_this.connect.ws.onclose = function() {
				layer.alert("连接已关闭,请重新刷新页面");
			};
			_this.connect.ws.onerror = function(e) {
				layer.msg('连接服务器失败...');
			}

		} else {
			layer.alert("浏览器不支持WebSocket!请更新到最新版本的浏览器！")
		}

		$("body").delegate("#data_table tbody tr td", "click", function() {
			$(this).parent().children("td.lastTd").toggleClass("shrink");
		});
		
		 
//		_this.logArrLength();
	},
	methods: {
		/**
		 * ws连接的数据接收和回调
		 * @param {Object} ws ws对象
		 * @param {Object} data 发送的数据
		 * */
		data_connect: function(ws, data) {
			var _this = this;
			ws.send(JSON.stringify(data));
			ws.onmessage = function(res) {
				var d = (typeof res.data == "object") ? res.data : JSON.parse(res.data);
				if(d.code == 1){
					layer.alert("请求参数出错，请检查前后端通讯参数！");
					return;
				}
				var d = d.data;
				switch(d.type) {
					//设备数据
					case "list":
						if(d.client.length > 0) _this.TB_device = d.client;
						break;
						//浏览人数
					case "client":
						_this.client_online = d.counts;
						break;
						//设备状态变化
					case "change":
						if(d.client.length > 0) _this.statusChange(d.client)
						break;
						//设备状态变化
					case "data":
						_this.mainDataToSave(d.data);
						break;
					default:
						break;
				}
			};
		},

		/**
		 * 返回设备状态的类名
		 * @param {String} status 1在线，0离线
		 * */
		TB_backClass: function(status) {
			return(status ? "on-line" : "off-line");
		},

		/**
		 * 设备状态变化数据处理
		 * @param {Object} data 设备的id和状态对象
		 * */
		statusChange: function(data) {
			var _this = this;
			for(var k in _this.TB_device) {				
				for(var i in data){
					if(data[i].client_name == _this.TB_device[k].client_name) _this.TB_device[k].data_status = data[i].data_status;
				}
			}
		},
		/**
		 * 获取在线探霸数量
		 * @param {Array} TB_device 探霸设备数组
		 * @return {Number}
		 * */
		getOnLineCount: function(TB_device) {
			var count = 0;
			for(var k in TB_device) {
				if(TB_device[k].data_status) count++;
			}
			return count;
		},
		//全刷新界面
		allReload: function() {
			var index = layer.confirm('刷新会清除所有数据?', function() {
				/*刷新页面*/
				window.location.reload(true);
			});
		},
		//数据服务器操作更改
		serverOption: function() {
			layer.open({
				type: 2,
				title: '修改服务器地址',
//				shade: 0,
				area: ['80%', '80%'],
				content: "serverList.html",
				end: function() {
					/*刷新页面*/
					window.location.reload(true);
				}
			});
		},
		//路由到雷达界面
		locationRadar: function(deviceID) {
			var _this = this;
			window.open("../leida/login.html?id=" + deviceID + "&wsip=" + _this.connect.wsServerUrl + "&ajaxIp=" + _this.connect.httpServerUrl, "_blank");
		},
		//处理主要数据进栈
		mainDataToSave: function(oData) {
			var _this = this;
			this.writeTable(oData);
//			this.saveLocal(oData);
		},
		//接收和关闭数据
		toggleReceive: function() {
			//判断是否过滤状态
			if($("#filter-btn").hasClass("active")){
				this.isReceive = false;
				//发送指令,后台停止发送数据
				this.data_connect(
					this.connect.ws, {
						type: "stop",
						do:"data"
					}
				);
				this.isFilter = false;
				$("#filter-btn").removeClass("active");
				return false;
			}
			
			if(this.isReceive == true) {
				this.isReceive = false;
				//发送指令,后台停止发送数据
				this.data_connect(
					this.connect.ws, {
						type: "stop",
						do:"data"
					}
				);
				return false;
			} else {
				this.isReceive = true;
				//继续接受后台数据
				this.data_connect(
					this.connect.ws, {
						type: "list",
						do:"data"
					}
				);
			}
		},
		backActive:function(b){
			return (b ? "active" : "");
		},
		//过滤开关
		toggleFilter: function() {
			var _this = this;
			if(_this.filterTxt.replace(/^\s+|\s+$/g, '') == "") {
				layer.alert("请输入正确的过滤字段");
				return;
			}			
			if(!_this.isFilter) {
				_this.isFilter = true;
				$("#filter-btn").addClass("active");
				
				//发送指令
				_this.data_connect(
					_this.connect.ws, {
						keyword: _this.filterTxt,
						type: "filter",
						do:"data"
					}
				);
				_this.isReceive == true;
				$("#stop_btn").text("暂停接收").removeClass("active");
				return false;
			} else {
				//取消过滤，获取全部数据
				this.isFilter = false;
				$("#filter-btn").removeClass("active");
				_this.filterTxt = "";
				//继续接受后台数据
				this.data_connect(
					this.connect.ws, {
						type: "list",
						do:"data"
					}
				);
			}
		},

		//渲染表格
		writeTable: function(oData) {
			//最多显示50个					
			var trs = "<tr class='text-primary'>" +
				"<td style='width:5%;'  class='text-center'>" + oData.type + "</td>" +
				"<td style='width:15%;'  class='text-center'>" + oData.time + "</td>" +
				"<td style='width:5%;'  class='text-center'>" + oData.client_id + "</td>" +
				"<td style='width:15%;'  class='text-center'>" + oData.client_name + "</td>" +
				"<td style='width:12%;'  class='text-center'>" + oData.mac + "</td>" +
				"<td style='width:48%;' class='lastTd shrink'>" + JSON.stringify(oData) + "</td>" +
				"</tr>";
			$("#data_table tbody").prepend($(trs));
			if($("#data_table tbody tr").length >= 50) $("#data_table tbody tr:last-child").remove();
		},
		//本地存储（统计展示方式）
		saveLocal:function(oData){
			var _this = this;
			
			//方法1（没有加发现次数）
//			if(_this.aSaveLocal.length > 0){
//				//过滤集合中不符合条件的元素。返回匹配元素数组
//				_this.aSaveLocal = _.reject(_this.aSaveLocal,function(v,i){
//					return v.mac == oData.mac;
//				});
//				_this.aSaveLocal.unshift(oData);
//			}else{				
//				_this.aSaveLocal.unshift(oData);
//			}
			
			//方法2（有加发现次数）
			var nFind = "";
			if(_this.aSaveLocal.length > 0){
				for(var i=0;i<_this.aSaveLocal.length;i++){
					if(oData.mac == _this.aSaveLocal[i].mac){
						nFind = _this.aSaveLocal[i].find;
					}
				}
				//过滤集合中不符合条件的元素。返回匹配元素数组
				var arr2 =  _.reject(_this.aSaveLocal,function(v,i){
					return v.mac == oData.mac;
				});
				oData.find = nFind*1 + 1;
				_this.aSaveLocal.unshift(oData);
				//去重
				_this.aSaveLocal = _.uniq(_this.aSaveLocal, 'mac');
			}
			else{
				oData.find = 1;
				_this.aSaveLocal.unshift(oData);
			}
			
			
		},
		//定时加载存储的数组长度
		logArrLength:function(){
			var _this = this;
			setTimeout(function(){
				console.log(_this.aSaveLocal.length);
				_this.logArrLength();
			},1000);
		}
	}
});


