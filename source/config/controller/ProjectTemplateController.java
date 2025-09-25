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
import org.jeecg.modules.config.entity.ProjectTemplate;
import org.jeecg.modules.config.service.IProjectTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.List;

/**
 * 项目模板控制器
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Api(tags="项目模板管理")
@RestController
@RequestMapping("/project/templates")
@Slf4j
public class ProjectTemplateController extends JeecgController<ProjectTemplate, IProjectTemplateService> {

    @Autowired
    private IProjectTemplateService projectTemplateService;

    /**
     * 分页列表查询
     * @param projectTemplate 查询条件
     * @param pageNo 页码
     * @param pageSize 页大小
     * @param req 请求对象
     * @return 分页结果
     */
    @AutoLog(value = "项目模板-分页列表查询")
    @ApiOperation(value="项目模板-分页列表查询", notes="项目模板-分页列表查询")
    @GetMapping(value = "/list")
    public Result<IPage<ProjectTemplate>> queryPageList(ProjectTemplate projectTemplate,
                                                       @RequestParam(name="pageNo", defaultValue="1") Integer pageNo,
                                                       @RequestParam(name="pageSize", defaultValue="10") Integer pageSize,
                                                       HttpServletRequest req) {
        QueryWrapper<ProjectTemplate> queryWrapper = QueryGenerator.initQueryWrapper(projectTemplate, req.getParameterMap());
        Page<ProjectTemplate> page = new Page<ProjectTemplate>(pageNo, pageSize);
        IPage<ProjectTemplate> pageList = projectTemplateService.page(page, queryWrapper);
        return Result.OK(pageList);
    }

    /**
     * 获取启用的模板列表
     * @return 模板列表
     */
    @AutoLog(value = "项目模板-获取启用列表")
    @ApiOperation(value="项目模板-获取启用列表", notes="项目模板-获取启用列表")
    @GetMapping(value = "/enabled")
    public Result<List<ProjectTemplate>> queryEnabledList() {
        QueryWrapper<ProjectTemplate> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("enabled", "Y");
        queryWrapper.orderByAsc("sort_order");
        List<ProjectTemplate> list = projectTemplateService.list(queryWrapper);
        return Result.OK(list);
    }

    /**
     * 根据模板类型查询模板列表
     * @param templateType 模板类型
     * @return 模板列表
     */
    @AutoLog(value = "项目模板-根据类型查询")
    @ApiOperation(value="项目模板-根据类型查询", notes="项目模板-根据类型查询")
    @GetMapping(value = "/listByType")
    public Result<List<ProjectTemplate>> queryByType(@RequestParam(name="templateType") String templateType) {
        QueryWrapper<ProjectTemplate> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("template_type", templateType);
        queryWrapper.eq("enabled", "Y");
        queryWrapper.orderByAsc("sort_order");
        List<ProjectTemplate> list = projectTemplateService.list(queryWrapper);
        return Result.OK(list);
    }

    /**
     * 添加模板
     * @param projectTemplate 模板信息
     * @return 操作结果
     */
    @AutoLog(value = "项目模板-添加")
    @ApiOperation(value="项目模板-添加", notes="项目模板-添加")
    @PostMapping(value = "/add")
    public Result<String> add(@RequestBody ProjectTemplate projectTemplate) {
        projectTemplateService.save(projectTemplate);
        return Result.OK("添加成功！");
    }

    /**
     * 编辑模板
     * @param projectTemplate 模板信息
     * @return 操作结果
     */
    @AutoLog(value = "项目模板-编辑")
    @ApiOperation(value="项目模板-编辑", notes="项目模板-编辑")
    @RequestMapping(value = "/edit", method = {RequestMethod.PUT,RequestMethod.POST})
    public Result<String> edit(@RequestBody ProjectTemplate projectTemplate) {
        projectTemplateService.updateById(projectTemplate);
        return Result.OK("编辑成功!");
    }

    /**
     * 通过id删除模板
     * @param id 模板ID
     * @return 操作结果
     */
    @AutoLog(value = "项目模板-通过id删除")
    @ApiOperation(value="项目模板-通过id删除", notes="项目模板-通过id删除")
    @DeleteMapping(value = "/delete")
    public Result<String> delete(@RequestParam(name="id",required=true) String id) {
        projectTemplateService.removeById(id);
        return Result.OK("删除成功!");
    }

    /**
     * 批量删除模板
     * @param ids 模板ID列表
     * @return 操作结果
     */
    @AutoLog(value = "项目模板-批量删除")
    @ApiOperation(value="项目模板-批量删除", notes="项目模板-批量删除")
    @DeleteMapping(value = "/deleteBatch")
    public Result<String> deleteBatch(@RequestParam(name="ids",required=true) String ids) {
        this.projectTemplateService.removeByIds(Arrays.asList(ids.split(",")));
        return Result.OK("批量删除成功!");
    }

    /**
     * 通过id查询模板
     * @param id 模板ID
     * @return 模板信息
     */
    @AutoLog(value = "项目模板-通过id查询")
    @ApiOperation(value="项目模板-通过id查询", notes="项目模板-通过id查询")
    @GetMapping(value = "/queryById")
    public Result<ProjectTemplate> queryById(@RequestParam(name="id",required=true) String id) {
        ProjectTemplate projectTemplate = projectTemplateService.getById(id);
        if(projectTemplate==null) {
            return Result.error("未找到对应数据");
        }
        return Result.OK(projectTemplate);
    }

    /**
     * 获取模板详情
     * @param templateId 模板ID
     * @return 模板详情
     */
    @AutoLog(value = "项目模板-获取详情")
    @ApiOperation(value="项目模板-获取详情", notes="项目模板-获取详情")
    @GetMapping(value = "/detail")
    public Result<ProjectTemplate> getTemplateDetail(@RequestParam(name="templateId") String templateId) {
        ProjectTemplate projectTemplate = projectTemplateService.getById(templateId);
        if(projectTemplate == null) {
            return Result.error("模板不存在");
        }
        
        // 增加使用次数
        projectTemplate.setUsageCount(projectTemplate.getUsageCount() == null ? 1 : projectTemplate.getUsageCount() + 1);
        projectTemplateService.updateById(projectTemplate);
        
        return Result.OK(projectTemplate);
    }
}