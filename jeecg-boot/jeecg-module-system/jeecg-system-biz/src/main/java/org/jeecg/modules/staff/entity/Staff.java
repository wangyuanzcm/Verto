package org.jeecg.modules.staff.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;
import org.jeecgframework.poi.excel.annotation.Excel;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * 人员管理实体类
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Data
@TableName("staff")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@Schema(description = "人员管理")
public class Staff implements Serializable {
    private static final long serialVersionUID = 1L;

    /**主键*/
    @TableId(type = IdType.ASSIGN_ID)
    @Schema(description = "主键")
    private String id;

    /**姓名*/
    @Excel(name = "姓名", width = 15)
    @Schema(description = "姓名")
    private String name;

    /**员工编号*/
    @Excel(name = "员工编号", width = 15)
    @Schema(description = "员工编号")
    private String employeeNo;

    /**邮箱*/
    @Excel(name = "邮箱", width = 20)
    @Schema(description = "邮箱")
    private String email;

    /**手机号*/
    @Excel(name = "手机号", width = 15)
    @Schema(description = "手机号")
    private String phone;

    /**入职日期*/
    @Excel(name = "入职日期", width = 15, format = "yyyy-MM-dd")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "入职日期")
    private Date hireDate;

    /**工作地点*/
    @Excel(name = "工作地点", width = 20)
    @Schema(description = "工作地点")
    private String workLocation;

    /**技能列表*/
    @Schema(description = "技能列表")
    private String skills;

    /**状态(0:离职 1:在职 2:休假)*/
    @Excel(name = "状态", width = 10, dicCode = "staff_status")
    @Schema(description = "状态(0:离职 1:在职 2:休假)")
    private Integer status;

    /**备注*/
    @Excel(name = "备注", width = 30)
    @Schema(description = "备注")
    private String remark;

    /**创建人*/
    @Schema(description = "创建人")
    private String createBy;

    /**创建日期*/
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "创建日期")
    private Date createTime;

    /**更新人*/
    @Schema(description = "更新人")
    private String updateBy;

    /**更新日期*/
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "更新日期")
    private Date updateTime;
}