package org.jeecg.modules.material.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.jeecg.common.api.vo.Result;
import org.jeecg.common.system.query.QueryGenerator;
import org.jeecg.modules.material.entity.MaterialComponent;
import org.jeecg.modules.material.service.IMaterialComponentService;
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
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * 物料组件Controller
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Slf4j
@RestController
@RequestMapping("/jeecgboot/material/component")
public class MaterialComponentController {

    @Autowired
    private IMaterialComponentService materialComponentService;

    /**
     * 分页列表查询
     */
    @GetMapping(value = "/list")
    public Result<IPage<MaterialComponent>> queryPageList(MaterialComponent materialComponent,
                                                          @RequestParam(name="pageNo", defaultValue="1") Integer pageNo,
                                                          @RequestParam(name="pageSize", defaultValue="10") Integer pageSize,
                                                          HttpServletRequest req) {
        QueryWrapper<MaterialComponent> queryWrapper = QueryGenerator.initQueryWrapper(materialComponent, req.getParameterMap());
        Page<MaterialComponent> page = new Page<MaterialComponent>(pageNo, pageSize);
        IPage<MaterialComponent> pageList = materialComponentService.page(page, queryWrapper);
        return Result.OK(pageList);
    }

    /**
     * 添加
     */
    @RequiresPermissions("material:component:add")
    @PostMapping(value = "/add")
    public Result<String> add(@RequestBody MaterialComponent materialComponent) {
        materialComponentService.save(materialComponent);
        return Result.OK("添加成功！");
    }

    /**
     * 编辑
     */
    @RequiresPermissions("material:component:edit")
    @RequestMapping(value = "/edit", method = {RequestMethod.PUT, RequestMethod.POST})
    public Result<String> edit(@RequestBody MaterialComponent materialComponent) {
        materialComponentService.updateById(materialComponent);
        return Result.OK("编辑成功!");
    }

    /**
     * 通过id删除
     */
    @RequiresPermissions("material:component:delete")
    @DeleteMapping(value = "/delete")
    public Result<String> delete(@RequestParam(name="id",required=true) String id) {
        materialComponentService.removeById(id);
        return Result.OK("删除成功!");
    }

    /**
     * 批量删除
     */
    @RequiresPermissions("material:component:deleteBatch")
    @DeleteMapping(value = "/deleteBatch")
    public Result<String> deleteBatch(@RequestParam(name="ids",required=true) String ids) {
        this.materialComponentService.removeByIds(Arrays.asList(ids.split(",")));
        return Result.OK("批量删除成功!");
    }

    /**
     * 通过id查询
     */
    @GetMapping(value = "/queryById")
    public Result<MaterialComponent> queryById(@RequestParam(name="id",required=true) String id) {
        MaterialComponent materialComponent = materialComponentService.getById(id);
        if(materialComponent==null) {
            return Result.error("未找到对应数据");
        }
        return Result.OK(materialComponent);
    }

    /**
     * 导出excel
     */
    @RequiresPermissions("material:component:exportXls")
    @RequestMapping(value = "/exportXls")
    public ModelAndView exportXls(HttpServletRequest request, MaterialComponent materialComponent) {
        return super.exportXls(request, materialComponent, MaterialComponent.class, "物料组件");
    }

    /**
     * 通过excel导入数据
     */
    @RequiresPermissions("material:component:importExcel")
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
                List<MaterialComponent> list = ExcelImportUtil.importExcel(file.getInputStream(), MaterialComponent.class, params);
                materialComponentService.saveBatch(list);
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
     * 导出excel的通用方法
     */
    private ModelAndView exportXls(HttpServletRequest request, MaterialComponent object, Class<?> clazz, String title) {
        // 获取查询条件
        QueryWrapper<MaterialComponent> queryWrapper = QueryGenerator.initQueryWrapper(object, request.getParameterMap());
        List<MaterialComponent> pageList = materialComponentService.list(queryWrapper);
        // 导出Excel
        ModelAndView mv = new ModelAndView(new JeecgEntityExcelView());
        mv.addObject(NormalExcelConstants.FILE_NAME, title);
        mv.addObject(NormalExcelConstants.CLASS, clazz);
        mv.addObject(NormalExcelConstants.PARAMS, new ExportParams(title + "报表", "导出人:" + "Admin", title));
        mv.addObject(NormalExcelConstants.DATA_LIST, pageList);
        return mv;
    }
}