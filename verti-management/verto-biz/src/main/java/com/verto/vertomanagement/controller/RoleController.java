package com.verto.vertomanagement.controller;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.verto.vertomanagement.common.Result;
import com.verto.vertomanagement.entity.Role;
import com.verto.vertomanagement.service.IRoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * @Description: 角色管理控制在 * @Author: Verto
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/role")
@Tag(name = "角色管理", description = "角色管理相关接口")
public class RoleController {

    @Autowired
    private IRoleService roleService;

    /**
     * 分页查询角色列表
     */
    @GetMapping("/list")
    @Operation(summary = "分页查询角色列表", description = "支持按角色名称、角色编码、状态等条件查询")
    public Result<IPage<Role>> list(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNo,
            @Parameter(description = "页大小") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "角色名称") @RequestParam(required = false) String roleName,
            @Parameter(description = "角色编码") @RequestParam(required = false) String roleCode,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status) {
        
        try {
            Page<Role> page = new Page<>(pageNo, pageSize);
            QueryWrapper<Role> queryWrapper = new QueryWrapper<>();
            
            // 构建查询条件
            if (StrUtil.isNotBlank(roleName)) {
                queryWrapper.like("role_name", roleName);
            }
            if (StrUtil.isNotBlank(roleCode)) {
                queryWrapper.like("role_code", roleCode);
            }
            if (status != null) {
                queryWrapper.eq("status", status);
            }
            
            queryWrapper.orderByDesc("create_time");
            
            IPage<Role> result = roleService.page(page, queryWrapper);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("查询角色列表失败", e);
            return Result.error("查询角色列表失败：" + e.getMessage());
        }
    }

    /**
     * 查询所有角色
     */
    @GetMapping("/all")
    @Operation(summary = "查询所有角色", description = "获取所有启用状态的角色")
    public Result<List<Role>> getAllRoles() {
        try {
            QueryWrapper<Role> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("status", 1);
            queryWrapper.orderBy(true, true, "create_time");
            
            List<Role> roles = roleService.list(queryWrapper);
            return Result.ok(roles);
        } catch (Exception e) {
            log.error("查询所有角色失败", e);
            return Result.error("查询所有角色失败：" + e.getMessage());
        }
    }

    /**
     * 根据ID查询角色详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "查询角色详情", description = "根据ID查询角色详细信息")
    public Result<Role> getById(@Parameter(description = "角色ID") @PathVariable String id) {
        try {
            Role role = roleService.getById(id);
            if (role == null) {
                return Result.error("角色不存在");
            }
            return Result.ok(role);
        } catch (Exception e) {
            log.error("查询角色详情失败", e);
            return Result.error("查询角色详情失败：" + e.getMessage());
        }
    }

    /**
     * 新增角色
     */
    @PostMapping("/add")
    @Operation(summary = "新增角色", description = "添加新的角色")
    public Result<String> add(@Valid @RequestBody Role role) {
        try {
            boolean success = roleService.save(role);
            if (success) {
                return Result.ok("新增角色成功");
            } else {
                return Result.error("新增角色失败");
            }
        } catch (Exception e) {
            log.error("新增角色失败", e);
            return Result.error("新增角色失败：" + e.getMessage());
        }
    }

    /**
     * 更新角色信息
     */
    @PutMapping("/edit")
    @Operation(summary = "更新角色信息", description = "修改角色信息")
    public Result<String> edit(@Valid @RequestBody Role role) {
        try {
            if (StrUtil.isBlank(role.getId())) {
                return Result.error("角色ID不能为空");
            }
            
            boolean success = roleService.updateById(role);
            if (success) {
                return Result.ok("更新角色信息成功");
            } else {
                return Result.error("更新角色信息失败");
            }
        } catch (Exception e) {
            log.error("更新角色信息失败", e);
            return Result.error("更新角色信息失败：" + e.getMessage());
        }
    }

    /**
     * 删除角色
     */
    @DeleteMapping("/delete/{id}")
    @Operation(summary = "删除角色", description = "根据ID删除角色（逻辑删除）")
    public Result<String> delete(@Parameter(description = "角色ID") @PathVariable String id) {
        try {
            boolean success = roleService.removeById(id);
            if (success) {
                return Result.ok("删除角色成功");
            } else {
                return Result.error("删除角色失败");
            }
        } catch (Exception e) {
            log.error("删除角色失败", e);
            return Result.error("删除角色失败：" + e.getMessage());
        }
    }

    /**
     * 批量删除角色
     */
    @DeleteMapping("/deleteBatch")
    @Operation(summary = "批量删除角色", description = "根据ID列表批量删除角色")
    public Result<String> deleteBatch(@RequestBody List<String> ids) {
        try {
            if (ids == null || ids.isEmpty()) {
                return Result.error("请选择要删除的角色");
            }
            
            boolean success = roleService.removeByIds(ids);
            if (success) {
                return Result.ok("批量删除角色成功");
            } else {
                return Result.error("批量删除角色失败");
            }
        } catch (Exception e) {
            log.error("批量删除角色失败", e);
            return Result.error("批量删除角色失败：" + e.getMessage());
        }
    }

    /**
     * 更新角色状态
     */
    @PutMapping("/updateStatus/{id}/{status}")
    @Operation(summary = "更新角色状态", description = "启用或禁用角色")
    public Result<String> updateStatus(
            @Parameter(description = "角色ID") @PathVariable String id,
            @Parameter(description = "状态：1-启用，0-禁用") @PathVariable Integer status) {
        try {
            Role role = new Role();
            role.setId(id);
            role.setStatus(status);
            
            boolean success = roleService.updateById(role);
            if (success) {
                String statusText = status == 1 ? "启用" : "禁用";
                return Result.ok(statusText + "角色成功");
            } else {
                return Result.error("更新角色状态失败");
            }
        } catch (Exception e) {
            log.error("更新角色状态失败", e);
            return Result.error("更新角色状态失败：" + e.getMessage());
        }
    }

    /**
     * 检查角色编码是否存在
     */
    @GetMapping("/checkRoleCode")
    @Operation(summary = "检查角色编码是否存在", description = "验证角色编码唯一性")
    public Result<Boolean> checkRoleCode(@Parameter(description = "角色编码") @RequestParam String roleCode) {
        try {
            boolean exists = roleService.existsByRoleCode(roleCode);
            return Result.ok(exists);
        } catch (Exception e) {
            log.error("检查角色编码失败", e);
            return Result.error("检查角色编码失败：" + e.getMessage());
        }
    }

    /**
     * 获取角色权限
     */
    @GetMapping("/permissions/{roleId}")
    @Operation(summary = "获取角色权限", description = "获取角色已分配的权限ID列表")
    public Result<List<String>> getRolePermissions(@Parameter(description = "角色ID") @PathVariable String roleId) {
        try {
            List<String> permissionIds = roleService.getPermissionIds(roleId);
            return Result.ok(permissionIds);
        } catch (Exception e) {
            log.error("获取角色权限失败", e);
            return Result.error("获取角色权限失败：" + e.getMessage());
        }
    }

    /**
     * 分配角色权限
     */
    @PostMapping("/assignPermissions/{roleId}")
    @Operation(summary = "分配角色权限", description = "为角色分配权限")
    public Result<String> assignPermissions(
            @Parameter(description = "角色ID") @PathVariable String roleId,
            @RequestBody List<String> permissionIds) {
        try {
            boolean success = roleService.assignPermissions(roleId, permissionIds);
            if (success) {
                return Result.ok("分配角色权限成功");
            } else {
                return Result.error("分配角色权限失败");
            }
        } catch (Exception e) {
            log.error("分配角色权限失败", e);
            return Result.error("分配角色权限失败：" + e.getMessage());
        }
    }
}
