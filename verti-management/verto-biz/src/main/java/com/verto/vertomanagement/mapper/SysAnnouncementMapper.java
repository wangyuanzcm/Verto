package com.verto.vertomanagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.verto.vertomanagement.entity.SysAnnouncement;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.Date;
import java.util.List;

/**
 * 系统通告Mapper接口
 * 
 * @author verto
 * @since 2024-01-01
 */
@Mapper
public interface SysAnnouncementMapper extends BaseMapper<SysAnnouncement> {

    /**
     * 根据用户ID分页查询系统通告
     * 
     * @param page 分页对象
     * @param userId 用户ID
     * @param msgCategory 消息类别
     * @param noticeType 通知类型
     * @param lastMonthStartDay 最近一个月开始日期
     * @return 分页结果
     */
    @Select("SELECT a.*, s.read_flag " +
            "FROM sys_announcement a " +
            "LEFT JOIN sys_announcement_send s ON a.id = s.annt_id AND s.user_id = #{userId} " +
            "WHERE a.send_status = '1' " +
            "AND a.del_flag = '0' " +
            "AND (a.msg_type = 'ALL' OR a.user_ids LIKE CONCAT('%', #{userId}, '%')) " +
            "AND (#{msgCategory} IS NULL OR a.msg_category = #{msgCategory}) " +
            "AND (#{noticeType} IS NULL OR a.notice_type = #{noticeType}) " +
            "AND (#{lastMonthStartDay} IS NULL OR a.send_time >= #{lastMonthStartDay}) " +
            "ORDER BY a.send_time DESC")
    IPage<SysAnnouncement> querySysCementPageByUserId(Page<SysAnnouncement> page, 
                                                      @Param("userId") String userId,
                                                      @Param("msgCategory") String msgCategory,
                                                      @Param("noticeType") String noticeType,
                                                      @Param("lastMonthStartDay") Date lastMonthStartDay);

    /**
     * 根据用户ID获取未读消息数量
     * 
     * @param userId 用户ID
     * @param lastMonthStartDay 最近一个月开始日期
     * @param noticeType 通知类型
     * @return 未读消息数量
     */
    @Select("SELECT COUNT(*) " +
            "FROM sys_announcement a " +
            "LEFT JOIN sys_announcement_send s ON a.id = s.annt_id AND s.user_id = #{userId} " +
            "WHERE a.send_status = '1' " +
            "AND a.del_flag = '0' " +
            "AND (a.msg_type = 'ALL' OR a.user_ids LIKE CONCAT('%', #{userId}, '%')) " +
            "AND (s.read_flag IS NULL OR s.read_flag = '0') " +
            "AND (#{noticeType} IS NULL OR a.notice_type = #{noticeType}) " +
            "AND (#{lastMonthStartDay} IS NULL OR a.send_time >= #{lastMonthStartDay})")
    Integer getUnreadMessageCountByUserId(@Param("userId") String userId,
                                         @Param("lastMonthStartDay") Date lastMonthStartDay,
                                         @Param("noticeType") String noticeType);

    /**
     * 查询系统消息列表
     * 
     * @param pageSize 页面大小
     * @param pageNo 页码
     * @param fromUser 发送用户
     * @param starFlag 星标标识
     * @param busType 业务类型
     * @param msgCategory 消息类别
     * @param beginTime 开始时间
     * @param endTime 结束时间
     * @param noticeType 通知类型
     * @return 消息列表
     */
    List<SysAnnouncement> querySysMessageList(@Param("pageSize") Integer pageSize,
                                             @Param("pageNo") Integer pageNo,
                                             @Param("fromUser") String fromUser,
                                             @Param("starFlag") String starFlag,
                                             @Param("busType") String busType,
                                             @Param("msgCategory") String msgCategory,
                                             @Param("beginTime") Date beginTime,
                                             @Param("endTime") Date endTime,
                                             @Param("noticeType") String noticeType);

    /**
     * 更新已读状态
     * 
     * @param annoceIdList 通告ID列表
     */
    void updateReaded(@Param("annoceIdList") List<String> annoceIdList);

    /**
     * 增加访问次数
     * 
     * @param id 通告ID
     */
    @Update("UPDATE sys_announcement SET visits_number = IFNULL(visits_number, 0) + 1 WHERE id = #{id}")
    void addVisitsNumber(@Param("id") String id);
}
