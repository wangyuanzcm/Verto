package com.verto.vertomanagement.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;

/**
 * @Description: 统一返回结果在 * @Author: Verto
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "统一返回结果")
public class Result<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "是否成功")
    private boolean success = true;

    @Schema(description = "返回消息")
    private String message = "操作成功";

    @Schema(description = "返回代码")
    private Integer code = 200;

    @Schema(description = "返回数据")
    private T result;

    @Schema(description = "时间戳")
    private long timestamp = System.currentTimeMillis();

    public Result() {
    }

    public Result(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public Result(boolean success, String message, Integer code) {
        this.success = success;
        this.message = message;
        this.code = code;
    }

    /**
     * 成功返回结果
     */
    public static <T> Result<T> ok() {
        return new Result<>();
    }

    /**
     * 成功返回结果
     * @param data 返回数据
     */
    public static <T> Result<T> ok(T data) {
        Result<T> result = new Result<>();
        result.setResult(data);
        return result;
    }

    /**
     * 成功返回结果
     * @param data 返回数据
     * @param message 返回消息
     */
    public static <T> Result<T> ok(T data, String message) {
        Result<T> result = new Result<>();
        result.setResult(data);
        result.setMessage(message);
        return result;
    }

    /**
     * 失败返回结果
     * @param message 错误消息
     */
    public static <T> Result<T> error(String message) {
        Result<T> result = new Result<>();
        result.setSuccess(false);
        result.setMessage(message);
        result.setCode(500);
        return result;
    }

    /**
     * 失败返回结果
     * @param code 错误代码
     * @param message 错误消息
     */
    public static <T> Result<T> error(Integer code, String message) {
        Result<T> result = new Result<>();
        result.setSuccess(false);
        result.setMessage(message);
        result.setCode(code);
        return result;
    }
}
