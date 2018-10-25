import React from 'react'

import { Table, Icon, Breadcrumb, Input, Button, Popconfirm, Tooltip, Form, Alert } from 'antd'

import PropTypes from 'prop-types'

import '../layout/App.css'

import { connect } from 'react-redux'
import { fetchEmployeesIfNeeded, invalidateEmployees, deleteEmployeeById, updateEmployee } from '../../api/employees/actions'

function compareByAlph (a, b) { if (a > b) { return -1; } if (a < b) { return 1; } return 0; }

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {

  getValidationRules = (title) => {
    if (this.props.dataIndex === 'forename' || this.props.dataIndex === 'surname') {
      return [{
  	required: true,
  	message: `${title} is required!`,
        }, {
  	min: 1,
  	max: 40,
  	message: `${title} cannot be longer than 40 characters.`,
        }];
    }
    if (this.props.dataIndex === 'position') {
      return [{
  	required: true,
  	message: `${title} is required!`,
        }, {
  	min: 1,
  	max: 40,
  	message: `${title} cannot be longer than 50 characters.`,
        }];
    }
    if (this.props.dataIndex === 'phone_number') {
      return [{
    pattern: new RegExp("^[0-9\-\+]{9,12}$"),
    message: `Phone number is invalid!`,
        }];
    }
    if (this.props.dataIndex === 'email') {
      return [{
    pattern: new RegExp("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"),
    message: `Email address is invalid!`,
        }];
    }
    if (this.props.dataIndex === 'car_plate') {
      return [{
  	required: true,
  	message: `${title} is required!`,
        }, {
  	min: 1,
  	max: 10,
  	message: `${title} cannot be longer than 10 characters.`,
        }];
    }
    return [{
	required: true,
	message: `${title} is required!`,
    }];
  }

  render() {
    const { editing, dataIndex, title, inputType, record, index, ...restProps } = this.props;
    return (
      <EditableContext.Consumer>
        {(form) => {
          const { getFieldDecorator } = form;
          return (
            <td {...restProps}>
              {editing ? (
                <FormItem style={{ margin: 0 }}>
                  {getFieldDecorator(dataIndex, {
                    rules: (this.getValidationRules(title)),
                    initialValue: record[dataIndex],
                  })(<Input />)}
                </FormItem>
              ) : restProps.children}
            </td>
          );
        }}
      </EditableContext.Consumer>
    );
  }
}

