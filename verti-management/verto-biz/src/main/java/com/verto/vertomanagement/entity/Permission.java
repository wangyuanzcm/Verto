package com.verto.vertomanagement.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 权限信息实体类
 * 
 * @author Verto
 * @since 2024-01-01
 */
@Data
@TableName("sys_permission")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@Schema(description = "权限信息")
public class Permission implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.ASSIGN_ID)
    @Schema(description = "权限ID")
    private String id;

    @Schema(description = "父级权限ID")
    private String parentId;

    @Schema(description = "权限名称")
    private String name;

    @Schema(description = "权限编码")
    private String permissionCode;

    @Schema(description = "权限类型(1:菜单 2:按钮)")
    private Integer type;

    @Schema(description = "菜单路径")
    private String path;

    @Schema(description = "组件路径")
    private String component;

    @Schema(description = "菜单图标")
    private String icon;

    @Schema(description = "排序")
    private Integer sortOrder;

    @Schema(description = "是否隐藏(0:显示 1:隐藏)")
    private Integer hidden;

    @Schema(description = "状态(1:正常 0:禁用)")
    private Integer status;

    @Schema(description = "删除状态(0:正常 1:已删除)")
    @TableLogic
    private Integer deleted;

    @Schema(description = "描述")
    private String description;

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

    @Schema(description = "子权限列表（非数据库字段）")
    @TableField(exist = false)
    private List<Permission> children;
}
