package org.jeecg.modules.project.controller;

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
import org.jeecg.modules.project.entity.Project;
import org.jeecg.modules.project.service.IProjectService;
import org.jeecgframework.poi.excel.ExcelImportUtil;
import org.jeecgframework.poi.excel.def.NormalExcelConstants;
import org.jeecgframework.poi.excel.entity.ExportParams;
import org.jeecgframework.poi.excel.entity.ImportParams;
import org.jeecgframework.poi.excel.view.JeecgEntityExcelView;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 项目管理控制器
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Api(tags="项目管理")
@RestController
@RequestMapping("/project")
@Slf4j
public class ProjectController extends JeecgController<Project, IProjectService> {

    @Autowired
    private IProjectService projectService;

    /**
     * 分页列表查询
     * @param project 查询条件
     * @param pageNo 页码
     * @param pageSize 页大小
     * @param req 请求对象
     * @return 分页结果
     */
    @AutoLog(value = "项目管理-分页列表查询")
    @ApiOperation(value="项目管理-分页列表查询", notes="项目管理-分页列表查询")
    @GetMapping(value = "/list")
    public Result<IPage<Project>> queryPageList(Project project,
                                               @RequestParam(name="pageNo", defaultValue="1") Integer pageNo,
                                               @RequestParam(name="pageSize", defaultValue="10") Integer pageSize,
                                               HttpServletRequest req) {
        QueryWrapper<Project> queryWrapper = QueryGenerator.initQueryWrapper(project, req.getParameterMap());
        Page<Project> page = new Page<Project>(pageNo, pageSize);
        IPage<Project> pageList = projectService.page(page, queryWrapper);
        return Result.OK(pageList);
    }

    /**
     * 添加项目
     * @param project 项目信息
     * @return 操作结果
     */
    @AutoLog(value = "项目管理-添加")
    @ApiOperation(value="项目管理-添加", notes="项目管理-添加")
    @PostMapping(value = "/add")
    public Result<String> add(@RequestBody Project project) {
        projectService.save(project);
        return Result.OK("添加成功！");
    }

    /**
     * 编辑项目
     * @param project 项目信息
     * @return 操作结果
     */
    @AutoLog(value = "项目管理-编辑")
    @ApiOperation(value="项目管理-编辑", notes="项目管理-编辑")
    @RequestMapping(value = "/edit", method = {RequestMethod.PUT,RequestMethod.POST})
    public Result<String> edit(@RequestBody Project project) {
        projectService.updateById(project);
        return Result.OK("编辑成功!");
    }

    /**
     * 通过id删除项目
     * @param id 项目ID
     * @return 操作结果
     */
    @AutoLog(value = "项目管理-通过id删除")
    @ApiOperation(value="项目管理-通过id删除", notes="项目管理-通过id删除")
    @DeleteMapping(value = "/delete")
    public Result<String> delete(@RequestParam(name="id",required=true) String id) {
        projectService.removeById(id);
        return Result.OK("删除成功!");
    }

    /**
     * 批量删除项目
     * @param ids 项目ID列表
     * @return 操作结果
     */
    @AutoLog(value = "项目管理-批量删除")
    @ApiOperation(value="项目管理-批量删除", notes="项目管理-批量删除")
    @DeleteMapping(value = "/deleteBatch")
    public Result<String> deleteBatch(@RequestParam(name="ids",required=true) String ids) {
        this.projectService.removeByIds(Arrays.asList(ids.split(",")));
        return Result.OK("批量删除成功!");
    }

    /**
     * 通过id查询项目
     * @param id 项目ID
     * @return 项目信息
     */
    @AutoLog(value = "项目管理-通过id查询")
    @ApiOperation(value="项目管理-通过id查询", notes="项目管理-通过id查询")
    @GetMapping(value = "/queryById")
    public Result<Project> queryById(@RequestParam(name="id",required=true) String id) {
        Project project = projectService.getById(id);
        if(project==null) {
            return Result.error("未找到对应数据");
        }
        return Result.OK(project);
    }

