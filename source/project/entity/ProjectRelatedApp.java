package org.jeecg.modules.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;
import org.jeecgframework.poi.excel.annotation.Excel;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.Serializable;
import java.util.Date;

/**
 * 项目关联应用实体类
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Data
@TableName("project_related_app")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@ApiModel(value="project_related_app对象", description="项目关联应用")
public class ProjectRelatedApp implements Serializable {
    private static final long serialVersionUID = 1L;

    /**主键*/
    @TableId(type = IdType.ASSIGN_ID)
    @ApiModelProperty(value = "主键")
    private String id;

    /**项目ID*/
    @Excel(name = "项目ID", width = 20)
    @ApiModelProperty(value = "项目ID")
    private String projectId;

    /**应用名称*/
    @Excel(name = "应用名称", width = 20)
    @ApiModelProperty(value = "应用名称")
    private String appName;

    /**应用编码*/
    @Excel(name = "应用编码", width = 20)
    @ApiModelProperty(value = "应用编码")
    private String appCode;

    /**应用类型(FRONTEND/BACKEND/MOBILE/DESKTOP)*/
    @Excel(name = "应用类型", width = 15, dicCode = "app_type")
    @ApiModelProperty(value = "应用类型")
    private String appType;

    /**Git仓库地址*/
    @Excel(name = "Git仓库地址", width = 30)
    @ApiModelProperty(value = "Git仓库地址")
    private String gitUrl;

    /**开发人员*/
    @Excel(name = "开发人员", width = 15)
    @ApiModelProperty(value = "开发人员")
    private String developer;

    /**开发人员姓名*/
    @ApiModelProperty(value = "开发人员姓名")
    private String developerText;

    /**测试人员*/
    @Excel(name = "测试人员", width = 15)
    @ApiModelProperty(value = "测试人员")
    private String tester;

    /**测试人员姓名*/
    @ApiModelProperty(value = "测试人员姓名")
    private String testerText;

    /**状态(DEVELOPING/TESTING/DEPLOYED/PAUSED)*/
    @Excel(name = "状态", width = 15, dicCode = "app_status")
    @ApiModelProperty(value = "状态")
    private String status;

    /**流水线地址*/
    @ApiModelProperty(value = "流水线地址")
    private String pipelineUrl;

    /**描述*/
    @Excel(name = "描述", width = 30)
    @ApiModelProperty(value = "描述")
    private String description;

    /**创建日期*/
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @ApiModelProperty(value = "创建日期")
    private Date createTime;

    /**更新日期*/
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @ApiModelProperty(value = "更新日期")
    private Date updateTime;
}