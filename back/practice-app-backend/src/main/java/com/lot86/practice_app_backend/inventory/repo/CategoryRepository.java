package com.lot86.practice_app_backend.inventory.repo;

import com.lot86.practice_app_backend.inventory.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    // 특정 그룹의 카테고리 목록 조회
    List<Category> findByGroup_GroupId(UUID groupId);

    // 이름으로 조회 (중복 방지 및 Find-or-Create용)
    Optional<Category> findByGroup_GroupIdAndName(UUID groupId, String name);
}