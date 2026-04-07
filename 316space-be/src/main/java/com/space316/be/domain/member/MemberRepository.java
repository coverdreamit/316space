package com.space316.be.domain.member;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByLoginId(String loginId);

    boolean existsByLoginId(String loginId);

    boolean existsByEmail(String email);

    List<Member> findByLoginIdContainingIgnoreCaseOrNameContainingIgnoreCase(String loginIdPart, String namePart);
}
