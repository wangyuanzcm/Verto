package com.verto.vertomanagement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.verto.vertomanagement.entity.Role;
import com.verto.vertomanagement.mapper.RoleMapper;
import com.verto.vertomanagement.service.ISysRoleService;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Arrays;

/**
 * 角色在服务实现在 * 
 * @author Verto
 * @since 2024-12-19
 */
@Service
public class SysRoleServiceImpl extends ServiceImpl<RoleMapper, Role> implements ISysRoleService {
    
    @Autowired
    private RoleMapper roleMapper;
    
    /**
     * 查询全部的角在     * 
     * @param page 分页对象
     * @param role 角色查询条件
     * @return 分页结果
     */
    @Override
    public IPage<Role> listAllSysRole(@Param("page") Page<Role> page, Role role) {
        QueryWrapper<Role> queryWrapper = new QueryWrapper<>();
        
        // 根据角色名称模糊查询
        if (StringUtils.hasText(role.getRoleName())) {
            queryWrapper.like("role_name", role.getRoleName());
        }
        
        // 根据角色编码模糊查询
        if (StringUtils.hasText(role.getRoleCode())) {
            queryWrapper.like("role_code", role.getRoleCode());
        }
        
        // 根据状态查在        
        if (role.getStatus() != null) {
            queryWrapper.eq("status", role.getStatus());
        }
        
        // 按创建时间倒序排列
        queryWrapper.orderByDesc("create_time");
        
        return this.page(page, queryWrapper);
    }
    
    /**
     * 根据角色编码查询角色
     * 
     * @param roleCode 角色编码
     * @return 角色对象
     */
    @Override
    public Role getRoleByCode(@Param("roleCode") String roleCode) {
        QueryWrapper<Role> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("role_code", roleCode);
        return this.getOne(queryWrapper);
    }
    
    /**
     * 删除角色
     * 
     * @param roleId 角色ID
     * @return 删除结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteRole(String roleId) {
        // TODO: 1.删除角色和用户关在        // roleMapper.deleteRoleUserRelation(roleId);
        
        // TODO: 2.删除角色和权限关在        // roleMapper.deleteRolePermissionRelation(roleId);
        
        // 3.删除角色
        this.removeById(roleId);
        return true;
    }
    
    /**
     * 批量删除角色
     * 
     * @param roleIds 角色ID数组
     * @return 删除结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteBatchRole(String[] roleIds) {
        // TODO: 1.删除角色和用户关在        // roleMapper.deleteBatchRoleUserRelation(roleIds);
        
        // TODO: 2.删除角色和权限关在        // roleMapper.deleteBatchRolePermissionRelation(roleIds);
        
        // 3.删除角色
        this.removeByIds(Arrays.asList(roleIds));
        return true;
    }
    
    /**
     * 检查角色编码是否唯一
     * 
     * @param roleCode 角色编码
     * @param id 角色ID（编辑时传入，新增时为null在     * @return true-唯一，false-不唯一
     */
    @Override
    public boolean checkRoleCodeUnique(String roleCode, String id) {
        QueryWrapper<Role> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("role_code", roleCode);
        
        // 编辑时排除当前记在        
        if (StringUtils.hasText(id)) {
            queryWrapper.ne("id", id);
        }
        
        Role existRole = this.getOne(queryWrapper);
        return existRole == null;
    }
    
    /**
     * 验证是否为管理员角色，拒绝删在     * 
     * @param ids 角色ID字符串，多个用逗号分隔
     */
    @Override
    public void checkAdminRoleRejectDel(String ids) {
        if (!StringUtils.hasText(ids)) {
            return;
        }
        
        String[] idArray = ids.split(",");
        for (String id : idArray) {
            Role role = this.getById(id);
            if (role != null && "admin".equals(role.getRoleCode())) {
                throw new RuntimeException("管理员角色不允许删除在");
            }
        }
    }
}
