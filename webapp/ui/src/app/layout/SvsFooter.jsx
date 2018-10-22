import React from 'react'

import { Layout, Icon } from 'antd';

import { Row, Col } from 'antd';

const { Footer } = Layout;

const SvsFooter = () => (
<Footer style={{ background: '#f8f8f8' }} >
		<Row style={{ textAlign: 'center' }}><a href="http://www.fx-tronik.pl/">FX-tronik</a> ©2018 
			<a href="https://www.facebook.com/fxtronikPL" style={{ padding: '0 0 0 10px' }}><Icon type="facebook" theme="outlined" /></a>
                    <a href="https://twitter.com/FxTronik"><Icon type="twitter" theme="outlined" /></a>
                    <a href="https://www.linkedin.com/company/11411144/"><Icon type="linkedin" theme="filled" /></a>
		    </Row>            
</Footer>
)

export default SvsFooter
