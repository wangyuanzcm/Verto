package org.jeecg.modules.material.controller;

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
import org.jeecg.modules.material.entity.Material;
import org.jeecg.modules.material.service.IMaterialService;
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
 * @Description: 物料管理控制器 - 支持组件和模板管理
 * @Author: jeecg-boot
 * @Date: 2024-01-26
 * @Version: V1.0
 */
@Slf4j
@Tag(name = "物料管理")
@RestController
@RequestMapping("/material")
public class MaterialController extends JeecgController<Material, IMaterialService> {

    @Autowired
    private IMaterialService materialService;

    /**
     * 组件管理 - 分页列表查询
     */
    @Operation(summary = "获取组件列表")
    @GetMapping(value = "/component/list")
    @PermissionData(pageComponent = "material/ComponentList")
    public Result<?> componentList(Material material,
                                   @RequestParam(name = "pageNo", defaultValue = "1") Integer pageNo,
                                   @RequestParam(name = "pageSize", defaultValue = "10") Integer pageSize,
                                   HttpServletRequest req) {
        // 设置查询条件为组件类型
        material.setType("component");
        QueryWrapper<Material> queryWrapper = QueryGenerator.initQueryWrapper(material, req.getParameterMap());
        queryWrapper.orderByDesc("create_time");
        Page<Material> page = new Page<>(pageNo, pageSize);

        IPage<Material> pageList = materialService.page(page, queryWrapper);
        log.info("查询组件列表 - 当前页：{}, 页面大小：{}, 结果数量：{}, 总数：{}", 
                pageList.getCurrent(), pageList.getSize(), pageList.getRecords().size(), pageList.getTotal());
        return Result.OK(pageList);
    }

    /**
     * 组件管理 - 添加
     */
    @PostMapping(value = "/component/add")
    @AutoLog(value = "添加组件")
    @Operation(summary = "添加组件")
    public Result<?> addComponent(@RequestBody Material material) {
        // 设置为组件类型
        material.setType("component");
        
        // 校验名称唯一性
        if (!materialService.checkNameAndTypeUnique(material.getName(), material.getType(), null)) {
            return Result.error("组件名称已存在！");
        }
        
        materialService.save(material);
        return Result.OK("添加组件成功！");
    }

    /**
     * 组件管理 - 编辑
     */
    @AutoLog(value = "编辑组件", operateType = CommonConstant.OPERATE_TYPE_3)
    @Operation(summary = "编辑组件")
    @RequestMapping(value = "/component/edit", method = {RequestMethod.PUT, RequestMethod.POST})
    public Result<?> editComponent(@RequestBody Material material) {
        // 校验名称唯一性（排除当前记录）
        if (!materialService.checkNameAndTypeUnique(material.getName(), "component", material.getId())) {
            return Result.error("组件名称已存在！");
        }
        
        material.setType("component");
        materialService.updateById(material);
        return Result.OK("更新组件成功！");
    }

    /**
     * 组件管理 - 通过id删除
     */
    @AutoLog(value = "删除组件")
    @DeleteMapping(value = "/component/delete")
    @Operation(summary = "通过ID删除组件")
    public Result<?> deleteComponent(@RequestParam(name = "id", required = true) String id) {
        materialService.removeById(id);
        return Result.OK("删除组件成功!");
    }

    /**
     * 组件管理 - 批量删除
     */
    @DeleteMapping(value = "/component/deleteBatch")
    @Operation(summary = "批量删除组件")
    public Result<?> deleteComponentBatch(@RequestParam(name = "ids", required = true) String ids) {
        materialService.removeByIds(Arrays.asList(ids.split(",")));
        return Result.OK("批量删除组件成功！");
    }

    /**
     * 模板管理 - 分页列表查询
     */
    @Operation(summary = "获取模板列表")
    @GetMapping(value = "/template/list")
    @PermissionData(pageComponent = "material/TemplateList")
    public Result<?> templateList(Material material,
                                  @RequestParam(name = "pageNo", defaultValue = "1") Integer pageNo,
                                  @RequestParam(name = "pageSize", defaultValue = "10") Integer pageSize,
                                  HttpServletRequest req) {
        // 设置查询条件为模板类型
        material.setType("template");
        QueryWrapper<Material> queryWrapper = QueryGenerator.initQueryWrapper(material, req.getParameterMap());
        queryWrapper.orderByDesc("create_time");
        Page<Material> page = new Page<>(pageNo, pageSize);

        IPage<Material> pageList = materialService.page(page, queryWrapper);
        log.info("查询模板列表 - 当前页：{}, 页面大小：{}, 结果数量：{}, 总数：{}", 
                pageList.getCurrent(), pageList.getSize(), pageList.getRecords().size(), pageList.getTotal());
        return Result.OK(pageList);
    }

