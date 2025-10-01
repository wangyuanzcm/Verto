package com.verto.vertomanagement.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.verto.vertomanagement.common.Result;
import com.verto.vertomanagement.entity.User;
import com.verto.vertomanagement.service.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * 用户管理控制器
 * 
 * @author Verto
 * @since 2024-01-01
 */
@Slf4j
@RestController
@ConditionalOnProperty(name = "feature.user-controller.enabled", havingValue = "true", matchIfMissing = false)
@RequestMapping("/system/user")
@Tag(name = "用户管理", description = "系统用户管理相关接口")
public class UserController {

    @Autowired
    private IUserService userService;

    /**
     * 分页查询用户列表
     *
     * @param current 当前页码
     * @param size 每页大小
     * @param username 用户名
     * @param realname 真实姓名
     * @param status 状态
     * @return 分页结果
     */
    @GetMapping("/list")
    @Operation(summary = "分页查询用户", description = "分页查询用户列表")
    public Result<IPage<User>> list(
            @Parameter(description = "当前页") @RequestParam(defaultValue = "1") Long current,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Long size,
            @Parameter(description = "用户名") @RequestParam(required = false) String username,
            @Parameter(description = "真实姓名") @RequestParam(required = false) String realname,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status) {
        try {
            Page<User> page = new Page<>(current, size);
            QueryWrapper<User> queryWrapper = new QueryWrapper<>();
            
            if (username != null && !username.trim().isEmpty()) {
                queryWrapper.like("username", username);
            }
            if (realname != null && !realname.trim().isEmpty()) {
                queryWrapper.like("realname", realname);
            }
            if (status != null) {
                queryWrapper.eq("status", status);
            }
            
            queryWrapper.orderByDesc("create_time");
            IPage<User> result = userService.page(page, queryWrapper);
            
            // 清除密码字段
            result.getRecords().forEach(user -> user.setPassword(null));
            
            return Result.ok(result);
        } catch (Exception e) {
            log.error("查询用户列表失败: {}", e.getMessage());
            return Result.error("查询用户列表失败");
        }
    }

    /**
     * 根据ID查询用户详情
     *
     * @param id 用户ID
     * @return 用户信息
     */
    @GetMapping("/{id}")
    @Operation(summary = "查询用户详情", description = "根据ID查询用户详情")
    public Result<User> getById(@PathVariable String id) {
        try {
            User user = userService.getById(id);
            if (user != null) {
                user.setPassword(null); // 清除密码字段
                return Result.ok(user);
            } else {
                return Result.error("用户不存在");
            }
        } catch (Exception e) {
            log.error("查询用户详情失败: {}", e.getMessage());
            return Result.error("查询用户详情失败");
        }
    }

    /**
     * 创建用户
     *
     * @param user 用户信息
     * @return 操作结果
     */
    @PostMapping
    @Operation(summary = "创建用户", description = "创建新用户")
    public Result<String> create(@RequestBody User user) {
        try {
            // 检查用户名是否重复
            if (userService.existsByUsername(user.getUsername())) {
                return Result.error("用户名已存在");
            }
            
            // 检查邮箱是否重复
            if (user.getEmail() != null && userService.existsByEmail(user.getEmail())) {
                return Result.error("邮箱已被注册");
            }
            
            // 检查手机号是否重复
            if (user.getPhone() != null && userService.existsByPhone(user.getPhone())) {
                return Result.error("手机号已被注册");
            }
            
            user.setCreateTime(LocalDateTime.now());
            user.setUpdateTime(LocalDateTime.now());
            
            boolean success = userService.save(user);
            if (success) {
                return Result.ok("创建用户成功");
            } else {
                return Result.error("创建用户失败");
            }
        } catch (Exception e) {
            log.error("创建用户失败: {}", e.getMessage());
            return Result.error("创建用户失败");
        }
    }

    /**
     * 更新用户
     *
     * @param user 用户信息
     * @return 操作结果
     */
    @PutMapping
    @Operation(summary = "更新用户", description = "更新用户信息")
    public Result<String> update(@RequestBody User user) {
        try {
            User existUser = userService.getById(user.getId());
            if (existUser == null) {
                return Result.error("用户不存在");
            }
            
            // 如果修改了用户名，检查是否重复
            if (!existUser.getUsername().equals(user.getUsername()) && 
                userService.existsByUsername(user.getUsername())) {
                return Result.error("用户名已存在");
            }
            
            // 如果修改了邮箱，检查是否重复
            if (user.getEmail() != null && !user.getEmail().equals(existUser.getEmail()) && 
                userService.existsByEmail(user.getEmail())) {
                return Result.error("邮箱已被注册");
            }
            
            // 如果修改了手机号，检查是否重复
            if (user.getPhone() != null && !user.getPhone().equals(existUser.getPhone()) && 
                userService.existsByPhone(user.getPhone())) {
                return Result.error("手机号已被注册");
            }
            
            user.setUpdateTime(LocalDateTime.now());
            user.setPassword(null); // 不允许通过此接口修改密码
            
            boolean success = userService.updateById(user);
            if (success) {
                return Result.ok("更新用户成功");
            } else {
                return Result.error("更新用户失败");
            }
        } catch (Exception e) {
            log.error("更新用户失败: {}", e.getMessage());
            return Result.error("更新用户失败");
        }
    }

    /**
     * 删除用户
     *
     * @param id 用户ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除用户", description = "删除用户（逻辑删除）")
    public Result<String> delete(@PathVariable String id) {
        try {
            boolean success = userService.removeById(id);
            if (success) {
                return Result.ok("删除用户成功");
            } else {
                return Result.error("删除用户失败");
            }
        } catch (Exception e) {
            log.error("删除用户失败: {}", e.getMessage());
            return Result.error("删除用户失败");
        }
    }

    /**
     * 批量删除用户
     *
     * @param ids 用户ID数组
     * @return 操作结果
     */
    @DeleteMapping("/batch")
    @Operation(summary = "批量删除用户", description = "批量删除用户（逻辑删除）")
    public Result<String> batchDelete(@RequestBody String[] ids) {
        try {
            boolean success = userService.removeByIds(java.util.Arrays.asList(ids));
            if (success) {
                return Result.ok("批量删除用户成功");
            } else {
                return Result.error("批量删除用户失败");
            }
        } catch (Exception e) {
            log.error("批量删除用户失败: {}", e.getMessage());
            return Result.error("批量删除用户失败");
        }
    }

    /**
     * 启用/禁用用户
     *
     * @param id 用户ID
     * @param status 状态
     * @return 操作结果
     */
    @PutMapping("/{id}/status")
    @Operation(summary = "启用/禁用用户", description = "修改用户状态")
    public Result<String> updateStatus(@PathVariable String id, @RequestParam Integer status) {
        try {
            User user = new User();
            user.setId(id);
            user.setStatus(status);
            user.setUpdateTime(LocalDateTime.now());
            
            boolean success = userService.updateById(user);
            if (success) {
                return Result.ok(status == 1 ? "启用用户成功" : "禁用用户成功");
            } else {
                return Result.error("操作失败");
            }
        } catch (Exception e) {
            log.error("修改用户状态失败: {}", e.getMessage());
            return Result.error("修改用户状态失败");
        }
    }
}
