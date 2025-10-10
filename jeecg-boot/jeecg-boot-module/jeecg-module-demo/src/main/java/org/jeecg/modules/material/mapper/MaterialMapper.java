package org.jeecg.modules.material.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;
import org.jeecg.modules.material.entity.Material;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

/**
 * @Description: 物料管理数据访问层
 * @Author: jeecg-boot
 * @Date: 2024-01-26
 * @Version: V1.0
 */
public interface MaterialMapper extends BaseMapper<Material> {

    /**
     * 根据物料名称查询物料列表
     * @param name 物料名称
     * @return 物料集合
     */
    List<Material> getMaterialByName(@Param("name") String name);

    /**
     * 根据物料类型查询物料列表
     * @param type 物料类型（component/template）
     * @return 物料集合
     */
    List<Material> getMaterialByType(@Param("type") String type);

    /**
     * 查询列表数据 - 支持数据权限过滤
     * @param page 分页对象
     * @param permissionSql 权限SQL
     * @return 分页结果
     */
    IPage<Material> queryListWithPermission(Page<Material> page, @Param("permissionSql") String permissionSql);

    /**
     * 根据物料名称和类型查询物料（用于唯一性校验）
     * @param name 物料名称
     * @param type 物料类型
     * @param excludeId 排除的ID（编辑时使用）
     * @return 物料对象
     */
    Material getMaterialByNameAndType(@Param("name") String name, @Param("type") String type, @Param("excludeId") String excludeId);

    /**
     * 获取物料统计信息
     * @return 统计信息Map
     */
    Map<String, Object> getMaterialStatistics();

    /**
     * 根据状态统计物料数量
     * @param status 状态
     * @return 数量
     */
    Integer countByStatus(@Param("status") String status);

    /**
     * 根据类型统计物料数量
     * @param type 类型
     * @return 数量
     */
    Integer countByType(@Param("type") String type);
}