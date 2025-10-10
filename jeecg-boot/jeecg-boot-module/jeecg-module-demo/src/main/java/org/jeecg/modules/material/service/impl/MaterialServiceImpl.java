package org.jeecg.modules.material.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.shiro.SecurityUtils;
import org.jeecg.common.constant.CacheConstant;
import org.jeecg.common.system.query.QueryGenerator;
import org.jeecg.common.system.vo.LoginUser;
import org.jeecg.common.util.UUIDGenerator;
import org.jeecg.modules.material.entity.Material;
import org.jeecg.modules.material.mapper.MaterialMapper;
import org.jeecg.modules.material.service.IMaterialService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.lang.reflect.Field;
import java.util.*;

/**
 * @Description: 物料管理服务实现类
 * @Author: jeecg-boot
 * @Date: 2024-01-26
 * @Version: V1.0
 */
@Service
public class MaterialServiceImpl extends ServiceImpl<MaterialMapper, Material> implements IMaterialService {

    @Autowired
    private MaterialMapper materialMapper;

    /**
     * 根据物料名称查询物料列表
     */
    @Override
    public List<Material> getMaterialByName(String name) {
        if (!StringUtils.hasText(name)) {
            return new ArrayList<>();
        }
        return materialMapper.getMaterialByName(name);
    }

    /**
     * 根据物料类型查询物料列表
     */
    @Override
    public List<Material> getMaterialByType(String type) {
        if (!StringUtils.hasText(type)) {
            return new ArrayList<>();
        }
        return materialMapper.getMaterialByType(type);
    }

    /**
     * 查询列表数据 - 支持数据权限过滤
     */
    @Override
    public IPage<Material> queryListWithPermission(int pageSize, int pageNo) {
        Page<Material> page = new Page<>(pageNo, pageSize);
        // 编程方式，获取当前请求的数据权限规则SQL片段
        String sql = QueryGenerator.installAuthJdbc(Material.class);
        return materialMapper.queryListWithPermission(page, sql);
    }

    /**
     * 校验物料名称和类型的唯一性
     */
    @Override
    public boolean checkNameAndTypeUnique(String name, String type, String excludeId) {
        if (!StringUtils.hasText(name) || !StringUtils.hasText(type)) {
            return false;
        }
        Material existMaterial = materialMapper.getMaterialByNameAndType(name, type, excludeId);
        return existMaterial == null;
    }

    /**
     * 获取物料统计信息
     */
    @Override
    @Cacheable(cacheNames = CacheConstant.TEST_DEMO_CACHE + ":material:statistics", key = "'all'")
    public Map<String, Object> getMaterialStatistics() {
        return materialMapper.getMaterialStatistics();
    }

    /**
     * 根据状态统计物料数量
     */
    @Override
    public Integer countByStatus(String status) {
        if (!StringUtils.hasText(status)) {
            return 0;
        }
        return materialMapper.countByStatus(status);
    }

    /**
     * 根据类型统计物料数量
     */
    @Override
    public Integer countByType(String type) {
        if (!StringUtils.hasText(type)) {
            return 0;
        }
        return materialMapper.countByType(type);
    }

    /**
     * 批量更新物料状态
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int batchUpdateStatus(List<String> ids, String status) {
        if (ids == null || ids.isEmpty() || !StringUtils.hasText(status)) {
            return 0;
        }
        
        UpdateWrapper<Material> updateWrapper = new UpdateWrapper<>();
        updateWrapper.in("id", ids);
        updateWrapper.set("status", status);
        updateWrapper.set("update_time", new Date());
        
        return materialMapper.update(null, updateWrapper);
    }

    /**
     * 根据用户权限获取导出字段
     */
    @Override
    public String getExportFields() {
        LoginUser sysUser = (LoginUser) SecurityUtils.getSubject().getPrincipal();
        String userId = sysUser.getId();
        
        // 获取所有字段权限
        List<String> allAuthFields = Arrays.asList("name", "type", "version", "description", "status", "create_time", "update_time");
        
        // 根据用户权限过滤字段（这里简化处理，实际可根据具体权限系统实现）
        StringBuilder exportFields = new StringBuilder();
        for (String field : allAuthFields) {
            if (exportFields.length() > 0) {
                exportFields.append(",");
            }
            exportFields.append(field);
        }
        
        return exportFields.toString();
    }

    /**
     * 复制物料（创建副本）
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Material copyMaterial(String id, String newName) {
        if (!StringUtils.hasText(id) || !StringUtils.hasText(newName)) {
            throw new IllegalArgumentException("物料ID和新名称不能为空");
        }
        
        // 获取原物料
        Material originalMaterial = this.getById(id);
        if (originalMaterial == null) {
            throw new IllegalArgumentException("原物料不存在");
        }
        
        // 检查新名称是否重复
        if (!checkNameAndTypeUnique(newName, originalMaterial.getType(), null)) {
            throw new IllegalArgumentException("物料名称已存在");
        }
        
        // 创建新物料
        Material newMaterial = new Material();
        BeanUtils.copyProperties(originalMaterial, newMaterial);
        
        // 重置关键字段
        newMaterial.setId(null);
        newMaterial.setName(newName);
        newMaterial.setCreateTime(null);
        newMaterial.setUpdateTime(null);
        newMaterial.setCreateBy(null);
        newMaterial.setUpdateBy(null);
        newMaterial.setUpdateCount(0);
        
        // 保存新物料
        this.save(newMaterial);
        
        return newMaterial;
    }
}