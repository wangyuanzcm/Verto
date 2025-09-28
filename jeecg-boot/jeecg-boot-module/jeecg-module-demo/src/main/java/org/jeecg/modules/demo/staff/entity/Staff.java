package org.jeecg.modules.demo.staff.entity;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.jeecg.common.system.base.entity.JeecgEntity;
import org.jeecgframework.poi.excel.annotation.Excel;
import org.springframework.format.annotation.DateTimeFormat;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * @Description: 人员管理实体类
 * @Author: jeecg-boot
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@Schema(description = "人员管理")
@TableName("staff")
public class Staff extends JeecgEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 姓名
     */
    @Excel(name = "姓名", width = 25)
    @Schema(description = "姓名")
    private String name;

    /**
     * 工号
     */
    @Excel(name = "工号", width = 20)
    @Schema(description = "工号")
    private String employeeNo;

    /**
     * 邮箱
     */
    @Excel(name = "邮箱", width = 30)
    @Schema(description = "邮箱")
    private String email;

    /**
     * 手机号
     */
    @Excel(name = "手机号", width = 20)
    @Schema(description = "手机号")
    private String phone;

    /**
     * 入职日期
     */
    @Excel(name = "入职日期", width = 20, format = "yyyy-MM-dd")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "入职日期")
    private Date hireDate;

    /**
     * 工作地点
     */
    @Excel(name = "工作地点", width = 30)
    @Schema(description = "工作地点")
    private String workLocation;

    /**
     * 技能列表（JSON格式存储）
     */
    @Schema(description = "技能列表")
    private String skillsJson;

    /**
     * 技能列表（用于前端展示，不存储到数据库）
     */
    @Schema(description = "技能列表")
    private List<String> skills;

    /**
     * 状态：0-离职，1-在职，2-休假
     */
    @Excel(name = "状态", width = 15, dicCode = "staff_status")
    @Schema(description = "状态：0-离职，1-在职，2-休假")
    private Integer status;

    /**
     * 备注
     */
    @Excel(name = "备注", width = 50)
    @Schema(description = "备注")
    private String remark;
}