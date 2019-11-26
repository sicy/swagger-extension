/*global chrome*/
import React, {Component} from "react";
import {Input, Select} from "antd";
// import Button from "antd/es/button";
import {List} from "antd";
import "./App.css";
import UxListItem from "./UxListItem";

const { Option } = Select;

class App extends Component {
  constructor() {
    super();
    if (chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(({type, to, url, json}) => {
        if (type === "ajaxInterceptor" && to === "iframe") {
          // 处理
          let tagIndexMap = {};
          json.tags.map((tag, index) => {
            tag.paths = [];
            tagIndexMap[tag.name] = index;
          });
          let allPaths = json.paths;
          for (let path in allPaths) {
            for (let mInfo in allPaths[path]) {
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
          this.createIndex();
        }
      });

      // 先发到bg
      chrome.runtime.sendMessage(chrome.runtime.id, {
        type: "ajaxInterceptor",
        to: "background",
        iframeScriptLoaded: true
      });
    }
  }

  componentDidMount() {
    if (!chrome.runtime.onMessage) {
      this.setState({
        tags: [
          {
            name: "aaa",
            paths: [{path: "/aaa/bbb"}, {path: "/aaa/bbb"}, {path: "/aaa/bbb"}]
          },
          {
            name: "vvv",
            paths: [{path: "/dd/bbb"}, {path: "/aaa/bbb"}, {path: "/aaa/bbb"}]
          },
          {
            name: "ccc",
            paths: [{path: "/aaa/bbb"}, {path: "/aaa/bbb"}, {path: "/aaa/bbb"}]
          }
        ]
      });
      this.createIndex();
    }
  }

  createIndex = () => {
    // 对数据进行处理
    // tagName
    let tagIndex = {};
    this.state.tags.map(tag => tagIndex[tag.name] = tag);
  }

  state = {
    tags: [],
    paths: {},
    currentTag: "",
    indexCache: {}
  };

  changeListShow = itemId => {
    this.setState({
      currentTag: itemId
    });
  };

  search = (e) => {
    // TODO
  }

  render() {
    const selectBefore = (
      <Select defaultValue="controller" style={{width: 90}}>
        <Option value="tag">tag名</Option>
        <Option value="controller">controller</Option>
        <Option value="path">path</Option>
        <Option value="desc">接口名</Option>
      </Select>
    );

    return (
      <div className="App">
        <Input addonBefore={selectBefore} placeholder="search" onChange={this.search.bind(this)}/>
        <List
          size="small"
          bordered="bordered"
          dataSource={this.state.tags}
          renderItem={item => (
            <UxListItem
              tag={item}
              changeListShow={this.changeListShow}
              currentShow={this.state.currentTag}
            />
          )}
        />
      </div>
    );
  }
}

export default App;
