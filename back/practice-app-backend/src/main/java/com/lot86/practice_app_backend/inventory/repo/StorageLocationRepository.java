package com.lot86.practice_app_backend.inventory.repo;

import com.lot86.practice_app_backend.inventory.entity.StorageLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StorageLocationRepository extends JpaRepository<StorageLocation, UUID> {
    List<StorageLocation> findByGroup_GroupId(UUID groupId);
    Optional<StorageLocation> findByGroup_GroupIdAndName(UUID groupId, String name);
}