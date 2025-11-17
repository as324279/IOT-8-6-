package com.lot86.practice_app_backend.group.entity; // 만약 group 패키지를 만든다면 com.lot86.practice_app_backend.group.entity 로 변경

import com.lot86.practice_app_backend.entity.AppUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp; // CreationTimestamp 임포트

import java.time.OffsetDateTime; // OffsetDateTime 임포트
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor // JPA는 기본 생성자가 필요해
@Entity // 이 클래스가 JPA 엔티티임을 나타내
@Table(name = "app_group") // 데이터베이스의 'app_group' 테이블과 매핑
public class AppGroup {

    @Id // 기본 키 필드
    @GeneratedValue(strategy = GenerationType.AUTO) // UUID 자동 생성 (DB 기본값 사용도 가능: @GeneratedValue(generator = "UUID"))
    @Column(name = "group_id", columnDefinition = "uuid") // 'group_id' 컬럼, DB 타입은 uuid
    private UUID groupId;

    @Column(name = "name", nullable = false, length = 100) // 'name' 컬럼, null 불가, 최대 길이 100
    private String name;

    // AppUser 엔티티와의 관계 설정 (Many = AppGroup, One = AppUser)
    // 그룹을 생성한 사용자를 나타내
    @ManyToOne(fetch = FetchType.LAZY) // 지연 로딩 설정 (필요할 때만 사용자 정보 로드)
    @JoinColumn(name = "created_by", nullable = false) // 'created_by' 컬럼을 외래 키로 사용, null 불가
    private AppUser createdBy; // 생성자 정보를 담을 AppUser 객체

    @CreationTimestamp // 엔티티 생성 시 자동으로 현재 시간(UTC) 저장
    @Column(name = "created_at", nullable = false, updatable = false) // 'created_at' 컬럼, null 불가, 업데이트 불가
    private OffsetDateTime createdAt;

    @Column(name = "dissolved_at") // 'dissolved_at' 컬럼 (그룹 해체 시각)
    private OffsetDateTime dissolvedAt; // 그룹 해체 시각 (null 가능)

    // 생성자를 직접 만들어줘도 좋아 (예: 그룹 이름과 생성자를 받는 생성자)
    public AppGroup(String name, AppUser createdBy) {
        this.name = name;
        this.createdBy = createdBy;
    }

    // @PrePersist로 groupId를 애플리케이션 레벨에서 생성할 수도 있어
    // @PrePersist
    // public void prePersist() {
    //     if (this.groupId == null) {
    //         this.groupId = UUID.randomUUID();
    //     }
    // }
}