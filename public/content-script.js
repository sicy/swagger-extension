console.log("这是content script!");

// 在页面上插入代码
// var s = document.createElement('script');
// s.src = chrome.extension.getURL('injected.js');
// s.onload = function() {
//     this.remove();
// };
// (document.head || document.documentElement).appendChild(s);

const script = document.createElement("script");
script.setAttribute("type", "text/javascript");
script.setAttribute("src", chrome.extension.getURL("injected.js"));
document.documentElement.appendChild(script);

let json;

let iframeLoaded = false;
// 接收pageScript传来的信息，转发给iframe
window.addEventListener(
  "pageScript",
  function(event) {
    if (iframeLoaded) {
      chrome.runtime.sendMessage({
        type: "ajaxInterceptor",
        to: "iframe",
        ...event.detail
      });
    } else {
      let count = 0;
      const checktLoadedInterval = setInterval(() => {
        if (iframeLoaded) {
          clearInterval(checktLoadedInterval);
          chrome.runtime.sendMessage({
            type: "ajaxInterceptor",
            to: "iframe",
            ...event.detail
          });
        }
        if (count++ > 500) {
          console.error("未能刷新dom状态");
          clearInterval(checktLoadedInterval);
        }
      }, 10);
    }
  },
  false
);

// 接收background.js传来的信息，转发给pageScript
chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === "ajaxInterceptor" && msg.to === "content") {
    if (msg.hasOwnProperty("iframeScriptLoaded")) {
      if (msg.iframeScriptLoaded) iframeLoaded = true;
    } else if (msg.hasOwnProperty("focus")) {
      // operations-tag-采集任务管理表
      let focusId = "#operations-" + msg.tagName + "-" + msg.operationId;
      let tagId = "#operations-tag-" + msg.tagName;
			// scrollTo(tagId);
			if(!$(tagId).parent().hasClass('is-open')){
				$(tagId).click();
			}
			$(focusId + " .opblock-summary").click();
			$(focusId + " .opblock-summary").focus();
			scrollTo(focusId);
    } else {
      postMessage({...msg, to: "pageScript"});
    }
  }
});

//滚动到指定位置
function scrollTo(element) {
  if (!element) {
    $("html,body").animate({scrollTop: 0});
  } else {
    if (element.length > 0) {
      $("html,body").animate({scrollTop: $(element).offset().top - 20});
    }
  }
}

document.addEventListener("DOMContentLoaded", function() {
  // 拦截rest http://localhost:8090/fintax/api/salary/v2/api-docs
  // console.log(XMLHttpRequest);
  // console.log(json);
  // 增加dom
  initCustomPanel();
  document.getElementsByTagName("body")[0].style.marginLeft = "310px";
});

function initCustomPanel() {
  var panel = document.createElement("iframe");
  panel.className = "chrome-plugin-swagger-list-panel";
  // panel.innerHTML = `
  // 	<h2>injected-script操作content-script演示区：</h2>
  // 	<div class="btn-area">
  // 		<a href="javascript:sendMessageToContentScriptByPostMessage('你好，我是普通页面！')">通过postMessage发送消息给content-script</a><br>
  // 		<a href="javascript:sendMessageToContentScriptByEvent('你好啊！我是通过DOM事件发送的消息！')">通过DOM事件发送消息给content-script</a><br>
  // 		<a href="javascript:invokeContentScript('sendMessageToBackground()')">发送消息到后台或者popup</a><br>
  // 	</div>
  // 	<div id="my_custom_log">
  // 	</div>
  // `;
  panel.src = chrome.extension.getURL("index.html");
  document.body.appendChild(panel);
}
