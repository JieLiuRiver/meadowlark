var arrTest = [
	'今天是星期三',
	'昨天是星期二',
	'明天是星期四',
	'后天是星期五~！'
];

exports.getAnswer = function(){
	var idx = Math.floor( Math.random()*arrTest.length );
	return arrTest[idx];
}