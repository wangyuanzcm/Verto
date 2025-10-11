package com.verto.modules.pipeline.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.verto.common.api.Result;
import com.verto.modules.pipeline.entity.ProjectPipeline;
import com.verto.modules.pipeline.service.IProjectPipelineService;
import com.verto.modules.pipeline.dto.PipelineCreateRequest;
import com.verto.modules.pipeline.service.IJenkinsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 项目流水线控制器
 * 
 * @author verto
 * @since 2024-01-27
 */
@Tag(name = "项目流水线", description = "项目流水线相关接口")
@RestController
@RequestMapping("/project/pipeline")
@Slf4j
public class ProjectPipelineController {

    @Autowired
    private IProjectPipelineService projectPipelineService;

    @Autowired
    private IJenkinsService jenkinsService;

    /**
     * 获取流水线配置
     * 
     * @param projectId 项目ID
     * @return 流水线配置
     */
    @Operation(summary = "获取流水线配置")
    @GetMapping(value = "/config/get")
    public Result<Map<String, Object>> getConfig(@Parameter(description = "项目ID") @RequestParam(name = "projectId", required = true) String projectId) {
        // 模拟流水线配置数据
        Map<String, Object> config = new HashMap<>();
        config.put("enabled", true);
        
        List<Map<String, Object>> stages = new ArrayList<>();
        
        Map<String, Object> buildStage = new HashMap<>();
        buildStage.put("name", "build");
        buildStage.put("displayName", "构建");
        buildStage.put("enabled", true);
        buildStage.put("timeout", 600);
        buildStage.put("commands", Arrays.asList("npm install", "npm run build"));
        stages.add(buildStage);
        
        Map<String, Object> testStage = new HashMap<>();
        testStage.put("name", "test");
        testStage.put("displayName", "测试");
        testStage.put("enabled", true);
        testStage.put("timeout", 300);
        testStage.put("commands", Arrays.asList("npm run test", "npm run test:coverage"));
        stages.add(testStage);
        
        Map<String, Object> deployStage = new HashMap<>();
        deployStage.put("name", "deploy");
        deployStage.put("displayName", "部署");
        deployStage.put("enabled", true);
        deployStage.put("timeout", 900);
        deployStage.put("commands", Arrays.asList("docker build -t app:latest .", "docker push registry.company.com/app:latest", "kubectl apply -f k8s/"));
        stages.add(deployStage);
        
        config.put("stages", stages);
        
        Map<String, Object> environment = new HashMap<>();
        environment.put("NODE_ENV", "production");
        environment.put("API_URL", "https://api.company.com");
        config.put("environment", environment);
        
        Map<String, Object> notifications = new HashMap<>();
        notifications.put("email", Arrays.asList("dev@company.com"));
        notifications.put("webhook", "https://hooks.company.com/pipeline");
        config.put("notifications", notifications);
        
        return Result.ok(config);
    }

    /**
     * 保存流水线配置
     * 
     * @param configData 配置数据
     * @return 操作结果
     */
    @Operation(summary = "保存流水线配置")
    @PostMapping(value = "/config/save")
    public Result<String> saveConfig(@RequestBody Map<String, Object> configData) {
        // 实际项目中应该保存到数据库
        return Result.ok("配置保存成功");
    }

    /**
     * 切换流水线启用状态
     * 
     * @param toggleData 切换数据
     * @return 操作结果
     */
    @Operation(summary = "切换流水线启用状态")
    @PostMapping(value = "/config/toggle")
    public Result<String> toggleConfig(@RequestBody Map<String, Object> toggleData) {
        return Result.ok("状态切换成功");
    }

    /**
     * 获取流水线状态
     * 
     * @param projectId 项目ID
     * @return 流水线状态
     */
    @Operation(summary = "获取流水线状态")
    @GetMapping(value = "/status")
    public Result<Map<String, Object>> getStatus(@Parameter(description = "项目ID") @RequestParam(name = "projectId", required = true) String projectId) {
        QueryWrapper<ProjectPipeline> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("project_id", projectId);
        queryWrapper.orderByDesc("create_time");
        queryWrapper.last("LIMIT 1");
        
        ProjectPipeline lastBuild = projectPipelineService.getOne(queryWrapper);
        
        Map<String, Object> status = new HashMap<>();
        status.put("projectId", projectId);
        status.put("isRunning", false);
        status.put("currentBuild", null);
        status.put("lastBuild", lastBuild);
        status.put("nextBuild", null);
        status.put("queueLength", 0);
        
        return Result.ok(status);
    }

    /**
     * 获取流水线历史记录
     * 
     * @param projectId 项目ID
     * @param pageNo 页码
     * @param pageSize 每页大小
     * @return 历史记录
     */
    @Operation(summary = "获取流水线历史记录")
    @GetMapping(value = "/history")
    public Result<IPage<ProjectPipeline>> getHistory(@Parameter(description = "项目ID") @RequestParam(name = "projectId", required = true) String projectId,
                                                     @Parameter(description = "页码") @RequestParam(name = "pageNo", defaultValue = "1") Integer pageNo,
                                                     @Parameter(description = "每页大小") @RequestParam(name = "pageSize", defaultValue = "10") Integer pageSize) {
        QueryWrapper<ProjectPipeline> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("project_id", projectId);
        queryWrapper.orderByDesc("create_time");
        
        Page<ProjectPipeline> page = new Page<>(pageNo, pageSize);
        IPage<ProjectPipeline> pageList = projectPipelineService.page(page, queryWrapper);
        
        return Result.ok(pageList);
    }

