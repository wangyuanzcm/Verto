package com.verto.vertomanagement.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.verto.vertomanagement.entity.Role;
import com.verto.vertomanagement.mapper.RoleMapper;
import com.verto.vertomanagement.service.IRoleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @Description: 角色服务实现
 * @Author: Verto
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@Slf4j
@Service
@Transactional
public class RoleServiceImpl extends ServiceImpl<RoleMapper, Role> implements IRoleService {

    @Autowired
    private RoleMapper roleMapper;

    @Override
    public Role findByRoleCode(String roleCode) {
        return roleMapper.findByRoleCode(roleCode);
    }

    @Override
    public List<Role> findByUserId(String userId) {
        return roleMapper.findByUserId(userId);
    }

    @Override
    public List<String> getPermissionIds(String roleId) {
        return roleMapper.getPermissionIds(roleId);
    }

    @Override
    @Transactional
    public boolean assignPermissions(String roleId, List<String> permissionIds) {
        try {
            // 先删除原有的角色权限关系
            roleMapper.deleteRolePermissions(roleId);
            
            // 如果权限列表不为空，则插入新的角色权限关系
            if (permissionIds != null && !permissionIds.isEmpty()) {
                roleMapper.insertRolePermissions(roleId, permissionIds);
            }
            
            return true;
        } catch (Exception e) {
            log.error("为角色分配权限失败", e);
            throw new RuntimeException("为角色分配权限失败：" + e.getMessage());
        }
    }

    @Override
    public boolean existsByRoleCode(String roleCode) {
        return StrUtil.isNotBlank(roleCode) && findByRoleCode(roleCode) != null;
    }

    @Override
    public boolean save(Role entity) {
        // 保存前的业务逻辑处理
        if (entity != null) {
            // 检查角色编码是否重复
            if (StrUtil.isNotBlank(entity.getRoleCode()) && existsByRoleCode(entity.getRoleCode())) {
                throw new RuntimeException("角色编码已存在");
            }
            
            // 设置默认状态
            if (entity.getStatus() == null) {
                entity.setStatus(1); // 默认启用
            }
        }
        
        return super.save(entity);
    }

    @Override
    public boolean updateById(Role entity) {
        if (entity != null && StrUtil.isNotBlank(entity.getId())) {
            Role existRole = getById(entity.getId());
            if (existRole == null) {
                throw new RuntimeException("角色不存在");
            }
            
            // 检查角色编码是否重复（排除自己）
            if (StrUtil.isNotBlank(entity.getRoleCode()) && 
                !entity.getRoleCode().equals(existRole.getRoleCode()) && 
                existsByRoleCode(entity.getRoleCode())) {
                throw new RuntimeException("角色编码已存在");
            }
        }
        
        return super.updateById(entity);
    }
}
