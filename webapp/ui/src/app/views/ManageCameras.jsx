import React from 'react'

import { Table, Icon, Breadcrumb, Input, Button, Popconfirm, Tooltip, Form, Alert, Select } from 'antd'

import PropTypes from 'prop-types'

import { NavLink, withRouter } from 'react-router-dom';

import '../layout/App.css'

import { connect } from 'react-redux'
import { fetchCameraTypesIfNeeded } from '../../api/cameraTypes/actions'
import { fetchCamerasIfNeeded, invalidateCameras, deleteCameraById, updateCamera } from '../../api/cameras/actions'

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

  getInput = (record, modelTypeOptions) => {
    if (this.props.inputType === 'select') {
      return <Select initialValue={record.camera_type.camera_model} style={{ width: 200 }} >{modelTypeOptions}</Select>;
    }
    return <Input />;
  }

  getValidationRules = (title) => {
    if (this.props.dataIndex === 'name') {
      return [{
	required: true,
	message: `${title} is required!`,
      }, {
	min: 1,
	max: 12,
	message: `${title} is invalid - its length must be in range <1; 12>!`,
      }];
    } else if (this.props.dataIndex === 'ip') {
      return [{
	required: true,
	message: `${title} is required!`,
      }, {
	pattern: new RegExp("^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"),
	message: `${title} is invalid!`,
      }];
    } else if ((this.props.dataIndex === 'login') || (this.props.dataIndex === 'password')) {
      return [{
	required: true,
	message: `${title} is required!`,
      }, {
	min: 1,
	max: 50,
	message: `${title} is invalid - its length must be in range <1; 50>!`,
      }];
    }
  }

  getInitialValue = (record) => {
    if (this.props.dataIndex === 'camera_type.camera_model') {
      return record.camera_type.camera_model
    }
    return record[this.props.dataIndex]
  }

  render() {
    const { modelTypeOptions, editing, dataIndex, title, inputType, record, index, ...restProps } = this.props;
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
                    initialValue: (this.getInitialValue(record)),
                  })(this.getInput(record, modelTypeOptions))}
                </FormItem>
              ) : restProps.children}
            </td>
          );
        }}
      </EditableContext.Consumer>
    );
  }
}

