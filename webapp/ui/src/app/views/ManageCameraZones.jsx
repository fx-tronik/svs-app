import React from 'react'

import { Icon, Breadcrumb, Button, Alert } from 'antd';

import PropTypes from 'prop-types'

import { connect } from 'react-redux'

import { setOrUpdateCameraZones } from '../../api/cameras/actions'

import ZoneConfig from '../../features/ZoneConfig'

class ManageCameraZones extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      updated: false
    }
  }

  componentDidUpdate(prevProps) {
    if ((prevProps.areCameraZonesSettingOrUpdating === true) && (this.props.areCameraZonesSettingOrUpdating === false))
      this.setState({ updated: true })
  }

  saveCameraZones = (id, camera_zones) => {
    const { dispatch } = this.props
    let service_url = `${window.location.origin.toString()}/api/zone-list/`
    dispatch(setOrUpdateCameraZones(service_url, id, camera_zones))
  }

      render() {
    	const { updated } = this.state;
        const { cameras, cameraFailure } = this.props;

	if (updated && !cameraFailure) {

	return (<div>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item><Icon type="camera" /><span>Camera</span></Breadcrumb.Item>
              <Breadcrumb.Item><span>{this.props.match.params.name}</span></Breadcrumb.Item>
              <Breadcrumb.Item><Icon type="edit" /><span>Manage zones</span></Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ padding: 24, minHeight: '100%', minWidth: '100%' }}>
              <Alert message="Congratulations - camera zones were properly set or updated." type="success" showIcon />
            </div>;
	</div>);

	}

	if (cameraFailure) {

	return (<div>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item><Icon type="camera" /><span>Camera</span></Breadcrumb.Item>
              <Breadcrumb.Item><span>{this.props.match.params.name}</span></Breadcrumb.Item>
              <Breadcrumb.Item><Icon type="edit" /><span>Manage zones</span></Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ padding: 24, minHeight: '100%', minWidth: '100%' }}>
              <Alert message={cameraFailure} type="error" showIcon />
            </div>;
	</div>);

	}

	return (<div>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item><Icon type="camera" /><span>Camera</span></Breadcrumb.Item>
              <Breadcrumb.Item><span>{this.props.match.params.name}</span></Breadcrumb.Item>
              <Breadcrumb.Item><Icon type="edit" /><span>Manage zones</span></Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ padding: 24, minHeight: '100%', minWidth: '100%' }}>
              <ZoneConfig id={this.props.match.params.id} cameras={cameras} saveCameraZones={this.saveCameraZones} />
            </div>
	</div>);
      }
}

ManageCameraZones.propTypes = {
  cameras: PropTypes.array.isRequired,
  areCameraZonesSettingOrUpdating: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { cameraReducer } = state
  const { cameraEntity } = cameraReducer
  const { areCameraZonesSettingOrUpdating, entries: cameras, failure: cameraFailure } = cameraEntity

  return {
    cameras,
    areCameraZonesSettingOrUpdating,
    cameraFailure
  }
}

export default connect(mapStateToProps)(ManageCameraZones)
