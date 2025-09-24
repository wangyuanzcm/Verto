package org.jeecg.modules.config.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;
import org.jeecg.common.aspect.annotation.Dict;
import org.jeecgframework.poi.excel.annotation.Excel;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.Serializable;
import java.util.Date;

/**
 * 项目配置实体类
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Data
@TableName("project_config")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@ApiModel(value="project_config对象", description="项目配置")
public class ProjectConfig implements Serializable {
    private static final long serialVersionUID = 1L;

    /**主键*/
    @TableId(type = IdType.ASSIGN_ID)
    @ApiModelProperty(value = "主键")
    private String id;

    /**项目ID*/
    @Excel(name = "项目ID", width = 15)
    @ApiModelProperty(value = "项目ID")
    private String projectId;

    /**配置类型*/
    @Excel(name = "配置类型", width = 15, dicCode = "config_type")
    @Dict(dicCode = "config_type")
    @ApiModelProperty(value = "配置类型")
    private String configType;

    /**配置键*/
    @Excel(name = "配置键", width = 15)
    @ApiModelProperty(value = "配置键")
    private String configKey;

    /**配置值*/
    @Excel(name = "配置值", width = 15)
    @ApiModelProperty(value = "配置值")
    private String configValue;

    /**配置描述*/
    @Excel(name = "配置描述", width = 15)
    @ApiModelProperty(value = "配置描述")
    private String description;

    /**是否启用*/
    @Excel(name = "是否启用", width = 15, dicCode = "yn")
    @Dict(dicCode = "yn")
    @ApiModelProperty(value = "是否启用")
    private String enabled;

    /**排序*/
    @Excel(name = "排序", width = 15)
    @ApiModelProperty(value = "排序")
    private Integer sortOrder;

    /**环境*/
    @Excel(name = "环境", width = 15, dicCode = "environment")
    @Dict(dicCode = "environment")
    @ApiModelProperty(value = "环境")
    private String environment;

    /**创建人*/
    @ApiModelProperty(value = "创建人")
    private String createBy;

    /**创建日期*/
    @JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")
    @ApiModelProperty(value = "创建日期")
    private Date createTime;

    /**更新人*/
    @ApiModelProperty(value = "更新人")
    private String updateBy;

    /**更新日期*/
    @JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")
    @ApiModelProperty(value = "更新日期")
    private Date updateTime;
}