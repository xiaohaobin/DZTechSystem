//服务器CMD命令集合
window.serverHandle = {
	//服务器操作请求地址
	serverUrl:"ws://10.10.10.201:9503",
	//服务器列表
	serverList:{
		do: "server", 
		type: "list"
	},
	//新增服务器
	serverAdd:{
		do: "server", 
		type:"add",
		name:"",
		host:"",
		post:""
	},
	//更新服务器
	serverUpdate:{
		do: "server", 
		type:"update",
		name:"",
		host:"",
		post:"",
		id:""
	},
	//删除服务器
	serverDel:{
		do: "server", 
		type:"delete",		
		id:""
	}
	
};


//探霸命令集合
window.TBCMD = {
	//获取探霸列表
	TBList:{
		type:"status"
	}
};
