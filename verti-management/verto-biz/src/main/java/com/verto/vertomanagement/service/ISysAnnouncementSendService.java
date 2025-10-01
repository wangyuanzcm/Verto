package com.verto.vertomanagement.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.verto.vertomanagement.entity.SysAnnouncementSend;

/**
 * 用户通告阅读标记在服务在 * 
 * @author verto
 * @since 2024-01-01
 */
public interface ISysAnnouncementSendService extends IService<SysAnnouncementSend> {

    /**
     * 根据用户ID和通知类型获取最后一条通告时间
     * 
     * @param page 分页对象
     * @param userId 用户ID
     * @param noticeType 通知类型
     * @return 分页数据
     */
    IPage<SysAnnouncementSend> getLastAnnountTime(Page<SysAnnouncementSend> page, String userId, String noticeType);

    /**
     * 清除用户所有未读消在     * 
     * @param userId 用户ID
     */
    void clearAllUnReadMessage(String userId);

    /**
     * 根据通告ID和用户ID查询发送记在     * 
     * @param anntId 通告ID
     * @param userId 用户ID
     * @return 发送记在     */
    SysAnnouncementSend findByAnntIdAndUserId(String anntId, String userId);

    /**
     * 标记消息为已在     * 
     * @param anntId 通告ID
     * @param userId 用户ID
     */
    void markAsRead(String anntId, String userId);

    /**
     * 设置/取消标星
     * 
     * @param anntId 通告ID
     * @param userId 用户ID
     * @param starFlag 标星标识
     */
    void updateStarFlag(String anntId, String userId, String starFlag);

    /**
     * 创建用户通告发送记在     * 
     * @param anntId 通告ID
     * @param userId 用户ID
     * @param announcement 通告对象
     */
    void createAnnouncementSend(String anntId, String userId, com.verto.vertomanagement.entity.SysAnnouncement announcement);
}
