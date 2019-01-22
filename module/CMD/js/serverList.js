var app = new Vue({
	data: {
		list: [], //服务器列表数据
		name: "", //服务器名称
		host: "", //服务器ip或者域名
		port: "", //服务器端口
		ws: null, //ws对象
		isAdd: true, //是否新增
		editId: null, //要编辑的id
	},
	el: "#app",
	created: function() {
		localStorage.removeItem("sUpdate");
		var _this = this;
		//初始化ws连接，并请求服务器列表数据
		_this.ws_connect(
			serverHandle.serverUrl,
			serverHandle.serverList,
			function(result) {
				console.log(result);
				//渲染select 列表
				if(result.length > 0) {
					_this.list = result;
				} else {
					layer.msg("服务器列表还没有，请手动添加");
				}

			}
		);

	},
	methods: {
		/**
		 * ws连接(一次发送一次请求数据)
		 * @param {String} wsUrl 请求地址
		 * @param {Object} param 发送参数
		 * @param {Function} callback ws连接成功，后台返回数据的回调函数
		 * */
		ws_connect: function(wsUrl, param, callback) {
			var _this = this;
			_this.loading = layer.load(2);

			if("WebSocket" in window) {
				_this.ws = new ReconnectingWebSocket(wsUrl); //实例化断开重连的ws对象
				_this.ws.onopen = function() {
					_this.ws.send(JSON.stringify(param));
				}
				_this.ws.onmessage = function(res) {
					layer.close(_this.loading);
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
			} else {
				layer.alert("当前浏览器不支持ws连接");
			}
		},
		/**
		 * ws连接，并发送数据
		 * @param {Object} oData 要发送的数据
		 * @param {Function} callback 发送成功回调函数
		 * */
		ws_send: function(oData, callback) {
			var _this = this;
			_this.ws.send(JSON.stringify(oData));
			_this.loading = layer.load(2);
			_this.ws.onmessage = function(res) {
				var d = (typeof res.data == "object") ? res.data : JSON.parse(res.data);
				layer.close(_this.loading);
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

		//保存服务器数据
		saveServer: function() {
			var _this = this;
			if(_this.name.replace(/^\s+|\s+$/g, '') == '' || _this.host.replace(/^\s+|\s+$/g, '') == '' || _this.port.replace(/^\s+|\s+$/g, '') == '') {
				layer.alert("服务器名称或者ip（域名）或者端口不能为空！");
				return;
			}

			if(_this.isAdd) {
				//							//新增服务器列表
				serverHandle.serverAdd.name = _this.name;
				serverHandle.serverAdd.host = _this.host;
				serverHandle.serverAdd.port = _this.port;

				_this.ws_send(
					serverHandle.serverAdd,
					function(data) {
						console.log(data);
						_this.list.push({
							name: _this.name,
							host: _this.host,
							port: _this.port,
							id: data.id
						});
						_this.name = "";
						_this.host = "";
						_this.port = "";
					}
				);

			} else {
				if(_this.editId != null) {
					//编辑服务器列表
					serverHandle.serverUpdate.name = _this.name;
					serverHandle.serverUpdate.host = _this.host;
					serverHandle.serverUpdate.port = _this.port;
					serverHandle.serverUpdate.id = _this.editId;

					_this.ws_send(
						serverHandle.serverUpdate,
						function(data) {
							console.log(data);
							for(var k in _this.list) {
								if(_this.editId == _this.list[k].id) {
									_this.list[k].name = _this.name;
									_this.list[k].host = _this.host;
									_this.list[k].port = _this.port;
								}
							}
							_this.name = "";
							_this.host = "";
							_this.port = "";
							_this.isAdd = true;
							_this.editId = null;
						}
					);

				}

			}
			localStorage.setItem("sUpdate", 1);
		},
		//编辑服务器
		editServer: function(item) {
			var _this = this;
			_this.isAdd = false;
			_this.editId = item.id;
			_this.name = item.name;
			_this.host = item.host;
			_this.port = item.port;
		},
		//删除服务器
		delServer: function(lId) {
			var _this = this;
			var index = layer.confirm("确认删除该服务器？", function() {
				layer.close(index);
				//删除
				serverHandle.serverDel.id = lId;
				_this.ws_send(
					serverHandle.serverDel,
					function(data) {
						console.log(data);
						if(lId == _this.editId) {
							_this.name = "";
							_this.host = "";
							_this.port = "";
							_this.isAdd = true;
							_this.editId = null;
						}
						for(var k in _this.list) {
							if(lId == _this.list[k].id) {
								_this.list.splice(k, 1);
								break;
							}
						}
					}
				);
				localStorage.setItem("sUpdate", 1);
			});
		},
		//高亮行状态
		lightTr: function(id) {
			var _this = this;
			if(id == _this.editId) {
				return "bg-danger";
			} else {
				return "";
			}
		}

	}
});