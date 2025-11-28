package com.lot86.practice_app_backend.group.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * 그룹에 속한 멤버 1명에 대한 정보.
 * - PK: (group_id, user_id) 복합키
 * - role: OWNER / MANAGER / MEMBER
 * - joinedAt: 그룹에 가입한 시각
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "group_member")
@IdClass(GroupMemberId.class) // 복합 기본 키 (group_id + user_id)
public class GroupMember {

    @Id
    @Column(name = "group_id", columnDefinition = "uuid")
    private UUID groupId;

    @Id
    @Column(name = "user_id", columnDefinition = "uuid")
    private UUID userId;

    /**
     * 그룹 내에서의 역할
     * - OWNER  : 그룹 생성자(최고 권한)
     * - MANAGER: 일부 관리 권한을 가진 멤버 (추후 확장용)
     * - MEMBER : 일반 멤버
     */
    @Column(name = "role", nullable = false, length = 10)
    private String role;

    /**
     * 그룹에 가입한 시각 (DB/하이버네이트에서 자동 세팅)
     */
    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private OffsetDateTime joinedAt;

    /**
     * 편의를 위한 생성자
     */
    public GroupMember(UUID groupId, UUID userId, String role) {
        this.groupId = groupId;
        this.userId = userId;
        this.role = role;
    }
}
