//基础信息数据配置
var _baseInfo = {
	status:{
		name:"连接状态",value:"在线"
	},
	netMode:{
		name:"联网方式",value:"WIFI"
	},
	deviceTemp:{
		name:"设备温度",value:"36°"
	},
	fanStatus:{
		name:"风扇状态",value:"未知"
	},
	cellStatus:{
		name:"电池状态",value:"未知"
	},
	power:{
		name:"剩余电量",value:"80%"
	},
	HVersion:{
		name:"硬件版本",value:"v1.10"
	},
	SVersion:{
		name:"软件版本",value:"v1.10"
	},
	position:{
		name:"地理位置经纬度",value:"113,22"
	},
	BaseSPosition:{
		name:"连接基站地理位置经纬度",value:"113,22"
	},
	workMode:{
		name:"工作模式",value:"采集"
	},
	server:{
		name:"所属服务器",value:"10.10.10.201"
	},
	ability:{
		name:"主要能力",value:"扫描ap，sta，rf数据"
	},
	SIMInfo:{
		name:"SIM卡信息",value:"未知"
	}				
};

//指令操作
var hostFile = "module/";

var _CMDInfor = {
	setWifiChannel:{
		name:"设置WIFI的信道",
		openUrl:hostFile + "setWifiChannel.html",
		cmd:{
			
		}
	},
	getWifiChannel:{
		name:"获取WIFI的信道",
		openUrl:hostFile + "getWifiChannel.html",
		cmd:{
			
		}
	},
	setWifiSSID:{
		name:"设置WIFI的SSID",
		openUrl:hostFile + "setWifiSSID.html",
		cmd:{
			
		}
	},
	getWifiSSID:{
		name:"获取WIFI的SSID",
		openUrl:hostFile + "getWifiSSID.html",
		cmd:{
			
		}
	},
	setheartspace:{
		name:"设置心跳间隔",
		openUrl:hostFile + "setheartspace.html",
		cmd:{
			
		}
	},
	getheartspace:{
		name:"获取心跳间隔",
		openUrl:hostFile + "getheartspace.html",
		cmd:{
			
		}
	},	
	restart:{
		name:"重启或复位",
		openUrl:hostFile + "restart.html",
		cmd:{
			
		}
	},
	setdomainport:{
		name:"设置域名和端口",
		openUrl:hostFile + "setdomainport.html",
		cmd:{
			
		}
	},
	getdomainport:{
		name:"获取域名和端口",
		openUrl:hostFile + "getdomainport.html",
		cmd:{
			
		}
	},
	setipport:{
		name:"设置IP和端口",
		openUrl:hostFile + "setipport.html",
		cmd:{
			
		}
	},
	getipport:{
		name:"获取IP和端口",
		openUrl:hostFile + "getipport.html",
		cmd:{
			
		}
	},
	settactics:{
		name:"设置策略地址",
		openUrl:hostFile + "settactics.html",
		cmd:{
			
		}
	},
	gettactics:{
		name:"获取策略地址",
		openUrl:hostFile + "gettactics.html",
		cmd:{
			
		}
	},
	setoffline:{
		name:"设置终端下线时间",
		openUrl:hostFile + "setoffline.html",
		cmd:{
			
		}
	},
	setworkmode:{
		name:"设置终端工作模式",
		openUrl:hostFile + "setworkmode.html",
		cmd:{
			
		}
	},
	setfilter:{
		name:"设置过滤策略",
		openUrl:hostFile + "setfilter.html",
		cmd:{
			
		}
	},
	getfilter:{
		name:"获取过滤策略",
		openUrl:hostFile + "getfilter.html",
		cmd:{
			
		}
	},
	setupspace:{
		name:"设置设备上报间隔",
		openUrl:hostFile + "setupspace.html",
		cmd:{
			
		}
	},
	getupspace:{
		name:"获取设备上报间隔",
		openUrl:hostFile + "getupspace.html",
		cmd:{
			
		}
	},
	setuptype:{
		name:"设置数据上报方式",
		openUrl:hostFile + "setuptype.html",
		cmd:{
			
		}
	},
	getuptype:{
		name:"获取数据上报方式",
		openUrl:hostFile + "getuptype.html",
		cmd:{
			
		}
	}
};

//其他指令
var _otherCMDInfo = {	
	getfault:{
		name:"获取设备故障信息",
		openUrl:hostFile + "getfault.html",
		cmd:{
			
		}
	},
	setupgrade:{
		name:"设备升级",
		openUrl:hostFile + "setupgrade.html",
		cmd:{
			
		}
	},
	upgradeadmin:{
		name:"上传升级包",
		openUrl:hostFile + "upgradeadmin.html",
		cmd:{
			
		}
	},
	upgradefileadmin:{
		name:"升级包管理",
		openUrl:hostFile + "upgradefileadmin.html",
		cmd:{
			
		}
	},
	DIY_cmd:{
		name:"自定义命令",
		openUrl:hostFile + "DIY_cmd.html",
		cmd:{
			
		}
	}
}
