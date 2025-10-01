package com.verto.vertomanagement.entity;

import java.io.Serializable;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import lombok.Data;

/**
 * 用户部门关系实体类
 * 用于管理用户与部门的多对多关系
 * 
 * @author Verto
 * @since 2024-01-01
 */
@Data
@TableName("sys_user_depart")
public class SysUserDepart implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private String id;

    /**
     * 用户ID
     */
    private String userId;

    /**
     * 部门ID
     */
    private String depId;

    /**
     * 构造函数
     * 
     * @param id 主键ID
     * @param userId 用户ID
     * @param depId 部门ID
     */
    public SysUserDepart(String id, String userId, String depId) {
        super();
        this.id = id;
        this.userId = userId;
        this.depId = depId;
    }

    /**
     * 构造函数
     * 
     * @param userId 用户ID
     * @param departId 部门ID
     */
    public SysUserDepart(String userId, String departId) {
        this.userId = userId;
        this.depId = departId;
    }

    /**
     * 默认构造函数
     */
    public SysUserDepart() {
        super();
    }
}
