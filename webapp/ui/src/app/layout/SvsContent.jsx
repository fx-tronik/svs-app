import React from 'react'

import { Switch, Route } from 'react-router-dom'

import { Layout} from 'antd';

const { Content } = Layout;

import Home from '../views/Home'
import CreateCameraType from '../views/CreateCameraType'
import ManageCameraTypes from '../views/ManageCameraTypes'
import CreateCamera from '../views/CreateCamera'
import ManageCameras from '../views/ManageCameras'
import ManageCameraZones from '../views/ManageCameraZones'
import InfrastructureState from '../views/InfrastructureState'
import AlertsHistory from '../views/AlertsHistory'

const SvsContent = () => (
          <Content style={{ margin: '0 16px' }}>
	    <Switch>
	      <Route exact path='/' component={Home}/>
	      <Route path='/manage-camera-zones/:id/:name' component={ManageCameraZones}/>
	      <Route path='/create-camera-type' component={CreateCameraType}/>
	      <Route path='/manage-camera-types' component={ManageCameraTypes}/>
	      <Route path='/create-camera' component={CreateCamera}/>
	      <Route path='/manage-cameras' component={ManageCameras}/>
	      <Route path='/infrastructure' component={InfrastructureState}/>
	      <Route path='/alert-history' component={AlertsHistory}/>
	    </Switch>
          </Content>
)

export default SvsContent
