package com.lot86.practice_app_backend.group.service;

import com.lot86.practice_app_backend.group.entity.AppGroup;
import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.group.entity.GroupMember;
import com.lot86.practice_app_backend.group.dto.GroupCreateRequest; // 패키지 경로 확인!
import com.lot86.practice_app_backend.repo.AppGroupRepository;
import com.lot86.practice_app_backend.repo.AppUserRepository;
import com.lot86.practice_app_backend.group.repo.GroupMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException; // 사용자 못 찾을 때 예외
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service // 이 클래스가 서비스 계층의 Bean임을 선언
@RequiredArgsConstructor // final 필드 생성자 자동 주입
@Transactional(readOnly = true) // 기본적으로 읽기 전용 트랜잭션
public class GroupService {

    private final AppGroupRepository appGroupRepository;
    private final GroupMemberRepository groupMemberRepository; //그룹 멤버 조회, 수정 , 삭제시 필요함
    private final AppUserRepository appUserRepository; // 사용자 정보를 가져오기 위해 추가

    /**
     * 새로운 그룹을 생성하고, 생성자를 OWNER로 자동 추가한다.
     * @param requestDto 그룹 생성 요청 DTO (그룹 이름 포함)
     * @param creatorUserId 그룹 생성자(현재 로그인한 사용자)의 ID
     * @return 생성된 AppGroup 엔티티
     */
    @Transactional // 데이터 변경이 있으므로 쓰기 트랜잭션 적용
    public AppGroup createGroup(GroupCreateRequest requestDto, UUID creatorUserId) {
        // 1. 그룹 생성자(AppUser) 정보 조회
        AppUser creator = appUserRepository.findById(creatorUserId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다. ID: " + creatorUserId));

        // 2. 새로운 AppGroup 엔티티 생성
        AppGroup newGroup = new AppGroup(requestDto.getName(), creator);

        // 3. AppGroup 저장
        AppGroup savedGroup = appGroupRepository.save(newGroup);

        // 4. 그룹 생성자를 OWNER로 GroupMember에 추가 (요구사항 반영)
        /*GroupMember ownerMember = new GroupMember(savedGroup.getGroupId(), creatorUserId, "OWNER");
        groupMemberRepository.save(ownerMember);*/

        // 5. 생성된 그룹 정보 반환 (필요에 따라 DTO로 변환해서 반환해도 됨)
        return savedGroup;
    }

    // --- 여기에 그룹 조회, 수정, 삭제, 초대 등 다른 메소드 추가 예정 ---
}