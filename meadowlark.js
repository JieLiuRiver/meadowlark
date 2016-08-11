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

	19、响应对象常用的属性和方法
		1)、res.status(code)	
			设置http状态码
			而对于重定向(状态码301、302、303、307),有一个更好的方法：redirect

		2)、res.cookie(name, value, [options]);
			res.clearCookie(name,[options]);
			设置或者清除客户端cookies值，需要中间件支持。

		3）、res.redirect([status], url)
		重定向浏览器。 默认重定向代码是302
		通常，应减少重定向。
		
		4）、res.send(body)
			 res.send(status, body);
			 向客户端发送响应以及可选的状态码。
			 Express默认内容类型text/html
			 如果想改，需要在res.send之前调用
			 	res.set('Content-Type','text/plain\');

			 如果body是一个对象或者数组，响应会以json发送，推荐调用res.json

		5)、res.json(json)
			res.json(status, json)
			向客户端发送Json以及可选的状态码

		6）、res.jsonp(json)
			 res.jsonp(status,json)
			 想客户端发送Jsonp

		7）、res.type(type)
			设置Content-Type头信息。
			相当于res.set("Content-Type","type")
		
		8)、 res.format(object)
		根据接受请求报文发送不同的内容，例如：
			res.format({ 'text/plain':'hi', 'text/html' : '<b>hi</b>' })

		9)、res.attachment([filename])
			res.download(path,[filename],[callback])
			将响应报头Content-Disposition 设为attachment
			浏览器就会选下载而不是展现内容。
			可以指定filename 给浏览器作为对用户的提示
			需要将内容发送到客户端

		10）、res.sendFile(path,[option],[callback])
			  根据路径读取指定文件
			  将内容发送到客户端

		11）、res.locals
			  res.render(view,[locals],callback)
			  res.locals 是一个对象，包含用于渲染视图的默认上下文
			  res.render 使用配置的模板引擎渲染视图

		
		12）、内容渲染

			示例6-1　基本用法
			// 基本用法
			app.get('/about', function(req, res){
				res.render('about');
			});

			示例6-2　200 以外的响应代码
			app.get('/error', function(req, res){
				res.status(500);
				res.render('error');
			});
			// 或是一行……
			app.get('/error', function(req, res){
				res.status(500).render('error');
			});

			示例6-3　将上下文传递给视图，包括查询字符串、cookie 和session 值
			app.get('/greeting', function(req, res){
				res.render('about', {
				message: 'welcome',
				style: req.query.style,
				userid: req.cookie.userid,
				username: req.session.username,
				});
			});

			示例6-4　没有布局的视图渲染
			// 下面的layout 没有布局文件，即views/no-layout.handlebars
			// 必须包含必要的HTML
			app.get('/no-layout', function(req, res){
				res.render('no-layout', { layout: null });
			});

			示例6-5　使用定制布局渲染视图
			// 使用布局文件views/layouts/custom.handlebars
			app.get('/custom-layout', function(req, res){
				res.render('custom-layout', { layout: 'custom' });
			});
			渲染纯文本输出
			app.get('/test', function(req, res){
				res.type('text/plain');
				res.send('this is a test');
			});

			示例6-7　添加错误处理程序
			// 这应该出现在所有路由方法的结尾
			// 需要注意的是，即使你不需要一个" 下一步" 方法
			// 它也必须包含，以便Express 将它识别为一个错误处理程序
			app.use(function(err, req, res, next){
				console.error(err.stack);
				res.status(500).render('error');
			});

			示例6-8　添加一个404 处理程序
			// 这应该出现在所有路由方法的结尾
			app.use(function(req, res){
				res.status(404).render('not-found');
			});


		13）、处理表单
			表单信息一般在req.body 中
			偶尔在req.query
			使用
			req.xhr 来判断是AJAX 请求还是浏览请求
			
			示例6-9　基本表单处理
			// 必须引入中间件body-parser
			app.post('/process-contact', function(req, res){
				console.log('Received contact from ' + req.body.name +
				' <' + req.body.email + '>');
				// 保存到数据库……
				res.redirect(303, '/thank-you');
			});

			示例6-10　更强大的表单处理
			// 必须引入中间件body-parser
			app.post('/process-contact', function(req, res){
				console.log('Received contact from ' + req.body.name +
				' <' + req.body.email + '>');
				try {
					// 保存到数据库……
					return res.xhr ?
					res.render({ success: true }) :
					res.redirect(303, '/thank-you');
				} catch(ex) {
					return res.xhr ?
					res.json({ error: 'Database error.' }) :
					res.redirect(303, '/database-error');
				}
			});

			
		14）、Handlebars模版引擎
			之前用javascript生成html
			js跟html混在一起，很混乱
			格式不正确的，不容易发现
			不能直观的分析
			难以让别人读懂代码

			这个时候模版解决了这个问题
		
			1、理解模版引擎的关键在于context上下文环境
			当渲染一个模版的时候，会传递给模版引擎一个对象，叫做上下文对象
			例如：	
				如果上下文对象是 {name : 'hello'}
				模版是 ： <p>say, {{name}}~!</p>
				可以理解了把。

			2、注释
				{{ ! super-secret comment }}      这种不会传递到浏览器
				<!-- not -so -secret commet -->    这种，查看Html源文件，能看到它在。

			3、	块级表达式：
				使用{{#each tours}}， 遍历一个数组。
				当第一次循环的时候：
					上下文是： { name: 'Hood River', price: '$99.95' }
				第二次循环的时候：
					上下文是： {name: 'Oregon Coast', price: '$159.95' }

				
				这个时候，想访问 currency对象，需要使用 ../来访问上一级上下文。
				在if块中，又会产生一个新的上下文，这里的上下文，跟其上一级的上下文是相同的。
				这个时候的访问，可能就会涉及到 ../../
				那么这样会产生很多混乱， 最好的做法是在Each块中避免使用if块

				在if 和each 块中都有一个可选的else 块（对于each，如果数组中没有任何元素，else
				块就会执行）。我们也用到了unless 辅助方法，它基本上和if 辅助方法是相反的：只有在
					参数为false 时，它才会执行。

			
			
*/




