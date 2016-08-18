var express = require("express");
var app = express();

//凭证引入来
var credentials = require('./credentials.js');

//引入模型对象
var Vacation = require('./models/vacation.js');

//引入自己的模块
var randomTest = require('./libs/myMoudle.js');

//引入文件上传模版
var formidable = require('formidable');

var cookieParser = require('cookie-parser');
var session = require('express-session');

//引入mongoose  创建数据库的连接
var mongoose = require('mongoose');
var opts = {
	server :{
		socketOptions: { keepAlive: 1 }
	}
}
/*
opts 对象是可选的，但我们想指定keepAlive 选项，以防止长期运行的应用程序（比如网
站）出现数据库连接错误。
 */

// switch(app.get('env')){
// 	case 'development':
// 		mongoose.connect(credentials.mongo.development.connectionString, opts);
// 	break;
// 	case 'production':
// 		mongoose.connect(credentials.mongo.production.connectionString, opts);
// 	break;
// 	default:
// 		throw new Error('Unknown execution environment: ' + app.get('env'));
// }


//创建度假包初始化数据，使用find save两个方法
// Vacation.find(function(err, vacations){
// 	if( vacations.length ) return; //有了就不用重复添加了
// 	new Vacation({
// 		name : 'Hood River Day Trip',
// 		slug: 'hood-river-day-trip',
// 		category: 'Day Trip',
// 		sku: 'HR199',
// 		description: 'Spend a day sailing on the Columbia and ' +
// 'enjoying craft beers in Hood River!',
// 		priceInCents: 9995,
// 		tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
// 		inSeason: true,
// 		maximumGuests: 16,
// 		available: true,
// 		packagesSold: 0
// 	}).save();

// 	new Vacation({
// 		name: 'Oregon Coast Getaway',
// 		slug: 'oregon-coast-getaway',
// 		category: 'Weekend Getaway',
// 		sku: 'OC39',
// 		description: 'Enjoy the ocean air and quaint coastal towns!',
// 		priceInCents: 269995,
// 		tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
// 		inSeason: false,
// 		maximumGuests: 8,
// 		available: true,
// 		packagesSold: 0,
// 	}).save();

// 	new Vacation({
// 		name: 'Rock Climbing in Bend',
// 		slug: 'rock-climbing-in-bend',
// 		category: 'Adventure',
// 		sku: 'B99',
// 		description: 'Experience the thrill of climbing in the high desert.',
// 		priceInCents: 289995,
// 		tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
// 		inSeason: true,
// 		requiresWaiver: true,
// 		maximumGuests: 4,
// 		available: false,
// 		packagesSold: 0,
// 		notes: 'The tour guide is currently recovering from a skiing accident.',
// 	}).save();

// });

//设置handlebars视图引擎
var handlebars = require('express3-handlebars')
	.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//设置端口
app.set("port", process.env.PORT || 3000);

//即显消息
/*app.use(function(req, res, next){
	//如果有即显消息，把它传到上下文中，然后清除它
	res.local.flash = req.session.flash; //报错 找不到falsh 
	delete req.session.flash;
	next();
});*/

//static中间件
app.use(express.static(__dirname + '/public'));

//Post方式中间件
app.use(require('body-parser')());

//cookie相关中间件
app.use(cookieParser(credentials.cookieSecret));
//会话中间件
app.use(session());

//感受视图传递动态信息的强大
/*var arrTest = [
	'今天是星期三',
	'昨天是星期二',
	'明天是星期四',
	'后天是星期五~！'
]*/


//post请求 路由，指定引擎模版
app.get('/newsletter', function(req, res){
	res.render('newsletter', { csrf : 'CSRF token goes here' });
});

//表单post请求进来
app.post('/process', function(req, res){
	console.log('body', req.body);
	res.redirect(303, '/thank-you');
});
/*app.post('/process', function(req, res){
	var name = req.body.name || '',
		email = req.body.email || '';
		//输入验证
		if( !email.match(VALID_EMAIL_REGEX) ){
			if( req.xhr ) return res.json({ error:"邮箱验证不通过" });
			req.session.flash = {
				type :'danger',
				intro : '验证错误',
				message : '邮箱验证出错'
			}
			return res.redirect(303,'/');
		}
		new NewsletterSignup({ name: name, email: email }).save(function(err){
			if(err) {
				if(req.xhr) return res.json({ error: 'Database error.' });
				req.session.flash = {
					type: 'danger',
					intro: 'Database error!',
					message: 'There was a database error; please try again later.',
				}
				return res.redirect(303, '/');
			}
			if(req.xhr) return res.json({ success: true });
				req.session.flash = {
				type: 'success',
				intro: 'Thank you!',
				message: 'You have now been signed up for the newsletter.',
			};
			return res.redirect(303, '/');
		});
});*/


