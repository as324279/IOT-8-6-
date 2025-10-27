package com.lot86.practice_app_backend.group.repo; // 패키지 경로는 실제 위치에 맞게 조절해줘.

import com.lot86.practice_app_backend.group.entity.GroupMember;
import com.lot86.practice_app_backend.group.entity.GroupMemberId; // GroupMemberId 클래스 임포트
import org.springframework.data.jpa.repository.JpaRepository;

// JpaRepository<엔티티 클래스, ID 클래스 타입> 형태로 지정
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {

    // 필요한 커스텀 쿼리 메소드 추가 가능
    // 예: 특정 그룹의 멤버 수 세기 (long countByGroupId(UUID groupId);)
    // 예: 특정 사용자가 속한 그룹 멤버 정보 목록 찾기 (List<GroupMember> findByUserId(UUID userId);)

}