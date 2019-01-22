/**
 * @author 肖浩彬
 * @description 百度地图控件
 * @version 1.0
 * @depend 百度API3.0
 * */

/**
 * 对象拓展函数,如果为数组，数组为哈希数组才有效
 * @param {Boolean} deep 是否深拷贝
 * @param {Object||Array} target 目标对象或者数组
 * @param {Object||Array} options 要并集的对象或者数组
 * */
function _extend(deep, target, options) {
	for(name in options) {
		copy = options[name];
		if(deep && copy instanceof Array) {
			target[name] = $.extend(deep, [], copy);
		} else if(deep && copy instanceof Object) {
			target[name] = $.extend(deep, {}, copy);
		} else {
			target[name] = options[name];
		}
	}
	return target;
}

;
(function(undefined) {
	"use strict"
	var _global;



	//主要函数体
	function baiduMap() {}

	//构建方法
	
	/**
	 * 缩放工具
	 * @return {Object} 返回缩放工具对象
	 * */
	baiduMap.prototype.navigationControl = function() {
		 var n = new BMap.NavigationControl({
            anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
            offset: new BMap.Size(10, 150),
            type: BMAP_NAVIGATION_CONTROL_LARGE,
            showZoomInfo: true,
            enableGeolocation: true
        });
        return n;
        //使用方法：map.addControl(bdMap.navigationControl());，以下工具类的方法一样
	}
	/**
	 * 定位工具
	 * @param {Function} succFn 定位成功的回调函数，参数是定位的地址和经纬度对象
	 * @param {Function} errFn 定位失败的回调函数，参数是定位失败的信息
	 * @return {Object} 返回定位工具对象
	 * */
	baiduMap.prototype.geolocationControl = function(succFn,errFn) {
		var g = new BMap.GeolocationControl({
            anchor: BMAP_ANCHOR_BOTTOM_LEFT,
            offset: new BMap.Size(10, 80),
            showAddressBar: true,
            enableGeolocation: true
        });
        //定位成功事件
        g.addEventListener("locationSuccess", function (e) {          
			/**
			 * @param {Object} e.addressComponent 地址
			 * @param {Object} e.point 经纬度
			 * */
            succFn(e.addressComponent,e.point);

        });
        //定位失败事件
        g.addEventListener("locationError", function (e) {
        	errFn(e.message);
        });
        return g;
	}
	
	/**
	 * 比例尺工具
	 * @return {Object} 返回比例尺工具对象
	 * */
	baiduMap.prototype.scaleControl = function(){
		var s = new BMap.ScaleControl({
            anchor: BMAP_ANCHOR_TOP_RIGHT,
            offset: new BMap.Size(10, 10),
        });
        return s;
	}
	
	/**
	 * 切换地图类型
	 * @return {Object} 返回地图类型对象
	 * */
	baiduMap.prototype.mapTypeControl = function(){
		var opts6 = {
            anchor: BMAP_ANCHOR_TOP_RIGHT,
            type: BMAP_MAPTYPE_CONTROL_MAP
        }
        var maptype = new BMap.MapTypeControl(opts6);
        return maptype;
	}
	
	/**
	 * 负责切换至全景地图的控件(浏览器要装Adobe Flash Play控件)
	 * @return {Object}
	 * */
	baiduMap.prototype.panoramaControl = function(){
		var p = new BMap.PanoramaControl({
            anchor: BMAP_ANCHOR_TOP_RIGHT,
        });
        return p;
	}
	
	/**
	 * 删除指定经纬度标注
	 * @param {Number} longitude 要删除的标注的经度
	 * @param {Number} latitude 要删除的标注的维度
	 * */
	baiduMap.prototype.removeMarker = function(longitude, latitude){
		var allOverlay = map.getOverlays();
        for (var i = 0; i < allOverlay.length; i++) {
            if (allOverlay[i].toString() == "[object Marker]") {
                if (allOverlay[i].getPosition().lng == longitude && allOverlay[i].getPosition().lat == latitude) {
                    map.removeOverlay(allOverlay[i]);
                }
            }
        }
	}
	
	/**
	 * GPS经纬度转换百度经纬度
	 * @param {Number} curLongitude 要转换的经度
	 * @param {Number} curLatitude 要转换的纬度
	 * @param {Function} fn 转换后的回调函数    参数是转换后的百度经纬度对象
	 * */
	baiduMap.prototype.transfrom = function(curLongitude, curLatitude, fn){
		//将获取的坐标转换为百度坐标
        var ggPoint = new BMap.Point(curLongitude, curLatitude);
        //坐标转换完之后的回调函数
        var translateCallback = function (data) {
            if (data.status === 0) fn(data.points[0]);
        }
        var convertor = new BMap.Convertor();
        var pointArr = [];
        pointArr.push(ggPoint);
        convertor.translate(pointArr, 1, 5, translateCallback);
	}
	
	/**
	 * 获取两点之间的距离
	 * @param {Number} start_lng 开始标注的经度
	 * @param {Number} start_lat 开始标注的纬度
	 * @param {Number} end_lng 结束标注的经度
	 * @param {Number} end_lat 结束标注的纬度
	 * @return {Number}
	 * */
	baiduMap.prototype.getDistence = function(start_lng, start_lat, end_lng, end_lat){
		var start_point = new BMap.Point(start_lng * 1, start_lat * 1);
        var end_point = new BMap.Point(end_lng * 1, end_lat * 1);
        return Math.ceil(map.getDistance(start_point, end_point));
	}
	
	/**
	 * marker设置地图label(基于jq的插件开发机制)
	 * @param {Object} option 设置地图label的参数
	 * @param {string} option.content label标签内容
     * @param {[number,number]} option.offset label标签相对marker标注的偏移值
	 * @param {object} option.style label样式对象
	 * @return {Object} lable对象
	 * * @example
	 * mapControl.setLabel({
		content:"这是标注的label",
		offset:[15, -15],
		style:{
			border: "solid 1px gray",
			padding:'2px 5px',
			borderRadius:'3px',
		}
	})
	 * */
	baiduMap.prototype.setLabel = function(option){
		var _this = this;
		var defaults = {
			content:"这是标注的label",
			offset:[15, -15],
			style:{
				border: "solid 1px gray",
				padding:'2px 5px',
				borderRadius:'3px',
			}
		};
		var opts = $.extend({}, defaults, option);
		
        var lbl = new BMap.Label(
            opts.content, {
                offset: new BMap.Size(opts.offset[0], opts.offset[1])
            }
        );
        lbl.setStyle(opts.style);
        return lbl;
	}

	

	/**
	 * 自定义icon创建标注，返回标注对象(基于jq的插件开发机制)
	 * @param {Object} option 自定义icon创建标注的参数
	 * @param {object} option.Icon 不设置，默认百度原始图标对象
	 * @param {number} option.lng 要创建的标注经度
	 * @param {number} option.lat 要创建的标注经度	
	 * @return {Object} 
	 * */
	baiduMap.prototype.createMarker = function(option){
		var _this = this;
		//参数输入示例
		var defaults = {
			Icon:_this.setIcon(),
			lng:113.95403656908,
			lat:22.549744538467
		};
		var opts = $.extend({}, defaults, option);
		var point = new BMap.Point(opts.lng,opts.lat)
        var Marker = new BMap.Marker(point, {
            icon: opts.Icon
        });
        return Marker;
	}
	
	/**
	 * 自定义百度地图icon，返回icon对象(基于jq的插件开发机制)
	 * @param {Object} option 自定义百度地图icon的参数
	 * @param {String} option.imgUrl 图片icon地址
	 * @param {number} option.width 图片的原始宽度
	 * @param {number} option.height 图片的原始高度
	 * @return {Object}
	 * */
	baiduMap.prototype.setIcon = function(option){
		//参数输入示例
		var defaults = {
			imgUrl:"http://api0.map.bdimg.com/images/marker_red_sprite.png",
			width:39,//img的原始宽度
			height:25//img的原始高度
		};
		var opts = $.extend({}, defaults, option);
		var icon = new BMap.Icon(opts.imgUrl, new BMap.Size(opts.width, opts.height));
		return icon;
	}
	
	/**
	 * 自定义窗口，返回窗口对象(基于jq的插件开发机制)
	 * @param {Object} option 自定义窗口的配置参数对象
	 * @param {String} option.content 信息窗口的主要内容
	 * @param {number} option.width 信息窗口的原始宽度
	 * @param {number} option.height 信息窗口的原始高度
	 * @param {string} option.title 信息窗口标题
	 * @return {object} 信息窗口对象
	 * */
	baiduMap.prototype.setWindow = function(option){
		var defaults = {
			content:"这特么是信息窗口内容！....",
			width : 200,     // 信息窗口宽度
			height: 200,     // 信息窗口高度
			title : "信息窗口标题" , // title信息窗口标题
		};
		var opts = $.extend({}, defaults, option);
		var infoWindow = new BMap.InfoWindow(
				opts.content, {
				width : opts.width,     // 信息窗口宽度
				height: opts.height,     // 信息窗口高度
				title : opts.title // 信息窗口标题
		});  
		return infoWindow;
	}
	
	/**
	 * 自定义右键菜单(基于jq的插件开发机制)
	 * @param {Object} option 自定义右键菜单的配置参数
	 * @param {Array} option.ContextMenu 右键菜单数据数组
	 * @param {String} option.ContextMenu[sort].text 右键菜单名称
	 * @param {Function} option.ContextMenu[sort].callback 右键菜单名称
	 * @param {Object} 右键菜单对象
	 * */
	baiduMap.prototype.setContextMenu = function(option){
		var defaults = {
			ContextMenu:[
				{
					text:"打印",
					callback:function(e,k,m){
						console.log(e,k,m);
					}
				},
				{
					text:"删除",
					callback:function(e,k,m){
						map.removeOverlay(m);
						console.log("del");
					}
				}
			]
		};
		var opts = $.extend({}, defaults, option);
		var Menu = new BMap.ContextMenu();
		for(var k in opts.ContextMenu){
			Menu.addItem(
				new BMap.MenuItem(opts.ContextMenu[k].text,opts.ContextMenu[k].callback)
			);
		}
		return Menu;
	}
	
	// 最后将插件对象暴露给全局对象
	_global = (function() {
		return this || (0, eval)('this');
	}());
	if(typeof module !== "undefined" && module.exports) {
		module.exports = baiduMap;
	} else if(typeof define === "function" && define.amd) {
		define(function() {
			return baiduMap;
		});
	} else {
		!('baiduMap' in _global) && (_global.baiduMap = baiduMap);
	}
}());