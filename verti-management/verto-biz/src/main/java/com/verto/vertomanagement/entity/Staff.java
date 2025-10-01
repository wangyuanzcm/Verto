package com.verto.vertomanagement.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 人员信息实体类
 * 
 * @author Verto
 * @since 2024-01-01
 */
@Data
@TableName("staff")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@Schema(description = "人员信息")
public class Staff implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.ASSIGN_ID)
    @Schema(description = "人员ID")
    private String id;

    @Schema(description = "姓名")
    private String name;

    @Schema(description = "工号")
    private String employeeNo;

    @Schema(description = "邮箱")
    private String email;

    @Schema(description = "手机号")
    private String phone;

    @Schema(description = "入职日期")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd")
    private LocalDate hireDate;

    @Schema(description = "工作地点")
    private String workLocation;

    @Schema(description = "技能JSON")
    private String skillsJson;

    @Schema(description = "技能")
    @TableField(exist = false)
    private String skills;

    @Schema(description = "状态(1:在职 0:离职)")
    private Integer status;

    @Schema(description = "备注")
    private String remark;

    @Schema(description = "部门")
    private String department;

    @Schema(description = "职位")
    private String position;

    @Schema(description = "直属领导")
    private String supervisor;

    @Schema(description = "薪资等级")
    private String salaryLevel;

    @Schema(description = "删除状态(0:正常 1:已删除)")
    @TableLogic
    private Integer deleted;

    @Schema(description = "创建者")
    @TableField(fill = FieldFill.INSERT)
    private String createBy;

    @Schema(description = "创建时间")
    @TableField(fill = FieldFill.INSERT)
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;

    @Schema(description = "更新者")
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private String updateBy;

    @Schema(description = "更新时间")
    @TableField(fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;
}
