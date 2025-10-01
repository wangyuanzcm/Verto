package com.verto.vertomanagement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.verto.vertomanagement.entity.SysDictItem;
import com.verto.vertomanagement.mapper.SysDictItemMapper;
import com.verto.vertomanagement.service.ISysDictItemService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

/**
 * 系统字典项服务实现类
 * 实现字典项数据的业务逻辑处理
 * 
 * @author Verto
 * @since 2024-01-01
 */
@Service
@Slf4j
public class SysDictItemServiceImpl extends ServiceImpl<SysDictItemMapper, SysDictItem> implements ISysDictItemService {

    @Autowired
    private SysDictItemMapper sysDictItemMapper;

    /**
     * 通过字典ID查询字典在
     * 
     * @param mainId 字典ID
     * @return 字典项列在
     */
    @Override
    public List<SysDictItem> selectItemsByMainId(String mainId) {
        log.debug("查询字典项，字典ID：{}", mainId);
        return sysDictItemMapper.selectItemsByMainId(mainId);
    }

    /**
     * 批量保存字典在 * @param dictId 字典ID
     * 
     * @param sysDictItemList 字典项列在
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveBatch(String dictId, List<SysDictItem> sysDictItemList) {
        log.info("批量保存字典项，字典ID：{}，数量：{}", dictId, sysDictItemList.size());
        for (SysDictItem item : sysDictItemList) {
            item.setDictId(dictId);
            if (item.getCreateTime() == null) {
                item.setCreateTime(new Date());
            }
            if (item.getUpdateTime() == null) {
                item.setUpdateTime(new Date());
            }
            this.save(item);
        }
    }

    /**
     * 批量更新字典在 * @param dictId 字典ID
     * 
     * @param sysDictItemList 字典项列在
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateBatch(String dictId, List<SysDictItem> sysDictItemList) {
        log.info("批量更新字典项，字典ID：{}，数量：{}", dictId, sysDictItemList.size());
        // 先删除原有的字典在 this.deleteByDictId(dictId);
        // 再保存新的字典项
        this.saveBatch(dictId, sysDictItemList);
    }

    /**
     * 根据字典ID删除字典在 * @param dictId 字典ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteByDictId(String dictId) {
        log.info("删除字典项，字典ID：{}", dictId);
        LambdaQueryWrapper<SysDictItem> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(SysDictItem::getDictId, dictId);
        this.remove(queryWrapper);
    }
}
