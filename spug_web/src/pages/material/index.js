/**
 * 物料管理模块入口
 */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import CategoryIndex from './category';
import MaterialIndex from './material';

export default function MaterialModule() {
  return (
    <Switch>
      <Route path="/material/category" component={CategoryIndex} />
      <Route path="/material/material" component={MaterialIndex} />
    </Switch>
  );
}