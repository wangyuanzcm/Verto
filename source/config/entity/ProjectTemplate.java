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
 * 项目模板实体类
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Data
@TableName("project_template")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@ApiModel(value="project_template对象", description="项目模板")
public class ProjectTemplate implements Serializable {
    private static final long serialVersionUID = 1L;

    /**主键*/
    @TableId(type = IdType.ASSIGN_ID)
    @ApiModelProperty(value = "主键")
    private String id;

    /**模板名称*/
    @Excel(name = "模板名称", width = 15)
    @ApiModelProperty(value = "模板名称")
    private String templateName;

    /**模板编码*/
    @Excel(name = "模板编码", width = 15)
    @ApiModelProperty(value = "模板编码")
    private String templateCode;

    /**模板类型*/
    @Excel(name = "模板类型", width = 15, dicCode = "template_type")
    @Dict(dicCode = "template_type")
    @ApiModelProperty(value = "模板类型")
    private String templateType;

    /**技术栈*/
    @Excel(name = "技术栈", width = 15)
    @ApiModelProperty(value = "技术栈")
    private String techStack;

    /**模板描述*/
    @Excel(name = "模板描述", width = 15)
    @ApiModelProperty(value = "模板描述")
    private String description;

    /**Git仓库地址*/
    @Excel(name = "Git仓库地址", width = 15)
    @ApiModelProperty(value = "Git仓库地址")
    private String gitUrl;

    /**Git分支*/
    @Excel(name = "Git分支", width = 15)
    @ApiModelProperty(value = "Git分支")
    private String gitBranch;

    /**模板配置*/
    @ApiModelProperty(value = "模板配置")
    private String configData;

    /**是否启用*/
    @Excel(name = "是否启用", width = 15, dicCode = "yn")
    @Dict(dicCode = "yn")
    @ApiModelProperty(value = "是否启用")
    private String enabled;

    /**排序*/
    @Excel(name = "排序", width = 15)
    @ApiModelProperty(value = "排序")
    private Integer sortOrder;

    /**版本号*/
    @Excel(name = "版本号", width = 15)
    @ApiModelProperty(value = "版本号")
    private String version;

    /**作者*/
    @Excel(name = "作者", width = 15)
    @ApiModelProperty(value = "作者")
    private String author;

    /**标签*/
    @Excel(name = "标签", width = 15)
    @ApiModelProperty(value = "标签")
    private String tags;

    /**使用次数*/
    @Excel(name = "使用次数", width = 15)
    @ApiModelProperty(value = "使用次数")
    private Integer usageCount;

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