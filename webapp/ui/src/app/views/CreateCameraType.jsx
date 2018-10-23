import React from 'react'

import { Form, Input, Tooltip, Icon, Button, Breadcrumb, Alert } from 'antd'

import PropTypes from 'prop-types'

import { connect } from 'react-redux'
import { fetchCameraTypesIfNeeded, addCameraType } from '../../api/cameraTypes/actions'

import CSRFToken from '../../features/CSRFToken'

const FormItem = Form.Item

class CameraTypeForm extends React.Component {

  static propTypes = {
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
                <CSRFToken />
		<FormItem
		  {...formItemLayout}
		  label={(
		    <span>
		      Camera model&nbsp;
		      <Tooltip title="Camera model cannot be longer than 100 characters.">
		        <Icon type="question-circle-o" />
		      </Tooltip>
		    </span>
		  )}
		>
		  {getFieldDecorator('camera_model', {
		    rules: [{
			required: true,
			message: `Camera model is required!`,
		      }, {
			min: 1,
			max: 100,
			message: `Camera model is invalid - its length must be in range <1; 100>!`,
		      }],
		  })(
		    <Input placeholder="New camera model" />
		  )}
		</FormItem>
		<FormItem
		  {...formItemLayout}
		  label={(
		    <span>
		      Stream URL&nbsp;
		      <Tooltip title="Stream URL must cover credentials, server address and path to the stream file.">
		        <Icon type="question-circle-o" />
		      </Tooltip>
		    </span>
		  )}
		>
		  {getFieldDecorator('custom_camera_url', {
		    rules: [{
			required: true,
			message: `Stream URL is required!`,
		    }],
		  })(
		    <Input placeholder="Its stream URL" />
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

const WrappedCameraTypeForm = Form.create()(CameraTypeForm);

class CreateCameraType extends React.Component {
        constructor(props) {
            super(props);
	    this.state = {
		submitted: false
	    }
        }

	componentDidMount() {
    	    const { dispatch } = this.props
	    dispatch(fetchCameraTypesIfNeeded())
	}

	onSubmit = (newValues) => {
	    const { dispatch } = this.props
	    dispatch(addCameraType(newValues))
	}

	componentDidUpdate(prevProps) {
	  if (prevProps.isAdding === true) {
	    this.setState({ submitted: true })
	  }
	}

	render() {
    		const { failure } = this.props;
    		const { submitted } = this.state;

	        if (submitted && !failure) {
			return (
				<div>
				    <Breadcrumb style={{ margin: '16px 0' }}>
				      <Breadcrumb.Item><Icon type="bars" /><span>Camera type</span></Breadcrumb.Item>
				      <Breadcrumb.Item><Icon type="plus-circle" /><span>Create</span></Breadcrumb.Item>
				    </Breadcrumb>
				    <div style={{ padding: 24, minHeight: '100%', minWidth: '100%' }}>
					<Alert message="Congratulations - new camera type was properly added." type="success" showIcon />
				    </div>
				</div>
			);
		}
		
		if (failure) {
		    	return (
				<div>
				    <Breadcrumb style={{ margin: '16px 0' }}>
				      <Breadcrumb.Item><Icon type="bars" /><span>Camera type</span></Breadcrumb.Item>
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
			      <Breadcrumb.Item><Icon type="bars" /><span>Camera type</span></Breadcrumb.Item>
			      <Breadcrumb.Item><Icon type="plus-circle" /><span>Create</span></Breadcrumb.Item>
			    </Breadcrumb>
			    <WrappedCameraTypeForm onSubmit={this.onSubmit}/>
			</div>
		);
	}
}

CreateCameraType.propTypes = {
  isAdding: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  const { cameraTypeReducer } = state
  const { cameraTypeEntity } = cameraTypeReducer
  const { isAdding, failure } = cameraTypeEntity

  return {
	isAdding,
	failure
  }
}

export default connect(mapStateToProps)(CreateCameraType)

