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
 * 项目管理实体类
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Data
@TableName("project")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@ApiModel(value="project对象", description="项目管理")
public class Project implements Serializable {
    private static final long serialVersionUID = 1L;

    /**主键*/
    @TableId(type = IdType.ASSIGN_ID)
    @ApiModelProperty(value = "主键")
    private String id;

    /**项目名称*/
    @Excel(name = "项目名称", width = 20)
    @ApiModelProperty(value = "项目名称")
    private String projectName;

    /**项目编码*/
    @Excel(name = "项目编码", width = 20)
    @ApiModelProperty(value = "项目编码")
    private String projectCode;

    /**项目描述*/
    @Excel(name = "项目描述", width = 30)
    @ApiModelProperty(value = "项目描述")
    private String projectDescription;

    /**项目类型(WEB/MOBILE/API/DESKTOP)*/
    @Excel(name = "项目类型", width = 15, dicCode = "project_type")
    @ApiModelProperty(value = "项目类型")
    private String projectType;

    /**状态(PLANNING/DEVELOPING/TESTING/DEPLOYED/PAUSED)*/
    @Excel(name = "状态", width = 15, dicCode = "project_status")
    @ApiModelProperty(value = "状态")
    private String status;

    /**优先级(LOW/MEDIUM/HIGH/URGENT)*/
    @Excel(name = "优先级", width = 10, dicCode = "project_priority")
    @ApiModelProperty(value = "优先级")
    private String priority;

    /**任务类型(REQUIREMENT/BUG)*/
    @Excel(name = "任务类型", width = 15, dicCode = "task_type")
    @ApiModelProperty(value = "任务类型")
    private String taskType;

    /**需求ID*/
    @Excel(name = "需求ID", width = 15)
    @ApiModelProperty(value = "需求ID")
    private String requirementId;

    /**Bug ID*/
    @Excel(name = "Bug ID", width = 15)
    @ApiModelProperty(value = "Bug ID")
    private String bugId;

    /**禅道链接*/
    @ApiModelProperty(value = "禅道链接")
    private String zentaoUrl;

    /**UI设计链接*/
    @ApiModelProperty(value = "UI设计链接")
    private String uiDesignUrl;

    /**原型链接*/
    @ApiModelProperty(value = "原型链接")
    private String prototypeUrl;

    /**设计文档链接*/
    @ApiModelProperty(value = "设计文档链接")
    private String designDocUrl;

    /**分支创建模式(AUTO/MANUAL)*/
    @Excel(name = "分支创建模式", width = 15, dicCode = "branch_create_mode")
    @ApiModelProperty(value = "分支创建模式")
    private String branchCreateMode;

    /**开发模式(L1/L2/L3)*/
    @Excel(name = "开发模式", width = 10, dicCode = "development_mode")
    @ApiModelProperty(value = "开发模式")
    private String developmentMode;

    /**模板ID*/
    @ApiModelProperty(value = "模板ID")
    private String templateId;

    /**配置数据*/
    @ApiModelProperty(value = "配置数据")
    private String configData;

    /**开始日期*/
    @Excel(name = "开始日期", width = 15, format = "yyyy-MM-dd")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @ApiModelProperty(value = "开始日期")
    private Date startDate;

    /**测试日期*/
    @Excel(name = "测试日期", width = 15, format = "yyyy-MM-dd")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @ApiModelProperty(value = "测试日期")
    private Date testDate;

    /**上线日期*/
    @Excel(name = "上线日期", width = 15, format = "yyyy-MM-dd")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @ApiModelProperty(value = "上线日期")
    private Date onlineDate;

    /**发布日期*/
    @Excel(name = "发布日期", width = 15, format = "yyyy-MM-dd")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @ApiModelProperty(value = "发布日期")
    private Date releaseDate;

    /**结束日期*/
    @Excel(name = "结束日期", width = 15, format = "yyyy-MM-dd")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @ApiModelProperty(value = "结束日期")
    private Date endDate;

    /**项目经理*/
    @Excel(name = "项目经理", width = 15)
    @ApiModelProperty(value = "项目经理")
    private String projectManager;

    /**项目经理姓名*/
    @ApiModelProperty(value = "项目经理姓名")
    private String projectManagerText;

    /**团队成员*/
    @ApiModelProperty(value = "团队成员")
    private String teamMembers;

    /**团队成员姓名*/
    @ApiModelProperty(value = "团队成员姓名")
    private String teamMembersText;

    /**Git仓库地址*/
    @Excel(name = "Git仓库地址", width = 30)
    @ApiModelProperty(value = "Git仓库地址")
    private String gitUrl;

    /**Git分支*/
    @Excel(name = "Git分支", width = 15)
    @ApiModelProperty(value = "Git分支")
    private String gitBranch;

    /**版本号*/
    @Excel(name = "版本号", width = 15)
    @ApiModelProperty(value = "版本号")
    private String version;

    /**进度百分比*/
    @Excel(name = "进度", width = 10)
    @ApiModelProperty(value = "进度百分比")
    private Integer progress;

    /**预估工时*/
    @Excel(name = "预估工时", width = 15)
    @ApiModelProperty(value = "预估工时")
    private Integer estimatedHours;

    /**实际工时*/
    @Excel(name = "实际工时", width = 15)
    @ApiModelProperty(value = "实际工时")
    private Integer actualHours;

    /**技术栈*/
    @ApiModelProperty(value = "技术栈")
    private String techStack;

    /**技术栈文本*/
    @ApiModelProperty(value = "技术栈文本")
    private String techStackText;

    /**环境配置*/
    @ApiModelProperty(value = "环境配置")
    private String environment;

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