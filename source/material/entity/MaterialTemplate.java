package org.jeecg.modules.material.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;
import org.jeecg.common.aspect.annotation.Dict;
import org.jeecgframework.poi.excel.annotation.Excel;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.Serializable;
import java.util.Date;

/**
 * 物料模板实体类
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Data
@TableName("material_template")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
public class MaterialTemplate implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(type = IdType.ASSIGN_ID)
    private String id;

    /**
     * 模板名称
     */
    @Excel(name = "模板名称", width = 20)
    private String name;

    /**
     * 模板类型
     */
    @Excel(name = "模板类型", width = 15, dicCode = "template_type")
    @Dict(dicCode = "template_type")
    private String type;

    /**
     * 版本号
     */
    @Excel(name = "版本号", width = 15)
    private String version;

    /**
     * 模板代码
     */
    @Excel(name = "模板代码", width = 30)
    private String code;

    /**
     * 模板描述
     */
    @Excel(name = "模板描述", width = 40)
    private String description;

    /**
     * 状态 (0-停用 1-启用)
     */
    @Excel(name = "状态", width = 10, dicCode = "valid_status")
    @Dict(dicCode = "valid_status")
    private Integer status;

    /**
     * 创建人
     */
    private String createBy;

    /**
     * 创建日期
     */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createTime;

    /**
     * 更新人
     */
    private String updateBy;

    /**
     * 更新日期
     */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updateTime;
}