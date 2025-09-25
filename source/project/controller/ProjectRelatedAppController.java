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
import org.jeecg.modules.project.entity.ProjectRelatedApp;
import org.jeecg.modules.project.service.IProjectRelatedAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.List;

/**
 * 项目关联应用控制器
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Api(tags="项目关联应用")
@RestController
@RequestMapping("/project/relatedApps")
@Slf4j
public class ProjectRelatedAppController extends JeecgController<ProjectRelatedApp, IProjectRelatedAppService> {

    @Autowired
    private IProjectRelatedAppService projectRelatedAppService;

    /**
     * 分页列表查询
     * @param projectRelatedApp 查询条件
     * @param pageNo 页码
     * @param pageSize 页大小
     * @param req 请求对象
     * @return 分页结果
     */
    @AutoLog(value = "项目关联应用-分页列表查询")
    @ApiOperation(value="项目关联应用-分页列表查询", notes="项目关联应用-分页列表查询")
    @GetMapping(value = "/list")
    public Result<IPage<ProjectRelatedApp>> queryPageList(ProjectRelatedApp projectRelatedApp,
                                                         @RequestParam(name="pageNo", defaultValue="1") Integer pageNo,
                                                         @RequestParam(name="pageSize", defaultValue="10") Integer pageSize,
                                                         HttpServletRequest req) {
        QueryWrapper<ProjectRelatedApp> queryWrapper = QueryGenerator.initQueryWrapper(projectRelatedApp, req.getParameterMap());
        Page<ProjectRelatedApp> page = new Page<ProjectRelatedApp>(pageNo, pageSize);
        IPage<ProjectRelatedApp> pageList = projectRelatedAppService.page(page, queryWrapper);
        return Result.OK(pageList);
    }

    /**
     * 根据项目ID查询关联应用列表
     * @param projectId 项目ID
     * @return 关联应用列表
     */
    @AutoLog(value = "项目关联应用-根据项目ID查询")
    @ApiOperation(value="项目关联应用-根据项目ID查询", notes="项目关联应用-根据项目ID查询")
    @GetMapping(value = "/listByProjectId")
    public Result<List<ProjectRelatedApp>> queryByProjectId(@RequestParam(name="projectId") String projectId) {
        QueryWrapper<ProjectRelatedApp> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("project_id", projectId);
        List<ProjectRelatedApp> list = projectRelatedAppService.list(queryWrapper);
        return Result.OK(list);
    }

    /**
     * 添加关联应用
     * @param projectRelatedApp 关联应用信息
     * @return 操作结果
     */
    @AutoLog(value = "项目关联应用-添加")
    @ApiOperation(value="项目关联应用-添加", notes="项目关联应用-添加")
    @PostMapping(value = "/add")
    public Result<String> add(@RequestBody ProjectRelatedApp projectRelatedApp) {
        projectRelatedAppService.save(projectRelatedApp);
        return Result.OK("添加成功！");
    }

    /**
     * 编辑关联应用
     * @param projectRelatedApp 关联应用信息
     * @return 操作结果
     */
    @AutoLog(value = "项目关联应用-编辑")
    @ApiOperation(value="项目关联应用-编辑", notes="项目关联应用-编辑")
    @RequestMapping(value = "/edit", method = {RequestMethod.PUT,RequestMethod.POST})
    public Result<String> edit(@RequestBody ProjectRelatedApp projectRelatedApp) {
        projectRelatedAppService.updateById(projectRelatedApp);
        return Result.OK("编辑成功!");
    }

    /**
     * 通过id删除关联应用
     * @param id 关联应用ID
     * @return 操作结果
     */
    @AutoLog(value = "项目关联应用-通过id删除")
    @ApiOperation(value="项目关联应用-通过id删除", notes="项目关联应用-通过id删除")
    @DeleteMapping(value = "/delete")
    public Result<String> delete(@RequestParam(name="id",required=true) String id) {
        projectRelatedAppService.removeById(id);
        return Result.OK("删除成功!");
    }

    /**
     * 批量删除关联应用
     * @param ids 关联应用ID列表
     * @return 操作结果
     */
    @AutoLog(value = "项目关联应用-批量删除")
    @ApiOperation(value="项目关联应用-批量删除", notes="项目关联应用-批量删除")
    @DeleteMapping(value = "/deleteBatch")
    public Result<String> deleteBatch(@RequestParam(name="ids",required=true) String ids) {
        this.projectRelatedAppService.removeByIds(Arrays.asList(ids.split(",")));
        return Result.OK("批量删除成功!");
    }

    /**
     * 通过id查询关联应用
     * @param id 关联应用ID
     * @return 关联应用信息
     */
    @AutoLog(value = "项目关联应用-通过id查询")
    @ApiOperation(value="项目关联应用-通过id查询", notes="项目关联应用-通过id查询")
    @GetMapping(value = "/queryById")
    public Result<ProjectRelatedApp> queryById(@RequestParam(name="id",required=true) String id) {
        ProjectRelatedApp projectRelatedApp = projectRelatedAppService.getById(id);
        if(projectRelatedApp==null) {
            return Result.error("未找到对应数据");
        }
        return Result.OK(projectRelatedApp);
    }
}