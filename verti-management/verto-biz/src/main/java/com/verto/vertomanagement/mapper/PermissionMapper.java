package com.verto.vertomanagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.verto.vertomanagement.entity.Permission;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 权限Mapper接口
 * 
 * @author Verto
 * @since 2024-01-01
 */
@Mapper
public interface PermissionMapper extends BaseMapper<Permission> {

    /**
     * 根据权限编码查询权限
     * 
     * @param permissionCode 权限编码
     * @return 权限信息
     */
    @Select("SELECT * FROM sys_permission WHERE permission_code = #{permissionCode} AND deleted = 0")
    Permission findByPermissionCode(@Param("permissionCode") String permissionCode);

    /**
     * 根据父级ID查询子权限列表
     * 
     * @param parentId 父级ID
     * @return 子权限列表
     */
    @Select("SELECT * FROM sys_permission WHERE parent_id = #{parentId} AND deleted = 0 ORDER BY sort_order")
    List<Permission> findByParentId(@Param("parentId") String parentId);

    /**
     * 查询所有菜单权限
     * 
     * @return 菜单权限列表
     */
    @Select("SELECT * FROM sys_permission WHERE type = 1 AND deleted = 0 ORDER BY sort_order")
    List<Permission> findAllMenus();

    /**
     * 根据权限类型查询权限列表
     * 
     * @param type 权限类型
     * @return 权限列表
     */
    @Select("SELECT * FROM sys_permission WHERE type = #{type} AND deleted = 0 ORDER BY sort_order")
    List<Permission> findByType(@Param("type") Integer type);

    /**
     * 根据角色ID查询权限列表
     * 
     * @param roleId 角色ID
     * @return 权限列表
     */
    @Select("SELECT p.* FROM sys_permission p " +
            "INNER JOIN sys_role_permission rp ON p.id = rp.permission_id " +
            "WHERE rp.role_id = #{roleId} AND p.deleted = 0 AND p.status = 1 " +
            "ORDER BY p.sort_order")
    List<Permission> findByRoleId(@Param("roleId") String roleId);

    /**
     * 根据用户ID查询权限列表
     * 
     * @param userId 用户ID
     * @return 权限列表
     */
    @Select("SELECT DISTINCT p.* FROM sys_permission p " +
            "INNER JOIN sys_role_permission rp ON p.id = rp.permission_id " +
            "INNER JOIN sys_user_role ur ON rp.role_id = ur.role_id " +
            "WHERE ur.user_id = #{userId} AND p.deleted = 0 AND p.status = 1 " +
            "ORDER BY p.sort_order")
    List<Permission> findByUserId(@Param("userId") String userId);
}
