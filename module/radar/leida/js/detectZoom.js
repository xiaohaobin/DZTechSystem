// 判断pc浏览器是否缩放，若返回100则为默认无缩放，如果大于100则是放大，否则缩小
function detectZoom() {
	var ratio = 0,
		screen = window.screen,
		ua = navigator.userAgent.toLowerCase();

	if(window.devicePixelRatio !== undefined) {
		ratio = window.devicePixelRatio;
	} else if(~ua.indexOf('msie')) {
		if(screen.deviceXDPI && screen.logicalXDPI) {
			ratio = screen.deviceXDPI / screen.logicalXDPI;
		}
	} else if(window.outerWidth !== undefined && window.innerWidth !== undefined) {
		ratio = window.outerWidth / window.innerWidth;
	}

	if(ratio) {
		ratio = Math.round(ratio * 100);
	}

	return ratio;
};
/*关于移动端的判断 */
function isMoblie(fnMobile, fnPc) {
	var sUserAgent = navigator.userAgent.toLowerCase();
	var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
	var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
	var bIsMidp = sUserAgent.match(/midp/i) == "midp";
	var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
	var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
	var bIsAndroid = sUserAgent.match(/android/i) == "android";
	var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
	var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
	if(bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) { //移动端
		fnMobile();
	} else {
		fnPc();
	}
}

window.onload = function() {
	isMoblie(function() {
		return false;
	}, function() {
		var ratio = detectZoom();
		if(ratio != 100) {
			window.alert("当前页面不是100%显示，请恢复100%显示标准，以防页面显示错乱！");
		}
	});
};

