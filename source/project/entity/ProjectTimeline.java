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
 * 项目时间线实体类
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Data
@TableName("project_timeline")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@ApiModel(value="project_timeline对象", description="项目时间线")
public class ProjectTimeline implements Serializable {
    private static final long serialVersionUID = 1L;

    /**主键*/
    @TableId(type = IdType.ASSIGN_ID)
    @ApiModelProperty(value = "主键")
    private String id;

    /**项目ID*/
    @Excel(name = "项目ID", width = 20)
    @ApiModelProperty(value = "项目ID")
    private String projectId;

    /**里程碑名称*/
    @Excel(name = "里程碑名称", width = 20)
    @ApiModelProperty(value = "里程碑名称")
    private String milestoneName;

    /**描述*/
    @Excel(name = "描述", width = 30)
    @ApiModelProperty(value = "描述")
    private String description;

    /**计划日期*/
    @Excel(name = "计划日期", width = 15, format = "yyyy-MM-dd")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @ApiModelProperty(value = "计划日期")
    private Date plannedDate;

    /**实际日期*/
    @Excel(name = "实际日期", width = 15, format = "yyyy-MM-dd")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @ApiModelProperty(value = "实际日期")
    private Date actualDate;

    /**状态(PENDING/IN_PROGRESS/COMPLETED/DELAYED)*/
    @Excel(name = "状态", width = 15, dicCode = "milestone_status")
    @ApiModelProperty(value = "状态")
    private String status;

    /**负责人*/
    @Excel(name = "负责人", width = 15)
    @ApiModelProperty(value = "负责人")
    private String assignee;

    /**负责人姓名*/
    @ApiModelProperty(value = "负责人姓名")
    private String assigneeText;

    /**优先级(LOW/MEDIUM/HIGH/URGENT)*/
    @Excel(name = "优先级", width = 10, dicCode = "priority")
    @ApiModelProperty(value = "优先级")
    private String priority;

    /**进度百分比*/
    @Excel(name = "进度", width = 10)
    @ApiModelProperty(value = "进度百分比")
    private Integer progress;

    /**备注*/
    @Excel(name = "备注", width = 30)
    @ApiModelProperty(value = "备注")
    private String remark;

    /**创建人*/
    @ApiModelProperty(value = "创建人")
    private String createBy;

    /**创建日期*/
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @ApiModelProperty(value = "创建日期")
    private Date createTime;

    /**更新人*/
    @ApiModelProperty(value = "更新人")
    private String updateBy;

    /**更新日期*/
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @ApiModelProperty(value = "更新日期")
    private Date updateTime;
}