    /**
     * 导出excel
     * @param request 请求对象
     * @param project 查询条件
     */
    @RequestMapping(value = "/exportXls")
    public ModelAndView exportXls(HttpServletRequest request, Project project) {
        return super.exportXls(request, project, Project.class, "项目管理");
    }

    /**
     * 通过excel导入数据
     * @param request 请求对象
     * @param response 响应对象
     * @return 导入结果
     */
    @RequestMapping(value = "/importExcel", method = RequestMethod.POST)
    public Result<?> importExcel(HttpServletRequest request, HttpServletResponse response) {
        return super.importExcel(request, response, Project.class);
    }

    /**
     * 获取项目统计信息
     * @return 统计数据
     */
    @AutoLog(value = "项目管理-统计信息")
    @ApiOperation(value="项目管理-统计信息", notes="项目管理-统计信息")
    @GetMapping(value = "/statistics")
    public Result<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // 获取项目总数
        long totalProjects = projectService.count();
        stats.put("totalProjects", totalProjects);
        
        // 获取各状态项目数量
        QueryWrapper<Project> activeQuery = new QueryWrapper<>();
        activeQuery.in("status", "DEVELOPING", "TESTING");
        long activeProjects = projectService.count(activeQuery);
        stats.put("activeProjects", activeProjects);
        
        QueryWrapper<Project> completedQuery = new QueryWrapper<>();
        completedQuery.eq("status", "DEPLOYED");
        long completedProjects = projectService.count(completedQuery);
        stats.put("completedProjects", completedProjects);
        
        QueryWrapper<Project> pausedQuery = new QueryWrapper<>();
        pausedQuery.eq("status", "PAUSED");
        long pausedProjects = projectService.count(pausedQuery);
        stats.put("pausedProjects", pausedProjects);
        
        QueryWrapper<Project> planningQuery = new QueryWrapper<>();
        planningQuery.eq("status", "PLANNING");
        long planningProjects = projectService.count(planningQuery);
        stats.put("planningProjects", planningProjects);
        
        // 计算平均进度
        List<Project> allProjects = projectService.list();
        double avgProgress = allProjects.stream()
            .filter(p -> p.getProgress() != null)
            .mapToInt(Project::getProgress)
            .average()
            .orElse(0.0);
        stats.put("avgProgress", Math.round(avgProgress));
        
        // 计算总预估工时和实际工时
        int totalEstimatedHours = allProjects.stream()
            .filter(p -> p.getEstimatedHours() != null)
            .mapToInt(Project::getEstimatedHours)
            .sum();
        stats.put("totalEstimatedHours", totalEstimatedHours);
        
        int totalActualHours = allProjects.stream()
            .filter(p -> p.getActualHours() != null)
            .mapToInt(Project::getActualHours)
            .sum();
        stats.put("totalActualHours", totalActualHours);
        
        // 计算按时完成率
        long onTimeProjects = allProjects.stream()
            .filter(p -> "DEPLOYED".equals(p.getStatus()))
            .filter(p -> p.getOnlineDate() != null && p.getEndDate() != null)
            .filter(p -> !p.getOnlineDate().after(p.getEndDate()))
            .count();
        
        double onTimeRate = completedProjects > 0 ? (double) onTimeProjects / completedProjects * 100 : 0;
        stats.put("onTimeRate", Math.round(onTimeRate));
        
        double delayedRate = 100 - onTimeRate;
        stats.put("delayedRate", Math.round(delayedRate));
        
        return Result.OK(stats);
    }

    /**
     * 检查项目编码是否存在
     * @param projectCode 项目编码
     * @param id 项目ID（编辑时传入）
     * @return 检查结果
     */
    @AutoLog(value = "项目管理-检查项目编码")
    @ApiOperation(value="项目管理-检查项目编码", notes="项目管理-检查项目编码")
    @GetMapping(value = "/checkProjectCode")
    public Result<Boolean> checkProjectCode(@RequestParam(name="projectCode") String projectCode,
                                          @RequestParam(name="id", required=false) String id) {
        QueryWrapper<Project> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("project_code", projectCode);
        if (id != null && !id.isEmpty()) {
            queryWrapper.ne("id", id);
        }
        long count = projectService.count(queryWrapper);
        return Result.OK(count == 0);
    }
}