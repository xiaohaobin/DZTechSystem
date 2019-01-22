//背景图设置模块
var bgModal = new Vue({
	el: "#bgModal",
	data: {
		bg: {
			onImage: "wallpapers/menglong2.jpg",
			list: [
				"wallpapers/game/bg_1.jpg",
				"wallpapers/game/bg_2.jpg",
				"wallpapers/mm/bg_1.jpg",
				"wallpapers/mm/bg_2.jpg",
				"wallpapers/movie/bg_1.jpg",
				"wallpapers/movie/bg_2.jpg",
				"wallpapers/view/bg_1.jpg",
				"wallpapers/view/bg_2.jpg"
			],
		}
	},
	created: function() {
		localStorage.getItem('bg') ? this.bg.onImage = localStorage.getItem('bg') : layer.alert("当前桌面背景数据已被删，可以鼠标右键菜单背景设置，重新设置背景");
		$("body").css({
			"background": "#0000FF url(" + this.bg.onImage + ") no-repeat",
			"backgroundSize": "cover"
		});
	},
	methods: {
		//选择背景图片
		chooseImage: function(imgUrl) {
			var _this = this;
			_this.bg.onImage = imgUrl;
			$(".bgimg").each(function() {
				if($(this).attr("src") == _this.bg.onImage) {
					$(this).parents("li").addClass("red").siblings("li").removeClass("red");
				}
			});
			$("body").css({
				"background": "#0000FF url(" + _this.bg.onImage + ") no-repeat",
				"backgroundSize": "cover"
			});

		},
		//保存背景图
		saveBgImg: function() {
			var _this = this;

			localStorage.setItem('bg', _this.bg.onImage);
			$("body").css({
				"background": "#0000FF url(" + _this.bg.onImage + ") no-repeat",
				"backgroundSize": "cover"
			});
			layer.msg("保存成功");
			$("#bgModal").modal("hide");
		},

	}
});

//桌面应用模块
var mainBox = new Vue({
	el: "#mainBox",
	data: {
		deskIconList: [{
				path: "",
				imgUrl: "icon/icon0.png",
				text: "系统管理"
			},
			{
				path: "",
				imgUrl: "icon/icon2.png",
				text: "后台用户管理"
			},			
			{
				path: "",
				imgUrl: "icon/icon9.png",
				text: "命令集管理"
			},
			{
				path: "../module/CMD/index.html",
				imgUrl: "icon/icon10.png",
				text: "探霸后台管理"
			},
			{
				path: "",
				imgUrl: "icon/icon10.png",
				text: "独尊探霸相关demo模块"
			},
//			{
//				path: "../module/radar/tb/index.html",
//				imgUrl: "icon/icon10.png",
//				text: "探霸雷达管理系统"
//			},
		]
	},
	created: function() {

	},
	methods: {
		//返回id值
		backID: function(i) {
			return "win" + (i + 1);
		}
	}
});