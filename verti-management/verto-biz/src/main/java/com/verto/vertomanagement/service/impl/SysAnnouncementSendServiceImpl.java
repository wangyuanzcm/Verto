package com.verto.vertomanagement.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.verto.vertomanagement.entity.SysAnnouncement;
import com.verto.vertomanagement.entity.SysAnnouncementSend;
import com.verto.vertomanagement.mapper.SysAnnouncementSendMapper;
import com.verto.vertomanagement.service.ISysAnnouncementSendService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;

/**
 * 用户通告阅读标记在服务实现在 * 
 * @author verto
 * @since 2024-01-01
 */
@Slf4j
@Service
public class SysAnnouncementSendServiceImpl extends ServiceImpl<SysAnnouncementSendMapper, SysAnnouncementSend> implements ISysAnnouncementSendService {

    @Autowired
    private SysAnnouncementSendMapper sysAnnouncementSendMapper;

    @Override
    public IPage<SysAnnouncementSend> getLastAnnountTime(Page<SysAnnouncementSend> page, String userId, String noticeType) {
        try {
            return sysAnnouncementSendMapper.getLastAnnountTime(page, userId, noticeType);
        } catch (Exception e) {
            log.error("获取最后通告时间失败", e);
            return page;
        }
    }

    @Override
    public void clearAllUnReadMessage(String userId) {
        try {
            sysAnnouncementSendMapper.clearAllUnReadMessage(userId);
        } catch (Exception e) {
            log.error("清除用户所有未读消息失败", e);
        }
    }

    @Override
    public SysAnnouncementSend findByAnntIdAndUserId(String anntId, String userId) {
        try {
            return sysAnnouncementSendMapper.findByAnntIdAndUserId(anntId, userId);
        } catch (Exception e) {
            log.error("根据通告ID和用户ID查询发送记录失败", e);
            return null;
        }
    }

    @Override
    public void markAsRead(String anntId, String userId) {
        try {
            sysAnnouncementSendMapper.markAsRead(anntId, userId);
        } catch (Exception e) {
            log.error("标记消息为已读失败", e);
        }
    }

    @Override
    public void updateStarFlag(String anntId, String userId, String starFlag) {
        try {
            sysAnnouncementSendMapper.updateStarFlag(anntId, userId, starFlag);
        } catch (Exception e) {
            log.error("设置标星状态失败", e);
        }
    }

    @Override
    public void createAnnouncementSend(String anntId, String userId, SysAnnouncement announcement) {
        try {
            SysAnnouncementSend send = new SysAnnouncementSend();
            send.setAnntId(anntId);
            send.setUserId(userId);
            send.setTitile(announcement.getTitile());
            send.setMsgContent(announcement.getMsgContent());
            send.setSender(announcement.getSender());
            send.setPriority(announcement.getPriority());
            send.setReadFlag("0");
            send.setSendTime(announcement.getSendTime());
            send.setMsgCategory(announcement.getMsgCategory());
            send.setBusType(announcement.getBusType());
            send.setBusId(announcement.getBusId());
            send.setOpenType(announcement.getOpenType());
            send.setOpenPage(announcement.getOpenPage());
            send.setNoticeType(announcement.getNoticeType());
            send.setStarFlag("0");
            send.setCreateTime(new Date());
            send.setCreateBy(announcement.getCreateBy());
            
            this.save(send);
        } catch (Exception e) {
            log.error("创建用户通告发送记录失败", e);
        }
    }
}
