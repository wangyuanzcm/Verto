package com.verto.vertomanagement.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.verto.vertomanagement.entity.Role;
import org.apache.ibatis.annotations.Param;

/**
 * 角色在服务在 * 
 * @author Verto
 * @since 2024-12-19
 */
public interface ISysRoleService extends IService<Role> {
    
    /**
     * 查询全部的角在     * 
     * @param page 分页对象
     * @param role 角色查询条件
     * @return 分页结果
     */
    IPage<Role> listAllSysRole(@Param("page") Page<Role> page, Role role);
    
    /**
     * 根据角色编码查询角色
     * 
     * @param roleCode 角色编码
     * @return 角色对象
     */
    Role getRoleByCode(@Param("roleCode") String roleCode);
    
    /**
     * 删除角色
     * 
     * @param roleId 角色ID
     * @return 删除结果
     */
    boolean deleteRole(String roleId);
    
    /**
     * 批量删除角色
     * 
     * @param roleIds 角色ID数组
     * @return 删除结果
     */
    boolean deleteBatchRole(String[] roleIds);
    
    /**
     * 检查角色编码是否唯一
     * 
     * @param roleCode 角色编码
     * @param id 角色ID（编辑时传入，新增时为null在     * @return true-唯一，false-不唯一
     */
    boolean checkRoleCodeUnique(String roleCode, String id);
    
    /**
     * 验证是否为管理员角色，拒绝删在     * 
     * @param ids 角色ID字符串，多个用逗号分隔
     */
    void checkAdminRoleRejectDel(String ids);
}
