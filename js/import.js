/**
 * 引入主要的jq库，ui框架，常用插件以及公共样式
 * @author xhb 
 * 
 **/

try {
	var myLib = {
		/**
		 * 创建子命名空间,用的是yui的方法------
		 * @param {String} ns 命名空间的名称
		 * */
		NS: function(ns) {
			if(!ns || !ns.length) {
				return null;
			}
			var levels = ns.split(".");
			var nsobj = myLib;
			for(var i = (levels[0] == "myLib") ? 1 : 0; i < levels.length; ++i) {
				nsobj[levels[i]] = nsobj[levels[i]] || {};
				nsobj = nsobj[levels[i]];
			}
			return nsobj;
		},

		/**
		 * 动态加载外部js文件
		 * @param {String} path 本地路径，注意：末尾不要加“.js”后缀
		 * @param {Function} callback 动态加载js成功的回调函数
		 * */
		_loadJs: function(path, callback) {
			callback = !(typeof(callback) == "undefined") ? callback : function() {};
			var oHead = document.getElementsByTagName('HEAD').item(0);
			var script = document.createElement("script")
			script.type = "text/javascript";
			if(script.readyState) { //IE
				script.onreadystatechange = function() {
					if(script.readyState == "loaded" || script.readyState == "complete") {
						script.onreadystatechange = null;
						callback();
					}
				};
			} else { //Others: Firefox, Safari, Chrome, and Opera
				script.onload = function() {
					callback();
				};
			}
			script.src = path + ".js";
			oHead.appendChild(script);
		},

		/**
		 * 动态加载外部css文件
		 * @param {String} path 本地路径，注意：末尾不要加“.css”后缀
		 * */
		_loadCss: function(path) {
			if(!path || path.length === 0) {
				throw new Error('argument "path" is required !');
			}
			var head = document.getElementsByTagName('head')[0];
			var links = document.createElement('link');
			links.href = path + ".css";
			links.rel = 'stylesheet';
			links.type = 'text/css';
			head.appendChild(links);
		},
		/**
		 * 获取对象类型名
		 * @param {Any} object 各种返回类型 ["Array", "Boolean", "Date", "Number", "Object", "RegExp", "String", "Window", "HTMLDocument"]
		 * */
		_getType: function(object) {
			return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
		},
		/**
		 * 用来判断对象类型
		 * @param {Any} object 需要判断的数据
		 * @param {String} typeStr 预想的类型字符串
		 * */
		_is: function(object, typeStr) {
			return this._getType(object) == typeStr;
		},
		/**
		 * 动态加载js文件,批量加载js,css文件，path可以是数组格式或用逗号隔开的字符串	
		 * @param {String||Array} path path可以是数组格式或用逗号隔开的字符串,指的是需要加载的js或者css组，如["jquery","layer"]
		 * @param {String} 指定要动态加载的统一的类型，js或者css
		 * */
		_import: function(path, fileType) {
			var loadfun;
			switch(fileType) {
				case "js":
					loadfun = this._loadJs;
					break;
				case "css":
					loadfun = this._loadCss;
					break;
				default:
					alert("请检查文件类型");
			}
			//如果path是以逗号隔开的字符串		 
			if(this._is(path, "String")) {
				if(path.indexOf(",") >= 0) {
					path = path.split(",");
				} else {
					path = [path];
				}
			}
			//循环加载文件
			for(var i = 0; i < path.length; i++) {
				loadfun(path[i]);
			}
		}
	};
	
	//根目录变量
	var root = "/DZTechSystem";
	
	//批量引入css
	myLib._import(
		[
			root + "/css/common",
			root + "/lib/bootstrap-3.3.7-dist/css/bootstrap.min"
		],
		"css"
	);
	
	//批量引入脚本
	myLib._import(
		[
			root + "/js/vue.min",
			root + "/js/jquery",
			root + "/js/reconnecting-websocket.min",
			root + "/js/crypto-js.min",
			root + "/js/jsrsasign-all-min",
			root + "/lib/bootstrap-3.3.7-dist/js/bootstrap.min",
			root + "/lib/layer/2.4/layer",
			root + "/js/jquery.xhb.plugin"
		],
		"js"
	);
	
} catch(e) {
	//TODO handle the exception
	console.error("error:" + e);
}