    /**
     * 触发流水线构建
     * 
     * @param triggerData 触发数据
     * @return 操作结果
     */
    @Operation(summary = "触发流水线构建")
    @PostMapping(value = "/trigger")
    public Result<Map<String, Object>> triggerBuild(@RequestBody Map<String, Object> triggerData) {
        String projectId = (String) triggerData.get("projectId");
        String branch = (String) triggerData.get("branch");
        
        // 创建新的构建记录
        ProjectPipeline pipeline = new ProjectPipeline();
        pipeline.setProjectId(projectId);
        pipeline.setBranch(branch);
        pipeline.setStatus("running");
        pipeline.setStartTime(new Date());
        pipeline.setCurrentStage("build");
        pipeline.setProgress(0);
        pipeline.setCreateTime(new Date());
        pipeline.setCreateBy("admin");
        
        // 获取当前项目的最大构建编号
        QueryWrapper<ProjectPipeline> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("project_id", projectId);
        queryWrapper.orderByDesc("build_number");
        queryWrapper.last("LIMIT 1");
        ProjectPipeline lastPipeline = projectPipelineService.getOne(queryWrapper);
        
        int nextBuildNumber = (lastPipeline != null && lastPipeline.getBuildNumber() != null) ? 
                              lastPipeline.getBuildNumber() + 1 : 1;
        pipeline.setBuildNumber(nextBuildNumber);
        
        projectPipelineService.save(pipeline);
        
        Map<String, Object> result = new HashMap<>();
        result.put("buildId", pipeline.getId());
        result.put("buildNumber", nextBuildNumber);
        result.put("status", "triggered");
        
        return Result.ok(result);
    }

    /**
     * 取消流水线构建
     * 
     * @param projectId 项目ID
     * @param buildId 构建ID
     * @return 操作结果
     */
    @Operation(summary = "取消流水线构建")
    @PostMapping(value = "/cancel/{projectId}/{buildId}")
    public Result<String> cancelBuild(@PathVariable String projectId, @PathVariable String buildId) {
        ProjectPipeline pipeline = projectPipelineService.getById(buildId);
        if (pipeline != null) {
            pipeline.setStatus("cancelled");
            pipeline.setEndTime(new Date());
            pipeline.setUpdateTime(new Date());
            pipeline.setUpdateBy("admin");
            projectPipelineService.updateById(pipeline);
        }
        return Result.ok("构建已取消");
    }

    /**
     * 重试流水线构建
     * 
     * @param projectId 项目ID
     * @param buildId 构建ID
     * @return 操作结果
     */
    @Operation(summary = "重试流水线构建")
    @PostMapping(value = "/build/retry/{projectId}/{buildId}")
    public Result<String> retryBuild(@PathVariable String projectId, @PathVariable String buildId) {
        ProjectPipeline pipeline = projectPipelineService.getById(buildId);
        if (pipeline != null) {
            pipeline.setStatus("running");
            pipeline.setStartTime(new Date());
            pipeline.setCurrentStage("build");
            pipeline.setProgress(0);
            pipeline.setUpdateTime(new Date());
            pipeline.setUpdateBy("admin");
            projectPipelineService.updateById(pipeline);
        }
        return Result.ok("构建已重新开始");
    }

    /**
     * 获取构建日志
     * 
     * @param projectId 项目ID
     * @param buildId 构建ID
     * @param stage 阶段名称
     * @return 构建日志
     */
    @Operation(summary = "获取构建日志")
    @GetMapping(value = "/logs/{projectId}/{buildId}/{stage}")
    public Result<List<String>> getBuildLogs(@PathVariable String projectId, 
                                             @PathVariable String buildId, 
                                             @PathVariable String stage) {
        ProjectPipeline pipeline = projectPipelineService.getById(buildId);
        List<String> logs = new ArrayList<>();
        
        if (pipeline != null) {
            switch (stage) {
                case "build":
                    if (pipeline.getBuildLogs() != null) {
                        logs = Arrays.asList(pipeline.getBuildLogs().split("\n"));
                    }
                    break;
                case "test":
                    if (pipeline.getTestLogs() != null) {
                        logs = Arrays.asList(pipeline.getTestLogs().split("\n"));
                    }
                    break;
                case "deploy":
                    if (pipeline.getDeployLogs() != null) {
                        logs = Arrays.asList(pipeline.getDeployLogs().split("\n"));
                    }
                    break;
            }
        }
        
        return Result.ok(logs);
    }

    /**
     * 删除构建记录
     * 
     * @param projectId 项目ID
     * @param buildId 构建ID
     * @return 操作结果
     */
    @Operation(summary = "删除构建记录")
    @DeleteMapping(value = "/build/delete/{projectId}/{buildId}")
    public Result<String> deleteBuild(@PathVariable String projectId, @PathVariable String buildId) {
        projectPipelineService.removeById(buildId);
        return Result.ok("构建记录已删除");
    }

    /**
     * 创建 Jenkins 流水线（Job）
     *
     * @param request 创建参数
     * @return 操作结果
     */
    @Operation(summary = "创建 Jenkins 流水线")
    @PostMapping(value = "/jenkins/create")
    public Result<Map<String, Object>> createJenkinsPipeline(@RequestBody PipelineCreateRequest request) {
        Map<String, Object> resp = jenkinsService.createOrUpdatePipelineJob(request);
        if (resp.containsKey("error")) {
            return Result.error("创建/更新 Jenkins Job 失败: " + resp.get("error"));
        }
        return Result.ok(resp);
    }
}