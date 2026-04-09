package com.space316.be.audit;

import com.space316.be.domain.audit.ActivityAuditLog;
import com.space316.be.domain.audit.ActivityAuditLogRepository;
import com.space316.be.domain.member.Member;
import com.space316.be.domain.member.MemberRepository;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final ActivityAuditLogRepository activityAuditLogRepository;
    private final ClientIpResolver clientIpResolver;
    private final MemberRepository memberRepository;

    public Optional<Long> currentActorMemberId() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null || !a.isAuthenticated()) {
            return Optional.empty();
        }
        Object p = a.getPrincipal();
        if (p instanceof Long id) {
            return Optional.of(id);
        }
        return Optional.empty();
    }

    @Transactional
    public void record(
            ActivityAuditAction action,
            Long actorMemberId,
            String actorLabel,
            String targetType,
            String targetId,
            String ipAddress,
            String detail) {
        String ip = ipAddress != null ? ipAddress : clientIpResolver.resolveCurrent();
        activityAuditLogRepository.save(ActivityAuditLog.builder()
                .action(action)
                .actorMemberId(actorMemberId)
                .actorLabel(truncate(actorLabel, 128))
                .targetType(truncate(targetType, 32))
                .targetId(truncate(targetId, 64))
                .ipAddress(truncate(ip, 45))
                .detail(detail)
                .build());
    }

    @Transactional
    public void recordForCurrentAdmin(
            ActivityAuditAction action, String targetType, String targetId, String detail) {
        Long adminId = currentActorMemberId().orElse(null);
        String adminLabel =
                adminId == null
                        ? "ADMIN"
                        : memberRepository.findById(adminId).map(Member::getLoginId).orElse("ADMIN");
        record(action, adminId, adminLabel, targetType, targetId, null, detail);
    }

    /** 인증 실패 등 메인 트랜잭션이 롤백돼도 남겨야 할 로그용 */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordInNewTransaction(
            ActivityAuditAction action,
            Long actorMemberId,
            String actorLabel,
            String targetType,
            String targetId,
            String ipAddress,
            String detail) {
        String ip = ipAddress != null ? ipAddress : clientIpResolver.resolveCurrent();
        activityAuditLogRepository.save(ActivityAuditLog.builder()
                .action(action)
                .actorMemberId(actorMemberId)
                .actorLabel(truncate(actorLabel, 128))
                .targetType(truncate(targetType, 32))
                .targetId(truncate(targetId, 64))
                .ipAddress(truncate(ip, 45))
                .detail(detail)
                .build());
    }

    @Transactional(readOnly = true)
    public Page<ActivityAuditLog> search(
            java.time.LocalDateTime from,
            java.time.LocalDateTime to,
            ActivityAuditAction action,
            Pageable pageable) {
        Specification<ActivityAuditLog> spec = (root, q, cb) -> {
            List<Predicate> parts = new ArrayList<>();
            if (from != null) {
                parts.add(cb.greaterThanOrEqualTo(root.get("occurredAt"), from));
            }
            if (to != null) {
                parts.add(cb.lessThanOrEqualTo(root.get("occurredAt"), to));
            }
            if (action != null) {
                parts.add(cb.equal(root.get("action"), action));
            }
            if (parts.isEmpty()) {
                return cb.conjunction();
            }
            return cb.and(parts.toArray(Predicate[]::new));
        };
        return activityAuditLogRepository.findAll(spec, pageable);
    }

    private static String truncate(String s, int max) {
        if (s == null) {
            return null;
        }
        if (s.length() <= max) {
            return s;
        }
        return s.substring(0, max);
    }
}
