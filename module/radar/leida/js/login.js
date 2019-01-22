(function(win, doc, $) {
	function login(options) {
		this._init(options);
	};
	$.extend(login.prototype, {
		_init: function(options) {
			var self = this;
			self.options = {
				/*sta数据接口*/
				staInlet: "#sta_Inlet",
				/*rf数据接口*/
				rfInlet: "#rf_Inlet",
				//true code
				macInlet:"#mac_Inlet",
				
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
			/*STA入口对象*/
			self.$staInlet = $(opts.staInlet);
			/*RF入口对象*/
			self.$rfInlet = $(opts.rfInlet);
			
			self.$macInlet = $(opts.macInlet);
			/*初始化绑定事件*/
			self._initDomBindEvent();
		},
		/**
		 * 初始化DOM绑定事件
		 * @return {[Object]} [this]
		 * */
		_initDomBindEvent: function() {
			var self = this;
			self.$staInlet.click(function(e) {
				e.preventDefault();
				self.editSearchParam("s");
				sessionStorage.setItem('portType','sta');
			});
			self.$rfInlet.click(function(e) {
				e.preventDefault();
				self.editSearchParam("r&dzkj=wd");
				sessionStorage.setItem('portType','rf');
			});
			self.$macInlet.click(function(e) {
				e.preventDefault();
				self.editSearchParam("s&dzkj=wd");
				sessionStorage.setItem('portType','sta');
			});
			
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
		/*修改地址栏参数*/
		editSearchParam: function(t) {
			console.log(this);
			var self = this;
			var obj = self.toQueryParams.call(location.search);
			if(obj.id != undefined) {
				/*修改URL*/
				var a = "&id=" + obj.id;
			} else {
				var a = "";
			};
			if(obj.wsip != undefined) {
				/*修改URL*/
				var b = "&wsip=" + obj.wsip;
			} else {
				var b = "";
			};
			if(obj.dzkj != undefined) {
				/*修改URL*/
				var c = "&dzkj=" + obj.dzkj;
			} else {
				var c = "";
			};
			location.href = "leida.html?dtp=" + t + a + b + c + "&ajaxIp=" + getQueryString("ajaxIp");
//			location.href = "leida.html?dtp=" + t + a + b + c + "&ajaxIp=" + localStorage.getItem("ajaxIp");
		}
	});
	win.login = login;
})(window, document, jQuery);
new login();

isMoblie(
	function(){
		$('#main .description').css('top','10%');
	},
	function(){
		
	}
);
//js获取url中的参数值
function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}
//console.log(getQueryString("id"));

//基站查询入口
$("#base_query").click(function(){
//	window.location.href = "baseQuery.html?id=" + getQueryString("id");
	window.location.href = "baseQueryCommon.html?id=" + getQueryString('id') + "&wsip=" + getQueryString('wsip') +"&ajaxIp=" + getQueryString('ajaxIp');
});
