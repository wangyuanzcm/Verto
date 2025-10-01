package com.verto.vertomanagement.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.verto.vertomanagement.entity.SysDictItem;

import java.util.List;

/**
 * 系统字典项服务接在 * 提供字典项数据的业务逻辑处理
 * 
 * @author Verto
 * @since 2024-01-01
 */
public interface ISysDictItemService extends IService<SysDictItem> {

    /**
     * 通过字典ID查询字典在     * @param mainId 字典ID
     * @return 字典项列在     */
    List<SysDictItem> selectItemsByMainId(String mainId);

    /**
     * 批量保存字典在     * @param dictId 字典ID
     * @param sysDictItemList 字典项列在     */
    void saveBatch(String dictId, List<SysDictItem> sysDictItemList);

    /**
     * 批量更新字典在     * @param dictId 字典ID
     * @param sysDictItemList 字典项列在     */
    void updateBatch(String dictId, List<SysDictItem> sysDictItemList);

    /**
     * 根据字典ID删除字典在     * @param dictId 字典ID
     */
    void deleteByDictId(String dictId);
}
