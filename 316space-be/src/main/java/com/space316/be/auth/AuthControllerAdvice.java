package com.space316.be.auth;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 로그인 요청의 Bean Validation 실패를 자격 증명 오류와 동일한 문구로 맞춥니다.
 * 회원가입 등 다른 auth 엔드포인트는 필드별 메시지를 유지합니다.
 */
@RestControllerAdvice(assignableTypes = AuthController.class)
public class AuthControllerAdvice {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException e) {
        if ("loginRequest".equals(e.getBindingResult().getObjectName())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
        }
        var fe = e.getBindingResult().getFieldError();
        String msg =
                fe != null && StringUtils.hasText(fe.getDefaultMessage())
                        ? fe.getDefaultMessage()
                        : "입력값을 확인해 주세요.";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", msg));
    }
}
