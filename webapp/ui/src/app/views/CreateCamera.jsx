import React from 'react'

import { Form, Input, Tooltip, Icon, Button, Breadcrumb, Select, Alert } from 'antd';

import PropTypes from 'prop-types'

import { connect } from 'react-redux'
import { fetchCameraTypesIfNeeded } from '../../api/cameraTypes/actions'
import { fetchCamerasIfNeeded, addCamera } from '../../api/cameras/actions'

const FormItem = Form.Item

class CameraForm extends React.Component {

  static propTypes = {
    modelTypeOptions: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, newValues) => {
      if (!err) {
        const { onSubmit} = this.props
        onSubmit(newValues)
      }
    });
  }  

  handleReset = () => {
    this.props.form.resetFields();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { modelTypeOptions } = this.props;

    const formItemLayout = {
      labelCol: {
        xs: { span: 12 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 12 },
        sm: { span: 8 },
      },
    };

    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 12,
          offset: 0,
        },
        sm: {
          span: 8,
          offset: 4,
        },
      },
    };

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem
          {...formItemLayout}
          label={(
            <span>
              Camera name&nbsp;
              <Tooltip title="Camera name cannot be longer than 12 characters.">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          )}
        >
          {getFieldDecorator('name', {
            rules: [{
		required: true,
		message: `Camera name is required!`,
	      }, {
		min: 1,
		max: 12,
		message: `Camera name is invalid - its length must be in range <1; 12>!`,
	      }],
          })(
            <Input placeholder="New camera name" />
          )}
        </FormItem>
	<FormItem
          {...formItemLayout}
          label={(
            <span>
              IP&nbsp;
              <Tooltip title="IPv4 is only supported.">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          )}
        >
          {getFieldDecorator('ip', {
            rules: [{
		required: true,
		message: `IP is required!`,
	      }, {
		pattern: new RegExp("^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"),
		message: `IP is invalid!`,
	      }],
          })(
            <Input placeholder="IPv4" />
          )}
        </FormItem>
	<FormItem
          {...formItemLayout}
          label={(
            <span>
              Login&nbsp;
              <Tooltip title="User login cannot be longer than 50 characters.">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          )}
        >
          {getFieldDecorator('login', {
            rules: [{
		required: true,
		message: `User login is required!`,
	      }, {
		min: 1,
		max: 50,
		message: `User login is invalid - its length must be in range <1; 50>!`,
	      }],
          })(
            <Input placeholder="Camera credentials - user login" />
          )}
        </FormItem>
	<FormItem
          {...formItemLayout}
          label={(
            <span>
              Password&nbsp;
              <Tooltip title="User password cannot be longer than 50 characters.">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          )}
        >
          {getFieldDecorator('password', {
            rules: [{
		required: true,
		message: `User password is required!`,
	      }, {
		min: 1,
		max: 50,
		message: `User password is invalid - its length must be in range <1; 50>!`,
	      }],
          })(
            <Input placeholder="Camera credentials - user password" />
          )}
        </FormItem>
	<FormItem
          {...formItemLayout}
          label={(
            <span>
              Camera type&nbsp;
              <Tooltip title="For each camera the type must be chosen.">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          )}
        >
          {getFieldDecorator('camera_type', {
            rules: [{
		required: true,
		message: `Camera type is required!`,
	      }],
          })(
		<Select placeholder="Select camera type">{modelTypeOptions}</Select>
          )}
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">Save</Button>
          <Button type="primary" style={{ marginLeft: 8 }} onClick={this.handleReset}>Reset</Button>
        </FormItem>
      </Form>
    );
  }
}

const WrappedCameraForm = Form.create()(CameraForm);

class CreateCamera extends React.Component {
        constructor(props) {
            super(props);
	    this.state = {
      		modelTypeOptions: [],
		submitted: false
	    }
        }

	componentDidMount() {
    	    const { dispatch } = this.props
	    dispatch(fetchCameraTypesIfNeeded())
	    dispatch(fetchCamerasIfNeeded())
	    this.setModelTypeOptions()
	}

	onSubmit = (newValues) => {
	    const { cameraTypes, dispatch } = this.props
            const selectedCameraType = cameraTypes.find(cameraType => cameraType.id === parseInt(newValues.camera_type))
            const updatedValues = Object.assign({}, newValues, { camera_type: selectedCameraType} )  
            dispatch(addCamera(updatedValues))
	}

	setModelTypeOptions = () => {
	    const { cameraTypes} = this.props
	    const modelTypeOptions = [];
	    cameraTypes.map(item => {
	      const {id, camera_model} = item;
	      const Option = Select.Option;
	      modelTypeOptions.push(<Option key={id}>{camera_model}</Option>);
	    });
	    this.setState({ modelTypeOptions: modelTypeOptions })
	}

	componentDidUpdate(prevProps) {
    	  if ((prevProps.isCameraTypeLoading === true) && (this.props.isCameraTypeLoading === false)) {
	    this.setModelTypeOptions()  
	  }
	  if (prevProps.isAdding === true) {
	    this.setState({ submitted: true })
	  }
	}

	render() {
    		const { cameraTypeFailure, cameraFailure } = this.props;
    		const { modelTypeOptions, submitted } = this.state;

	        if (submitted && !cameraFailure) {
			return (
				<div>
				    <Breadcrumb style={{ margin: '16px 0' }}>
				      <Breadcrumb.Item><Icon type="camera" /><span>Camera</span></Breadcrumb.Item>
				      <Breadcrumb.Item><Icon type="plus-circle" /><span>Create</span></Breadcrumb.Item>
				    </Breadcrumb>
				    <div style={{ padding: 24, minHeight: '100%', minWidth: '100%' }}>
					<Alert message="Congratulations - new camera was properly added." type="success" showIcon />
				    </div>
				</div>
			);
		}
		
		if (cameraTypeFailure || cameraFailure) {
			const failure = (cameraTypeFailure) ? cameraTypeFailure : cameraFailure
		    	return (
				<div>
				    <Breadcrumb style={{ margin: '16px 0' }}>
				      <Breadcrumb.Item><Icon type="camera" /><span>Camera</span></Breadcrumb.Item>
				      <Breadcrumb.Item><Icon type="plus-circle" /><span>Create</span></Breadcrumb.Item>
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
			      <Breadcrumb.Item><Icon type="camera" /><span>Camera</span></Breadcrumb.Item>
			      <Breadcrumb.Item><Icon type="plus-circle" /><span>Create</span></Breadcrumb.Item>
			    </Breadcrumb>
			    <WrappedCameraForm onSubmit={this.onSubmit} modelTypeOptions={modelTypeOptions} />
			</div>
		);
	}
}

CreateCamera.propTypes = {
  cameraTypes: PropTypes.array.isRequired,
  isAdding: PropTypes.bool.isRequired,
  isCameraTypeLoading: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  const { cameraTypeReducer, cameraReducer } = state
  const { cameraTypeEntity } = cameraTypeReducer
  const { isLoading: isCameraTypeLoading, entries: cameraTypes, failure: cameraTypeFailure } = cameraTypeEntity
  const { cameraEntity } = cameraReducer
  const { isAdding, failure: cameraFailure } = cameraEntity

  return {
        cameraTypes,
	isAdding,
	isCameraTypeLoading,
	cameraTypeFailure,
	cameraFailure
  }
}

export default connect(mapStateToProps)(CreateCamera)
