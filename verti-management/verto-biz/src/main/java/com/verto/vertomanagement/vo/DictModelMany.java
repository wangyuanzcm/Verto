package com.verto.vertomanagement.vo;

import lombok.Data;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 * 多字典模型VO在 * 用于处理多个字典的数据查询结在 * 
 * @author Verto
 * @since 2024-01-01
 */
@Data
@Accessors(chain = true)
public class DictModelMany implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 字典编码
     * 标识字典类型
     */
    private String dictCode;

    /**
     * 字典在     * 实际存储和传输的在     */
    private String value;

    /**
     * 字典文本
     * 显示给用户看的文本内在     */
    private String text;

    /**
     * 字典项颜在     * 用于前端显示时的颜色标识
     */
    private String color;

    /**
     * 默认构造函在     */
    public DictModelMany() {
    }

    /**
     * 构造函在     * @param dictCode 字典编码
     * @param value 字典在     * @param text 字典文本
     */
    public DictModelMany(String dictCode, String value, String text) {
        this.dictCode = dictCode;
        this.value = value;
        this.text = text;
    }

    /**
     * 构造函在     * @param dictCode 字典编码
     * @param value 字典在     * @param text 字典文本
     * @param color 字典颜色
     */
    public DictModelMany(String dictCode, String value, String text, String color) {
        this.dictCode = dictCode;
        this.value = value;
        this.text = text;
        this.color = color;
    }
}
