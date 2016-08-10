var express = require("express");
var app = express();

//引入自己的模块
var randomTest = require('./libs/myMoudle.js');


//设置handlebars视图引擎
var handlebars = require('express3-handlebars')
	.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set("port", process.env.PORT || 3000);

//static中间件
app.use(express.static(__dirname + '/public'));

//感受视图传递动态信息的强大
/*var arrTest = [
	'今天是星期三',
	'昨天是星期二',
	'明天是星期四',
	'后天是星期五~！'
]*/

//todo 加上路由
app.get('/', function(req, res){
	//res.type('text/plain');
	//res.send("Meadowlark Travel");	
	res.render('home');
});
app.get('/about', function(req, res){
	//res.type('text/plain');
	//res.send('About Meadowlark Travel');	
	/*var randomTest = arrTest[ Math.floor(Math.random()*arrTest.length) ];*/
	res.render('about', { arrTest : randomTest.getAnswer() });
});

//todo 定制404页面
app.use(function(req, res){
		res.status(404);
		//res.send('404 - Not Found');
		res.render('404');
});

//todo 定制500页面
app.use(function(req, res){
	console.log( err.stack );
	//res.type('text/plain');
	res.status(500);
	//res.send('500 - Server Error');	
	res.render('500');
});

app.listen(app.get('port'), function(){
	console.log('Express start on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');	
});

/*
	1、很多教程，建议主文件名为app.js或者是index.js、server.js， 但是这里更倾向项目命名主文件。
	2、port.env.PORT || 300。  意味着可以在启动服务器前通过设置环境变量覆盖端口。
	3、app.get是添加路由的方法。 2个参数，路径、函数。 
		路径这一块，express给我们做了很多工作，我们写/About  /about/ /about?foo=bar等适用。
	4、Express默认的状态码是200， 不用显示指定。
	5、res.send 替代 node 的res.end 、  res.set 、 res.status代替 node的ers.writeHead 、 res.type设置响应头
	6、注意，我们设置404和500页面处理的时候，用的是 app.use方法，这是出来美誉路径匹配的处理器。 这是添加中间件的一个方法。 注意，路由与中间件的添加顺序是有着重要的关系的。比方，现在我把404处理器放到所有路由的上面，导致首页和关于页面就不能用。
	7、运行这个服务器： 
			node meadowlark.js
	
	8、我这里说的视图，指的是html, 那我们这个Express它支持多种不同的视图引擎。偏好Jade
	9、Jade，精简，没有尖括号没有结束标签， Jade引擎会把它转换成html
	10、还有一种，抽象程度比较低的模版框架Handlebars
		安装:	
			npm install --save express3-handlebars
			
	11、创建views目录，并创建一个子目录layouts
		开发网站的时候，每个页面上肯定会有一定数量上的html是相同的，布局来解决这个问题，就是为所有页面提供一个通用的框架。创建一个views/layouts/main.handlebars文件
			{{body}}表达式，意思是会被每个视图自己的html取代。
		我们在创建handlebars的时候，指明了defaultLayout:'main'，意思是说，除非特备指明，否则所有视图用的都是这个布局。
		
	12、创建首页、关于页面、404页面、500页面的视图页面
	
	13、优化路由内容： 不在指定内容类型和状态码，试图引擎会返回text/html的内容类型何200的状态码， 404、500这样的，必须明确设定状态码。
		
	14、重启服务器，看到套化效果。
	
	
	15、中间件，是一种模块化手段。
	
	16、需要一个包含静态资源的目录，其中的资源不经过任何特殊处理，直接就发送到客户端，可以在里面放图片，css文件，客户端Js文件。 这个就叫做static中间件。它就相当于给所有静态文件一个路由， 渲染文件发送给客户端。
		首先：我们在项目目录下创建一个名为public的子目录，对外开发的意思。
		然后：把static中间件添加进来， 放到所有路由之前。	
			app.use(express.static(__dirname + '/public'));
			
		第三： 重新修改布局文件，main.handlebars, 让所有页面都有Logo
		
	17、视图并不只是一种传递静态Html的方式，真正的强大中秋能包含动态信息。
		比方，我在主文件里定义个数组， 然后修改关于页面的视图，修改关于路由，就能接收到。
		
		
	18、创建自己的模块：
			我们把随机回答星期几的功能模块化
			首先： 我们要创建一个用来保存模块的目录，lib/
			然后：创建一个myModule01.js,
			注意，要把函数加到exports上，才能让其在模块外可见。
			最后，在主文件里，引入自己的模块。
*/




