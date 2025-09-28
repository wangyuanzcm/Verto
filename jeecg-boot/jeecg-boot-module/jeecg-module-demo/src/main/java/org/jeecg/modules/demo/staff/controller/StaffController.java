package org.jeecg.modules.demo.staff.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.jeecg.common.api.vo.Result;
import org.jeecg.common.aspect.annotation.AutoLog;
import org.jeecg.common.aspect.annotation.PermissionData;
import org.jeecg.common.constant.CommonConstant;
import org.jeecg.common.system.base.controller.JeecgController;
import org.jeecg.common.system.query.QueryGenerator;
import org.jeecg.common.util.oConvertUtils;
import org.jeecg.modules.demo.staff.entity.Staff;
import org.jeecg.modules.demo.staff.service.IStaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @Description: 人员管理
 * @Author: jeecg-boot
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@Slf4j
@Tag(name = "人员管理")
@RestController
@RequestMapping("/staff")
public class StaffController extends JeecgController<Staff, IStaffService> {

    @Autowired
    private IStaffService staffService;

    /**
     * 分页列表查询
     *
     * @param staff 查询条件
     * @param pageNo 页码
     * @param pageSize 页大小
     * @param req 请求对象
     * @return 分页结果
     */
    @Operation(summary = "获取人员数据列表")
    @GetMapping(value = "/list")
    @PermissionData(pageComponent = "staff/StaffList")
    public Result<?> list(Staff staff, 
                          @RequestParam(name = "pageNo", defaultValue = "1") Integer pageNo, 
                          @RequestParam(name = "pageSize", defaultValue = "10") Integer pageSize,
                          HttpServletRequest req) {
        QueryWrapper<Staff> queryWrapper = QueryGenerator.initQueryWrapper(staff, req.getParameterMap());
        queryWrapper.orderByDesc("create_time");
        Page<Staff> page = new Page<>(pageNo, pageSize);

        IPage<Staff> pageList = staffService.page(page, queryWrapper);
        log.info("查询当前页：" + pageList.getCurrent());
        log.info("查询当前页数量：" + pageList.getSize());
        log.info("查询结果数量：" + pageList.getRecords().size());
        log.info("数据总数：" + pageList.getTotal());
        return Result.OK(pageList);
    }

    /**
     * 添加人员
     *
     * @param staff 人员信息
     * @return 操作结果
     */
    @PostMapping(value = "/add")
    @AutoLog(value = "添加人员")
    @Operation(summary = "添加人员")
    public Result<?> add(@RequestBody Staff staff) {
        staffService.save(staff);
        return Result.OK("添加成功！");
    }

    /**
     * 编辑人员
     *
     * @param staff 人员信息
     * @return 操作结果
     */
    @AutoLog(value = "编辑人员", operateType = CommonConstant.OPERATE_TYPE_3)
    @Operation(summary = "编辑人员")
    @RequestMapping(value = "/edit", method = {RequestMethod.PUT, RequestMethod.POST})
    public Result<?> edit(@RequestBody Staff staff) {
        staffService.updateById(staff);
        return Result.OK("编辑成功!");
    }

    /**
     * 通过id删除人员
     *
     * @param id 人员ID
     * @return 操作结果
     */
    @AutoLog(value = "删除人员")
    @DeleteMapping(value = "/delete")
    @Operation(summary = "通过ID删除人员")
    public Result<?> delete(@RequestParam(name = "id", required = true) String id) {
        staffService.removeById(id);
        return Result.OK("删除成功!");
    }

    /**
     * 批量删除人员
     *
     * @param ids 人员ID列表，逗号分隔
     * @return 操作结果
     */
    @AutoLog(value = "批量删除人员")
    @DeleteMapping(value = "/deleteBatch")
    @Operation(summary = "批量删除人员")
    public Result<?> deleteBatch(@RequestParam(name = "ids", required = true) String ids) {
        this.staffService.removeByIds(Arrays.asList(ids.split(",")));
        return Result.OK("批量删除成功！");
    }

    /**
     * 通过id查询人员
     *
     * @param id 人员ID
     * @return 人员信息
     */
    @GetMapping(value = "/queryById")
    @Operation(summary = "通过ID查询人员")
    public Result<?> queryById(@Parameter(name = "id", description = "人员id", required = true) 
                               @RequestParam(name = "id", required = true) String id) {
        Staff staff = staffService.getById(id);
        return Result.OK(staff);
    }

    /**
     * 导出excel
     *
     * @param request 请求对象
     * @param staff 查询条件
     * @return ModelAndView
     */
    @RequestMapping(value = "/exportXls")
    @PermissionData(pageComponent = "staff/StaffList")
    public ModelAndView exportXls(HttpServletRequest request, Staff staff) {
        return super.exportXls(request, staff, Staff.class, "人员管理");
    }

    /**
     * 通过excel导入数据
     *
     * @param request 请求对象
     * @param response 响应对象
     * @return 导入结果
     */
    @RequestMapping(value = "/importExcel", method = RequestMethod.POST)
    public Result<?> importExcel(HttpServletRequest request, HttpServletResponse response) {
        return super.importExcel(request, response, Staff.class);
    }

    /**
     * 检查工号是否重复
     *
     * @param employeeNo 工号
     * @param id 当前记录ID（编辑时排除自己）
     * @return 检查结果
     */
    @GetMapping(value = "/checkEmployeeNo")
    @Operation(summary = "检查工号是否重复")
    public Result<?> checkEmployeeNo(@RequestParam(name = "employeeNo") String employeeNo,
                                     @RequestParam(name = "id", required = false) String id) {
        boolean isUnique = staffService.checkEmployeeNo(employeeNo, id);
        Map<String, Object> result = new HashMap<>();
        result.put("success", isUnique);
        result.put("message", isUnique ? "工号可用" : "工号已存在");
        return Result.OK(result);
    }

    /**
     * 检查邮箱是否重复
     *
     * @param email 邮箱
     * @param id 当前记录ID（编辑时排除自己）
     * @return 检查结果
     */
    @GetMapping(value = "/checkEmail")
    @Operation(summary = "检查邮箱是否重复")
    public Result<?> checkEmail(@RequestParam(name = "email") String email,
                                @RequestParam(name = "id", required = false) String id) {
        boolean isUnique = staffService.checkEmail(email, id);
        Map<String, Object> result = new HashMap<>();
        result.put("success", isUnique);
        result.put("message", isUnique ? "邮箱可用" : "邮箱已存在");
        return Result.OK(result);
    }

    /**
     * 获取技能统计
     *
     * @return 技能统计数据
     */
    @GetMapping(value = "/skillsStats")
    @Operation(summary = "获取技能统计")
    public Result<?> skillsStats() {
        List<Map<String, Object>> stats = staffService.getSkillsStats();
        return Result.OK(stats);
    }

    /**
     * 获取部门统计
     *
     * @return 部门统计数据
     */
    @GetMapping(value = "/departmentStats")
    @Operation(summary = "获取部门统计")
    public Result<?> departmentStats() {
        List<Map<String, Object>> stats = staffService.getDepartmentStats();
        return Result.OK(stats);
    }
}