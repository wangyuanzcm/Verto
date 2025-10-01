package com.verto.vertomanagement.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.verto.vertomanagement.entity.SysDict;
import com.verto.vertomanagement.entity.SysDictItem;
import com.verto.vertomanagement.vo.DictModel;
import com.verto.vertomanagement.vo.DictQuery;

import java.util.List;
import java.util.Map;

/**
 * 系统字典服务接口
 * 提供字典数据的业务逻辑处理
 * 
 * @author Verto
 * @since 2024-01-01
 */
public interface ISysDictService extends IService<SysDict> {

    /**
     * 通过字典编码查询字典在     * @param code 字典编码
     * @return 字典项列在     */
    List<DictModel> queryDictItemsByCode(String code);

    /**
     * 查询有效的字典项
     * @param code 字典编码
     * @return 有效的字典项列表
     */
    List<DictModel> queryEnableDictItemsByCode(String code);

    /**
     * 通过字典编码和键值获取字典文在     * @param code 字典编码
     * @param key 字典键在     * @return 字典文本
     */
    String queryDictTextByKey(String code, String key);

    /**
     * 查询所有字典项
     * @return 所有字典项
     */
    Map<String, List<DictModel>> queryAllDictItems();

    /**
     * 查询所有部门字在     * @return 部门字典列表
     */
    List<DictModel> queryAllDepartBackDictModel();

    /**
     * 查询所有用户字在     * @return 用户字典列表
     */
    List<DictModel> queryAllUserBackDictModel();

    /**
     * 查询表字典项（支持过滤条件）
     * @param table 表名
     * @param text 文本字段
     * @param code 编码字段
     * @param filterSql 过滤SQL
     * @return 字典项列在     */
    List<DictModel> queryTableDictItemsByCodeAndFilter(String table, String text, String code, String filterSql);

    /**
     * 删除字典（物理删除）
     * @param id 字典ID
     */
    void deleteOneDictPhysically(String id);

    /**
     * 更新字典删除标志
     * @param delFlag 删除标志
     * @param id 字典ID
     */
    void updateDictDelFlag(int delFlag, String id);

    /**
     * 刷新字典缓存
     */
    void refreshCache();

    /**
     * 根据字典编码删除Redis缓存
     * @param dictCode 字典编码
     */
    void deleteByDictCode(String dictCode);

    /**
     * 查询删除列表
     * @return 已删除的字典列表
     */
    List<SysDict> queryDeleteList();

    /**
     * 还原逻辑删除的数在     * @param ids ID列表
     */
    void revertLogicDeleted(List<String> ids);

    /**
     * 彻底删除逻辑删除的数在     * @param ids ID列表
     */
    void removeLogicDeleted(List<String> ids);

    /**
     * 保存字典及其子项
     * @param sysDict 字典对象
     * @param sysDictItemList 字典项列在     */
    void saveDict(SysDict sysDict, List<SysDictItem> sysDictItemList);

    /**
     * 更新字典及其子项
     * @param sysDict 字典对象
     * @param sysDictItemList 字典项列在     */
    void updateDict(SysDict sysDict, List<SysDictItem> sysDictItemList);
}
