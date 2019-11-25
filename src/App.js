/*global chrome*/
import React, {Component} from "react";
import Button from "antd/es/button";
import {List, Typography} from "antd";
import "./App.css";
import UxListItem from "./UxListItem"

class App extends Component {
  constructor() {
    super();
    if(chrome){
      chrome.runtime.onMessage.addListener(({type, to, url, json}) => {
        if (type === "ajaxInterceptor" && to === "iframe") {
          // 处理
          let tagIndexMap = {};
          json.tags.map((tag, index) => {
            tag.paths = [];
            tagIndexMap[tag.name] = index
          });
          let allPaths = json.paths;
          for (let path in allPaths) {
            for(let mInfo in allPaths[path]){
              let tagName = allPaths[path][mInfo].tags[0];
              let index = tagIndexMap[tagName];
              // 将路径信息加入到对象中
              let pathInfo = allPaths[path][mInfo];
              pathInfo.path = path;
              pathInfo.tagName = tagName;
              json.tags[index].paths.push(pathInfo);
            }
          }
          // 保存到state
          this.setState({tags: json.tags, paths: json.paths});
        }
      });

      // 先发到bg
      chrome.runtime.sendMessage(chrome.runtime.id, {
        type: "ajaxInterceptor",
        to: "background",
        iframeScriptLoaded: true
      });
    }else{
      this.setState({
        tags: [
          {
            name: 'aaa',
            paths:[
              {path: '/aaa/bbb'},
              {path: '/aaa/bbb'},
              {path: '/aaa/bbb'}
            ]
          },
          {name: 'aaa'},
          {name: 'aaa'},{name: 'aaa'},{name: 'aaa'},{name: 'aaa'}
        ]
      })
    }
  }

  state = {
    tags: [],
    paths: {}
  };

  render() {
    return (
      <div className="App">
        <List
          size="small"
          bordered="bordered"
          dataSource={this.state.tags}
          renderItem={item =>
            <UxListItem tag={item}/>
          }
        />
      </div>
    );
  }
}

export default App;
