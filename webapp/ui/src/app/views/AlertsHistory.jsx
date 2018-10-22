import React from 'react'

import { Icon, Breadcrumb, Alert, Table, Input, Button, DatePicker, Row, Col } from 'antd'

import PropTypes from 'prop-types'

import { connect } from 'react-redux'
import { fetchAlertHistoryIfNeeded, invalidateAlertHistory } from '../../api/alertHistory/actions'

import moment from 'moment'

function compareByAlph (a, b) { if (a > b) return -1; if (a < b) return 1; return 0; }

function compareByDates (a, b) { let at = moment(a, 'YYYY-MM-DD HH:mm:ss'); let bt = moment(b, 'YYYY-MM-DD HH:mm:ss'); if (at.isBefore(bt)) return -1; if (at.isAfter(bt)) return 1; return 0; }

function getLocaleDateString (dateString) { return moment(dateString, 'YYYY-MM-DD HH:mm:ss').format('HH:mm:ss, DD/MM/YYYY'); }

function getLocaleDateStringFromDate (date) { return moment(date).format('HH:mm:ss, DD/MM/YYYY'); }

function getAlertTypeString (typeString) { let type = parseInt(typeString); 
						if (type === 0) return 'success'; else if (type === 1) return 'info'; else if (type === 2) return 'warning'; else return 'error'; } 

const { RangePicker } = DatePicker;
const dateFormat = 'DD/MM/YYYY';

function dateIsInRange (currentDateString, startDateString, endDateString) {
  let currentDate = moment(currentDateString, 'YYYY-MM-DD');
  let startDate = moment(startDateString, dateFormat);
  let endDate = moment(endDateString, dateFormat);
  let result = (startDate.isBefore(currentDate, 'day') || startDate.isSame(currentDate, 'day')) && (endDate.isAfter(currentDate, 'day') || endDate.isSame(currentDate, 'day'));
  return result;
}

