package com.verto.vertomanagement.vo;

import lombok.Data;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 * 字典查询VO在 * 用于字典数据的查询条件封在 * 
 * @author Verto
 * @since 2024-01-01
 */
@Data
@Accessors(chain = true)
public class DictQuery implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 表名
     */
    private String table;

    /**
     * 文本字段在     */
    private String text;

    /**
     * 编码字段在     */
    private String code;

    /**
     * 查询关键在     */
    private String keyword;

    /**
     * 编码在     */
    private String codeValue;

    /**
     * 过滤SQL条件
     */
    private String filterSql;

    /**
     * 默认构造函在     */
    public DictQuery() {
    }

    /**
     * 构造函在     * @param table 表名
     * @param text 文本字段在     * @param code 编码字段在     */
    public DictQuery(String table, String text, String code) {
        this.table = table;
        this.text = text;
        this.code = code;
    }

    /**
     * 构造函在     * @param table 表名
     * @param text 文本字段在     * @param code 编码字段在     * @param keyword 查询关键在     */
    public DictQuery(String table, String text, String code, String keyword) {
        this.table = table;
        this.text = text;
        this.code = code;
        this.keyword = keyword;
    }
}
