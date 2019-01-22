//首页主要模块
var container = new Vue({
	el:"#container",
	data:{
		baseInfo:_baseInfo,//基础信息
		CMDInfor:_CMDInfor,//控制型指令集
		otherCMDInfo:_otherCMDInfo,//其他命令集合
		ws:null,//ws对象
		loading:null,//layerloading对象
		serverList:[],//服务器列表
		TBList:[],//探霸列表
		windowSize:{//内容可视区域的宽高
			outerHeight:0,
			outerWidth:0
		},
		currTB:null,//当前单选的探霸
	},
	methods:{
		//重新设置高度
		resetHight:function(){
			var _this = this;
			var containerH = $("#container").outerHeight();		
			var navH = $("nav").outerHeight();
			var sectionH = containerH - navH - 10;
			console.log(containerH,navH);
			_this.windowSize.outerHeight = sectionH;			
			$("section").css("minHeight",sectionH+"px");
						
			//定义左边探霸列表容器的高度
			var panelHeadingH = $(".TBListBox .panel-heading").outerHeight();
			var panelFooterH = $(".TBListBox .panel-footer").outerHeight();
			$(".TBListBox .panel-body").outerHeight((sectionH - panelHeadingH - panelFooterH - 12));
		},
		//全选切换
		toggleChoose:function(){
			var b = $(".allChoose").prop("checked");
			console.log(b);
			$(".tbList input[type=checkbox]").prop("checked",b);
		},
		/**
		 * ws连接(一次发送一次请求数据)
		 * @param {String} wsUrl 请求地址
		 * @param {Object} param 发送参数
		 * @param {Function} callback ws连接成功，后台返回数据的回调函数
		 * @param {Object} scopeSelector 设置加载层和遮罩层只存在某个容器对象里面
		 * */
		ws_connect:function(wsUrl,param,callback,scopeSelector){
			var _this = this;
			console.log(scopeSelector);
			
			!scopeSelector ? _this.loading = layer.load(2) : _this.createLoading(scopeSelector);
			
			if("WebSocket" in window){
				_this.ws = new ReconnectingWebSocket(wsUrl); //实例化断开重连的ws对象
				_this.ws.onopen = function(){
					_this.ws.send(JSON.stringify(param));
				}
				_this.ws.onmessage = function(res){
					
					!scopeSelector ? layer.close(_this.loading) : _this.delLoading(scopeSelector);
					
					var d = (typeof res.data == "object") ? res.data : JSON.parse(res.data);
					
					if(d.code != 0) {
						layer.msg(d.message);
						
					} else {
						callback(d.data);
					}
					
				}
				_this.ws.onclose = function() {
					layer.msg("连接已关闭,请重新刷新页面");
				};
				_this.ws.onerror = function(e) {
					layer.msg('连接服务器失败...');
				}
			}else{
				layer.alert("当前浏览器不支持ws连接");
			}
		},
		/**
		 * ws连接，并发送数据
		 * @param {Object} oData 要发送的数据
		 * @param {Function} callback 发送成功回调函数
		 * @param {Object} scopeSelector 设置加载层和遮罩层只存在某个容器对象里面
		 * */
		ws_send:function(oData,callback,scopeSelector){
			var _this = this;					
			_this.ws.send(JSON.stringify(oData));
			
			!scopeSelector ? _this.loading = layer.load(2) : _this.createLoading(scopeSelector);
			
			_this.ws.onmessage = function(res){
				var d = (typeof res.data == "object") ? res.data : JSON.parse(res.data);
				
				!scopeSelector ? layer.close(_this.loading) : _this.delLoading(scopeSelector);
				
				if(d.code != 0) {
					layer.msg(d.message);
				} else {					
					callback(d.data);
				}
			}
			_this.ws.onclose = function() {
				layer.msg("连接已关闭,请重新刷新页面");
			};
			_this.ws.onerror = function(e) {
				layer.msg('连接服务器失败...');
			}
		},
		//服务器列表改变
		serverChange:function(){
			var v = $(".serverselect").val();
			localStorage.setItem("serverVal",v);
			window.location.reload();
		},
		//验证是否值等于本地存储的
		checkLocal:function(val){
			if(localStorage.getItem("serverVal") && val == localStorage.getItem("serverVal")){
				$(".serverselect").val(localStorage.getItem("serverVal"));
				return "selected";
			}else{
				return false;
			}
		},
		//打开iframeWindow
		openIfWindow:function(sUrl){
			console.log(sUrl);
			layer.open({
				type: 2,
				title: false,
				area: ['80%', '100%'],
//				offset: ['0px', '0px'],
				shade: [0.5, "#3585FF"],
				closeBtn: 0,
				shadeClose: true,
				content: sUrl,
				end:function(){
					
					//是否需要重新刷新服务器列表
					if(sUrl == "serverList.html" && localStorage.getItem("sUpdate") && localStorage.getItem("sUpdate") == 1){
						window.location.reload();
					}
				}
			})
		},
		//在指定区域容器生成加载层和遮罩层
		createLoading:function(scopeSelector){
			scopeSelector.css("position","relative");
			//加载层
			var loadingBox = $('<div class="loadingBox"><img src="../../img/loading-2.gif" /></div>');
			loadingBox.css({
				"position":"absolute",
				"top":"50%",
				"left":"50%",
				"width":"100px",
				"height":"100px",
				"marginLeft":"-50px",
				"marginTop":"-50px",
				"zIndex":500,
			    "textAlign":"center",
    			"lineHeight":"100px"
			});
			//遮罩层
			var maskBox = $('<div class="maskBox"></div>');
			maskBox.css({
				"position":"absolute",
				"width":"100%",
				"height":"100%",
				"top":0,
				"left":0,
				"zIndex":400,
			    "backgroundColor":"rgba(255, 255, 255, 0.5)"
			});
			scopeSelector.append(loadingBox);
			scopeSelector.append(maskBox);
		},
		//删除指定区域容器的加载层和遮罩层
		delLoading:function(scopeSelector){
			scopeSelector.find(".loadingBox,.maskBox").remove();
		},
		//单选切换探霸列表
		chooseOne:function(i){
			var _this = this;
			for(var k in _this.TBList){				
				_this.TBList[k].active = false;
			}
			_this.TBList[i].active = true;
			localStorage.setItem("currTB",_this.TBList[i].client_name);
			_this.currTB = _this.TBList[i].client_name;
		},
		//探霸列表返回选中类名
		backActiveClass:function(bActive){
			return (bActive ? "active" : "");
		},
		//探霸返回对应在线颜色类名
		backFontColor:function(nStatus){
			return (nStatus == 1 ? "c-green" : "c-gray");
		},
		//判断本地存储的探霸id是否在当前列表又存在
		hasCurrTB:function(){
			var _this = this;
			var currTB = localStorage.getItem("currTB");
		
			var findTB = _.find(_this.TBList,function(v,i){
//				console.log(v,i);
				return v.client_name == currTB;
			});
			console.log(findTB);
			return (findTB == undefined ? false : currTB);
		},
		//重新设置右边面板内容高度
		resetPanelBodyH:function(){
			var sectionH = $("section").outerHeight();
			var panelHeadingH = $("section .panel-heading").outerHeight();
			var panelBodyH = (sectionH - (panelHeadingH * 2)) / 2 - 10;
			$(".content-body").outerHeight(panelBodyH);
		}
		
	},
	created:function(){
		var _this = this;		
		//ws连接
		_this.ws_connect(
			serverHandle.serverUrl,
			serverHandle.serverList,
			function(result){
				//渲染select 列表
				if(result.length > 0){
					for(var k in result){
						_this.serverList.push({
							id:result[k].id,
							value:"ws://" + result[k].host + ":" + result[k].port,
							name:result[k].name
						});
					}
					
					//ws连接 获取并监听探霸列表
					_this.ws_connect(
						localStorage.getItem("serverVal"),
						TBCMD.TBList,
						function(res){
							console.log(res);
							//历史数据进栈
							if(res.type == "statusList") {
								for(var i in res.data) {
									_this.TBList.push({
										client_name: (res.data[i].client_name ? res.data[i].client_name : "没有设备ID"),
										config_status: (res.data[i].config_status ? (res.data[i].config_status*1) : 0),
										data_status: (res.data[i].data_status ? (res.data[i].data_status*1) : 0),
										active:(localStorage.getItem("currTB") == res.data[i].client_name)
									});
								}
							}
							//实时数据
							else if(res.type == "status") {
								var flag = false; // tail
								for(var k in _this.TBList) {
									if(_this.TBList[k].client_name == res.client_name) {
										flag = true;
										if(_.has(res, "config_status")) { //判断对象是否有该属性
											console.log(res.config_status);
											if(typeof res.config_status == "boolean"){//布尔值类型
												_this.TBList[k].config_status = (res.config_status == true ? 1 : 0);
											}
											else{
												_this.TBList[k].config_status = res.config_status;
											}
										}
										
										if(_.has(res, "data_status")) {
											console.log(res.data_status);
											if(typeof res.data_status == "boolean"){//布尔值类型
												_this.TBList[k].data_status = (res.data_status == true ? 1 : 0);
											}
											else{
												_this.TBList[k].data_status = res.data_status;
											}
										}
									}
								}
								if(!flag) {
									res.active = false;
									_this.TBList.push(res);
								}
							}
							_this.hasCurrTB() && (_this.currTB = _this.hasCurrTB());
							
						},
						$(".TBListBox .panel-body")
					);
					
				}else{
					layer.msg("服务器列表还没有，请手动添加");
				}
				
			}
		);
	},
	//组件挂载
	mounted:function(){		
		var _this = this;
		//重新设置高度
		_this.resetHight();
		_this.resetPanelBodyH();
		
//		_this.createLoading($(".TBListBox .panel-body"));
		$(window).resize(function(){
			_this.resetHight();
			_this.resetPanelBodyH();
		});
		
		
	},
	//组件更新之后
	updated:function(){
		var _this = this;
		
	}
});