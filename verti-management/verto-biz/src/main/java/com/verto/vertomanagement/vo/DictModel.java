package com.verto.vertomanagement.vo;

import lombok.Data;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 * 字典模型VO在 * 用于前端展示字典数据的标准格在 * 
 * @author Verto
 * @since 2024-01-01
 */
@Data
@Accessors(chain = true)
public class DictModel implements Serializable {

    private static final long serialVersionUID = 1L;

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
    public DictModel() {
    }

    /**
     * 构造函在     * @param value 字典在     * @param text 字典文本
     */
    public DictModel(String value, String text) {
        this.value = value;
        this.text = text;
    }

    /**
     * 构造函在     * @param value 字典在     * @param text 字典文本
     * @param color 字典颜色
     */
    public DictModel(String value, String text, String color) {
        this.value = value;
        this.text = text;
        this.color = color;
    }
}
