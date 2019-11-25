chrome.runtime.onInstalled.addListener(function(){
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function(){
		chrome.declarativeContent.onPageChanged.addRules([
			{
				conditions: [
					// 只有打开百度才显示pageAction
					new chrome.declarativeContent.PageStateMatcher({pageUrl: {urlContains: 'swagger-ui.html'}})
				],
				actions: [new chrome.declarativeContent.ShowPageAction()]
			}
		]);
	});

});


// 接收iframe传来的信息，转发给content.js
chrome.runtime.onMessage.addListener(msg => {
	console.log('bg get msg!');
  if (msg.type === 'ajaxInterceptor' && msg.to === 'background') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      chrome.tabs.sendMessage(tabs[0].id, {...msg, to: 'content'});
    })
  }
});
