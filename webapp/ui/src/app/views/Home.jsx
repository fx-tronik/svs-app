import React from 'react'

import { Icon, Breadcrumb } from 'antd';

const Home = () => (
	<div>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item><Icon type="home" /><span>Home</span></Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ padding: 24, minHeight: '100%', minWidth: '100%' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </div>
	</div>
)

export default Home
