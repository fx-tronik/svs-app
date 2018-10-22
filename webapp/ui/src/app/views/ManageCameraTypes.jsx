import React from 'react'

import { Table, Icon, Breadcrumb, Input, Button, Popconfirm, Tooltip, Form, Alert } from 'antd'

import PropTypes from 'prop-types'

import '../layout/App.css'

import { connect } from 'react-redux'
import { fetchCameraTypesIfNeeded, invalidateCameraTypes, deleteCameraTypeById, updateCameraType } from '../../api/cameraTypes/actions'
import { fetchCamerasIfNeeded, invalidateCameras } from '../../api/cameras/actions'

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
    if (this.props.dataIndex === 'camera_model') {
      return [{
	required: true,
	message: `${title} is required!`,
      }, {
	min: 1,
	max: 100,
	message: `${title} is invalid - its length must be in range <1; 100>!`,
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

class ManageCameraTypes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      pagination: {},
      nameSearchText: '',
      urlSearchText: '',
      editingId: ''
    };
    this.columns = [{
	  title: 'Model',
	  dataIndex: 'camera_model',
          editable: true,
	  sorter: (a, b) => compareByAlph(a.camera_model, b.camera_model),
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
	      onFilter: (value, record) => record.camera_model.toLowerCase().includes(value.toLowerCase()),
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
	  title: 'URL',
	  dataIndex: 'custom_camera_url',
          editable: true,
	  sorter: (a, b) =>  compareByAlph(a.custom_camera_url, b.custom_camera_url),
	  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
		<div className="custom-filter-dropdown">
		  <Input
		    ref={ele => this.urlSearchInput = ele}
		    placeholder="Search URL"
		    value={selectedKeys[0]}
		    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
		    onPressEnter={this.handleURLSearch(selectedKeys, confirm)}
		  />
		  <Button type="primary" onClick={this.handleURLSearch(selectedKeys, confirm)}>Search</Button>
		  <Button onClick={this.handleURLReset(clearFilters)}>Reset</Button>
		</div>
	      ),
	      filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
	      onFilter: (value, record) => record.custom_camera_url.toLowerCase().includes(value.toLowerCase()),
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

  handleURLSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ urlSearchText: selectedKeys[0] });
  }

  handleURLReset = clearFilters => () => {
    clearFilters();
    this.setState({ urlSearchText: '' });
  }

  handleDelete = (id) => {
    const { dispatch } = this.props
    dispatch(deleteCameraTypeById(id))
  }

  invalidateCamerasIfNeeded(id) {
    const { cameras } = this.props
    const index = cameras.findIndex(entry => entry.camera_type === id);
    if (index > -1) {
      const { dispatch } = this.props
      dispatch(invalidateCameras())
      dispatch(fetchCamerasIfNeeded())
    }
  }

  setStateDataBasedOnProps() {
    this.setState({ data: [] });
    const { cameraTypes } = this.props
    if (cameraTypes.length > 0) {
      const pagination = { ...this.state.pagination };
      pagination.total = cameraTypes.length;
      this.setState({ data: cameraTypes });
    }
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(fetchCameraTypesIfNeeded())
    this.setStateDataBasedOnProps()
  }

  handleRefreshClick(e) {
    e.preventDefault()
    const { dispatch } = this.props
    dispatch(invalidateCameraTypes())
    dispatch(fetchCameraTypesIfNeeded())
    this.setStateDataBasedOnProps()
  }

  componentDidUpdate(prevProps) {
    if ((prevProps.isUpdating === true) && (this.props.isUpdating === false)) {
      const { idOfUpdatedEntry } = this.props
      this.invalidateCamerasIfNeeded(idOfUpdatedEntry)
    }
    if ((prevProps.isDeleting === true) && (this.props.isDeleting === false)) {
      const { idOfDeletedEntry } = this.props
      this.invalidateCamerasIfNeeded(idOfDeletedEntry)
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
      dispatch(updateCameraType(id, newValues))
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
			      <Breadcrumb.Item><Icon type="bars" /><span>Camera type</span></Breadcrumb.Item>
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
		      <Breadcrumb.Item><Icon type="bars" /><span>Camera type</span></Breadcrumb.Item>
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

ManageCameraTypes.propTypes = {
  cameraTypes: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  isDeleting: PropTypes.bool.isRequired,
  didInvalidate: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { cameraTypeReducer, cameraReducer } = state
  const { cameraTypeEntity } = cameraTypeReducer
  const { isLoading, isUpdating, isDeleting, didInvalidate, failure, idOfDeletedEntry, idOfUpdatedEntry, entries: cameraTypes } = cameraTypeEntity
  const { cameraEntity } = cameraReducer
  const { entries: cameras } = cameraEntity

  return {
    cameras,
    cameraTypes,
    isLoading,
    isUpdating,
    isDeleting,
    didInvalidate,
    idOfDeletedEntry,
    idOfUpdatedEntry,
    failure
  }
}

export default connect(mapStateToProps)(ManageCameraTypes)
