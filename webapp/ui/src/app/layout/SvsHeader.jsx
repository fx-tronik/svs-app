import React from 'react'

import { Layout } from 'antd';

import { Row, Col } from 'antd';

import cameraImg from '../../assets/images/camera.png';
import eyeImg from '../../assets/images/eye.png';
import svsImg from '../../assets/images/svs-name.png';

import './App.css';

const { Header } = Layout;

const SvsHeader = () => (
<Header className="header" >
		<Row>
		      <Col span={4}><img src={cameraImg} className="header-image" /></Col>
		      <Col span={14} style={{ textAlign: 'center' }}><img src={svsImg} /></Col>
		      <Col span={6} style={{ textAlign: 'right' }}><img src={eyeImg} className="header-image" /></Col>
		    </Row>
</Header>
)

export default SvsHeader

