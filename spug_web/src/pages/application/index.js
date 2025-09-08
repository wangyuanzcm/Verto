/**
 * 应用管理模块入口页面
 */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import ProjectIndex from './project';
import RequirementIndex from './requirement';

export default function ApplicationIndex() {
  return (
    <Switch>
      <Route path="/application/project" component={ProjectIndex} />
      <Route path="/application/requirement" component={RequirementIndex} />
    </Switch>
  );
}