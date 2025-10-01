package com.verto.vertomanagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.verto.vertomanagement.entity.SysDictItem;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 系统字典项Mapper接口
 * 提供字典项数据的数据访问操作
 * 
 * @author Verto
 * @since 2024-01-01
 */
public interface SysDictItemMapper extends BaseMapper<SysDictItem> {

    /**
     * 通过字典id查询字典项
     * 按照排序号和项值升序排列
     * 
     * @param mainId 字典id
     * @return 字典项列表
     */
    @Select("SELECT * FROM sys_dict_item WHERE dict_id = #{mainId} ORDER BY sort_order ASC, item_value ASC")
    List<SysDictItem> selectItemsByMainId(String mainId);
}
