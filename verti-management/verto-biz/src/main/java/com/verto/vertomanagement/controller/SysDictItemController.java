package com.verto.vertomanagement.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.verto.vertomanagement.common.Result;
import com.verto.vertomanagement.entity.SysDictItem;
import com.verto.vertomanagement.service.ISysDictItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

/**
 * 系统字典项控制器
 * 提供字典项数据的管理接口
 * 
 * @author Verto
 * @since 2024-01-01
 */
@Tag(name = "系统字典项管理")
@RestController
@RequestMapping("/sys/dictItem")
@Slf4j
public class SysDictItemController {

    @Autowired
    private ISysDictItemService sysDictItemService;

    /**
     * 分页查询字典项列表
     * @param sysDictItem 查询条件
     * @param pageNo 页码
     * @param pageSize 页大小
     * @param req 请求对象
     * @return 分页结果
     */
    @Operation(summary = "分页查询字典项列表")
    @GetMapping("/list")
    public Result<IPage<SysDictItem>> queryPageList(
            SysDictItem sysDictItem,
            @RequestParam(name = "pageNo", defaultValue = "1") Integer pageNo,
            @RequestParam(name = "pageSize", defaultValue = "10") Integer pageSize,
            HttpServletRequest req) {
        
        log.info("分页查询字典项列表，页码：{}，页大小：{}", pageNo, pageSize);
        
        QueryWrapper<SysDictItem> queryWrapper = new QueryWrapper<>();
        
        // 构建查询条件
        if (StringUtils.hasText(sysDictItem.getDictId())) {
            queryWrapper.eq("dict_id", sysDictItem.getDictId());
        }
        if (StringUtils.hasText(sysDictItem.getItemText())) {
            queryWrapper.like("item_text", sysDictItem.getItemText());
        }
        if (StringUtils.hasText(sysDictItem.getItemValue())) {
            queryWrapper.like("item_value", sysDictItem.getItemValue());
        }
        if (sysDictItem.getStatus() != null) {
            queryWrapper.eq("status", sysDictItem.getStatus());
        }
        
        queryWrapper.orderByAsc("sort_order");
        
        Page<SysDictItem> page = new Page<>(pageNo, pageSize);
        IPage<SysDictItem> pageList = sysDictItemService.page(page, queryWrapper);
        
        return Result.ok(pageList);
    }

    /**
     * 新增字典项
     * @param sysDictItem 字典项对象
     * @return 操作结果
     */
    @Operation(summary = "新增字典项")
    @PostMapping("/add")
    public Result<String> add(@RequestBody SysDictItem sysDictItem) {
        log.info("新增字典项，字典ID：{}，项值：{}", sysDictItem.getDictId(), sysDictItem.getItemValue());
        
        // 检查字典项值是否重复
        LambdaQueryWrapper<SysDictItem> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(SysDictItem::getDictId, sysDictItem.getDictId());
        queryWrapper.eq(SysDictItem::getItemValue, sysDictItem.getItemValue());
        long count = sysDictItemService.count(queryWrapper);
        if (count > 0) {
            return Result.error("字典项值已存在！");
        }
        
        sysDictItem.setCreateTime(new Date());
        sysDictItem.setUpdateTime(new Date());
        if (sysDictItem.getStatus() == null) {
            sysDictItem.setStatus(1);
        }
        
        boolean success = sysDictItemService.save(sysDictItem);
        if (success) {
            return Result.ok("添加成功");
        } else {
            return Result.error("添加失败");
        }
    }

    /**
     * 编辑字典项
     * @param sysDictItem 字典项对象
     * @return 操作结果
     */
    @Operation(summary = "编辑字典项")
    @PutMapping("/edit")
    public Result<String> edit(@RequestBody SysDictItem sysDictItem) {
        log.info("编辑字典项，字典项ID：{}", sysDictItem.getId());
        
        // 检查字典项值是否重复（排除自己）
        LambdaQueryWrapper<SysDictItem> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(SysDictItem::getDictId, sysDictItem.getDictId());
        queryWrapper.eq(SysDictItem::getItemValue, sysDictItem.getItemValue());
        queryWrapper.ne(SysDictItem::getId, sysDictItem.getId());
        long count = sysDictItemService.count(queryWrapper);
        if (count > 0) {
            return Result.error("字典项值已存在！");
        }
        
        sysDictItem.setUpdateTime(new Date());
        boolean success = sysDictItemService.updateById(sysDictItem);
        if (success) {
            return Result.ok("编辑成功");
        } else {
            return Result.error("编辑失败");
        }
    }

    /**
     * 通过ID查询字典项
     * @param id 字典项ID
     * @return 字典项对象
     */
    @Operation(summary = "通过ID查询字典项")
    @GetMapping("/queryById")
    public Result<SysDictItem> queryById(@RequestParam(name = "id", required = true) String id) {
        log.info("通过ID查询字典项，ID：{}", id);
        SysDictItem sysDictItem = sysDictItemService.getById(id);
        return Result.ok(sysDictItem);
    }

    /**
     * 删除字典项
     * @param id 字典项ID
     * @return 操作结果
     */
    @Operation(summary = "删除字典项")
    @DeleteMapping("/delete")
    public Result<String> delete(@RequestParam(name = "id", required = true) String id) {
        log.info("删除字典项，ID：{}", id);
        
        boolean success = sysDictItemService.removeById(id);
        if (success) {
            return Result.ok("删除成功");
        } else {
            return Result.error("删除失败");
        }
    }

    /**
     * 批量删除字典项
     * @param ids 字典项ID列表
     * @return 操作结果
     */
    @Operation(summary = "批量删除字典项")
    @DeleteMapping("/deleteBatch")
    public Result<String> deleteBatch(@RequestParam(name = "ids", required = true) String ids) {
        log.info("批量删除字典项，IDs：{}", ids);
        
        List<String> idList = Arrays.asList(ids.split(","));
        boolean success = sysDictItemService.removeByIds(idList);
        if (success) {
            return Result.ok("批量删除成功");
        } else {
            return Result.error("批量删除失败");
        }
    }

    /**
     * 通过字典ID查询字典项
     * @param dictId 字典ID
     * @return 字典项列表
     */
    @Operation(summary = "通过字典ID查询字典项")
    @GetMapping("/queryByDictId")
    public Result<List<SysDictItem>> queryByDictId(@RequestParam(name = "dictId", required = true) String dictId) {
        log.info("通过字典ID查询字典项，字典ID：{}", dictId);
        
        List<SysDictItem> dictItems = sysDictItemService.selectItemsByMainId(dictId);
        return Result.ok(dictItems);
    }

    /**
     * 启用/禁用字典项
     * @param id 字典项ID
     * @param status 状态（1启用，0禁用）
     * @return 操作结果
     */
    @Operation(summary = "启用/禁用字典项")
    @PutMapping("/updateStatus")
    public Result<String> updateStatus(@RequestParam(name = "id", required = true) String id,
                                       @RequestParam(name = "status", required = true) Integer status) {
        log.info("更新字典项状态，ID：{}，状态：{}", id, status);
        
        SysDictItem sysDictItem = new SysDictItem();
        sysDictItem.setId(id);
        sysDictItem.setStatus(status);
        sysDictItem.setUpdateTime(new Date());
        
        boolean success = sysDictItemService.updateById(sysDictItem);
        if (success) {
            return Result.ok("状态更新成功！");
        } else {
            return Result.error("状态更新失败！");
        }
    }
}
