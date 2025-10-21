package com.verto.modules.staff.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.verto.common.api.Result;
import com.verto.modules.staff.entity.Staff;
import com.verto.modules.staff.entity.StaffPointsLog;
import com.verto.modules.staff.service.IStaffPointsLogService;
import com.verto.modules.staff.service.IStaffService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@Tag(name = "人员积分", description = "人员积分相关接口")
@RestController
@RequestMapping("/staff/points")
public class StaffPointsController {

    @Autowired
    private IStaffPointsLogService staffPointsLogService;

    @Autowired
    private IStaffService staffService;

    /**
     * 员工总积分摘要
     */
    @Operation(summary = "员工总积分摘要")
    @GetMapping("/summary")
    public Result<Integer> summary(@Parameter(description = "员工ID") @RequestParam(name = "staffId") String staffId) {
        Integer total = staffPointsLogService.getTotalPointsByStaffId(staffId);
        return Result.ok(total);
    }

    /**
     * 员工积分日志分页
     */
    @Operation(summary = "员工积分日志分页")
    @GetMapping("/logs")
    public Result<IPage<StaffPointsLog>> logs(
            @Parameter(description = "员工ID") @RequestParam(name = "staffId") String staffId,
            @Parameter(description = "页码") @RequestParam(name = "pageNo", defaultValue = "1") Integer pageNo,
            @Parameter(description = "每页大小") @RequestParam(name = "pageSize", defaultValue = "10") Integer pageSize) {
        QueryWrapper<StaffPointsLog> qw = new QueryWrapper<>();
        qw.eq("staff_id", staffId);
        qw.orderByDesc("create_time");
        Page<StaffPointsLog> page = new Page<>(pageNo, pageSize);
        IPage<StaffPointsLog> pageList = staffPointsLogService.page(page, qw);
        return Result.ok(pageList);
    }

    /**
     * 手动调整积分（正负皆可）
     */
    @Operation(summary = "手动调整积分")
    @PostMapping("/adjust")
    public Result<String> adjust(@RequestBody StaffPointsLog body) {
        if (body.getStaffId() == null || body.getStaffId().trim().isEmpty()) {
            return Result.error("staffId 不能为空");
        }
        Staff staff = staffService.getById(body.getStaffId());
        if (staff == null) {
            return Result.error("员工不存在: " + body.getStaffId());
        }
        if (body.getDelta() == null || body.getDelta() == 0) {
            return Result.error("delta 必须为非 0 值");
        }
        body.setCreateTime(new Date());
        staffPointsLogService.save(body);
        return Result.ok("调整成功");
    }
}