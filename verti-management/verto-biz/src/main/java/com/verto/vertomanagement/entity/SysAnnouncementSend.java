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
 * 用户通告阅读标记表
 * 
 * @author verto
 * @since 2024-01-01
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("sys_announcement_send")
public class SysAnnouncementSend implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private String id;

    /**
     * 通告ID
     */
    private String anntId;

    /**
     * 用户ID
     */
    private String userId;

    /**
     * 标题
     */
    private String titile;

    /**
     * 消息内容
     */
    private String msgContent;

    /**
     * 发送者
     */
    private String sender;

    /**
     * 优先级
     */
    private String priority;

    /**
     * 阅读状态
     */
    private String readFlag;

    /**
     * 阅读时间
     */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private Date readTime;

    /**
     * 发送时间
     */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private Date sendTime;

    /**
     * 消息类别
     */
    private String msgCategory;

    /**
     * 业务类型
     */
    private String busType;

    /**
     * 业务ID
     */
    private String busId;

    /**
     * 打开方式
     */
    private String openType;

    /**
     * 打开页面
     */
    private String openPage;

    /**
     * 通知类型
     */
    private String noticeType;

    /**
     * 收藏标记
     */
    private String starFlag;

    /**
     * 创建者
     */
    private String createBy;

    /**
     * 创建时间
     */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createTime;

    /**
     * 更新者
     */
    private String updateBy;

    /**
     * 更新时间
     */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updateTime;
}
