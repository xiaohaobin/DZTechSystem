$.extend({
	/*
	 * 信息反馈弹框
	 * txt : 显示的文字
	 * timer :  弹框持续时间
	 * boole : 是否显示确定按钮, 显示按钮则不自动关闭
	 * */
	infoAlert: function(txt, timer, boole) {
		var txt = txt || '请稍后...';
		var timer = timer || 2500;
		var boole = (boole == undefined ? false : boole);
		/*载入要输出的文字*/
		$("#infoAlertText").html(txt);
		/*是否显示按钮*/
		if(boole) {
			$(".infoAlertBtn").show();
		} else {
			$(".infoAlertBtn").hide();
		}
		/*显示弹窗*/
		$(".infoAlertBox").show();
		/*指定时间关闭弹窗*/
		if(boole == false) {
			setTimeout(function() {
				$(".infoAlertBox").hide();
			}, timer)
		} else {
			$("#infoAlertBtn").on("click", function() {
				$(".infoAlertBox").hide();
			})
		}
	}
});
$(document).ready(function() {
	$(".chart").hover(function() {
		$(this).find(".chart_Prompt").stop(false).fadeIn(300);
	}, function() {
		$(this).find(".chart_Prompt").stop(false).fadeOut(300);
	})

	/*iframe子页，点击首页效果切换*/
	$("#home").on("click", function(e) {
		e.preventDefault();
		//在iframe子页面中查找父页面元素
		window.parent.activeHome();
	})
})

function getOnTime(oTime) {
	//获取当前具体时间
	var oDate = new Date();
	var nYear = oDate.getFullYear();
	var nMonth = oDate.getMonth() * 1 + 1;
	var nDate = oDate.getDate();

	var nHours = oDate.getHours();
	var nMinutes = oDate.getMinutes();
	var nSeconds = oDate.getSeconds();
	if(nHours < 10) {
		nHours = "0" + nHours;
	}
	if(nMinutes < 10) {
		nMinutes = "0" + nMinutes;
	}
	if(nSeconds < 10) {
		nSeconds = "0" + nSeconds;
	}
	if(oTime == "y-m-d") { //返回大时间年月日
		return nYear + "-" + nMonth + "-" + nDate;
	}
	if(oTime == "h-m-s") { //返回小时间时分秒
		return nHours + ":" + nMinutes + ":" + nSeconds;
	} else { //不传参数，是整个时间			
		return nYear + "-" + nMonth + "-" + nDate + "\0" + nHours + ":" + nMinutes + ":" + nSeconds;
	}

}