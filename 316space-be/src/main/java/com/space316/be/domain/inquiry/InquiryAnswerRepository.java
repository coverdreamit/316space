package com.space316.be.domain.inquiry;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InquiryAnswerRepository extends JpaRepository<InquiryAnswer, Long> {

    Optional<InquiryAnswer> findByInquiryId(Long inquiryId);

    long countByAdmin_Id(Long adminId);
}
