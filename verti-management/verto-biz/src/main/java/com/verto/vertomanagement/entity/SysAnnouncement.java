package com.verto.vertomanagement.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.util.Date;

/**
 * 系统通告在 * 
 * @author verto
 * @since 2024-01-01
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("sys_announcement")
public class SysAnnouncement implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private String id;

    /**
     * 标题
     */
    private String titile;

    /**
     * 内容
     */
    private String msgContent;

    /**
     * 开始时在     */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private Date startTime;

    /**
     * 结束时间
     */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private Date endTime;

    /**
     * 发布在     */
    private String sender;

    /**
     * 优先级（L低，M中，H高）
     */
    private String priority;

    /**
     * 消息类型1:通知公告2:系统消息
     */
    private String msgCategory;

    /**
     * 通告对象类型（USER:指定用户，ALL:全体用户在     */
    private String msgType;

    /**
     * 发布状态（0未发布，1已发布，2已撤销在     */
    private String sendStatus;

    /**
     * 发布时间
     */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private Date sendTime;

    /**
     * 撤销时间
     */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private Date cancelTime;

    /**
     * 删除状态（0，正常，1已删除）
     */
    private String delFlag;

    /**
     * 业务类型(email:邮件 bpm:流程)
     */
    private String busType;

    /**
     * 业务id
     */
    private String busId;

    /**
     * 打开方式 组件：component 路由：url
     */
    private String openType;

    /**
     * 组件/路由 地址
     */
    private String openPage;

    /**
     * 指定用户
     */
    private String userIds;

    /**
     * 创建在     */
    private String createBy;

    /**
     * 创建时间
     */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createTime;

    /**
     * 更新在     */
    private String updateBy;

    /**
     * 更新时间
     */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updateTime;

    /**
     * 阅读状态（用于查询时标识是否已读）
     */
    private String readFlag;

    /**
     * 通知类型
     */
    private String noticeType;

    /**
     * 访问次数
     */
    private Integer visitsNumber;

    /**
     * 是否置顶在否，1是）
     */
    private String izTop;

    /**
     * 钉钉任务ID
     */
    private String dtTaskId;
}
