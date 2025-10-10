package com.verto.modules.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.Serializable;
import java.util.Date;

/**
 * 项目管理实体类
 * 
 * @author verto
 * @since 2024-01-27
 */
@Data
@TableName("project")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@Schema(description = "项目管理")
public class Project implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    @Schema(description = "主键ID")
    private String id;

    /**
     * 项目ID
     */
    @Schema(description = "项目ID")
    private String projectId;

    /**
     * 应用名称
     */
    @Schema(description = "应用名称")
    private String appName;

    /**
     * 应用代码
     */
    @Schema(description = "应用代码")
    private String appCode;

    /**
     * 应用类型
     */
    @Schema(description = "应用类型")
    private String appType;

    /**
     * Git仓库地址
     */
    @Schema(description = "Git仓库地址")
    private String gitUrl;

    /**
     * 开发人员
     */
    @Schema(description = "开发人员")
    private String developer;

    /**
     * 测试人员
     */
    @Schema(description = "测试人员")
    private String tester;

    /**
     * 状态：1-进行中，2-已完成，3-已暂停，0-已取消
     */
    @Schema(description = "状态：1-进行中，2-已完成，3-已暂停，0-已取消")
    private Integer status;

    /**
     * 项目描述
     */
    @Schema(description = "项目描述")
    private String description;

    /**
     * 创建人
     */
    @Schema(description = "创建人")
    private String createBy;

    /**
     * 创建时间
     */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "创建时间")
    private Date createTime;

    /**
     * 更新人
     */
    @Schema(description = "更新人")
    private String updateBy;

    /**
     * 更新时间
     */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "更新时间")
    private Date updateTime;

    // 手动添加必要的 getter 方法，确保编译通过
    public String getProjectId() {
        return projectId;
    }

    public String getAppName() {
        return appName;
    }

    public String getAppCode() {
        return appCode;
    }

    public String getAppType() {
        return appType;
    }

    public String getDeveloper() {
        return developer;
    }

    public String getTester() {
        return tester;
    }

    public Integer getStatus() {
        return status;
    }

    public String getDescription() {
        return description;
    }

    public String getGitUrl() {
        return gitUrl;
    }

    // 手动添加必要的 setter 方法，确保编译通过
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public void setCreateBy(String createBy) {
        this.createBy = createBy;
    }

    public void setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
    }

    public void setUpdateBy(String updateBy) {
        this.updateBy = updateBy;
    }
}