package org.jeecg.modules.appmanage.entity;

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
 * 应用管理实体类
 * @author jeecg-boot
 * @since 2024-01-25
 */
@Data
@TableName("app_manage")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
public class AppManage implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(type = IdType.ASSIGN_ID)
    private String id;

    /**
     * 应用名称
     */
    @Excel(name = "应用名称", width = 15)
    private String appName;

    /**
     * 应用描述
     */
    @Excel(name = "应用描述", width = 30)
    private String appDescription;

    /**
     * Git仓库地址
     */
    @Excel(name = "Git仓库地址", width = 50)
    private String gitUrl;

    /**
     * 域名
     */
    @Excel(name = "域名", width = 30)
    @Dict(dictTable = "sys_dict_item", dicText = "item_text", dicCode = "item_value", dictCondition = "dict_id = (SELECT id FROM sys_dict WHERE dict_code = 'app_domain')")
    private String domain;

    /**
     * 负责人
     */
    @Excel(name = "负责人", width = 20)
    private String managers;

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