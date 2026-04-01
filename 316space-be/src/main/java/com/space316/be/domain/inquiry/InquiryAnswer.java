package com.space316.be.domain.inquiry;

import com.space316.be.domain.common.BaseEntity;
import com.space316.be.domain.member.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inquiry_answer")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InquiryAnswer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inquiry_id", nullable = false)
    private Inquiry inquiry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Member admin;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Builder
    private InquiryAnswer(Inquiry inquiry, Member admin, String content) {
        this.inquiry = inquiry;
        this.admin = admin;
        this.content = content;
    }

    public void updateContent(String content) {
        this.content = content;
    }
}