class AlertsHistory extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      pagination: {},
      messageSearchText: '',
      lastUpdate: null,
      endDate: moment().format(dateFormat),
      startDate: moment().subtract(1, 'week').format(dateFormat),
      datePickerChanged: false,
      periodInMs: 5000
      //periodInMs: -1
    };
    this.columns = [{
	  title: 'Message',
	  dataIndex: 'message',
	  sorter: (a, b) => compareByAlph(a.message, b.message),
	  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
		<div className="custom-filter-dropdown">
		  <Input
		    ref={ele => this.messageSearchInput = ele}
		    placeholder="Search message"
		    value={selectedKeys[0]}
		    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
		    onPressEnter={this.handleMessageSearch(selectedKeys, confirm)}
		  />
		  <Button type="primary" onClick={this.handleMessageSearch(selectedKeys, confirm)}>Search</Button>
		  <Button onClick={this.handleMessageReset(clearFilters)}>Reset</Button>
		</div>
	      ),
	      filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
	      onFilter: (value, record) => record.message.toLowerCase().includes(value.toLowerCase()),
	      onFilterDropdownVisibleChange: (visible) => {
		if (visible) {
		  setTimeout(() => {
		    this.messageSearchInput.focus();
		  });
		}
	      },
	      render: (text, record) => {
		const { messageSearchText } = this.state;
                let type = record.type
		return <Alert message={text} type={getAlertTypeString(type)} showIcon />;
	      }
	}, {
	  title: 'Date of creation',
	  dataIndex: 'created_at',
          filters: [{text: 'Success', value: '0'}, {text: 'Information', value: '1'}, {text: 'Warning', value: '2'}, {text: 'Error', value: '3'}],
          onFilter: (value, record) => parseInt(record.type) === parseInt(value),
	  sorter: (a, b) => compareByDates(a.created_at, b.created_at),
          render: (text) => getLocaleDateString(text)
     }];
  }

  handleMessageSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ messageSearchText: selectedKeys[0] });
  }

  handleMessageReset = clearFilters => () => {
    clearFilters();
    this.setState({ messageSearchText: '' });
  }

  setStateDataBasedOnProps() {
    const { startDate, endDate } = this.state
    this.setState({ data: [] });
    const { alertHistory } = this.props
    if (alertHistory.length > 0) {
      var selectedData = [...alertHistory];
      if ((startDate) && (endDate)) {
        selectedData = [...alertHistory.filter(alert => dateIsInRange(alert.created_at, startDate, endDate))]
      }
      const pagination = { ...this.state.pagination };
      pagination.total = selectedData.length;
      this.setState({ data: selectedData });
    }
  }

  componentDidMount() {
    this.setState( { lastUpdate: null, datePickerChanged: false } )
    const { periodInMs } = this.state
    if (periodInMs > 0)
      this.interval = setInterval(() => this.invalidateAlertsHistory(), periodInMs);
    else
      this.invalidateAlertsHistory()
  }

  componentWillUnmount() {
    if (this.interval)
      clearInterval(this.interval);
  }

  invalidateAlertsHistory() {
    const { dispatch } = this.props
    dispatch(invalidateAlertHistory())
    dispatch(fetchAlertHistoryIfNeeded())
    this.setStateDataBasedOnProps()
  }

  handleRefreshClick(e) {
    e.preventDefault()
    this.setState( { lastUpdate: null, datePickerChanged: false } )
    this.invalidateAlertsHistory()
  }

  componentDidUpdate(prevProps) {
    const { datePickerChanged } = this.state
    if (((prevProps.isLoading === true) && (this.props.isLoading === false)) || (datePickerChanged)) {
      this.setStateDataBasedOnProps()
    }
    if ((prevProps.isLoading === true) && (this.props.isLoading === false)) {
      this.setState({ lastUpdate: Date.now() })
    }
    if (datePickerChanged)
      this.setState( { datePickerChanged: false } )
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({ pagination: pager });
  }

  onDatePickerChange = (date, dateString) => {
    let trimmedDateString = (dateString + '').trim()
    if (trimmedDateString === ',') {
	this.setState({ startDate: null, endDate: null, datePickerChanged: true })
    } else {
        let datesArray = trimmedDateString.split(',')
        let newStartDateString = datesArray[0].trim()
        let newEndDateString = datesArray[1].trim()
        this.setState({ startDate: newStartDateString, endDate: newEndDateString, datePickerChanged: true })
    }
  }

  render() {
        const { failure } = this.props
        const { startDate, endDate, lastUpdate } = this.state

	if (failure) {
	    	return (
			<div>
			    <Breadcrumb style={{ margin: '16px 0' }}>
                                <Breadcrumb.Item><Icon type="warning" /><span>Alert history</span></Breadcrumb.Item>
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
              <Breadcrumb.Item><Icon type="warning" /><span>Alert history</span></Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ padding: 24, minHeight: '100%', minWidth: '100%' }}>
              <Row>
		      <Col span={12}><RangePicker defaultValue={[moment(startDate, dateFormat), moment(endDate, dateFormat)]} format={dateFormat} onChange={this.onDatePickerChange}/></Col>
		      <Col span={12} style={{ textAlign: 'right' }}>Last update at: {(lastUpdate) ? getLocaleDateStringFromDate(lastUpdate) : <Icon type="loading" />}</Col>
	      </Row>
              <Table columns={this.columns}
		rowKey={record => record.id}
		dataSource={this.state.data}
		pagination={this.state.pagination}
		loading={this.props.isLoading}
		onChange={this.handleTableChange}/>
            </div>
	</div>
    );
  }
}


AlertsHistory.propTypes = {
  alertHistory: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  didInvalidate: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { alertHistoryReducer } = state
  const { alertHistoryEntity } = alertHistoryReducer
  const { isLoading, didInvalidate, failure, entries: alertHistory } = alertHistoryEntity

  return {
    alertHistory,
    isLoading,
    didInvalidate,
    failure
  }
}

export default connect(mapStateToProps)(AlertsHistory)
