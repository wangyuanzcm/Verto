package com.verto.modules.appmanage.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.verto.common.api.Result;
import com.verto.modules.appmanage.entity.AppManage;
import com.verto.modules.appmanage.entity.AppStatistics;
import com.verto.modules.appmanage.entity.PackageJsonInfo;
import com.verto.modules.appmanage.service.IAppManageService;
import com.verto.modules.appmanage.service.IAppStatisticsService;
import com.verto.modules.appmanage.service.IPackageJsonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

/**
 * 应用管理控制器
 * 
 * @author verto
 * @since 2024-01-27
 */
@Tag(name = "应用管理", description = "应用管理相关接口")
@RestController
@RequestMapping("/appmanage/app")
@Slf4j
public class AppManageController {

    @Autowired
    private IAppManageService appManageService;

    @Autowired
    private IPackageJsonService packageJsonService;

    @Autowired
    private IAppStatisticsService appStatisticsService;

    /**
     * 分页查询应用列表
     * 
     * @param appManage 查询条件
     * @param pageNo 页码
     * @param pageSize 每页大小
     * @return 分页结果
     */
    @Operation(summary = "分页查询应用列表")
    @GetMapping(value = "/list")
    public Result<IPage<AppManage>> queryPageList(AppManage appManage,
                                                  @Parameter(description = "页码") @RequestParam(name = "pageNo", defaultValue = "1") Integer pageNo,
                                                  @Parameter(description = "每页大小") @RequestParam(name = "pageSize", defaultValue = "10") Integer pageSize) {
        QueryWrapper<AppManage> queryWrapper = new QueryWrapper<>();
        
        // 应用名称模糊查询
        if (appManage.getAppName() != null && !appManage.getAppName().trim().isEmpty()) {
            queryWrapper.like("app_name", appManage.getAppName());
        }
        
        // 应用领域精确查询
        if (appManage.getDomain() != null && !appManage.getDomain().trim().isEmpty()) {
            queryWrapper.eq("domain", appManage.getDomain());
        }
        
        // 状态查询
        if (appManage.getStatus() != null) {
            queryWrapper.eq("status", appManage.getStatus());
        }
        
        // 按创建时间倒序排列
        queryWrapper.orderByDesc("create_time");
        
        Page<AppManage> page = new Page<>(pageNo, pageSize);
        IPage<AppManage> pageList = appManageService.page(page, queryWrapper);
        
        return Result.ok(pageList);
    }

    /**
     * 根据ID查询应用详情
     * 
     * @param id 应用ID
     * @return 应用详情
     */
    @Operation(summary = "根据ID查询应用详情")
    @GetMapping(value = "/queryById")
    public Result<AppManage> queryById(@Parameter(description = "应用ID") @RequestParam(name = "id", required = true) String id) {
        AppManage appManage = appManageService.getById(id);
        if (appManage == null) {
            return Result.error("未找到对应实体");
        }
        return Result.ok(appManage);
    }

    /**
     * 新增应用
     * 
     * @param appManage 应用信息
     * @return 操作结果，包含创建的应用信息
     */
    @Operation(summary = "新增应用")
    @PostMapping(value = "/add")
    public Result<AppManage> add(@RequestBody AppManage appManage) {
        appManage.setCreateTime(new Date());
        appManage.setCreateBy("admin"); // 实际项目中应从当前登录用户获取
        appManageService.save(appManage);
        return Result.ok(appManage);
    }

    /**
     * 编辑应用
     * 
     * @param appManage 应用信息
     * @return 操作结果
     */
    @Operation(summary = "编辑应用")
    @PutMapping(value = "/edit")
    public Result<String> edit(@RequestBody AppManage appManage) {
        appManage.setUpdateTime(new Date());
        appManage.setUpdateBy("admin"); // 实际项目中应从当前登录用户获取
        appManageService.updateById(appManage);
        return Result.ok("编辑成功!");
    }

    /**
     * 删除应用
     * 
     * @param id 应用ID
     * @return 操作结果
     */
    @Operation(summary = "删除应用")
    @DeleteMapping(value = "/delete")
    public Result<String> delete(@Parameter(description = "应用ID") @RequestParam(name = "id", required = true) String id) {
        appManageService.removeById(id);
        return Result.ok("删除成功!");
    }

    /**
     * 批量删除应用
     * 
     * @param ids 应用ID列表
     * @return 操作结果
     */
    @Operation(summary = "批量删除应用")
    @DeleteMapping(value = "/deleteBatch")
    public Result<String> deleteBatch(@Parameter(description = "应用ID列表") @RequestParam(name = "ids", required = true) String ids) {
        List<String> idList = Arrays.asList(ids.split(","));
        appManageService.removeByIds(idList);
        return Result.ok("批量删除成功!");
    }

    /**
     * 获取应用的package.json信息
     * 
     * @param id 应用ID
     * @return package.json信息
     */
    @Operation(summary = "获取应用的package.json信息")
    @GetMapping(value = "/package-json")
    public Result<PackageJsonInfo> getPackageJson(@Parameter(description = "应用ID") @RequestParam(name = "id", required = true) String id) {
        try {
            PackageJsonInfo packageJsonInfo = packageJsonService.getPackageJsonByAppId(id);
            if (packageJsonInfo != null) {
                return Result.ok(packageJsonInfo);
            } else {
                return Result.error("未找到该应用的 package.json 信息");
            }
        } catch (Exception e) {
            log.error("获取应用package.json信息失败", e);
            return Result.error("获取package.json信息失败: " + e.getMessage());
        }
    }

    /**
     * 获取应用统计数据
     * 
     * @param id 应用ID
     * @return 应用统计数据
     */
    @Operation(summary = "获取应用统计数据")
    @GetMapping(value = "/statistics")
    public Result<AppStatistics> getStatistics(@Parameter(description = "应用ID") @RequestParam(name = "id", required = true) String id) {
        try {
            AppStatistics statistics = appStatisticsService.getStatisticsByAppId(id);
            if (statistics != null) {
                return Result.ok(statistics);
            } else {
                return Result.error("未找到该应用的统计数据");
            }
        } catch (Exception e) {
            log.error("获取应用统计数据失败", e);
            return Result.error("获取统计数据失败: " + e.getMessage());
        }
    }
}