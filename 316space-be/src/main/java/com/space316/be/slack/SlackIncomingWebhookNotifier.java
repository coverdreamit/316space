package com.space316.be.slack;

import com.space316.be.booking.dto.BookingResponse;
import com.space316.be.domain.inquiry.Inquiry;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@RequiredArgsConstructor
public class SlackIncomingWebhookNotifier {

  private static final Logger log = LoggerFactory.getLogger(SlackIncomingWebhookNotifier.class);

  private final SlackWebhookUrlProvider slackWebhookUrlProvider;
  private final RestClient restClient = RestClient.create();

  public void notifyNewBooking(String sourceLabel, BookingResponse b) {
    if (b == null) {
      return;
    }
    String text =
            """
            :spiral_calendar_pad: *새 예약* (%s)
            • 예약번호: `%s`
            • 홀: %s
            • 일시: %s ~ %s
            • 예약자: %s / %s
            • 인원: %s
            • 목적: %s
            • 비고: %s
            """
                    .formatted(
                            escapeSlack(sourceLabel),
                            escapeSlack(b.bookingNo()),
                            escapeSlack(b.hallId()),
                            escapeSlack(String.valueOf(b.startAt())),
                            escapeSlack(String.valueOf(b.endAt())),
                            escapeSlack(b.guestName()),
                            escapeSlack(b.guestPhone()),
                            b.headcount() != null ? escapeSlack(String.valueOf(b.headcount())) : "-",
                            escapeSlackOrDash(b.purpose()),
                            escapeSlackOrDash(b.note()));
    sendText(text);
  }

  public void notifyNewInquiry(Inquiry inquiry) {
    if (inquiry == null) {
      return;
    }
    String memberLabel = inquiry.getMember() != null ? "회원" : "비회원";
    String previewBlock =
            inquiry.isPrivate()
                    ? "_비공개 문의 — 본문은 관리자 화면에서만 확인하세요._"
                    : truncateForSlack(inquiry.getContent(), 400);
    String text =
            """
            :speech_balloon: *새 문의*
            • ID: %d
            • 구분: %s (%s)
            • 제목: %s
            • 작성자: %s / %s
            • 이메일: %s
            • 비공개: %s
            • 내용:
            %s
            """
                    .formatted(
                            inquiry.getId(),
                            escapeSlack(memberLabel),
                            escapeSlack(String.valueOf(inquiry.getCategory())),
                            escapeSlack(inquiry.getTitle()),
                            escapeSlack(inquiry.getAuthorName()),
                            escapeSlack(Objects.toString(inquiry.getAuthorPhone(), "-")),
                            escapeSlackOrDash(inquiry.getAuthorEmail()),
                            inquiry.isPrivate() ? "예" : "아니오",
                            inquiry.isPrivate() ? previewBlock : escapeSlack(previewBlock));
    sendText(text);
  }

  /** 현재 적용 중인 웹훅(DB 또는 환경 변수)으로 테스트 메시지 전송 */
  public boolean sendTestMessage() {
    return slackWebhookUrlProvider
        .currentWebhookUrl()
        .map(
            url -> {
              String when = DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(LocalDateTime.now());
              String body =
                  ":white_check_mark: *316 SPACE* 알림 연동 테스트\n이 메시지가 보이면 웹훅이 정상입니다.\n_"
                      + escapeSlack(when)
                      + "_";
              return postSlackText(url, body);
            })
        .orElse(false);
  }

  private void sendText(String text) {
    slackWebhookUrlProvider.currentWebhookUrl().ifPresent(url -> postSlackText(url, text));
  }

  private boolean postSlackText(String url, String text) {
    try {
      restClient
          .post()
          .uri(url)
          .contentType(MediaType.APPLICATION_JSON)
          .body(new SlackTextBody(text))
          .retrieve()
          .toBodilessEntity();
      return true;
    } catch (RestClientException e) {
      log.warn("Slack Incoming Webhook 전송 실패: {}", e.getMessage());
      return false;
    }
  }

  private static String escapeSlackOrDash(String s) {
    if (s == null || s.isBlank()) {
      return "-";
    }
    return escapeSlack(s);
  }

  /** Incoming webhook `text` 필드용: &, &lt;, &gt; 이스케이프 */
  private static String escapeSlack(String s) {
    if (s == null) {
      return "";
    }
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
  }

  private static String truncateForSlack(String content, int maxLen) {
    if (content == null || content.isBlank()) {
      return "(내용 없음)";
    }
    String t = content.strip();
    if (t.length() <= maxLen) {
      return t;
    }
    return t.substring(0, maxLen) + "…";
  }

  private record SlackTextBody(String text) {}
}
