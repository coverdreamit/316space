package com.space316.be.domain.inquiry;

import com.space316.be.domain.common.BaseEntity;
import com.space316.be.domain.member.Member;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inquiry")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Inquiry extends BaseEntity {

    @Id
    @SequenceGenerator(name = "inquiry_seq", sequenceName = "inquiry_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "inquiry_seq")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(nullable = false, length = 50)
    private String authorName;

    @Column(length = 20)
    private String authorPhone;

    @Column(length = 100)
    private String authorEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InquiryCategory category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private boolean isPrivate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InquiryStatus status;

    @OneToOne(mappedBy = "inquiry", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private InquiryAnswer answer;

    @Builder
    private Inquiry(Member member, String authorName, String authorPhone, String authorEmail,
            InquiryCategory category, String title, String content, boolean isPrivate) {
        this.member = member;
        this.authorName = authorName;
        this.authorPhone = authorPhone;
        this.authorEmail = authorEmail;
        this.category = category;
        this.title = title;
        this.content = content;
        this.isPrivate = isPrivate;
        this.status = InquiryStatus.WAITING;
    }

    public boolean isAccessibleBy(Long memberId, boolean isAdmin) {
        if (!isPrivate || isAdmin) return true;
        if (member != null && member.getId().equals(memberId)) return true;
        return false;
    }

    public void markAnswered() {
        this.status = InquiryStatus.ANSWERED;
    }
}
