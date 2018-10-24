import React from 'react'

import { Form, Input, Tooltip, Icon, Button, Breadcrumb, Alert } from 'antd'

import PropTypes from 'prop-types'

import { connect } from 'react-redux'
import { fetchEmployeesIfNeeded, addEmployee } from '../../api/employees/actions'

import CSRFToken from '../../features/CSRFToken'

const FormItem = Form.Item

class EmployeeForm extends React.Component {

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
		      Forename&nbsp;
		      <Tooltip title="Forename cannot be longer than 40 characters.">
		        <Icon type="question-circle-o" />
		      </Tooltip>
		    </span>
		  )}
		>
		  {getFieldDecorator('forename', {
		    rules: [{
			required: true,
			message: `Forename is required!`,
		      }, {
			min: 1,
			max: 40,
			message: "Forename cannot be longer than 40 characters.",
		      }],
		  })(
		    <Input placeholder="Forename" />
		  )}
		</FormItem>
		<FormItem
		  {...formItemLayout}
		  label={(
		    <span>
		      Surname&nbsp;
		      <Tooltip title="Surname cannot be longer than 40 characters.">
		        <Icon type="question-circle-o" />
		      </Tooltip>
		    </span>
		  )}
		>
		  {getFieldDecorator('surname', {
		    rules: [{
			required: true,
			message: `Surname is required!`,
          }, {
      min: 1,
      max: 40,
      message: "Surname cannot be longer than 40 characters.",
          }],
		  })(
		    <Input placeholder="Surname" />
		  )}
		</FormItem>

    <FormItem
		  {...formItemLayout}
		  label={(
		    <span>
		      Positon&nbsp;
		      <Tooltip title="Position cannot be longer than 50 characters.">
		        <Icon type="question-circle-o" />
		      </Tooltip>
		    </span>
		  )}
		>
		  {getFieldDecorator('position', {
		    rules: [{
			required: true,
			message: `Position is required!`,
          }, {
      min: 1,
      max: 50,
      message: "Position cannot be longer than 50 characters.",
          }],
		  })(
		    <Input placeholder="Position" />
		  )}
		</FormItem>

    <FormItem
		  {...formItemLayout}
		  label={(
		    <span>
		      Phone_number&nbsp;
		      <Tooltip title="Please enter a valid phone number.">
		        <Icon type="question-circle-o" />
		      </Tooltip>
		    </span>
		  )}
		>
		  {getFieldDecorator('phone_number', {
		    rules: [{
		pattern: new RegExp("^[0-9\-\+]{9,12}$"),
		message: `Phone number is invalid!`,
	      }],
		  })(
		    <Input placeholder="Phone number" />
		  )}
		</FormItem>

    <FormItem
		  {...formItemLayout}
		  label={(
		    <span>
		      Email&nbsp;
		      <Tooltip title="Please enter a valid email address.">
		        <Icon type="question-circle-o" />
		      </Tooltip>
		    </span>
		  )}
		>
		  {getFieldDecorator('email', {
		    rules: [{
		pattern: new RegExp("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"),
		message: `Email address is invalid!`,
	      }],
		  })(
		    <Input placeholder="Email" />
		  )}
		</FormItem>

    <FormItem
		  {...formItemLayout}
		  label={(
		    <span>
		      Car plate&nbsp;
		      <Tooltip title="Car plate cannot be longer than 10 characters.">
		        <Icon type="question-circle-o" />
		      </Tooltip>
		    </span>
		  )}
		>
		  {getFieldDecorator('car_plate', {
		    rules: [{
    min: 1,
    max: 10,
    message: "Car plate cannot be longer than 10 characters.",
        }],
		  })(
		    <Input placeholder="Car plate" />
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

const WrappedEmployeeForm = Form.create()(EmployeeForm);

class CreateEmployee extends React.Component {
        constructor(props) {
            super(props);
	    this.state = {
		submitted: false
	    }
        }

	componentDidMount() {
    	    const { dispatch } = this.props
	    dispatch(fetchEmployeesIfNeeded())
	}

	onSubmit = (newValues) => {
	    const { dispatch } = this.props
	    dispatch(addEmployee(newValues))
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
					<Alert message="Congratulations - new employee was properly added." type="success" showIcon />
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
			    <WrappedEmployeeForm onSubmit={this.onSubmit}/>
			</div>
		);
	}
}

CreateEmployee.propTypes = {
  isAdding: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  const { employeeReducer } = state
  const { employeeEntity } = employeeReducer
  const { isAdding, failure } = employeeEntity

  return {
	isAdding,
	failure
  }
}

export default connect(mapStateToProps)(CreateEmployee)
