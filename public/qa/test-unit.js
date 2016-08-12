var myModule = require('../libs/myModule');
var expect = require('chai').expect;
suite('myModule cookies tests', function(){
	test('myMoudle里的函数应该执行，并返回数组',function(){
		expect(typeof myModule.getAnswer() === 'string');
	})
})