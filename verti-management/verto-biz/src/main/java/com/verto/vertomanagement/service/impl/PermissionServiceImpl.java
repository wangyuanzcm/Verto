package com.verto.vertomanagement.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.verto.vertomanagement.entity.Permission;
import com.verto.vertomanagement.mapper.PermissionMapper;
import com.verto.vertomanagement.service.IPermissionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @Description: 权限服务实现在 * @Author: Verto
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@Slf4j
@Service
@Transactional
public class PermissionServiceImpl extends ServiceImpl<PermissionMapper, Permission> implements IPermissionService {

    @Autowired
    private PermissionMapper permissionMapper;

    @Override
    public Permission findByPermissionCode(String permissionCode) {
        return permissionMapper.findByPermissionCode(permissionCode);
    }

    @Override
    public List<Permission> findByParentId(String parentId) {
        return permissionMapper.findByParentId(parentId);
    }

    @Override
    public List<Permission> findByType(Integer type) {
        return permissionMapper.findByType(type);
    }

    @Override
    public List<Permission> findByRoleId(String roleId) {
        return permissionMapper.findByRoleId(roleId);
    }

    @Override
    public List<Permission> findByUserId(String userId) {
        return permissionMapper.findByUserId(userId);
    }

    @Override
    public List<Permission> buildPermissionTree(List<Permission> permissions) {
        if (permissions == null || permissions.isEmpty()) {
            return new ArrayList<>();
        }

        // 找出根节点（parentId为空或为"0"的节点）
        List<Permission> rootNodes = permissions.stream()
                .filter(permission -> StrUtil.isBlank(permission.getParentId()) || "0".equals(permission.getParentId()))
                .collect(Collectors.toList());

        // 为每个根节点构建子树
        for (Permission rootNode : rootNodes) {
            buildChildren(rootNode, permissions);
        }

        return rootNodes;
    }

    /**
     * 递归构建子节在     
     * @param parent 父节在     
     * @param allPermissions 所有权限列在     */
    private void buildChildren(Permission parent, List<Permission> allPermissions) {
        List<Permission> children = allPermissions.stream()
                .filter(permission -> parent.getId().equals(permission.getParentId()))
                .collect(Collectors.toList());

        if (!children.isEmpty()) {
            parent.setChildren(children);
            // 递归构建每个子节点的子树
            for (Permission child : children) {
                buildChildren(child, allPermissions);
            }
        }
    }

    @Override
    public List<Permission> getUserMenuTree(String userId) {
        // 获取用户的所有权在        
        List<Permission> userPermissions = findByUserId(userId);
        
        // 过滤出菜单类型的权限（type = 0 在1在        
        List<Permission> menuPermissions = userPermissions.stream()
                .filter(permission -> permission.getType() != null && 
                        (permission.getType() == 0 || permission.getType() == 1))
                .collect(Collectors.toList());
        
        // 构建权限在        
        return buildPermissionTree(menuPermissions);
    }

    @Override
    public boolean existsByPermissionCode(String permissionCode) {
        return StrUtil.isNotBlank(permissionCode) && findByPermissionCode(permissionCode) != null;
    }

    @Override
    public boolean save(Permission entity) {
        // 保存前的业务逻辑处理
        if (entity != null) {
            // 检查权限编码是否重复
            if (StrUtil.isNotBlank(entity.getPermissionCode()) && existsByPermissionCode(entity.getPermissionCode())) {
                throw new RuntimeException("权限编码已存在");
            }
            
            // 设置默认状态
            if (entity.getStatus() == null) {
                entity.setStatus(1); // 默认启用
            }
            
            // 设置默认排序
            if (entity.getSortOrder() == null) {
                entity.setSortOrder(1);
            }
            
            // 设置默认隐藏状在           
             if (entity.getHidden() == null) {
                entity.setHidden(0); // 默认显示
            }
        }
        
        return super.save(entity);
    }

    @Override
    public boolean updateById(Permission entity) {
        if (entity != null && StrUtil.isNotBlank(entity.getId())) {
            Permission existPermission = getById(entity.getId());
            if (existPermission == null) {
                throw new RuntimeException("权限不存在");
            }
            
            // 检查权限编码是否重复（排除自己）
            if (StrUtil.isNotBlank(entity.getPermissionCode()) && 
                !entity.getPermissionCode().equals(existPermission.getPermissionCode()) && 
                existsByPermissionCode(entity.getPermissionCode())) {
                throw new RuntimeException("权限编码已存在");
            }
        }
        
        return super.updateById(entity);
    }
}
