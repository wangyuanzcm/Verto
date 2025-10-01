package com.verto.vertomanagement.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.verto.vertomanagement.entity.Role;

import java.util.List;

/**
 * @Description: 角色服务接口
 * @Author: Verto
 * @Date: 2024-01-28
 * @Version: V1.0
 */
public interface IRoleService extends IService<Role> {

    /**
     * 根据角色编码查询角色
     * @param roleCode 角色编码
     * @return 角色信息
     */
    Role findByRoleCode(String roleCode);

    /**
     * 根据用户ID查询角色列表
     * @param userId 用户ID
     * @return 角色列表
     */
    List<Role> findByUserId(String userId);

    /**
     * 获取角色的权限ID列表
     * @param roleId 角色ID
     * @return 权限ID列表
     */
    List<String> getPermissionIds(String roleId);

    /**
     * 为角色分配权在     * @param roleId 角色ID
     * @param permissionIds 权限ID列表
     * @return 是否成功
     */
    boolean assignPermissions(String roleId, List<String> permissionIds);

    /**
     * 检查角色编码是否存在     * @param roleCode 角色编码
     * @return 是否存在
     */
    boolean existsByRoleCode(String roleCode);
}