    /**
     * 模板管理 - 添加
     */
    @PostMapping(value = "/template/add")
    @AutoLog(value = "添加模板")
    @Operation(summary = "添加模板")
    public Result<?> addTemplate(@RequestBody Material material) {
        // 设置为模板类型
        material.setType("template");
        
        // 校验名称唯一性
        if (!materialService.checkNameAndTypeUnique(material.getName(), material.getType(), null)) {
            return Result.error("模板名称已存在！");
        }
        
        materialService.save(material);
        return Result.OK("添加模板成功！");
    }

    /**
     * 模板管理 - 编辑
     */
    @AutoLog(value = "编辑模板", operateType = CommonConstant.OPERATE_TYPE_3)
    @Operation(summary = "编辑模板")
    @RequestMapping(value = "/template/edit", method = {RequestMethod.PUT, RequestMethod.POST})
    public Result<?> editTemplate(@RequestBody Material material) {
        // 校验名称唯一性（排除当前记录）
        if (!materialService.checkNameAndTypeUnique(material.getName(), "template", material.getId())) {
            return Result.error("模板名称已存在！");
        }
        
        material.setType("template");
        materialService.updateById(material);
        return Result.OK("更新模板成功！");
    }

    /**
     * 模板管理 - 通过id删除
     */
    @AutoLog(value = "删除模板")
    @DeleteMapping(value = "/template/delete")
    @Operation(summary = "通过ID删除模板")
    public Result<?> deleteTemplate(@RequestParam(name = "id", required = true) String id) {
        materialService.removeById(id);
        return Result.OK("删除模板成功!");
    }

    /**
     * 模板管理 - 批量删除
     */
    @DeleteMapping(value = "/template/deleteBatch")
    @Operation(summary = "批量删除模板")
    public Result<?> deleteTemplateBatch(@RequestParam(name = "ids", required = true) String ids) {
        materialService.removeByIds(Arrays.asList(ids.split(",")));
        return Result.OK("批量删除模板成功！");
    }

    /**
     * 通用方法 - 通过id查询
     */
    @GetMapping(value = "/queryById")
    @Operation(summary = "通过ID查询物料")
    public Result<?> queryById(@Parameter(name = "id", description = "物料id", required = true) 
                               @RequestParam(name = "id", required = true) String id) {
        Material material = materialService.getById(id);
        if (material == null) {
            return Result.error("未找到对应数据");
        }
        return Result.OK(material);
    }

    /**
     * 导出excel
     */
    @RequestMapping(value = "/exportXls")
    @PermissionData(pageComponent = "material/MaterialList")
    public ModelAndView exportXls(HttpServletRequest request, Material material) {
        return super.exportXls(request, material, Material.class, "物料管理");
    }

    /**
     * 通过excel导入数据
     */
    @RequestMapping(value = "/importExcel", method = RequestMethod.POST)
    public Result<?> importExcel(HttpServletRequest request, HttpServletResponse response) {
        return super.importExcel(request, response, Material.class);
    }

    /**
     * 校验物料名称唯一性
     */
    @GetMapping(value = "/checkNameUnique")
    @Operation(summary = "校验物料名称唯一性")
    public Result<?> checkNameUnique(@RequestParam(name = "name") String name,
                                     @RequestParam(name = "type") String type,
                                     @RequestParam(name = "id", required = false) String id) {
        boolean isUnique = materialService.checkNameAndTypeUnique(name, type, id);
        return Result.OK(isUnique);
    }

    /**
     * 获取物料统计信息
     */
    @GetMapping(value = "/statistics")
    @Operation(summary = "获取物料统计信息")
    public Result<?> getStatistics() {
        Map<String, Object> statistics = materialService.getMaterialStatistics();
        return Result.OK(statistics);
    }

    /**
     * 复制物料
     */
    @PostMapping(value = "/copy")
    @AutoLog(value = "复制物料")
    @Operation(summary = "复制物料")
    public Result<?> copyMaterial(@RequestParam(name = "id") String id,
                                  @RequestParam(name = "newName") String newName) {
        try {
            Material newMaterial = materialService.copyMaterial(id, newName);
            return Result.OK("复制物料成功！", newMaterial);
        } catch (Exception e) {
            log.error("复制物料失败：", e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * 批量更新状态
     */
    @PostMapping(value = "/batchUpdateStatus")
    @AutoLog(value = "批量更新物料状态")
    @Operation(summary = "批量更新物料状态")
    public Result<?> batchUpdateStatus(@RequestParam(name = "ids") String ids,
                                       @RequestParam(name = "status") String status) {
        List<String> idList = Arrays.asList(ids.split(","));
        int count = materialService.batchUpdateStatus(idList, status);
        return Result.OK("批量更新成功，共更新" + count + "条记录！");
    }

    /**
     * 根据类型获取物料列表（不分页）
     */
    @GetMapping(value = "/listByType")
    @Operation(summary = "根据类型获取物料列表")
    public Result<?> listByType(@RequestParam(name = "type") String type) {
        List<Material> list = materialService.getMaterialByType(type);
        return Result.OK(list);
    }
}