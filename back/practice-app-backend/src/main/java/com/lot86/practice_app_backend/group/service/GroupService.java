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
import com.lot86.practice_app_backend.notification.service.NotificationService; // [추가] 알림 서비스
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

    private final NotificationService notificationService; // [추가] 알림 발송용 서비스 주입

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    /** 그룹 생성 */
    @Transactional
    public AppGroup createGroup(GroupCreateRequest requestDto, UUID creatorUserId) {
        AppUser creator = appUserRepository.findById(creatorUserId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다. ID: " + creatorUserId));

        AppGroup newGroup = new AppGroup(requestDto.getName(), creator);
        AppGroup savedGroup = appGroupRepository.save(newGroup);

        return savedGroup;
    }

    /** 내가 속한 그룹 목록 조회 (Requirement 3-5) */
    public List<GroupCreateResponse> getMyGroups(UUID userId) {
        List<GroupMember> memberships = groupMemberRepository.findByUserId(userId);

        List<UUID> groupIds = memberships.stream()
                .map(GroupMember::getGroupId)
                .toList();

        List<AppGroup> groups = appGroupRepository.findAllById(groupIds);

        // [수정] 각 그룹별로 멤버 수를 조회해서 DTO에 담음
        return groups.stream()
                .map(group -> {
                    long count = groupMemberRepository.countByGroupId(group.getGroupId());
                    return GroupCreateResponse.fromEntity(group, count);
                })
                .toList();
    }

    /** 권한 체크 (OWNER or MANAGER) */
    private void assertManagerOrOwner(UUID groupId, UUID userId) {
        GroupMember gm = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new IllegalStateException("그룹 멤버가 아닙니다."));

        if (!"OWNER".equals(gm.getRole()) && !"MANAGER".equals(gm.getRole())) {
            throw new IllegalStateException("초대코드는 OWNER 또는 MANAGER만 생성할 수 있습니다.");
        }
    }

    /** 랜덤 초대코드 생성 */
    private String generateInviteCode() {
        int length = 10;
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
        invite.setMaxUses(100); // 최대 100명
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

    /** 2) 초대코드 검증 */
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

    /** 3) 초대코드로 그룹 가입 (+ 알림 발송) */
    @Transactional
    public void joinGroupByCode(String code, UUID currentUserId) {
        InviteCode invite = inviteCodeRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 초대코드입니다."));

        if (!invite.isUsable()) {
            throw new IllegalStateException("만료되었거나 더 이상 사용 불가능한 초대코드입니다.");
        }

        UUID groupId = invite.getGroupId();

        // 이미 가입 여부 체크
        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUserId)) {
            throw new IllegalStateException("이미 그룹에 가입되어 있습니다.");
        }

        // 멤버 추가 (기본 MEMBER)
        GroupMember member = new GroupMember();
        member.setGroupId(groupId);
        member.setUserId(currentUserId);
        member.setRole("MEMBER");
        groupMemberRepository.save(member);

        // 이력 기록
        InviteRedeem redeem = new InviteRedeem();
        redeem.setCodeId(invite.getCodeId());
        redeem.setGroupId(groupId);
        redeem.setUserId(currentUserId);
        inviteRedeemRepository.save(redeem);

        // 사용 횟수 증가
        invite.setUsedCount(invite.getUsedCount() + 1);
        if (invite.getUsedCount() >= invite.getMaxUses()) {
            invite.setStatus("EXPIRED");
        }

        // [추가] 기존 그룹 멤버들에게 알림 발송 (Requirement 6-4)
        sendJoinNotification(groupId, currentUserId);
    }

    /** 가입 알림 발송 헬퍼 메서드 */
    private void sendJoinNotification(UUID groupId, UUID newMemberId) {
        try {
            // 1. 새 멤버 정보 조회
            AppUser newUser = appUserRepository.findById(newMemberId).orElseThrow();

            // 2. 기존 멤버 조회 (본인 제외)
            List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
            List<UUID> targetUserIds = members.stream()
                    .map(GroupMember::getUserId)
                    .filter(id -> !id.equals(newMemberId))
                    .toList();

            if (targetUserIds.isEmpty()) return;

            List<AppUser> targets = appUserRepository.findAllById(targetUserIds);

            // 3. 알림 생성 및 저장
            String title = "새로운 멤버 가입";
            String body = "'" + newUser.getName() + "'님이 그룹에 합류했습니다!";

            for (AppUser target : targets) {
                notificationService.createNotification(target, "NEW_MEMBER", title, body);
            }
        } catch (Exception e) {
            // 알림 실패가 가입 로직을 방해하지 않도록 예외 처리
            System.err.println("알림 발송 실패: " + e.getMessage());
        }
    }

    /** 4) 그룹 멤버 목록 조회 */
    public List<GroupMemberResponse> getGroupMembers(UUID groupId, UUID currentUserId) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        if (members.isEmpty()) {
            return List.of();
        }

        List<UUID> userIds = members.stream().map(GroupMember::getUserId).toList();
        List<AppUser> users = appUserRepository.findAllById(userIds);

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

    /** 5) 그룹 탈퇴 */
    @Transactional
    public void leaveGroup(UUID groupId, UUID currentUserId) {
        GroupMember gm = groupMemberRepository.findByGroupIdAndUserId(groupId, currentUserId)
                .orElseThrow(() -> new IllegalStateException("해당 그룹의 멤버가 아닙니다."));

        // 멤버 삭제
        groupMemberRepository.delete(gm);

        // 남은 멤버가 0명이면 그룹 해산
        long memberCount = groupMemberRepository.countByGroupId(groupId);
        if (memberCount == 0) {
            appGroupRepository.findById(groupId).ifPresent(g -> {
                g.setDissolvedAt(OffsetDateTime.now(ZoneOffset.UTC));
            });
        }
    }
}