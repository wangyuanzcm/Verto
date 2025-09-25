package org.jeecg.modules.material.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.jeecg.common.api.vo.Result;
import org.jeecg.common.system.query.QueryGenerator;
import org.jeecg.modules.material.entity.MaterialTemplate;
import org.jeecg.modules.material.service.IMaterialTemplateService;
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
 * 物料模板Controller
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Slf4j
@RestController
@RequestMapping("/jeecgboot/material/template")
public class MaterialTemplateController {

    @Autowired
    private IMaterialTemplateService materialTemplateService;

    /**
     * 分页列表查询
     */
    @GetMapping(value = "/list")
    public Result<IPage<MaterialTemplate>> queryPageList(MaterialTemplate materialTemplate,
                                                         @RequestParam(name="pageNo", defaultValue="1") Integer pageNo,
                                                         @RequestParam(name="pageSize", defaultValue="10") Integer pageSize,
                                                         HttpServletRequest req) {
        QueryWrapper<MaterialTemplate> queryWrapper = QueryGenerator.initQueryWrapper(materialTemplate, req.getParameterMap());
        Page<MaterialTemplate> page = new Page<MaterialTemplate>(pageNo, pageSize);
        IPage<MaterialTemplate> pageList = materialTemplateService.page(page, queryWrapper);
        return Result.OK(pageList);
    }

    /**
     * 添加
     */
    @RequiresPermissions("material:template:add")
    @PostMapping(value = "/add")
    public Result<String> add(@RequestBody MaterialTemplate materialTemplate) {
        materialTemplateService.save(materialTemplate);
        return Result.OK("添加成功！");
    }

    /**
     * 编辑
     */
    @RequiresPermissions("material:template:edit")
    @RequestMapping(value = "/edit", method = {RequestMethod.PUT, RequestMethod.POST})
    public Result<String> edit(@RequestBody MaterialTemplate materialTemplate) {
        materialTemplateService.updateById(materialTemplate);
        return Result.OK("编辑成功!");
    }

    /**
     * 通过id删除
     */
    @RequiresPermissions("material:template:delete")
    @DeleteMapping(value = "/delete")
    public Result<String> delete(@RequestParam(name="id",required=true) String id) {
        materialTemplateService.removeById(id);
        return Result.OK("删除成功!");
    }

    /**
     * 批量删除
     */
    @RequiresPermissions("material:template:deleteBatch")
    @DeleteMapping(value = "/deleteBatch")
    public Result<String> deleteBatch(@RequestParam(name="ids",required=true) String ids) {
        this.materialTemplateService.removeByIds(Arrays.asList(ids.split(",")));
        return Result.OK("批量删除成功!");
    }

    /**
     * 通过id查询
     */
    @GetMapping(value = "/queryById")
    public Result<MaterialTemplate> queryById(@RequestParam(name="id",required=true) String id) {
        MaterialTemplate materialTemplate = materialTemplateService.getById(id);
        if(materialTemplate==null) {
            return Result.error("未找到对应数据");
        }
        return Result.OK(materialTemplate);
    }

    /**
     * 导出excel
     */
    @RequiresPermissions("material:template:exportXls")
    @RequestMapping(value = "/exportXls")
    public ModelAndView exportXls(HttpServletRequest request, MaterialTemplate materialTemplate) {
        return super.exportXls(request, materialTemplate, MaterialTemplate.class, "物料模板");
    }

    /**
     * 通过excel导入数据
     */
    @RequiresPermissions("material:template:importExcel")
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
                List<MaterialTemplate> list = ExcelImportUtil.importExcel(file.getInputStream(), MaterialTemplate.class, params);
                materialTemplateService.saveBatch(list);
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
    private ModelAndView exportXls(HttpServletRequest request, MaterialTemplate object, Class<?> clazz, String title) {
        // 获取查询条件
        QueryWrapper<MaterialTemplate> queryWrapper = QueryGenerator.initQueryWrapper(object, request.getParameterMap());
        List<MaterialTemplate> pageList = materialTemplateService.list(queryWrapper);
        // 导出Excel
        ModelAndView mv = new ModelAndView(new JeecgEntityExcelView());
        mv.addObject(NormalExcelConstants.FILE_NAME, title);
        mv.addObject(NormalExcelConstants.CLASS, clazz);
        mv.addObject(NormalExcelConstants.PARAMS, new ExportParams(title + "报表", "导出人:" + "Admin", title));
        mv.addObject(NormalExcelConstants.DATA_LIST, pageList);
        return mv;
    }
}