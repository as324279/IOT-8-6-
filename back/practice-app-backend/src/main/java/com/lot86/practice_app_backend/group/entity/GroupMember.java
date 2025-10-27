package com.lot86.practice_app_backend.group.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "group_member")
// 복합 기본 키를 위한 ID 클래스 지정 (아래 IdClass 정의 필요)
@IdClass(GroupMemberId.class)
public class GroupMember {

    @Id // 복합 키의 일부
    @Column(name = "group_id", columnDefinition = "uuid")
    private UUID groupId;

    @Id // 복합 키의 일부
    @Column(name = "user_id", columnDefinition = "uuid")
    private UUID userId;

    // 복합 키 대신 관계 매핑을 사용할 수도 있음 (아래 주석 참고)
    // @Id
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "group_id")
    // private AppGroup group;

    // @Id
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "user_id")
    // private AppUser user;

    @Column(name = "role", nullable = false, length = 10)
    private String role; // 예: "OWNER", "MANAGER", "MEMBER"

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private OffsetDateTime joinedAt;

    // 생성자 (편의를 위해)
    public GroupMember(UUID groupId, UUID userId, String role) {
        this.groupId = groupId;
        this.userId = userId;
        this.role = role;
    }
}

