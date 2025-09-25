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
import org.jeecg.modules.project.entity.ProjectTimeline;
import org.jeecg.modules.project.service.IProjectTimelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.List;

/**
 * 项目时间线控制器
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Api(tags="项目时间线")
@RestController
@RequestMapping("/project/timeline")
@Slf4j
public class ProjectTimelineController extends JeecgController<ProjectTimeline, IProjectTimelineService> {

    @Autowired
    private IProjectTimelineService projectTimelineService;

    /**
     * 分页列表查询
     * @param projectTimeline 查询条件
     * @param pageNo 页码
     * @param pageSize 页大小
     * @param req 请求对象
     * @return 分页结果
     */
    @AutoLog(value = "项目时间线-分页列表查询")
    @ApiOperation(value="项目时间线-分页列表查询", notes="项目时间线-分页列表查询")
    @GetMapping(value = "/list")
    public Result<IPage<ProjectTimeline>> queryPageList(ProjectTimeline projectTimeline,
                                                       @RequestParam(name="pageNo", defaultValue="1") Integer pageNo,
                                                       @RequestParam(name="pageSize", defaultValue="10") Integer pageSize,
                                                       HttpServletRequest req) {
        QueryWrapper<ProjectTimeline> queryWrapper = QueryGenerator.initQueryWrapper(projectTimeline, req.getParameterMap());
        Page<ProjectTimeline> page = new Page<ProjectTimeline>(pageNo, pageSize);
        IPage<ProjectTimeline> pageList = projectTimelineService.page(page, queryWrapper);
        return Result.OK(pageList);
    }

    /**
     * 根据项目ID查询时间线列表
     * @param projectId 项目ID
     * @return 时间线列表
     */
    @AutoLog(value = "项目时间线-根据项目ID查询")
    @ApiOperation(value="项目时间线-根据项目ID查询", notes="项目时间线-根据项目ID查询")
    @GetMapping(value = "/listByProjectId")
    public Result<List<ProjectTimeline>> queryByProjectId(@RequestParam(name="projectId") String projectId) {
        QueryWrapper<ProjectTimeline> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("project_id", projectId);
        queryWrapper.orderByAsc("planned_date");
        List<ProjectTimeline> list = projectTimelineService.list(queryWrapper);
        return Result.OK(list);
    }

    /**
     * 添加时间线节点
     * @param projectTimeline 时间线信息
     * @return 操作结果
     */
    @AutoLog(value = "项目时间线-添加")
    @ApiOperation(value="项目时间线-添加", notes="项目时间线-添加")
    @PostMapping(value = "/add")
    public Result<String> add(@RequestBody ProjectTimeline projectTimeline) {
        projectTimelineService.save(projectTimeline);
        return Result.OK("添加成功！");
    }

    /**
     * 编辑时间线节点
     * @param projectTimeline 时间线信息
     * @return 操作结果
     */
    @AutoLog(value = "项目时间线-编辑")
    @ApiOperation(value="项目时间线-编辑", notes="项目时间线-编辑")
    @RequestMapping(value = "/edit", method = {RequestMethod.PUT,RequestMethod.POST})
    public Result<String> edit(@RequestBody ProjectTimeline projectTimeline) {
        projectTimelineService.updateById(projectTimeline);
        return Result.OK("编辑成功!");
    }

    /**
     * 通过id删除时间线节点
     * @param id 时间线节点ID
     * @return 操作结果
     */
    @AutoLog(value = "项目时间线-通过id删除")
    @ApiOperation(value="项目时间线-通过id删除", notes="项目时间线-通过id删除")
    @DeleteMapping(value = "/delete")
    public Result<String> delete(@RequestParam(name="id",required=true) String id) {
        projectTimelineService.removeById(id);
        return Result.OK("删除成功!");
    }

    /**
     * 批量删除时间线节点
     * @param ids 时间线节点ID列表
     * @return 操作结果
     */
    @AutoLog(value = "项目时间线-批量删除")
    @ApiOperation(value="项目时间线-批量删除", notes="项目时间线-批量删除")
    @DeleteMapping(value = "/deleteBatch")
    public Result<String> deleteBatch(@RequestParam(name="ids",required=true) String ids) {
        this.projectTimelineService.removeByIds(Arrays.asList(ids.split(",")));
        return Result.OK("批量删除成功!");
    }

    /**
     * 通过id查询时间线节点
     * @param id 时间线节点ID
     * @return 时间线节点信息
     */
    @AutoLog(value = "项目时间线-通过id查询")
    @ApiOperation(value="项目时间线-通过id查询", notes="项目时间线-通过id查询")
    @GetMapping(value = "/queryById")
    public Result<ProjectTimeline> queryById(@RequestParam(name="id",required=true) String id) {
        ProjectTimeline projectTimeline = projectTimelineService.getById(id);
        if(projectTimeline==null) {
            return Result.error("未找到对应数据");
        }
        return Result.OK(projectTimeline);
    }

    /**
     * 更新时间线节点状态
     * @param id 时间线节点ID
     * @param status 新状态
     * @return 操作结果
     */
    @AutoLog(value = "项目时间线-更新状态")
    @ApiOperation(value="项目时间线-更新状态", notes="项目时间线-更新状态")
    @PutMapping(value = "/updateStatus")
    public Result<String> updateStatus(@RequestParam(name="id") String id, 
                                     @RequestParam(name="status") String status) {
        ProjectTimeline projectTimeline = projectTimelineService.getById(id);
        if(projectTimeline == null) {
            return Result.error("未找到对应数据");
        }
        projectTimeline.setStatus(status);
        projectTimelineService.updateById(projectTimeline);
        return Result.OK("状态更新成功!");
    }
}