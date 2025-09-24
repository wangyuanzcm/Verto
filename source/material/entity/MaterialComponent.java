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
 * 物料组件实体类
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Data
@TableName("material_component")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
public class MaterialComponent implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(type = IdType.ASSIGN_ID)
    private String id;

    /**
     * 组件名称
     */
    @Excel(name = "组件名称", width = 20)
    private String name;

    /**
     * 组件类型
     */
    @Excel(name = "组件类型", width = 15, dicCode = "component_type")
    @Dict(dicCode = "component_type")
    private String type;

    /**
     * 版本号
     */
    @Excel(name = "版本号", width = 15)
    private String version;

    /**
     * 组件代码
     */
    @Excel(name = "组件代码", width = 30)
    private String code;

    /**
     * 组件描述
     */
    @Excel(name = "组件描述", width = 40)
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