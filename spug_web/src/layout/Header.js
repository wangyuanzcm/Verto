/**
 * Copyright (c) OpenSpug Organization. https://github.com/openspug/spug
 * Copyright (c) <spug.dev@gmail.com>
 * Released under the AGPL-3.0 License.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Dropdown, Menu, Avatar, Divider } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined, CodeOutlined, DownOutlined } from '@ant-design/icons';
import { AuthDiv } from 'components';
import Notification from './Notification';
import styles from './layout.module.less';
import http from '../libs/http';
import history from '../libs/history';
import avatar from './avatar.png';

export default function (props) {

  function handleLogout() {
    history.push('/');
    http.get('/api/account/logout/')
  }

  function openTerminal() {
    window.open('/ssh')
  }

  const UserMenu = (
    <Menu>
      <Menu.Item>
        <Link to="/welcome/info">
          <UserOutlined style={{marginRight: 10}}/>个人中心
        </Link>
      </Menu.Item>
      <Menu.Divider/>
      <Menu.Item onClick={handleLogout}>
        <LogoutOutlined style={{marginRight: 10}}/>退出登录
      </Menu.Item>
    </Menu>
  );

  const ToolsMenu = (
    <Menu>
      <Menu.Item onClick={() => window.open('https://ssl.spug.cc')}>
        免费证书
      </Menu.Item>
      <Menu.Item onClick={() => window.open('https://up.spug.cc')}>
        免费监控
      </Menu.Item>
      <Menu.Item onClick={() => window.open('https://push.spug.cc')}>
        推送助手
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout.Header className={styles.header}>
      <div className={styles.trigger} onClick={props.toggle}>
        {props.collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
      </div>
      <div className={styles.right}>
        <div className={styles.link} onClick={() => window.open('https://spug.cc/')}>官网</div>
        <div className={styles.link} onClick={() => window.open('https://ops.spug.cc/docs/about-spug/')}>文档</div>
        <Dropdown overlay={ToolsMenu} placement="bottomCenter">
          <span className={styles.link}>
            工具服务 <DownOutlined style={{fontSize: 12}}/>
          </span>
        </Dropdown>
        <Divider type="vertical"/>
        <Notification/>
        <AuthDiv className={styles.terminal} auth="host.console.view|host.console.list" onClick={openTerminal}>
          <CodeOutlined style={{fontSize: 16}}/>
        </AuthDiv>
        <div className={styles.user}>
          <Dropdown overlay={UserMenu} style={{background: '#000'}}>
            <span className={styles.action}>
              <Avatar size="small" src={avatar} style={{marginRight: 8}}/>
              {localStorage.getItem('nickname')}
            </span>
          </Dropdown>
        </div>
      </div>
    </Layout.Header>
  )
}