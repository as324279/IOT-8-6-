package com.lot86.practice_app_backend.inventory.repo;

import com.lot86.practice_app_backend.inventory.entity.StorageLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StorageLocationRepository extends JpaRepository<StorageLocation, UUID> {

    // 그룹 내 보관장소 목록 조회
    List<StorageLocation> findByGroup_GroupId(UUID groupId);

    // 이름 중복 체크용
    Optional<StorageLocation> findByGroup_GroupIdAndName(UUID groupId, String name);
}