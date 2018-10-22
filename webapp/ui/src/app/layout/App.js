import React, { Component } from 'react';

import { Layout, Menu, Breadcrumb, Icon } from 'antd';

import { Row, Col } from 'antd';

import SvsHeader from "./SvsHeader";
import SvsFooter from "./SvsFooter";
import SvsContent from "./SvsContent";
import SvsMenu from "./SvsMenu";

const { Sider } = Layout;

class App extends Component {
  state = {
    collapsed: false
  };

  onCollapse = (collapsed) => {
    console.log(collapsed);
    this.setState({ collapsed });
  }

  render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
        >
          <SvsMenu />
        </Sider>
        <Layout style={{ background: '#f8f8f8' }} >
          <SvsHeader />
	  <SvsContent />
          <SvsFooter/>
        </Layout>
      </Layout>
    );
  }
}

export default App;
