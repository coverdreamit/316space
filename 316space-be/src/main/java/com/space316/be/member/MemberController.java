package com.space316.be.member;

import com.space316.be.member.dto.MemberProfileResponse;
import com.space316.be.member.dto.ProfileAccessRequest;
import com.space316.be.member.dto.ProfileAccessResponse;
import com.space316.be.member.dto.UpdateMemberProfileRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/me")
    public ResponseEntity<MemberProfileResponse> getMe(@AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(memberService.getProfile(memberId));
    }

    @PostMapping("/me/profile-access")
    public ResponseEntity<ProfileAccessResponse> issueProfileAccess(
            @AuthenticationPrincipal Long memberId, @Valid @RequestBody ProfileAccessRequest req) {
        return ResponseEntity.ok(memberService.issueProfileAccess(memberId, req.password()));
    }

    @PatchMapping("/me")
    public ResponseEntity<MemberProfileResponse> updateMe(
            @AuthenticationPrincipal Long memberId, @Valid @RequestBody UpdateMemberProfileRequest req) {
        return ResponseEntity.ok(memberService.updateProfile(memberId, req));
    }
}
