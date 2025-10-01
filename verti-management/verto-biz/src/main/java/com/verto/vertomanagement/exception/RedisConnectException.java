package com.verto.vertomanagement.exception;

/**
 * @Description: Redis连接异常在 * 用于处理Redis服务器连接失败、超时等异常情况
 * @author: Verto Team
 */
public class RedisConnectException extends Exception {

    private static final long serialVersionUID = 1L;

    /**
     * 默认构造函在     */
    public RedisConnectException() {
        super();
    }

    /**
     * 带消息的构造函在     * @param message 异常消息
     */
    public RedisConnectException(String message) {
        super(message);
    }

    /**
     * 带消息和原因的构造函在     * @param message 异常消息
     * @param cause 异常原因
     */
    public RedisConnectException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * 带原因的构造函在     * @param cause 异常原因
     */
    public RedisConnectException(Throwable cause) {
        super(cause);
    }
}
