/*global chrome*/
import React, {Component} from "react";
import {List} from "antd";

class UxListItem extends Component {
  constructor(props) {
    super();
  }

  componentDidMount() {
    this.setState({
      tag: this.props.tag
    });
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.currentShow != this.state.tag.name){
      this.setState({
        itemPathsShow: false
      });
    }
  }

  state = {
    paths: [{path: "/aaa/bbb"}, {path: "/aaa/bbb"}, {path: "/aaa/bbb"}],
    tag: {},
    itemPathsShow: false
  };

  handleItem = () => {
    this.setState({
      itemPathsShow: !this.state.itemPathsShow
    });
    // 向父组件传递切换信息
    this.props.changeListShow(this.state.tag.name);
  };

  handleFouce = (item) => {
    chrome.runtime.sendMessage(chrome.runtime.id, {
      type: "ajaxInterceptor",
      to: "background",
      focus: true,
      tagName: item.tagName,
      operationId: item.operationId
    });
  }

  render() {
    return (
      <div className="UxListItem">
        <div className="item-name" onClick={this.handleItem}>{this.state.tag.name}</div>
        <List
          className={this.state.itemPathsShow ? "" : "ux-list-item-paths-hide"}
          size="small"
          bordered="bordered"
          dataSource={this.state.tag.paths}
          renderItem={
            item =>
            <List.Item className="ux-list-item-path" onClick={this.handleFouce.bind(this, item)}>
              {item.path}&nbsp;&nbsp;&nbsp;{item.summary}
            </List.Item>
          }
        />
      </div>
    );
  }
}

export default UxListItem;
