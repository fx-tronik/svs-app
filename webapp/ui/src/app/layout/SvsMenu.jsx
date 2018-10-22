import React, {Component} from 'react'

import { NavLink, withRouter } from 'react-router-dom';

import { Menu, Icon } from 'antd'

import logoImg from '../../assets/images/svs.png';

import './App.css'

const SubMenu = Menu.SubMenu;

const menuItems = [
            {name : "camera-type", label : "Camera type", iconType : "bars"},
            {name : "camera", label : "Camera", iconType : "camera"}
];

const actions = [
            {actionName : "manage", label : "Manage", iconType : "edit"},
            {actionName : "create", label : "Create", iconType : "plus-circle"}
];

export class SvsMenu extends Component {

	render() {
		const actionItems = (name) => (
				actions.map(actionItem => {
				const {actionName, label, iconType} = actionItem;
				var actionKey = '/' + actionName + '-' + name;
				if (actionName === 'manage') {
					actionKey = actionKey + 's';
				}
				return (
					<Menu.Item key={actionKey}><NavLink to={actionKey}><Icon type={iconType}/><span>{label}</span></NavLink></Menu.Item>
				);
			     })
		);

		const menu = menuItems.map(menuItem => {
			const {name, label, iconType} = menuItem;
				return (
					<SubMenu key={name}
						title={<span><Icon type={iconType} /><span>{label}</span></span>}
					>
					{actionItems(name)}
					</SubMenu>
				);
		});

		return (
		  <div>
		  <img src={logoImg} className="logo" />
		  <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
		    <Menu.Item key="/">
			<NavLink to="/">
		      <Icon type="home" />
		      <span>Home</span>
			</NavLink>
		    </Menu.Item>
		    {menu}
		    <Menu.Item key="/infrastructure">
			<NavLink to="/infrastructure">
		      <Icon type="dashboard" />
		      <span>Infrastructure</span>
			</NavLink>
		    </Menu.Item>
		    <Menu.Item key="/alert-history">
			<NavLink to="/alert-history">
		      <Icon type="warning" />
		      <span>Alert history</span>
			</NavLink>
		    </Menu.Item>
		  </Menu>
		  </div>
		);
	}
}

export default withRouter(SvsMenu)
