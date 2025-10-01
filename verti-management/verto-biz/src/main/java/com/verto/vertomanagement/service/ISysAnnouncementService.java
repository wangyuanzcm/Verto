package com.verto.vertomanagement.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.verto.vertomanagement.entity.SysAnnouncement;

import java.util.Date;
import java.util.List;

/**
 * 系统通告在服务在 * 
 * @author verto
 * @since 2024-01-01
 */
public interface ISysAnnouncementService extends IService<SysAnnouncement> {

    /**
     * 根据用户ID查询系统通告分页数据
     * 
     * @param page 分页对象
     * @param userId 用户ID
     * @param msgCategory 消息类型
     * @param noticeType 通知类型
     * @param lastMonthStartDay 查询起始时间
     * @return 分页数据
     */
    Page<SysAnnouncement> querySysCementPageByUserId(Page<SysAnnouncement> page, 
                                                     String userId,
                                                     String msgCategory,
                                                     String noticeType,
                                                     Date lastMonthStartDay);

    /**
     * 获取用户未读消息数量
     * 
     * @param userId 用户ID
     * @param lastMonthStartDay 查询起始时间
     * @param noticeType 通知类型
     * @return 未读消息数量
     */
    Integer getUnreadMessageCountByUserId(String userId, Date lastMonthStartDay, String noticeType);

    /**
     * 查询系统消息列表
     * 
     * @param pageSize 页面大小
     * @param pageNo 页码
     * @param fromUser 发送人
     * @param starFlag 标星标识
     * @param busType 业务类型
     * @param msgCategory 消息类型
     * @param beginTime 开始时在     * @param endTime 结束时间
     * @param noticeType 通知类型
     * @return 消息列表
     */
    List<SysAnnouncement> querySysMessageList(Integer pageSize, Integer pageNo, String fromUser,
                                             String starFlag, String busType, String msgCategory,
                                             Date beginTime, Date endTime, String noticeType);

    /**
     * 批量更新消息为已读状在     * 
     * @param annoceIdList 通告ID列表
     */
    void updateReaded(List<String> annoceIdList);

    /**
     * 发布通告
     * 
     * @param sysAnnouncement 通告对象
     * @return 是否成功
     */
    boolean releaseAnnouncement(SysAnnouncement sysAnnouncement);

    /**
     * 撤销通告
     * 
     * @param id 通告ID
     * @return 是否成功
     */
    boolean revokeAnnouncement(String id);

    /**
     * 增加访问次数
     * 
     * @param id 通告ID
     */
    void addVisitsNumber(String id);

    /**
     * 设置置顶状在     * 
     * @param id 通告ID
     * @param izTop 是否置顶
     * @return 是否成功
     */
    boolean updateTopStatus(String id, String izTop);
}
