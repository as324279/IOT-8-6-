package com.lot86.practice_app_backend.inventory.service;

import com.lot86.practice_app_backend.group.entity.AppGroup;
import com.lot86.practice_app_backend.inventory.dto.StorageLocationCreateRequest;
import com.lot86.practice_app_backend.inventory.dto.StorageLocationResponse;
import com.lot86.practice_app_backend.inventory.entity.StorageLocation;
import com.lot86.practice_app_backend.inventory.repo.StorageLocationRepository;
import com.lot86.practice_app_backend.repo.AppGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StorageLocationService {

    private final StorageLocationRepository locationRepository;
    private final AppGroupRepository groupRepository;

    /** 보관 장소 생성 (방 만들기) */
    @Transactional
    public StorageLocationResponse createLocation(UUID groupId, StorageLocationCreateRequest request) {
        AppGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 그룹입니다."));

        // 이름 중복 방지
        if (locationRepository.findByGroup_GroupIdAndName(groupId, request.getName()).isPresent()) {
            throw new IllegalStateException("이미 존재하는 보관 장소 이름입니다.");
        }

        StorageLocation location = new StorageLocation();
        location.setGroup(group);
        location.setName(request.getName());
        location.setStorageType(request.getStorageType());

        locationRepository.save(location);

        return StorageLocationResponse.fromEntity(location);
    }

    /** 그룹의 보관 장소 목록 조회 */
    public List<StorageLocationResponse> getGroupLocations(UUID groupId) {
        return locationRepository.findByGroup_GroupId(groupId).stream()
                .map(StorageLocationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /** 보관 장소 삭제 */
    @Transactional
    public void deleteLocation(UUID locationId) {
        // 주의: 여기에 속한 물품이 있으면 삭제가 안 될 수 있습니다 (DB 제약조건에 따라)
        locationRepository.deleteById(locationId);
    }
}