class ManageCameras extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      modelTypeFilters: [],
      modelTypeOptions: [],
      pagination: {},
      nameSearchText: '',
      ipSearchText: '',
      loginSearchText: '',
      urlSearchText: '',
      editingId: ''
    };
    this.columns = [{
	  title: 'Name',
	  dataIndex: 'name',
          editable: true,
	  sorter: (a, b) => compareByAlph(a.name, b.name),
	  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
		<div className="custom-filter-dropdown">
		  <Input
		    ref={ele => this.nameSearchInput = ele}
		    placeholder="Search name"
		    value={selectedKeys[0]}
		    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
		    onPressEnter={this.handleNameSearch(selectedKeys, confirm)}
		  />
		  <Button type="primary" onClick={this.handleNameSearch(selectedKeys, confirm)}>Search</Button>
		  <Button onClick={this.handleNameReset(clearFilters)}>Reset</Button>
		</div>
	      ),
	      filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
	      onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
	      onFilterDropdownVisibleChange: (visible) => {
		if (visible) {
		  setTimeout(() => {
		    this.nameSearchInput.focus();
		  });
		}
	      },
	      render: (text) => {
		const { nameSearchText } = this.state;
		return nameSearchText ? (
		  <span>
		    {
			text.split(new RegExp(`(${nameSearchText})|(?=${nameSearchText})`, 'i')).map((fragment, i) => (
		      fragment.toLowerCase() === nameSearchText.toLowerCase()
		        ? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
		    ))}
		  </span>
		) : text;
	      }
	}, {
	  title: 'IP',
	  dataIndex: 'ip',
          editable: true,
	  sorter: (a, b) =>  compareByAlph(a.ip, b.ip),
	  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
		<div className="custom-filter-dropdown">
		  <Input
		    ref={ele => this.ipSearchInput = ele}
		    placeholder="Search IP"
		    value={selectedKeys[0]}
		    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
		    onPressEnter={this.handleIPSearch(selectedKeys, confirm)}
		  />
		  <Button type="primary" onClick={this.handleIPSearch(selectedKeys, confirm)}>Search</Button>
		  <Button onClick={this.handleIPReset(clearFilters)}>Reset</Button>
		</div>
	      ),
	      filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
	      onFilter: (value, record) => record.ip.toLowerCase().includes(value.toLowerCase()),
	      onFilterDropdownVisibleChange: (visible) => {
		if (visible) {
		  setTimeout(() => {
		    this.ipSearchInput.focus();
		  });
		}
	      },
	      render: (text) => {
		const { ipSearchText } = this.state;
		return ipSearchText ? (
		  <span>
		    {
			text.split(new RegExp(`(${ipSearchText})|(?=${ipSearchText})`, 'i')).map((fragment, i) => (
		      fragment.toLowerCase() === ipSearchText.toLowerCase()
		        ? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
		    ))}
		  </span>
		) : text;
	      }
	}, {
	  title: 'Login',
	  dataIndex: 'login',
          editable: true,
	  sorter: (a, b) =>  compareByAlph(a.login, b.login),
	  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
		<div className="custom-filter-dropdown">
		  <Input
		    ref={ele => this.loginSearchInput = ele}
		    placeholder="Search login"
		    value={selectedKeys[0]}
		    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
		    onPressEnter={this.handleLoginSearch(selectedKeys, confirm)}
		  />
		  <Button type="primary" onClick={this.handleLoginSearch(selectedKeys, confirm)}>Search</Button>
		  <Button onClick={this.handleLoginReset(clearFilters)}>Reset</Button>
		</div>
	      ),
	      filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
	      onFilter: (value, record) => record.login.toLowerCase().includes(value.toLowerCase()),
	      onFilterDropdownVisibleChange: (visible) => {
		if (visible) {
		  setTimeout(() => {
		    this.loginSearchInput.focus();
		  });
		}
	      },
	      render: (text) => {
		const { loginSearchText } = this.state;
		return loginSearchText ? (
		  <span>
		    {
			text.split(new RegExp(`(${loginSearchText})|(?=${loginSearchText})`, 'i')).map((fragment, i) => (
		      fragment.toLowerCase() === loginSearchText.toLowerCase()
		        ? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
		    ))}
		  </span>
		) : text;
	      }
	}, {
	  title: 'Password',
	  dataIndex: 'password',
          editable: true,
	  sorter: (a, b) =>  compareByAlph(a.password, b.password)
	}, {
	  title: 'Model',
	  dataIndex: 'camera_type.camera_model',
          editable: true,
	  sorter: (a, b) =>  compareByAlph(a.camera_type.camera_model, b.camera_type.camera_model),
	  filters: this.state.modelTypeFilters,
	  onFilter: (value, record) => record.camera_type.camera_model.indexOf(value) === 0
	}, {
	  title: 'Stream URL',
	  dataIndex: 'formatted_url',
	  sorter: (a, b) =>  compareByAlph(a.formatted_url, b.formatted_url),
	  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
		<div className="custom-filter-dropdown">
		  <Input
		    ref={ele => this.urlSearchInput = ele}
		    placeholder="Search stream URL"
		    value={selectedKeys[0]}
		    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
		    onPressEnter={this.handleUrlSearch(selectedKeys, confirm)}
		  />
		  <Button type="primary" onClick={this.handleUrlSearch(selectedKeys, confirm)}>Search</Button>
		  <Button onClick={this.handleUrlReset(clearFilters)}>Reset</Button>
		</div>
	      ),
	      filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
	      onFilter: (value, record) => record.formatted_url.toLowerCase().includes(value.toLowerCase()),
	      onFilterDropdownVisibleChange: (visible) => {
		if (visible) {
		  setTimeout(() => {
		    this.urlSearchInput.focus();
		  });
		}
	      },
	      render: (text) => {
		const { urlSearchText } = this.state;
		return urlSearchText ? (
		  <span>
		    {
			text.split(new RegExp(`(${urlSearchText})|(?=${urlSearchText})`, 'i')).map((fragment, i) => (
		      fragment.toLowerCase() === urlSearchText.toLowerCase()
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
		  <NavLink to={'/manage-camera-zones/' + record.id + '/' + record.name + '/'} style={{ padding: '0 10px 0 0' }}>
		      <Tooltip title="Manage zones"><Icon type="layout" /></Tooltip>
		  </NavLink>
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

  handleNameSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ nameSearchText: selectedKeys[0] });
  }

  handleNameReset = clearFilters => () => {
    clearFilters();
    this.setState({ nameSearchText: '' });
  }

  handleIPSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ ipSearchText: selectedKeys[0] });
  }

  handleIPReset = clearFilters => () => {
    clearFilters();
    this.setState({ ipSearchText: '' });
  }

  handleLoginSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ loginSearchText: selectedKeys[0] });
  }

  handleLoginReset = clearFilters => () => {
    clearFilters();
    this.setState({ loginSearchText: '' });
  }

  handleUrlSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ urlSearchText: selectedKeys[0] });
  }

  handleUrlReset = clearFilters => () => {
    clearFilters();
    this.setState({ urlSearchText: '' });
  }

  handleDelete = (id) => {
    const { dispatch } = this.props
    dispatch(deleteCameraById(id))
  }

  setStateDataBasedOnProps() {
    this.setState({ data: [] });
    const { cameras } = this.props
    if (cameras.length > 0) {
      const pagination = { ...this.state.pagination };
      pagination.total = cameras.length;
      this.setState({ data: cameras });
    }
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(fetchCameraTypesIfNeeded())
    dispatch(fetchCamerasIfNeeded())
    this.setStateDataBasedOnProps()
    this.setModelTypeFiltersAndOptions()
  }

  handleRefreshClick(e) {
    e.preventDefault()
    const { dispatch } = this.props
    dispatch(invalidateCameras())
    dispatch(fetchCamerasIfNeeded())
    this.setStateDataBasedOnProps()
  }

  setModelTypeFiltersAndOptions = () => {
    const { cameraTypes} = this.props
    const modelTypeOptions = []
    const modelTypeFilters = []
    cameraTypes.map(item => {
      const {id, camera_model} = item
      modelTypeFilters.push({text: `${camera_model}`,value: `${camera_model}`});
      const Option = Select.Option
      modelTypeOptions.push(<Option key={camera_model}>{camera_model}</Option>)
    });
    this.setState({modelTypeFilters: modelTypeFilters, modelTypeOptions: modelTypeOptions});
  }

  componentDidUpdate(prevProps) {
    if ((prevProps.isCameraTypeLoading === true) && (this.props.isCameraTypeLoading === false)) {
      this.setModelTypeFiltersAndOptions()
    }
    if (((prevProps.isCameraLoading === true) && (this.props.isCameraLoading === false)) || 
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
      const { cameraTypes, dispatch } = this.props
      const selectedCameraType = cameraTypes.find(cameraType => cameraType.camera_model === newValues.camera_type.camera_model)
      const updatedValues = Object.assign({}, newValues, { camera_type: selectedCameraType} ) 
      dispatch(updateCamera(id, updatedValues))
      this.setState({ editingId: '' })
    });
  }

  cancel = () => {
    this.setState({ editingId: '' });
  }

  render() {
    const { modelTypeFilters, modelTypeOptions } = this.state
    const { cameraTypeFailure, cameraFailure } = this.props

    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

    const columns = this.columns.map((col) => {
      if (col.dataIndex === 'camera_type.camera_model') {
        col.filters = modelTypeFilters;
      }
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.dataIndex === 'camera_type.camera_model' ? 'select' : 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
	  modelTypeOptions: modelTypeOptions
        }),
      };
    });

	if (cameraTypeFailure || cameraFailure) {
		const failure = (cameraTypeFailure) ? cameraTypeFailure : cameraFailure
	    	return (
			<div>
			    <Breadcrumb style={{ margin: '16px 0' }}>
			      <Breadcrumb.Item><Icon type="bars" /><span>Camera</span></Breadcrumb.Item>
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
		      <Breadcrumb.Item><Icon type="bars" /><span>Camera</span></Breadcrumb.Item>
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

ManageCameras.propTypes = {
  cameraTypes: PropTypes.array.isRequired,
  isCameraTypeLoading: PropTypes.bool.isRequired,
  cameras: PropTypes.array.isRequired,
  isCameraLoading: PropTypes.bool.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  isDeleting: PropTypes.bool.isRequired,
  didInvalidate: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { cameraTypeReducer, cameraReducer } = state
  const { cameraTypeEntity } = cameraTypeReducer
  const { isLoading: isCameraTypeLoading, entries: cameraTypes, failure: cameraTypeFailure } = cameraTypeEntity
  const { cameraEntity } = cameraReducer
  const { isLoading: isCameraLoading, isUpdating, isDeleting, didInvalidate, entries: cameras, failure: cameraFailure } = cameraEntity

  return {
    cameraTypes,
    isCameraTypeLoading,
    cameraTypeFailure,
    cameras,
    isCameraLoading,
    cameraFailure,
    isUpdating,
    isDeleting,
    didInvalidate
  }
}

export default connect(mapStateToProps)(ManageCameras)
