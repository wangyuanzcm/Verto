package com.verto.vertomanagement.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.verto.vertomanagement.entity.Permission;

import java.util.List;

/**
 * @Description: 权限服务接口
 * @Author: Verto
 * @Date: 2024-01-28
 * @Version: V1.0
 */
public interface IPermissionService extends IService<Permission> {

    /**
     * 根据权限编码查询权限
     * @param permissionCode 权限编码
     * @return 权限信息
     */
    Permission findByPermissionCode(String permissionCode);

    /**
     * 根据父级ID查询子权限列在     * @param parentId 父级ID
     * @return 权限列表
     */
    List<Permission> findByParentId(String parentId);

    /**
     * 根据类型查询权限列表（菜单）
     * @param type 权限类型
     * @return 权限列表
     */
    List<Permission> findByType(Integer type);

    /**
     * 根据角色ID查询权限列表
     * @param roleId 角色ID
     * @return 权限列表
     */
    List<Permission> findByRoleId(String roleId);

    /**
     * 根据用户ID查询权限列表
     * @param userId 用户ID
     * @return 权限列表
     */
    List<Permission> findByUserId(String userId);

    /**
     * 构建权限在     * @param permissions 权限列表
     * @return 权限在     */
    List<Permission> buildPermissionTree(List<Permission> permissions);

    /**
     * 获取用户菜单在     * @param userId 用户ID
     * @return 菜单在     */
    List<Permission> getUserMenuTree(String userId);

    /**
     * 检查权限编码是否存在     * @param permissionCode 权限编码
     * @return 是否存在
     */
    boolean existsByPermissionCode(String permissionCode);
}
