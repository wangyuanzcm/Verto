package com.verto.vertomanagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.verto.vertomanagement.entity.SysAnnouncementSend;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/**
 * 用户通告阅读标记Mapper接口
 * 
 * @author verto
 * @since 2024-01-01
 */
@Mapper
public interface SysAnnouncementSendMapper extends BaseMapper<SysAnnouncementSend> {

    /**
     * 获取用户最后通告时间
     * 
     * @param page 分页对象
     * @param userId 用户ID
     * @param noticeType 通知类型
     * @return 分页结果
     */
    @Select("SELECT * FROM sys_announcement_send " +
            "WHERE user_id = #{userId} " +
            "AND (#{noticeType} IS NULL OR notice_type = #{noticeType}) " +
            "ORDER BY send_time DESC")
    IPage<SysAnnouncementSend> getLastAnnountTime(Page<SysAnnouncementSend> page,
                                                  @Param("userId") String userId,
                                                  @Param("noticeType") String noticeType);

    /**
     * 清除用户所有未读消息
     * 
     * @param userId 用户ID
     */
    @Update("UPDATE sys_announcement_send SET read_flag = '1', read_time = NOW() " +
            "WHERE user_id = #{userId} AND read_flag = '0'")
    void clearAllUnReadMessage(@Param("userId") String userId);

    /**
     * 根据通告ID和用户ID查询记录
     * 
     * @param anntId 通告ID
     * @param userId 用户ID
     * @return 通告发送记录
     */
    @Select("SELECT * FROM sys_announcement_send WHERE annt_id = #{anntId} AND user_id = #{userId}")
    SysAnnouncementSend findByAnntIdAndUserId(@Param("anntId") String anntId, @Param("userId") String userId);

    /**
     * 标记消息为已读
     * 
     * @param anntId 通告ID
     * @param userId 用户ID
     */
    @Update("UPDATE sys_announcement_send SET read_flag = '1', read_time = NOW() " +
            "WHERE annt_id = #{anntId} AND user_id = #{userId}")
    void markAsRead(@Param("anntId") String anntId, @Param("userId") String userId);

    /**
     * 更新星标状态
     * 
     * @param anntId 通告ID
     * @param userId 用户ID
     * @param starFlag 星标标识
     */
    @Update("UPDATE sys_announcement_send SET star_flag = #{starFlag} " +
            "WHERE annt_id = #{anntId} AND user_id = #{userId}")
    void updateStarFlag(@Param("anntId") String anntId, @Param("userId") String userId, @Param("starFlag") String starFlag);
}
