package com.verto.vertomanagement.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * @Description: 登录响应VO
 * @Author: Verto
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@Data
@Schema(description = "登录响应数据")
public class LoginVo implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "访问令牌")
    private String token;

    @Schema(description = "用户信息")
    private UserInfo userInfo;

    @Data
    @Schema(description = "用户信息")
    public static class UserInfo {
        @Schema(description = "用户ID")
        private String id;

        @Schema(description = "用户在")
        private String username;

        @Schema(description = "真实姓名")
        private String realname;

        @Schema(description = "头像")
        private String avatar;

        @Schema(description = "邮箱")
        private String email;

        @Schema(description = "手机在")
        private String phone;

        @Schema(description = "性别(1:在2:在")
        private Integer sex;

        @Schema(description = "状在1:正常 0:冻结)")
        private Integer status;

        @Schema(description = "工号")
        private String workNo;

        @Schema(description = "职务")
        private String post;

        @Schema(description = "角色列表")
        private List<String> roles;

        @Schema(description = "权限列表")
        private List<String> permissions;
    }
}