//post请求 路由，指定引擎模版
app.get('/ajax', function(req, res){
	console.log('in ajax route....');
	res.render('ajax', { csrf : 'CSRF token goes here' });
});

//度假包路由
app.get('/vacations', function(req, res){
	Vacation.find({ available:true }, function(err, vacations){
		var context = {
			vacations: vacations.map(function(vacation){
				return {
				sku: vacation.sku,
				name: vacation.name,
				description: vacation.description,
				price: vacation.getDisplayPrice(),
				inSeason: vacation.inSeason,
				}
			})
		};
		res.render('vacations', context);
	});
})
/*
我们为什么要将从数据库里返回来的产品映射为几乎一样的对象？
其中一个原因是Handlebars 视图无法在表达式中使用函数的输出。
所以为了以一个整齐的格式化方式显示价格，
我们必须将其转为简单的字符串属性。
 */


//ajax post请求进来
app.post('/process2', function(req, res){
	if( req.xhr || req.accepts('json,html') === 'json' ){
		res.send({ success : true });
	}else{
		res.redirect(303, '/thank-you');
	}
});

//上传图片页面 请求进来
app.post('/photo/:year/:month', function(req, res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		if(err) return res.redirect(303, '/error');
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		//保存到数据库或者其他处理
		
		res.redirect(303, '/thank-you');
	});
});

//todo 加上路由 首页
app.get('/', function(req, res){
	//res.type('text/plain');
	//res.send("Meadowlark Travel");	
	res.render('home');
});

//关于页面 路由
app.get('/about', function(req, res){
	//res.type('text/plain');
	//res.send('About Meadowlark Travel');	
	/*var randomTest = arrTest[ Math.floor(Math.random()*arrTest.length) ];*/
	res.render('about', { arrTest : randomTest.getAnswer() });
});

//图片上传页面路由
app.get('/photo', function(req, res){
	var now = new Date();
	res.render('uploadPhotoFile', { year : now.getFullYear(), month : now.getMonth() });
})

//todo 定制404页面
app.use(function(req, res){
		res.status(404);
		//res.send('404 - Not Found');
		res.render('404');
});