class ManageEmployees extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      pagination: {},
      fornameSearchText: '',
      surnameSearchText: '',
      positionSearchText: '',
      phoneNumberSearchText: '',
      emailSearchText: '',
      carPlateSearchText: '',
      editingId: ''
    };
    this.columns = [{
	  title: 'Forename',
	  dataIndex: 'forename',
          editable: true,
	  sorter: (a, b) => compareByAlph(a.forename, b.forename),
	  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
		<div className="custom-filter-dropdown">
		  <Input
		    ref={ele => this.fornameSearchInput = ele}
		    placeholder="Search forename"
		    value={selectedKeys[0]}
		    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
		    onPressEnter={this.handleFornameSearch(selectedKeys, confirm)}
		  />
		  <Button type="primary" onClick={this.handleFornameSearch(selectedKeys, confirm)}>Search</Button>
		  <Button onClick={this.handleFornameReset(clearFilters)}>Reset</Button>
		</div>
	      ),
	      filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
	      onFilter: (value, record) => (record.forename !== null) ? record.forename.toLowerCase().includes(value.toLowerCase()) : false,
	      onFilterDropdownVisibleChange: (visible) => {
		if (visible) {
		  setTimeout(() => {
		    this.fornameSearchInput.focus();
		  });
		}
	      },
	      render: (text) => {
		const { fornameSearchText } = this.state;
		return fornameSearchText ? (
		  <span>
		    {
			text.split(new RegExp(`(${fornameSearchText})|(?=${fornameSearchText})`, 'i')).map((fragment, i) => (
		      fragment.toLowerCase() === fornameSearchText.toLowerCase()
		        ? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
		    ))}
		  </span>
		) : text;
	      }
	}, {
	  title: 'Surname',
	  dataIndex: 'surname',
          editable: true,
	  sorter: (a, b) =>  compareByAlph(a.surname, b.surname),
	  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
		<div className="custom-filter-dropdown">
		  <Input
		    ref={ele => this.surnameSearchInput = ele}
		    placeholder="Search surname"
		    value={selectedKeys[0]}
		    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
		    onPressEnter={this.handleSurnameSearch(selectedKeys, confirm)}
		  />
		  <Button type="primary" onClick={this.handleSurnameSearch(selectedKeys, confirm)}>Search</Button>
		  <Button onClick={this.handleSurnameReset(clearFilters)}>Reset</Button>
		</div>
	      ),
	      filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
	      onFilter: (value, record) => (record.surname !== null) ? record.surname.toLowerCase().includes(value.toLowerCase()) : false,
	      onFilterDropdownVisibleChange: (visible) => {
		if (visible) {
		  setTimeout(() => {
		    this.surnameSearchInput.focus();
		  });
		}
	      },
	      render: (text) => {
		const { surnameSearchText } = this.state;
		return surnameSearchText ? (
		  <span>
		    {
			text.split(new RegExp(`(${surnameSearchText})|(?=${surnameSearchText})`, 'i')).map((fragment, i) => (
		      fragment.toLowerCase() === surnameSearchText.toLowerCase()
		        ? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
		    ))}
		  </span>
		) : text;
	      }
	}, {
	  title: 'Position',
	  dataIndex: 'position',
          editable: true,
	  sorter: (a, b) =>  compareByAlph(a.position, b.positon),
	  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
		<div className="custom-filter-dropdown">
		  <Input
		    ref={ele => this.positionSearchInput = ele}
		    placeholder="Search positon"
		    value={selectedKeys[0]}
		    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
		    onPressEnter={this.handlePositionSearch(selectedKeys, confirm)}
		  />
		  <Button type="primary" onClick={this.handlePositionSearch(selectedKeys, confirm)}>Search</Button>
		  <Button onClick={this.handlePositionReset(clearFilters)}>Reset</Button>
		</div>
	      ),
	      filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
	      onFilter: (value, record) => (record.position !== null) ? record.position.toLowerCase().includes(value.toLowerCase()) : false,
	      onFilterDropdownVisibleChange: (visible) => {
		if (visible) {
		  setTimeout(() => {
		    this.positionSearchInput.focus();
		  });
		}
	      },
	      render: (text) => {
		const { positionSearchText } = this.state;
		return positionSearchText ? (
		  <span>
		    {
			text.split(new RegExp(`(${positionSearchText})|(?=${positionSearchText})`, 'i')).map((fragment, i) => (
		      fragment.toLowerCase() === positionSearchText.toLowerCase()
		        ? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
		    ))}
		  </span>
		) : text;
	      }
	}, {
	  title: 'Phone number',
	  dataIndex: 'phone_number',
          editable: true,
	  sorter: (a, b) =>  compareByAlph(a.phone_number, b.phone_number),
	  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
		<div className="custom-filter-dropdown">
		  <Input
		    ref={ele => this.phoneNumberSearchInput = ele}
		    placeholder="Search phone number"
		    value={selectedKeys[0]}
		    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
		    onPressEnter={this.handlePhoneNumberSearch(selectedKeys, confirm)}
		  />
		  <Button type="primary" onClick={this.handlePhoneNumberSearch(selectedKeys, confirm)}>Search</Button>
		  <Button onClick={this.handlePhoneNumberReset(clearFilters)}>Reset</Button>
		</div>
	      ),
	      filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
	      onFilter: (value, record) => (record.phone_number !== null) ? record.phone_number.toLowerCase().includes(value.toLowerCase()) : false,
	      onFilterDropdownVisibleChange: (visible) => {
		if (visible) {
		  setTimeout(() => {
		    this.phoneNumberSearchInput.focus();
		  });
		}
	      },
	      render: (text) => {
		const { phoneNumberSearchText } = this.state;
		return phoneNumberSearchText ? (
		  <span>
		    {
			text.split(new RegExp(`(${phoneNumberSearchText})|(?=${phoneNumberSearchText})`, 'i')).map((fragment, i) => (
		      fragment.toLowerCase() === phoneNumberSearchText.toLowerCase()
		        ? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
		    ))}
		  </span>
		) : text;
	      }
	}, {
	  title: 'Email',
	  dataIndex: 'email',
          editable: true,
	  sorter: (a, b) =>  compareByAlph(a.email, b.email),
	  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
		<div className="custom-filter-dropdown">
		  <Input
		    ref={ele => this.emailSearchInput = ele}
		    placeholder="Search email"
		    value={selectedKeys[0]}
		    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
		    onPressEnter={this.handleEmailSearch(selectedKeys, confirm)}
		  />
		  <Button type="primary" onClick={this.handleEmailSearch(selectedKeys, confirm)}>Search</Button>
		  <Button onClick={this.handleEmailReset(clearFilters)}>Reset</Button>
		</div>
	      ),
	      filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
	      onFilter: (value, record) => (record.email !== null) ? record.email.toLowerCase().includes(value.toLowerCase()) : false,
	      onFilterDropdownVisibleChange: (visible) => {
		if (visible) {
		  setTimeout(() => {
		    this.emailSearchInput.focus();
		  });
		}
	      },
	      render: (text) => {
		const { emailSearchText } = this.state;
		return emailSearchText ? (
		  <span>
		    {
			text.split(new RegExp(`(${emailSearchText})|(?=${emailSearchText})`, 'i')).map((fragment, i) => (
		      fragment.toLowerCase() === emailSearchText.toLowerCase()
		        ? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
		    ))}
		  </span>
		) : text;
	      }
	}, {
	  title: 'Car plate',
	  dataIndex: 'car_plate',
          editable: true,
	  sorter: (a, b) =>  compareByAlph(a.car_plate, b.car_plate),
	  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
		<div className="custom-filter-dropdown">
		  <Input
		    ref={ele => this.carPlateSearchInput = ele}
		    placeholder="Search car plate"
		    value={selectedKeys[0]}
		    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
		    onPressEnter={this.handleCarPlateSearch(selectedKeys, confirm)}
		  />
		  <Button type="primary" onClick={this.handleCarPlateSearch(selectedKeys, confirm)}>Search</Button>
		  <Button onClick={this.handleCarPlateReset(clearFilters)}>Reset</Button>
		</div>
	      ),
	      filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
	      onFilter: (value, record) => (record.car_plate !== null) ? record.car_plate.toLowerCase().includes(value.toLowerCase()) : false,
	      onFilterDropdownVisibleChange: (visible) => {
		if (visible) {
		  setTimeout(() => {
		    this.carPlateSearchInput.focus();
		  });
		}
	      },
	      render: (text) => {
		const { carPlateSearchText } = this.state;
		return carPlateSearchText ? (
		  <span>
		    {
			text.split(new RegExp(`(${carPlateSearchText})|(?=${carPlateSearchText})`, 'i')).map((fragment, i) => (
		      fragment.toLowerCase() === carPlateSearchText.toLowerCase()
		        ? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
		    ))}
		  </span>
		) : text;
	      }
	}, {
	      title: 'Operation',
	      dataIndex: 'operation',
	      render: (text, record) => {
                const editable = this.isEditing(record);
		return (
		    <div>
		      {editable ? (
		        <span>
		          <EditableContext.Consumer>
		            {form => (
		              <a
		                href="javascript:;"
		                onClick={() => this.save(form, record.id)}
		                style={{ marginRight: 8 }}
		              >
		                <Tooltip title="Save"><Icon type="save" theme="outlined" /></Tooltip>
		              </a>
		            )}
		          </EditableContext.Consumer>
		          <Popconfirm
		            title="Sure to cancel?"
		            onConfirm={() => this.cancel(record.id)}
		          >
		            <a style={{ padding: '0 10px 0 0' }}><Tooltip title="Cancel"><Icon type="close" /></Tooltip></a>
		          </Popconfirm>
		        </span>
		      ) : (
		        <a onClick={() => this.edit(record.id)} style={{ padding: '0 10px 0 0' }}><Tooltip title="Edit"><Icon type="edit" /></Tooltip></a>
		      )}
		  {this.state.data.length >= 1
		    ? (
		      <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.id)}>
		        <a href="javascript:;"><Tooltip title="Delete"><Icon type="delete" /></Tooltip></a>
		      </Popconfirm>
		    ) : null}
		    </div>
		);
	      }
	}];
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
  }

  handleFornameSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ fornameSearchText: selectedKeys[0] });
  }

  handleFornameReset = clearFilters => () => {
    clearFilters();
    this.setState({ fornameSearchText: '' });
  }

  handleSurnameSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ surnameSearchText: selectedKeys[0] });
  }

  handleSurnameReset = clearFilters => () => {
    clearFilters();
    this.setState({ surnameSearchText: '' });
  }

  handlePositionSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ positionSearchText: selectedKeys[0] });
  }

  handlePositionReset = clearFilters => () => {
    clearFilters();
    this.setState({ positionSearchText: '' });
  }

  handlePhoneNumberSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ phoneNumberSearchText: selectedKeys[0] });
  }

  handlePhoneNumberReset = clearFilters => () => {
    clearFilters();
    this.setState({ phoneNumberSearchText: '' });
  }

  handleEmailSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ emailSearchText: selectedKeys[0] });
  }

  handleEmailReset = clearFilters => () => {
    clearFilters();
    this.setState({ emailSearchText: '' });
  }

  handleCarPlateSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ carPlateSearchText: selectedKeys[0] });
  }

  handleCarPlateReset = clearFilters => () => {
    clearFilters();
    this.setState({ carPlateSearchText: '' });
  }

  handleDelete = (id) => {
    const { dispatch } = this.props
    dispatch(deleteEmployeeById(id))
  }

  invalidateEmployeesIfNeeded(id) {
    const { employees } = this.props
    const index = employees.findIndex(entry => entry.employee === id);
    if (index > -1) {
      const { dispatch } = this.props
      dispatch(invalidateEmployees())
      dispatch(fetchEmployeesIfNeeded())
    }
  }

  setStateDataBasedOnProps() {
    this.setState({ data: [] });
    const { employees } = this.props
    if (employees.length > 0) {
      const pagination = { ...this.state.pagination };
      pagination.total = employees.length;
      this.setState({ data: employees });
    }
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(fetchEmployeesIfNeeded())
    this.setStateDataBasedOnProps()
  }

  handleRefreshClick(e) {
    e.preventDefault()
    const { dispatch } = this.props
    dispatch(invalidateEmployees())
    dispatch(fetchEmployeesIfNeeded())
    this.setStateDataBasedOnProps()
  }

  componentDidUpdate(prevProps) {
    if ((prevProps.isUpdating === true) && (this.props.isUpdating === false)) {
      const { idOfUpdatedEntry } = this.props
      this.invalidateEmployeesIfNeeded(idOfUpdatedEntry)
    }
    if ((prevProps.isDeleting === true) && (this.props.isDeleting === false)) {
      const { idOfDeletedEntry } = this.props
      this.invalidateEmployeesIfNeeded(idOfDeletedEntry)
    }
    if (((prevProps.isLoading === true) && (this.props.isLoading === false)) ||
	((prevProps.isDeleting === true) && (this.props.isDeleting === false)) ||
	((prevProps.isUpdating === true) && (this.props.isUpdating === false))) {
      this.setStateDataBasedOnProps()
    }
  }

  isEditing = (record) => {
    return record.id === this.state.editingId;
  }

  edit(id) {
    this.setState({ editingId: id });
  }

  save(form, id) {
    form.validateFields((error, newValues) => {
      if (error) {
        return;
      }
      const { dispatch } = this.props
      dispatch(updateEmployee(id, newValues))
      this.setState({ editingId: '' })
    });
  }

  cancel = () => {
    this.setState({ editingId: '' });
  }

  render() {
    const { failure } = this.props

    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
        }),
      };
    });

	if (failure) {
	    	return (
			<div>
			    <Breadcrumb style={{ margin: '16px 0' }}>
			      <Breadcrumb.Item><Icon type="idcard" /><span>Employee</span></Breadcrumb.Item>
			      <Breadcrumb.Item><Icon type="edit" /><span>Manage</span></Breadcrumb.Item>
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
		      <Breadcrumb.Item><Icon type="idcard" /><span>Employee</span></Breadcrumb.Item>
		      <Breadcrumb.Item><Icon type="edit" /><span>Manage</span></Breadcrumb.Item>
		    </Breadcrumb>
		    <div style={{ padding: 24, minHeight: '100%', minWidth: '100%' }}>
		      <Table
			components={components}
			columns={columns}
			rowKey={record => record.id}
			dataSource={this.state.data}
			pagination={this.state.pagination}
			loading={this.props.isLoading}
			onChange={this.handleTableChange}
			bordered
			rowClassName="editable-row"
		      />
		    </div>
		</div>
	);
  }
}

ManageEmployees.propTypes = {
  employees: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  isDeleting: PropTypes.bool.isRequired,
  didInvalidate: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { employeeReducer } = state
  const { employeeEntity } = employeeReducer
  const { isLoading, isUpdating, isDeleting, didInvalidate, failure, idOfDeletedEntry, idOfUpdatedEntry, entries: employees } = employeeEntity

  return {
    employees,
    isLoading,
    isUpdating,
    isDeleting,
    didInvalidate,
    idOfDeletedEntry,
    idOfUpdatedEntry,
    failure
  }
}

export default connect(mapStateToProps)(ManageEmployees)
