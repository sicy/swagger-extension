// 命名空间
let ajax_interceptor_qoweifjqon = {
  settings: {
    ajaxInterceptor_switchOn: false,
    ajaxInterceptor_rules: [],
  },
  originalXHR: window.XMLHttpRequest,
  myXHR: function() {
    let pageScriptEventDispatched = false;
    const modifyResponse = () => {
      ajax_interceptor_qoweifjqon.settings.ajaxInterceptor_rules.forEach(({
        switchOn = true,
        match,
        overrideTxt = ''
      }) => {
        if (switchOn && match && this.responseURL.indexOf(match) > -1) {
          this.responseText = overrideTxt;
          this.response = overrideTxt;

          if (!pageScriptEventDispatched) {
            window.dispatchEvent(new CustomEvent("pageScript", {
              detail: {
                url: this.responseURL,
                match
              }
            }));
            pageScriptEventDispatched = true;
          }
        }
      })
    }

    const xhr = new ajax_interceptor_qoweifjqon.originalXHR;
    for (let attr in xhr) {
      if (attr === 'onreadystatechange') {
        xhr.onreadystatechange = (...args) => {
          if (this.readyState == 4) {
            console.log(this);
            // 请求成功
            if (ajax_interceptor_qoweifjqon.settings.ajaxInterceptor_switchOn) {
              // 开启拦截
              modifyResponse();
            }
          }
          this.onreadystatechange && this.onreadystatechange.apply(this, args);
        }
        continue;
      } else if (attr === 'onload') {
        xhr.onload = (...args) => {
          console.log(this);
          // 请求成功
          if (ajax_interceptor_qoweifjqon.settings.ajaxInterceptor_switchOn) {
            // 开启拦截
            modifyResponse();
          }
          this.onload && this.onload.apply(this, args);
        }
        continue;
      }

      if (typeof xhr[attr] === 'function') {
        this[attr] = xhr[attr].bind(xhr);
      } else {
        // responseText和response不是writeable的，但拦截时需要修改它，所以修改就存储在this[`_${attr}`]上
        if (attr === 'responseText' || attr === 'response') {
          Object.defineProperty(this, attr, {
            get: () => this[`_${attr}`] == undefined ? xhr[attr] : this[`_${attr}`],
            set: (val) => this[`_${attr}`] = val,
            enumerable: true
          });
        } else {
          Object.defineProperty(this, attr, {
            get: () => xhr[attr],
            set: (val) => xhr[attr] = val,
            enumerable: true
          });
        }
      }
    }
  },

  originalFetch: window.fetch.bind(window),
  myFetch: function(...args) {
    return ajax_interceptor_qoweifjqon.originalFetch(...args).then((response) => {
      if (response.url.indexOf('v2/api-docs') > 0) {
        // 复制一个出来
        let newResp = response.clone();
        // console.log(newResp);
        let reader = newResp.body.getReader();
        var decoder = new TextDecoder();
        let allData = '';
        reader.read().then(function processText({
          done,
          value
        }) {
          if (done) {
            // console.log("Stream complete");
            let json = JSON.parse(allData);
            window.dispatchEvent(new CustomEvent("pageScript", {
              detail: {json}
            }));
            return;
          }
          var data = decoder.decode(value);
          allData += data;
          // Read some more, and call this function again
          return reader.read().then(processText);
        });
      }

      return response;

    });
  },
}

window.XMLHttpRequest = ajax_interceptor_qoweifjqon.myXHR;
window.fetch = ajax_interceptor_qoweifjqon.myFetch;

// window.addEventListener("message", function(event) {
//   const data = event.data;
//
//   if (data.type === 'ajaxInterceptor' && data.to === 'pageScript') {
//     ajax_interceptor_qoweifjqon.settings[data.key] = data.value;
//   }
//
//   if (ajax_interceptor_qoweifjqon.settings.ajaxInterceptor_switchOn) {
//     window.XMLHttpRequest = ajax_interceptor_qoweifjqon.myXHR;
//     window.fetch = ajax_interceptor_qoweifjqon.myFetch;
//   } else {
//     window.XMLHttpRequest = ajax_interceptor_qoweifjqon.originalXHR;
//     window.fetch = ajax_interceptor_qoweifjqon.originalFetch;
//   }
// }, false);