//todo 定制303页面
app.use(function(req, res){
		res.status(303);
		res.render('303');
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
		

		***笔记：
			 cp bower_components/bootstrap/dist/css/bootstrap.min.css public/css
			
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

			
			4、向服务器发送客户端的数据
				通常来说，有2种方式，一种是查询字符串，一种是请求正文。
				查询字符串的方式，通过get的请求
				请求正文的方式，通过post请求
				有一种误解：任务post安全，get方式不安全
				其实，如果使用https，那2者都是安全的，不用的话， 2者都不安全。

			5、
				<form action="/process" method="POST">
					<input type="hidden" name="hush" val="hidden, but not secret!">
					<div>
					<label for="fieldColor">Your favorite color: </label>
					<input type="text" id="fieldColor" name="color">
					</div>
					<div>
					<button type="submit">Submit</button>
					</div>
				</form>
				action 的值被指定为用于接收表单数据的URL。
				我建议你始终都为action 提供一个有效值，即使是使用AJAX提交（这会防止你丢失数据）
				从服务器的角度来说，最重要的属性应该是name,服务器才能识别字段。
				注意隐藏域，不能使用它来存放秘密和敏感信息。

			6、Express表单处理
				GET进行表单处理： 在req.query对象中
				POST进行表单处理： 需要引入中间件来解析URL编码体，
					首先:安装body-parser中间件（npm install --save body-parser）
					然后：引入，app.use(require('body-parser')()); 
					此时： req.body可用 
				
				新建newsletter.handlebars，使用表单提交的方式。

			7、使用ajax进行表单提交：
				新建ajax.handlebars 完成测试

			8、使用Formidable，进行处理文件上传
				必须指定enctype="multipart/form-data" 来启用文件上传
				安装： npm install --save formidable

	15）、Cookie与回话
		当我在浏览器中加载页面的时候，然后转到统一网站的另一个页面。这个时候，我们的服务器，和浏览器都没办法知道，这个统一浏览器访问统一网站。
		http是无状态协议。
		我们需要用某种办法在http上建立状态。于是有了cookie和会话。
		cookie:  服务器发送一点信息，浏览器在一段时间内保存它。
		a、cookie对用户来说不是加密的
		b、用户可以删除或禁用cookie
		c、一般的cookie可以被篡改
		d、cookie可以用于攻击
		e、如果你滥用cookie，用户会注意到
		f、如果可以选择，会话要优于cookie

		1、为了保证cookie的安全，需要一个cookie秘钥，它是一个字符串。服务器在把cookie发送到客户端之前，
		会进行加密。是一个随机生成的字符串。

		2、外化第三方凭证的做法：
			首先：新建credentials.js  :
				module.exports = {
					cookieSecret: ' 把你的cookie 秘钥放在这里',
				};
			然后，为了防止把这个文件，添加到源码库中，我们在.gitignore文本文件里面加上： credentials.js

			接下来： 将凭证引入程序：var credentials = require('./credentials.js');

			接下来： 需要引入中间件cookie-parser 
					安装：npm install --save cookie-parser
					写入： app.use(require('cookie-parser')(credentials.cookieSecret));

		3、会话session
			会话是更方便的状态维护
			实现会话推荐的方案：只在cookie里存放一个唯一标识，其他东西都放在服务器。
			那必须找到一个地方来储存它------内存会话
			首先： 安装express-session （npm install --save express-session）
			然后： 在链入cookie-parser 之后链入express-session；
				app.use(require('cookie-parser')(credentials.cookieSecret));
				app.use(require('express-session')());
			参数：key  会话标识cookie名称，唯一的。
				  store 会话存储的实例
				  cookie 会话 cookie 的 cookie 设置
			使用会话：
				req.session.userName = 'Anonymous';
				var colorScheme = req.session.colorScheme || 'dark';
			要删除会话，可以用JavaScript 的delete操作符：

		
		4、即显消息：  不破坏用户导航的前提下向用户提供反馈的办法
		   会话的方式来实现即显消息是最简单的方式。
		   flash.message外面用了3个大括号，可以使用简单的html。
		   如果会话中有flash对象，添加到上下文中显示出来，
		   显示过一次的，需要从会话中去掉，避免下一次请求时再次显示。
		   会话的作用：
		   		当你登录后，会创建一个会话，之后不用在每次重新加载页面的时候
		   	再登录一次。


	16）、中间件
			中间件是在管道中执行
			通过调用app.use 向管道中插入中间件。
			a、路由处理器（app.get、app.post 等，经常被统称为 app.VERB）可以被看作只处理特定
HTTP 谓词（GET、POST 等）的中间件
			b、路由处理器的第一个参数必须是路径。
			c、路由处理器和中间件的参数中都有回调函数
			d、如果不调用 next()，管道就会被终止，也不会再有处理器或中间件做后续处理。如果
你不调用next()，则应该发送一个响应到客户端（res.send、res.json、res.render 等）；
如果你不这样做，客户端会被挂起并最终导致超时。
			e、如果调用了 next()，一般不宜再发送响应到客户端。如果你发送了，管道中后续的中
间件或路由处理器还会执行，但它们发送的任何响应都会被忽略。


			例子：	
					app.use(function(req, res, next){
						console.log('processing request for "' + req.url + '"....');
						next();
					});
					app.use(function(req, res, next){
						console.log('terminating request');
						res.send('thanks for playing!');
					// 注意，我们没有调用next()……这样请求处理就终止了
					});
					app.use(function(req, res, next){
						console.log('whoops, i\'ll never get called!');
					});
					
					这里有三个中间件，第一个，请求传给下一个中间件之前，记录了一条消息。
					下一个中间件真正处理请求。 如果在第二个中间件里，我们不写res.send，导致，不会有
					响应返回到客户端，最终造成客户端超时，而第三个中间件也不会执行。

				
			1、常用的中间件
				Express中捆绑了Connect,它包含了大部分常用的中间件。
				建议安装： npm install --save connect
				var connect = require(connect);

				a、app.use(connect.basicAuth)();
					提供基本的访问授权。 需要又快又容易的东西，并且在使用Https的情况下，才使用。

				b、npm install --save body-parser
					app.use( require(body-parser)() )
					只连入json何urlencoded的便利中间件

				c、urlencoded
					解析互联网媒体类型为application/x-www-form-urlencoded的请求体
					这是处理表单和ajax请求最常用的方式。

				d、cookie-parser 
					提供cookie支持

				e、cookie-session
					提供cookie存储的会话支持

				f、 express-session
					提供会话ID（存在cookie里）的会话支持

				g、directory
					app.use(connect.directory())
					提供静态文件的目录清单支持。

				h、static
					app.use( express.static(path_to_static_files()) )
					提供对静态文件的支持
			

	17）、发送邮件
			首先： 安装Nodemailer包
				npm install --save nodemailer
			然后：引入nodemailer包，创建一个nodemailer实例
				var nodemailer = require("nodemailer");
				var mailTransport = nodemailer.createTransport("SMTP",{
					service : 'Gmail',
					auth :{
						user :creadenticals.gmail.user,
						pass : creadentials.gmail.password
					}
				});
			接下来：发送邮件
				mailTransport.sendMail({
					from: '"Meadowlark Travel" <info@meadowlarktravel.com>',
					to: 'joecustomer@gmail.com',
					subject: 'Your Meadowlark Travel Tour',
					text: 'Thank you for booking your trip with Meadowlark Travel.'+
					'We look forward to your visit!',
				}, function(err){
					if(err) console.error( 'Unable to send email: ' + error );
				});

			封装邮件功能：
				创建模块email.js
			使用：
				var emailService = require('./lib/email.js')(credentials);
				emailService.send('joecustomer@gmail.com', 'Hood River tours on sale today!','Get \'em while they\'re hot!');



	18）、
		云持久化
		强烈建议利用这些便宜好用的服务。
		http://aws.amazon.com/sdkfornodejs


	19）、数据库，
		在node程序中集成关系型数据库很容易，到那时NoSQL几乎是专为node设计的。
		NoSQL数据库中文档数据库最流行，文档数据库中MongoDB最佳。


		mongolab入手：
			到http://mongolab.com
			登录
			
			1、首先：安装mongoose模块
			npm install --save mongoose
			2、接下来： 将数据库凭证添加到creadentials.js
				mongo: {
					development: {
						connectionString: 'your_dev_connection_string',
					},
					production: {
						connectionString: 'your_production_connection_string',
					},
				},

			3、创建数据库的连接
				var mongoose = require('mongoose');
				var opts = {
					server: {
					socketOptions: { keepAlive: 1 }
				}
				};
				switch(app.get('env')){
						case 'development':
						mongoose.connect(credentials.mongo.development.connectionString, opts);
					break;
						case 'production':
						mongoose.connect(credentials.mongo.production.connectionString, opts);
					break;
					default:
						throw new Error('Unknown execution environment: ' + app.get('env'));
				}

			4、创建模式何模型
				var mongoose = require('mongoose');
				var vacationSchema = mongoose.Schema({
					name: String,
					slug: String,
					category: String,
					sku: String,
					description: String,
					priceInCents: Number,
					tags: [String],
					inSeason: Boolean,
					available: Boolean,
					requiresWaiver: Boolean,
					maximumGuests: Number,
					notes: String,
					packagesSold: Number,
				});
				vacationSchema.methods.getDisplayPrice = function(){
					return '$' + (this.priceInCents / 100).toFixed(2);
				};
				var Vacation = mongoose.model('Vacation', vacationSchema);
				module.exports = Vacation;

				这段代码，首先声明一些需要的属性，以及属性的类型。
				还可以定义模式的方法。
				有了模式之后，我们就可以使用mongoose.model创建模型
				Vacation非常像面向对象编程中的类。

				在主程序中使用这个模型：
					var Vacation = require('./models/vacation.js');
				
				添加数据：
					使用了2个方法，一个是find，查找数据库中的所有Vacation实例，
					并且返回结果列表传递给回调函数并调用。
					调用save方法，保存到数据库中。

				
				
			5、用mongoDB存储会话数据	
				用session-mongoose包提供回话存储
				安装：npm install --save session-mongoose
				主程序设置：
					var MongoSessionStore = require('session-mongoose')(require('connect'));
					var sessionStore = new MongoSessionStore({ url:
					credentials.mongo.connectionString });
					app.use(require('cookie-parser')(credentials.cookieSecret));
					app.use(require('express-session')({ store: sessionStore }));
	
	
	20、bower安装到指定的目录下：
		新建文件：   .bowerrc
		内容：
			{
				"directory" : "public/libs"
			}
	
	21、要弄配置文件
		方便拷贝
		只需要拷贝配置文件，进行npm install bower install  就可以安装所有前后端的依赖
		
		首先：前端的：	bower init  
			生成bower.json
		注意，要在cmd输入bower init 在git bash会报错
	
		后端的： npm init	
			生成 package.json
			
		这样很容易就跑起来。
	
	22、希望，自动启动服务，不用总是手工操作，我们需要用自动化工具grunt
			首先： 全局安装grunt    cli是可以允许你在任何的项目目录去启动它
				npm install grunt-cli -g
			
			新建一个文件 Gruntfile.js
						
			npm install grunt-contrib-watch --save-dev  //监听文件变化，重新执行注册好的任务
			npm install grunt-nodemon --save-dev  //监听app.js项目入口文件，重新保存后，重新开启服务。
			npm install grunt-concurrent --save-dev  //针对慢任务  优化构建时间
		
		
		
	23、注册登录模型设计	
		首先：
			
			要有模型，先得有模式，就是schemas/
		我们新建一个user.js	
		name
		password
		注意密码要加密 
		hash 加盐 
		
		用bcrypt模块，安装npm install bcrypt --save-dev，引入进来。
		随机生成一些数据，跟hash混合在一起
		增加计算强度  
		
		在用户注册的时候，我们存储密码的时候 save
		对密码进行加密处理
		
		
		然后：
			前台的登陆/注册的页面入口，写好。
			
		
		接下来： 来到models/
			新建一个user.js
			创建模型
			
			然后来到app.js
			引入var User = require("./models/user");
			
			接下来写路由：
				app.post('/user/signup', function(req, res){
					var _user = req.body;
					console.log('req.body',req.body);
					var user = new User(_user);
					user.save(function(err, user){
						if( err ){
							console.log(err);
						}
						console.log(user);
					});
				})
			这里会报错，说bCrypt.js没有回调，那我们可以这么处理：
				打开bCrypt.js
					把下面这一段找出来：
						if(!callback) {
							throw "No callback function was given."
						}
					用下面的来代替：
						if(typeof callback == 'undefined') {
							callback = progress;
							progress = null;
						}
		
		接下来，创建一个用户名称列表页面，userlist.handlebars
		为它分配路由，把用户都展现出来，方便查看。
				
			当用户注册的时候，注册名在mongoose里面已经存在了，就不能注册，这里需要判断一下。
			
			
			
		用户登录：
			拿到用户名name,
			
			如果数据库中不存在，
			如果存在，对密码进行匹配，匹配成功，即登录成功
			
		保持用户登录/退出状态：
			通过服务器与客户端的会话：
				req.session.user = user;  //匹配成功之后，意味着这个user是登录成功的，因此把它存起来。
				要用session，我们要用其中间件：
					app.use(express.session({
						secret : "imooc"	
					}));
				要用session，需要引入cookie中间件，
					app.use( express.cookieParser() );
				
			注意，我们在密码匹配成功之后，作了一个跳转到首页的处理，
			因此我们在首页的路由get('/')里，能判断是否有session.user
			特别注意：	如果用的是4.0以上版本的express，那session  cookieParser都已经从express里分离出来了，是一个独立的模块，应该独立安装加载进来。具体的安装使用方法，在前文有。
			
			
			
		问题：  登陆，跳转到首页，找到对应的session会话了，但是，当我重启服务，在刷新首页，会发现会话undefined，  怎么解决？
			会话其实就是用来跟踪用户，确定用户的身份的。
			一个用户的所有的请求是一个会话
			另外一个用户的所有请求是另外要给会话
			会话与会话之间是相互独立的
			去超市买东西，自己的东西放在自己的购物车里，别人的不能放到我的购物车里来。			而我们的http协议是一个无状态的协议，请求完成就断掉。
			也就是说服务器没办法跟踪下去
			因此需要引入一个机制弥补它
			一般用cookie 或 session
			cookie是客户端记录信息
				以前都用cookie, 主要是每一次http请求，都会给服务器带来当前域下的cookie值，服务器来解析cookie,来辨识当前用户的信息。
			而session是服务器端记录信息
				cookie和session综合使用
				当程序需要为某一个请求创建session的时候， 服务会首先检查这个请求里面，有没有session标识，就是sessionid; 如果有，意味着服务器已经给这个用户创建过session， 服务器要做的只是根据sessionid找出对应的session信息即可；  如果没有，那就为它创建一个session，并且创建一个唯一的sessionid， 这个session返回给客户端保存起来，保存在cookie里。
					session服务器怎么保存持久？
						1，内存
						2，mongoDB
						3，redis数据库
			
			
		24, 利用mongodb来做会话的持久化
			需要用到一个中间件 connect-mongo
			安装：
				npm install connect-mongo --save-dev
			
			引入进来,传入express：
			var session = require("express-session")//注意这个要在前头
			var mongoStore = require('connect-mongo')(session);
			
			//然后再这里写入 store ， 创建一个new 实例， 传入url,就是本地芒果数据库地址，还有collection名字
			app.use(session({
				secret : "imooc",
				store : new mongoStore({
					url : "mongodb://localhost/imooc",
					collection : "sessions"
				})
			}));
			
*/




