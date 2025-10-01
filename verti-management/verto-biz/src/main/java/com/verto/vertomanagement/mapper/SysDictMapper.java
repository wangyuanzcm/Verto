package com.verto.vertomanagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.verto.vertomanagement.entity.SysDict;
import com.verto.vertomanagement.vo.DictModel;
import com.verto.vertomanagement.vo.DictModelMany;
import com.verto.vertomanagement.vo.DictQuery;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;
import java.util.Map;

/**
 * 系统字典Mapper接口
 * 提供字典数据的数据访问操作
 * 
 * @author Verto
 * @since 2024-01-01
 */
public interface SysDictMapper extends BaseMapper<SysDict> {

    /**
     * 根据字典编码查询字典项
     * 
     * @param code 字典编码
     * @return 字典项列表
     */
    List<DictModel> queryDictItemsByCode(@Param("code") String code);

    /**
     * 根据字典编码查询启用的字典项
     * 
     * @param code 字典编码
     * @return 字典项列表
     */
    List<DictModel> queryEnableDictItemsByCode(@Param("code") String code);

    /**
     * 根据字典编码列表查询字典项
     * 
     * @param dictCodeList 字典编码列表
     * @return 字典项列表
     */
    List<DictModelMany> queryDictItemsByCodeList(@Param("dictCodeList") List<String> dictCodeList);

    /**
     * 根据字典编码和键值查询字典文本
     * 
     * @param code 字典编码
     * @param key 键值
     * @return 字典文本
     */
    String queryDictTextByKey(@Param("code") String code, @Param("key") String key);

    /**
     * 根据字典编码列表和键值列表查询字典项
     * 
     * @param dictCodeList 字典编码列表
     * @param keys 键值列表
     * @return 字典项列表
     */
    List<DictModelMany> queryManyDictByKeys(@Param("dictCodeList") List<String> dictCodeList, @Param("keys") List<String> keys);

    /**
     * 查询所有字典项
     * 
     * @return 字典项列表
     */
    List<DictModelMany> queryAllDictItems();

    /**
     * 查询所有部门字典模型
     * 
     * @return 部门字典模型列表
     */
    List<DictModel> queryAllDepartBackDictModel();

    /**
     * 查询所有用户字典模型
     * 
     * @return 用户字典模型列表
     */
    List<DictModel> queryAllUserBackDictModel();

    /**
     * 根据ID删除字典
     * 
     * @param id 字典ID
     */
    @Select("delete from sys_dict where id = #{id}")
    void deleteOneById(@Param("id") String id);

    /**
     * 查询已删除的字典列表
     * 
     * @return 已删除的字典列表
     */
    @Select("select * from sys_dict where del_flag = 1")
    List<SysDict> queryDeleteList();

    /**
     * 更新字典删除标识
     * 
     * @param delFlag 删除标识
     * @param id 字典ID
     */
    @Update("update sys_dict set del_flag = #{flag,jdbcType=INTEGER} where id = #{id,jdbcType=VARCHAR}")
    void updateDictDelFlag(@Param("flag") int delFlag, @Param("id") String id);

    /**
     * 分页查询字典表列表
     * 
     * @param page 分页对象
     * @param query 查询条件
     * @return 分页结果
     */
    Page<DictModel> queryDictTablePageList(Page page, @Param("query") DictQuery query);

    /**
     * 分页查询表字典数据（带过滤条件）
     * 
     * @param page 分页对象
     * @param table 表名
     * @param text 文本字段
     * @param code 编码字段
     * @param filterSql 过滤SQL
     * @return 分页结果
     */
    IPage<DictModel> queryPageTableDictWithFilter(Page<DictModel> page, @Param("table") String table, 
                                                   @Param("text") String text, @Param("code") String code, 
                                                   @Param("filterSql") String filterSql);

    /**
     * 查询表字典数据（带过滤条件）
     * 
     * @param table 表名
     * @param text 文本字段
     * @param code 编码字段
     * @param filterSql 过滤SQL
     * @return 字典项列表
     */
    List<DictModel> queryTableDictWithFilter(@Param("table") String table, @Param("text") String text, 
                                             @Param("code") String code, @Param("filterSql") String filterSql);

    /**
     * 根据键值和过滤条件查询表字典数据
     * 
     * @param table 表名
     * @param text 文本字段
     * @param code 编码字段
     * @param filterSql 过滤SQL
     * @param codeValues 编码值列表
     * @return 字典项列表
     */
    List<DictModel> queryTableDictByKeysAndFilterSql(@Param("table") String table, @Param("text") String text, 
                                                      @Param("code") String code, @Param("filterSql") String filterSql,  
                                                      @Param("codeValues") List<String> codeValues);

    /**
     * 恢复逻辑删除的记录
     * 
     * @param ids ID列表
     * @return 影响行数
     */
    int revertLogicDeleted(@Param("ids") List<String> ids);

    /**
     * 物理删除逻辑删除的记录
     * 
     * @param ids ID列表
     * @return 影响行数
     */
    int removeLogicDeleted(@Param("ids") List<String> ids);
}
