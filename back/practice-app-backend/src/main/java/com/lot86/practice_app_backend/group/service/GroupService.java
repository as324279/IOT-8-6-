package com.lot86.practice_app_backend.group.service;

import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.group.dto.*;
import com.lot86.practice_app_backend.group.entity.AppGroup;
import com.lot86.practice_app_backend.group.entity.GroupMember;
import com.lot86.practice_app_backend.group.entity.InviteCode;
import com.lot86.practice_app_backend.group.entity.InviteRedeem;
import com.lot86.practice_app_backend.group.repo.GroupMemberRepository;
import com.lot86.practice_app_backend.group.repo.InviteCodeRepository;
import com.lot86.practice_app_backend.group.repo.InviteRedeemRepository;
import com.lot86.practice_app_backend.repo.AppGroupRepository;
import com.lot86.practice_app_backend.repo.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GroupService {

    private final AppGroupRepository appGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final InviteCodeRepository inviteCodeRepository;
    private final InviteRedeemRepository inviteRedeemRepository;
    private final AppUserRepository appUserRepository;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    /** 그룹 생성 (기존) */
    @Transactional
    public AppGroup createGroup(GroupCreateRequest requestDto, UUID creatorUserId) {
        AppUser creator = appUserRepository.findById(creatorUserId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다. ID: " + creatorUserId));

        AppGroup newGroup = new AppGroup(requestDto.getName(), creator);
        AppGroup savedGroup = appGroupRepository.save(newGroup);


        return savedGroup;
    }

    /** 현재 사용자가 해당 그룹에서 OWNER / MANAGER 인지 체크 */
    private void assertManagerOrOwner(UUID groupId, UUID userId) {
        GroupMember gm = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new IllegalStateException("그룹 멤버가 아닙니다."));

        if (!"OWNER".equals(gm.getRole()) && !"MANAGER".equals(gm.getRole())) {
            throw new IllegalStateException("초대코드는 OWNER 또는 MANAGER만 생성할 수 있습니다.");
        }
    }

    /** 랜덤 초대코드 생성 (8~12자리) */
    private String generateInviteCode() {
        int length = 10; // 8~12 중 10자로 통일
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
    }

    /** 1) 초대코드 생성 */
    @Transactional
    public GroupInviteCreateResponse createInvite(UUID groupId, UUID currentUserId) {
        AppGroup group = appGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 그룹입니다."));

        // 권한 체크
        assertManagerOrOwner(groupId, currentUserId);

        String code = generateInviteCode();

        InviteCode invite = new InviteCode();
        invite.setGroupId(group.getGroupId());
        invite.setInviterId(currentUserId);
        invite.setCode(code);
        invite.setMaxUses(10); // 한 코드로 최대 10명까지 가입 (원하면 변경 가능)
        invite.setUsedCount(0);
        invite.setExpiresAt(OffsetDateTime.now(ZoneOffset.UTC).plusDays(3)); // 3일 유효

        inviteCodeRepository.save(invite);

        return new GroupInviteCreateResponse(
                invite.getGroupId(),
                invite.getCode(),
                invite.getExpiresAt(),
                invite.getMaxUses(),
                invite.getUsedCount(),
                invite.getStatus()
        );
    }

    /** 2) 초대코드 검증 (미리 체크용) */
    public GroupInviteCheckResponse checkInviteCode(String code) {
        InviteCode invite = inviteCodeRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 초대코드입니다."));

        AppGroup group = appGroupRepository.findById(invite.getGroupId())
                .orElseThrow(() -> new IllegalStateException("초대 대상 그룹이 존재하지 않습니다."));

        boolean valid = invite.isUsable();
        int remaining = Math.max(0, invite.getMaxUses() - invite.getUsedCount());

        return new GroupInviteCheckResponse(
                valid,
                group.getGroupId(),
                group.getName(),
                invite.getExpiresAt(),
                remaining,
                invite.getStatus()
        );
    }

    /** 3) 초대코드로 그룹 가입 */
    @Transactional
    public void joinGroupByCode(String code, UUID currentUserId) {
        InviteCode invite = inviteCodeRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 초대코드입니다."));

        if (!invite.isUsable()) {
            throw new IllegalStateException("만료되었거나 더 이상 사용 불가능한 초대코드입니다.");
        }

        UUID groupId = invite.getGroupId();

        // 이미 가입된 멤버인지 체크
        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUserId)) {
            throw new IllegalStateException("이미 그룹에 가입되어 있습니다.");
        }

        // 멤버 추가 (기본 MEMBER)
        GroupMember member = new GroupMember();
        member.setGroupId(groupId);
        member.setUserId(currentUserId);
        member.setRole("MEMBER");
        groupMemberRepository.save(member);

        // 사용 이력 기록
        InviteRedeem redeem = new InviteRedeem();
        redeem.setCodeId(invite.getCodeId());
        redeem.setGroupId(groupId);
        redeem.setUserId(currentUserId);
        inviteRedeemRepository.save(redeem);

        // 사용 횟수 증가 + 상태 업데이트
        invite.setUsedCount(invite.getUsedCount() + 1);
        if (invite.getUsedCount() >= invite.getMaxUses()) {
            invite.setStatus("EXPIRED");
        }
    }

    /** 4) 그룹 멤버 목록 조회 */
    public List<GroupMemberResponse> getGroupMembers(UUID groupId, UUID currentUserId) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        if (members.isEmpty()) {
            return List.of();
        }

        // userId 목록으로 한 번에 사용자 조회
        List<UUID> userIds = members.stream().map(GroupMember::getUserId).toList();
        List<AppUser> users = appUserRepository.findAllById(userIds);

        // userId -> AppUser 매핑
        var userMap = new java.util.HashMap<UUID, AppUser>();
        for (AppUser u : users) {
            userMap.put(u.getUserId(), u);
        }

        List<GroupMemberResponse> result = new ArrayList<>();
        for (GroupMember gm : members) {
            AppUser u = userMap.get(gm.getUserId());
            if (u == null) continue;

            result.add(new GroupMemberResponse(
                    u.getUserId(),
                    u.getName(),
                    u.getEmail(),
                    gm.getRole(),
                    gm.getJoinedAt(),
                    u.getUserId().equals(currentUserId)
            ));
        }
        return result;
    }

    /** 5) 그룹 탈퇴 (현재 사용자) */
    @Transactional
    public void leaveGroup(UUID groupId, UUID currentUserId) {
        GroupMember gm = groupMemberRepository.findByGroupIdAndUserId(groupId, currentUserId)
                .orElseThrow(() -> new IllegalStateException("해당 그룹의 멤버가 아닙니다."));

        // OWNER가 나갈 때 처리 전략은 여기서 결정:
        // 간단하게: 그냥 나가게 허용하고, 아무도 안 남으면 그룹 해산
        groupMemberRepository.delete(gm);

        long memberCount = groupMemberRepository.countByGroupId(groupId);
        if (memberCount == 0) {
            // 그룹 해산 처리 (dissolved_at 설정)
            appGroupRepository.findById(groupId).ifPresent(g -> {
                g.setDissolvedAt(OffsetDateTime.now(ZoneOffset.UTC));
            });
        }
    }
}
