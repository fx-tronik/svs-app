import React from 'react'

import { Icon, Breadcrumb, Row, Col, message, Alert } from 'antd'

import moment from 'moment'

import OfficePlan from '../../features/OfficePlan'

import '../layout/App.css'

import PropTypes from 'prop-types'

import { connect } from 'react-redux'
import { fetchInfrastructureStateIfNeeded, invalidateInfrastructureState, deleteInfrastructureComponentById, updateInfrastructureComponent } from '../../api/infrastructure/actions'

function getLocaleDateStringFromDate (date) { return moment(date).format('HH:mm:ss, DD/MM/YYYY'); }

class InfrastructureState extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stateOfOutputs: null,
      stateOfInputs: null,
      stateOfOthers: null,
      lastUpdate: null,
      periodInMs: 5000
      //periodInMs: -1
    };
  }

  getOutputClassNameById = (id) => {
    switch(id) {
        case 'DO1':
          return 'path4060-9-on'
        case 'DO2':
          return 'path4060-9-9-on'
        case 'DO3':
          return 'path4060-9-0-on'
        case 'DO4':
          return 'path4060-9-1-on'
        case 'DO5':
          return 'path4060-9-6-on'
        case 'DO6':
          return 'path4060-9-91-on'
        case 'DO7':
          return 'path4060-9-91-2-on'
        case 'DO8':
          return 'path4060-9-91-3-on'
    }
  }

  getInputClassNameById = (id) => {
    switch(id) {
        case 'DI1':
          return 'rect4319-1-on'
        case 'DI2':
          return 'rect4319-1-7-on'
        case 'DI3':
          return 'rect4319-1-7-4-on'
        case 'DI4':
          return 'rect4319-1-7-0-on'
        case 'DI5':
          return 'rect4319-1-7-5-on'
        case 'DI6':
          return 'rect4319-1-7-6-on'
        case 'DI7':
          return 'rect4319-1-7-1-on'
        case 'DI8':
          return 'rect4319-1-7-3-on'
    }
  }

  getClassNameString = (stateOfOutputs, stateOfInputs) => {
    var classNameString = ''
    if (stateOfOutputs != null) {
      stateOfOutputs.map(entry => {
        const {id, value} = entry
        if (parseFloat(value) === 1.0) {
          if (classNameString.length > 0)
            classNameString = classNameString + ' '
          classNameString = classNameString + this.getOutputClassNameById(id)
        }
      });
    }
    if (stateOfInputs != null) {
      stateOfInputs.map(entry => {
        const {id, value} = entry
        if (parseFloat(value) === 1.0) {
          if (classNameString.length > 0)
            classNameString = classNameString + ' '
          classNameString = classNameString + this.getInputClassNameById(id)
        }
      });
    }
    return classNameString; 
  }

  handleDelete = (id) => {
    const { dispatch } = this.props
    dispatch(deleteInfrastructureComponentById(id))
  }

  invalidateInfrastructure() {
    const { dispatch } = this.props
    dispatch(invalidateInfrastructureState())
    dispatch(fetchInfrastructureStateIfNeeded())
    this.setStateDataBasedOnProps()
  }

  componentDidMount() {
    this.setState( { lastUpdate: null } )
    const { periodInMs } = this.state
    if (periodInMs > 0)
      this.interval = setInterval(() => this.invalidateInfrastructure(), periodInMs);
    else
      this.invalidateInfrastructure()
  }

  componentWillUnmount() {
    if (this.interval)
      clearInterval(this.interval);
  }

  handleRefreshClick(e) {
    e.preventDefault()
    this.invalidateInfrastructure()
  }

  componentDidUpdate(prevProps) {
    if (((prevProps.isLoading === true) && (this.props.isLoading === false)) || 
	((prevProps.isDeleting === true) && (this.props.isDeleting === false)) || 
	((prevProps.isUpdating === true) && (this.props.isUpdating === false))) {
      this.setStateDataBasedOnProps()
    }
    if ((prevProps.isLoading === true) && (this.props.isLoading === false))
      this.setState({ lastUpdate: Date.now() })
    if ((prevProps.isUpdating === true) && (this.props.isUpdating === false))
      message.success(this.props.idOfUpdatedEntry + ' is properly set with 1.0')
  }

  setStateDataBasedOnProps = () => {
    const { infrastructureState} = this.props
    const stateOfInputs = []
    const stateOfOutputs = []
    const stateOfOthers = []
    infrastructureState.map(entry => {
      const {id, value} = entry
      if (id.startsWith('DI'))
        stateOfInputs.push(entry)
      else if (id.startsWith('DO'))
        stateOfOutputs.push(entry)
      else
        stateOfOthers.push(entry)
    });
    this.setState({ stateOfInputs: stateOfInputs, stateOfOutputs: stateOfOutputs, stateOfOthers: stateOfOthers });
  }

  saveComponent = (id, newValue) => {
    const { dispatch } = this.props
    dispatch(updateInfrastructureComponent(id, newValue))
  }

  render() {

    const { failure } = this.props
    const { stateOfOutputs, stateOfInputs, lastUpdate } = this.state

    if (failure) {
	    	return (
			<div>
			    <Breadcrumb style={{ margin: '16px 0' }}>
                              <Breadcrumb.Item><Icon type="dashboard" /><span>Infrastructure state</span></Breadcrumb.Item>
			    </Breadcrumb>
			    <div style={{ padding: 24, minHeight: '100%', minWidth: '100%' }}>
				<Alert message={failure} type="error" showIcon />
			    </div>
			</div>
		);
    }

    return (
	<div>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item><Icon type="dashboard" /><span>Infrastructure state</span></Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ padding: 24, minHeight: '100%', minWidth: '100%' }}>
              <Row>
		      <Col span={24} style={{ textAlign: 'right' }}>Last update at: {(lastUpdate) ? getLocaleDateStringFromDate(lastUpdate) : <Icon type="loading" />}</Col>
	      </Row>
            </div>
            <div style={{ padding: 24, minHeight: '100%', minWidth: '100%', textAlign: 'center' }}>
              <OfficePlan className={this.getClassNameString(stateOfOutputs, stateOfInputs)} saveComponent={this.saveComponent} />
            </div>
	</div>
    );
  }
}

InfrastructureState.propTypes = {
  infrastructureState: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  isDeleting: PropTypes.bool.isRequired,
  didInvalidate: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { infrastructureReducer } = state
  const { infrastructureEntity } = infrastructureReducer
  const { isLoading, isUpdating, isDeleting, didInvalidate, idOfUpdatedEntry, entries: infrastructureState, failure } = infrastructureEntity

  return {
    infrastructureState,
    idOfUpdatedEntry,
    isLoading,
    isUpdating,
    isDeleting,
    didInvalidate,
    failure
  }
}

export default connect(mapStateToProps)(InfrastructureState)
