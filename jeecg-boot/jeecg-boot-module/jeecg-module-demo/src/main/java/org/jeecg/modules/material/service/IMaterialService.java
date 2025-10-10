package org.jeecg.modules.material.service;

import org.jeecg.common.system.base.service.JeecgService;
import org.jeecg.modules.material.entity.Material;

import com.baomidou.mybatisplus.core.metadata.IPage;

import java.util.List;
import java.util.Map;

/**
 * @Description: 物料管理服务接口
 * @Author: jeecg-boot
 * @Date: 2024-01-26
 * @Version: V1.0
 */
public interface IMaterialService extends JeecgService<Material> {

    /**
     * 根据物料名称查询物料列表
     * @param name 物料名称
     * @return 物料集合
     */
    List<Material> getMaterialByName(String name);

    /**
     * 根据物料类型查询物料列表
     * @param type 物料类型（component/template）
     * @return 物料集合
     */
    List<Material> getMaterialByType(String type);

    /**
     * 查询列表数据 - 支持数据权限过滤
     * @param pageSize 页面大小
     * @param pageNo 页码
     * @return 分页结果
     */
    IPage<Material> queryListWithPermission(int pageSize, int pageNo);

    /**
     * 校验物料名称和类型的唯一性
     * @param name 物料名称
     * @param type 物料类型
     * @param excludeId 排除的ID（编辑时使用）
     * @return true-唯一，false-重复
     */
    boolean checkNameAndTypeUnique(String name, String type, String excludeId);

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
    Integer countByStatus(String status);

    /**
     * 根据类型统计物料数量
     * @param type 类型
     * @return 数量
     */
    Integer countByType(String type);

    /**
     * 批量更新物料状态
     * @param ids 物料ID列表
     * @param status 新状态
     * @return 更新成功的数量
     */
    int batchUpdateStatus(List<String> ids, String status);

    /**
     * 根据用户权限获取导出字段
     * @return 导出字段字符串
     */
    String getExportFields();

    /**
     * 复制物料（创建副本）
     * @param id 原物料ID
     * @param newName 新物料名称
     * @return 新物料对象
     */
    Material copyMaterial(String id, String newName);
}