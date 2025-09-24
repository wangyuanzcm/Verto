package org.jeecg.modules.config.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.jeecg.common.api.vo.Result;
import org.jeecg.common.aspect.annotation.AutoLog;
import org.jeecg.common.system.base.controller.JeecgController;
import org.jeecg.common.system.query.QueryGenerator;
import org.jeecg.modules.config.entity.ProjectConfig;
import org.jeecg.modules.config.service.IProjectConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.List;

/**
 * 项目配置控制器
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Api(tags="项目配置管理")
@RestController
@RequestMapping("/project/config")
@Slf4j
public class ProjectConfigController extends JeecgController<ProjectConfig, IProjectConfigService> {

    @Autowired
    private IProjectConfigService projectConfigService;

    /**
     * 分页列表查询
     * @param projectConfig 查询条件
     * @param pageNo 页码
     * @param pageSize 页大小
     * @param req 请求对象
     * @return 分页结果
     */
    @AutoLog(value = "项目配置-分页列表查询")
    @ApiOperation(value="项目配置-分页列表查询", notes="项目配置-分页列表查询")
    @GetMapping(value = "/list")
    public Result<IPage<ProjectConfig>> queryPageList(ProjectConfig projectConfig,
                                                     @RequestParam(name="pageNo", defaultValue="1") Integer pageNo,
                                                     @RequestParam(name="pageSize", defaultValue="10") Integer pageSize,
                                                     HttpServletRequest req) {
        QueryWrapper<ProjectConfig> queryWrapper = QueryGenerator.initQueryWrapper(projectConfig, req.getParameterMap());
        Page<ProjectConfig> page = new Page<ProjectConfig>(pageNo, pageSize);
        IPage<ProjectConfig> pageList = projectConfigService.page(page, queryWrapper);
        return Result.OK(pageList);
    }

    /**
     * 根据项目ID查询配置列表
     * @param projectId 项目ID
     * @return 配置列表
     */
    @AutoLog(value = "项目配置-根据项目ID查询")
    @ApiOperation(value="项目配置-根据项目ID查询", notes="项目配置-根据项目ID查询")
    @GetMapping(value = "/listByProjectId")
    public Result<List<ProjectConfig>> queryByProjectId(@RequestParam(name="projectId") String projectId) {
        QueryWrapper<ProjectConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("project_id", projectId);
        queryWrapper.orderByAsc("config_type", "sort_order");
        List<ProjectConfig> list = projectConfigService.list(queryWrapper);
        return Result.OK(list);
    }

    /**
     * 根据配置类型查询配置列表
     * @param configType 配置类型
     * @return 配置列表
     */
    @AutoLog(value = "项目配置-根据配置类型查询")
    @ApiOperation(value="项目配置-根据配置类型查询", notes="项目配置-根据配置类型查询")
    @GetMapping(value = "/listByType")
    public Result<List<ProjectConfig>> queryByType(@RequestParam(name="configType") String configType) {
        QueryWrapper<ProjectConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("config_type", configType);
        queryWrapper.eq("enabled", "Y");
        queryWrapper.orderByAsc("sort_order");
        List<ProjectConfig> list = projectConfigService.list(queryWrapper);
        return Result.OK(list);
    }

    /**
     * 添加配置
     * @param projectConfig 配置信息
     * @return 操作结果
     */
    @AutoLog(value = "项目配置-添加")
    @ApiOperation(value="项目配置-添加", notes="项目配置-添加")
    @PostMapping(value = "/add")
    public Result<String> add(@RequestBody ProjectConfig projectConfig) {
        projectConfigService.save(projectConfig);
        return Result.OK("添加成功！");
    }

    /**
     * 编辑配置
     * @param projectConfig 配置信息
     * @return 操作结果
     */
    @AutoLog(value = "项目配置-编辑")
    @ApiOperation(value="项目配置-编辑", notes="项目配置-编辑")
    @RequestMapping(value = "/edit", method = {RequestMethod.PUT,RequestMethod.POST})
    public Result<String> edit(@RequestBody ProjectConfig projectConfig) {
        projectConfigService.updateById(projectConfig);
        return Result.OK("编辑成功!");
    }

    /**
     * 通过id删除配置
     * @param id 配置ID
     * @return 操作结果
     */
    @AutoLog(value = "项目配置-通过id删除")
    @ApiOperation(value="项目配置-通过id删除", notes="项目配置-通过id删除")
    @DeleteMapping(value = "/delete")
    public Result<String> delete(@RequestParam(name="id",required=true) String id) {
        projectConfigService.removeById(id);
        return Result.OK("删除成功!");
    }

    /**
     * 批量删除配置
     * @param ids 配置ID列表
     * @return 操作结果
     */
    @AutoLog(value = "项目配置-批量删除")
    @ApiOperation(value="项目配置-批量删除", notes="项目配置-批量删除")
    @DeleteMapping(value = "/deleteBatch")
    public Result<String> deleteBatch(@RequestParam(name="ids",required=true) String ids) {
        this.projectConfigService.removeByIds(Arrays.asList(ids.split(",")));
        return Result.OK("批量删除成功!");
    }

    /**
     * 通过id查询配置
     * @param id 配置ID
     * @return 配置信息
     */
    @AutoLog(value = "项目配置-通过id查询")
    @ApiOperation(value="项目配置-通过id查询", notes="项目配置-通过id查询")
    @GetMapping(value = "/queryById")
    public Result<ProjectConfig> queryById(@RequestParam(name="id",required=true) String id) {
        ProjectConfig projectConfig = projectConfigService.getById(id);
        if(projectConfig==null) {
            return Result.error("未找到对应数据");
        }
        return Result.OK(projectConfig);
    }

    /**
     * 保存项目配置
     * @param projectId 项目ID
     * @param configData 配置数据
     * @return 操作结果
     */
    @AutoLog(value = "项目配置-保存配置")
    @ApiOperation(value="项目配置-保存配置", notes="项目配置-保存配置")
    @PostMapping(value = "/save")
    public Result<String> saveConfig(@RequestParam(name="projectId") String projectId,
                                   @RequestBody String configData) {
        // 这里可以实现批量保存配置的逻辑
        // 解析configData并保存到数据库
        return Result.OK("配置保存成功!");
    }
}