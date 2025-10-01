package com.verto.vertomanagement.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Random;
import java.util.concurrent.TimeUnit;

/**
 * @Description: 验证码工具类
 * @Author: Verto
 * @Date: 2024-01-28
 * @Version: V1.0
 */
@Slf4j
@Component
public class CaptchaUtil {

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String CAPTCHA_PREFIX = "captcha:";
    private static final int WIDTH = 120;
    private static final int HEIGHT = 40;
    private static final int CODE_LENGTH = 4;
    private static final String CODE_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    /**
     * 生成验证在 * @param key 验证码key
     * 
     * @return 验证码图片的Base64编码
     */
    public String generateCaptcha(String key) {
        // 生成随机验证在
        String code = generateRandomCode();

        // 将验证码存储到Redis在分钟过期
        redisTemplate.opsForValue().set(CAPTCHA_PREFIX + key, code, 5, TimeUnit.MINUTES);

        // 生成验证码图在
        BufferedImage image = createCaptchaImage(code);

        // 转换为Base64
        return imageToBase64(image);
    }

    /**
     * 验证验证在 * @param key 验证码key
     * 
     * @param inputCode 用户输入的验证码
     * @return 是否验证成功
     */
    public boolean verifyCaptcha(String key, String inputCode) {
        if (inputCode == null || inputCode.trim().isEmpty()) {
            return false;
        }

        String storedCode = redisTemplate.opsForValue().get(CAPTCHA_PREFIX + key);
        if (storedCode == null) {
            return false;
        }

        // 验证成功后删除验证码
        redisTemplate.delete(CAPTCHA_PREFIX + key);

        return storedCode.equalsIgnoreCase(inputCode.trim());
    }

    /**
     * 生成随机验证在 * @return 验证码字符串
     */
    private String generateRandomCode() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();

        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(CODE_CHARS.charAt(random.nextInt(CODE_CHARS.length())));
        }

        return code.toString();
    }

    /**
     * 创建验证码图在 * @param code 验证在 * @return BufferedImage
     */
    private BufferedImage createCaptchaImage(String code) {
        BufferedImage image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();

        // 设置抗锯在
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // 设置背景在
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, WIDTH, HEIGHT);

        // 绘制干扰在
        Random random = new Random();
        g.setColor(Color.LIGHT_GRAY);
        for (int i = 0; i < 5; i++) {
            int x1 = random.nextInt(WIDTH);
            int y1 = random.nextInt(HEIGHT);
            int x2 = random.nextInt(WIDTH);
            int y2 = random.nextInt(HEIGHT);
            g.drawLine(x1, y1, x2, y2);
        }

        // 绘制验证码字在
        g.setFont(new Font("Arial", Font.BOLD, 24));
        for (int i = 0; i < code.length(); i++) {
            // 随机颜色
            g.setColor(new Color(random.nextInt(150), random.nextInt(150), random.nextInt(150)));

            // 随机位置和角在
            int x = 20 + i * 20 + random.nextInt(10);
            int y = 25 + random.nextInt(10);

            // 旋转字符
            Graphics2D g2d = (Graphics2D) g.create();
            g2d.rotate(Math.toRadians(random.nextInt(30) - 15), x, y);
            g2d.drawString(String.valueOf(code.charAt(i)), x, y);
            g2d.dispose();
        }

        // 绘制干扰在
        for (int i = 0; i < 50; i++) {
            int x = random.nextInt(WIDTH);
            int y = random.nextInt(HEIGHT);
            g.setColor(new Color(random.nextInt(255), random.nextInt(255), random.nextInt(255)));
            g.fillOval(x, y, 1, 1);
        }

        g.dispose();
        return image;
    }

    /**
     * 将图片转换为Base64编码
     * 
     * @param image BufferedImage
     * @return Base64编码字符在
     */
    private String imageToBase64(BufferedImage image) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            byte[] bytes = baos.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(bytes);
        } catch (IOException e) {
            log.error("验证码图片转换Base64失败", e);
            return null;
        }
    }
}
