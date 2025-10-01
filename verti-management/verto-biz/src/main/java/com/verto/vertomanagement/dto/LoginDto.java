package com.verto.vertomanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;

/**
 * @Description: 登录请求DTO
 * @Author: Verto
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@Data
@Schema(description = "登录请求参数")
public class LoginDto implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "用户名不能为空")
    @Schema(description = "用户名", required = true)
    private String username;

    @NotBlank(message = "密码不能为空")
    @Schema(description = "密码", required = true)
    private String password;

    @Schema(description = "验证码")
    private String captcha;

    @Schema(description = "验证码key")
    private String captchaKey;

    @Schema(description = "记住我")
    private Boolean rememberMe = false;
}
