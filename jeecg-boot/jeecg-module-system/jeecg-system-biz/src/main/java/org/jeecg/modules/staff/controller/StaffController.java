package org.jeecg.modules.staff.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.jeecg.common.api.vo.Result;
import org.jeecg.common.system.query.QueryGenerator;
import org.jeecg.modules.staff.entity.Staff;
import org.jeecg.modules.staff.service.IStaffService;
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

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;

/**
 * 人员管理Controller
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Slf4j
@RestController
@RequestMapping("/sys/staff")
@Tag(name = "人员管理", description = "人员管理相关接口")
public class StaffController {

    @Autowired
    private IStaffService staffService;

    /**
     * 分页列表查询
     */
    @Operation(summary = "分页列表查询", description = "获取人员管理分页列表")
    @GetMapping(value = "/list")
    public Result<IPage<Staff>> queryPageList(Staff staff,
                                              @RequestParam(name="pageNo", defaultValue="1") Integer pageNo,
                                              @RequestParam(name="pageSize", defaultValue="10") Integer pageSize,
                                              HttpServletRequest req) {
        QueryWrapper<Staff> queryWrapper = QueryGenerator.initQueryWrapper(staff, req.getParameterMap());
        Page<Staff> page = new Page<Staff>(pageNo, pageSize);
        IPage<Staff> pageList = staffService.page(page, queryWrapper);
        return Result.OK(pageList);
    }

    /**
     * 添加
     */
    @Operation(summary = "添加人员", description = "添加新的人员信息")
    @RequiresPermissions("staff:add")
    @PostMapping(value = "/add")
    public Result<String> add(@RequestBody Staff staff) {
        staffService.save(staff);
        return Result.OK("添加成功！");
    }

    /**
     * 编辑
     */
    @Operation(summary = "编辑人员", description = "编辑人员信息")
    @RequiresPermissions("staff:edit")
    @RequestMapping(value = "/edit", method = {RequestMethod.PUT, RequestMethod.POST})
    public Result<String> edit(@RequestBody Staff staff) {
        staffService.updateById(staff);
        return Result.OK("编辑成功!");
    }

    /**
     * 通过id删除
     */
    @Operation(summary = "删除人员", description = "通过ID删除人员")
    @RequiresPermissions("staff:delete")
    @DeleteMapping(value = "/delete")
    public Result<String> delete(@RequestParam(name="id",required=true) String id) {
        staffService.removeById(id);
        return Result.OK("删除成功!");
    }

    /**
     * 批量删除
     */
    @Operation(summary = "批量删除人员", description = "批量删除人员信息")
    @RequiresPermissions("staff:deleteBatch")
    @DeleteMapping(value = "/deleteBatch")
    public Result<String> deleteBatch(@RequestParam(name="ids",required=true) String ids) {
        this.staffService.removeByIds(Arrays.asList(ids.split(",")));
        return Result.OK("批量删除成功!");
    }

    /**
     * 通过id查询
     */
    @Operation(summary = "查询人员详情", description = "通过ID查询人员详细信息")
    @GetMapping(value = "/queryById")
    public Result<Staff> queryById(@RequestParam(name="id",required=true) String id) {
        Staff staff = staffService.getById(id);
        if(staff==null) {
            return Result.error("未找到对应数据");
        }
        return Result.OK(staff);
    }

    /**
     * 导出excel
     */
    @Operation(summary = "导出Excel", description = "导出人员信息到Excel文件")
    @RequiresPermissions("staff:exportXls")
    @RequestMapping(value = "/exportXls")
    public ModelAndView exportXls(HttpServletRequest request, Staff staff) {
        return this.exportXls(request, staff, Staff.class, "人员管理");
    }

    /**
     * 通过excel导入数据
     */
    @Operation(summary = "导入Excel", description = "通过Excel文件导入人员数据")
    @RequiresPermissions("staff:importExcel")
    @RequestMapping(value = "/importExcel", method = RequestMethod.POST)
    public Result<?> importExcel(HttpServletRequest request, HttpServletResponse response) throws IOException {
        MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
        Map<String, MultipartFile> fileMap = multipartRequest.getFileMap();
        for (Map.Entry<String, MultipartFile> entity : fileMap.entrySet()) {
            MultipartFile file = entity.getValue();// 获取上传文件对象
            ImportParams params = new ImportParams();
            params.setTitleRows(2);
            params.setHeadRows(1);
            params.setNeedSave(true);
            try {
                List<Staff> list = ExcelImportUtil.importExcel(file.getInputStream(), Staff.class, params);
                staffService.saveBatch(list);
                return Result.OK("文件导入成功！数据行数:" + list.size());
            } catch (Exception e) {
                log.error(e.getMessage(),e);
                return Result.error("文件导入失败:"+e.getMessage());
            } finally {
                try {
                    file.getInputStream().close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return Result.OK("文件导入失败！");
    }

    /**
     * 技能统计
     */
    @Operation(summary = "技能统计", description = "统计人员技能分布情况")
    @GetMapping(value = "/skillsStats")
    public Result<List<Map<String, Object>>> skillsStats() {
        // 这里可以根据实际需求实现技能统计逻辑
        List<Map<String, Object>> stats = new ArrayList<>();
        Map<String, Object> stat1 = new HashMap<>();
        stat1.put("skill", "Java");
        stat1.put("count", 3);
        stat1.put("percentage", 20);
        stats.add(stat1);
        
        Map<String, Object> stat2 = new HashMap<>();
        stat2.put("skill", "JavaScript");
        stat2.put("count", 3);
        stat2.put("percentage", 20);
        stats.add(stat2);
        
        return Result.OK(stats);
    }

    /**
     * 部门统计
     */
    @Operation(summary = "部门统计", description = "统计各部门人员分布情况")
    @GetMapping(value = "/departmentStats")
    public Result<List<Map<String, Object>>> departmentStats() {
        // 这里可以根据实际需求实现部门统计逻辑
        List<Map<String, Object>> stats = new ArrayList<>();
        Map<String, Object> stat1 = new HashMap<>();
        stat1.put("department", "技术部");
        stat1.put("count", 10);
        stat1.put("percentage", 66.7);
        stats.add(stat1);
        
        return Result.OK(stats);
    }

    /**
     * 检查员工编号是否存在
     */
    @Operation(summary = "检查员工编号", description = "检查员工编号是否已存在")
    @GetMapping(value = "/checkEmployeeNo")
    public Result<Boolean> checkEmployeeNo(@RequestParam(name="employeeNo",required=true) String employeeNo,
                                           @RequestParam(name="id",required=false) String id) {
        QueryWrapper<Staff> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("employee_no", employeeNo);
        if (id != null && !id.isEmpty()) {
            queryWrapper.ne("id", id);
        }
        long count = staffService.count(queryWrapper);
        return Result.OK(count > 0);
    }

    /**
     * 检查邮箱是否存在
     */
    @Operation(summary = "检查邮箱", description = "检查邮箱是否已存在")
    @GetMapping(value = "/checkEmail")
    public Result<Boolean> checkEmail(@RequestParam(name="email",required=true) String email,
                                      @RequestParam(name="id",required=false) String id) {
        QueryWrapper<Staff> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", email);
        if (id != null && !id.isEmpty()) {
            queryWrapper.ne("id", id);
        }
        long count = staffService.count(queryWrapper);
        return Result.OK(count > 0);
    }

    /**
     * 导出excel的通用方法
     */
    private ModelAndView exportXls(HttpServletRequest request, Staff object, Class<?> clazz, String title) {
        // 获取查询条件
        QueryWrapper<Staff> queryWrapper = QueryGenerator.initQueryWrapper(object, request.getParameterMap());
        List<Staff> pageList = staffService.list(queryWrapper);
        // 导出Excel
        ModelAndView mv = new ModelAndView(new JeecgEntityExcelView());
        mv.addObject(NormalExcelConstants.FILE_NAME, title);
        mv.addObject(NormalExcelConstants.CLASS, clazz);
        mv.addObject(NormalExcelConstants.PARAMS, new ExportParams(title + "报表", "导出人:" + "Admin", title));
        mv.addObject(NormalExcelConstants.DATA_LIST, pageList);
        return mv;
    }
}