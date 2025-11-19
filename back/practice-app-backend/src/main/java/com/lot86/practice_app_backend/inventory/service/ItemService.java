package com.lot86.practice_app_backend.inventory.service;

import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.group.entity.AppGroup;
import com.lot86.practice_app_backend.inventory.dto.ItemCreateRequest;
import com.lot86.practice_app_backend.inventory.dto.ItemResponse;
import com.lot86.practice_app_backend.inventory.entity.Category;
import com.lot86.practice_app_backend.inventory.entity.Item;
import com.lot86.practice_app_backend.inventory.entity.StorageLocation;
import com.lot86.practice_app_backend.inventory.repo.CategoryRepository;
import com.lot86.practice_app_backend.inventory.repo.ItemRepository;
import com.lot86.practice_app_backend.inventory.repo.StorageLocationRepository;
import com.lot86.practice_app_backend.repo.AppGroupRepository;
import com.lot86.practice_app_backend.repo.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lot86.practice_app_backend.inventory.dto.ItemUpdateRequest;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final StorageLocationRepository locationRepository;
    private final AppGroupRepository groupRepository;
    private final AppUserRepository userRepository;

    /**
     * 물품 등록
     */
    @Transactional
    public ItemResponse createItem(UUID groupId, UUID userId, ItemCreateRequest request) {
        // 1. 그룹 및 작성자 조회
        AppGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 그룹입니다."));
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 2. 카테고리 처리 (입력한 이름이 있으면 찾고, 없으면 새로 생성 - Find or Create)
        Category category = null;
        if (request.getCategoryName() != null && !request.getCategoryName().isBlank()) {
            String catName = request.getCategoryName().trim();
            category = categoryRepository.findByGroup_GroupIdAndName(groupId, catName)
                    .orElseGet(() -> categoryRepository.save(new Category(group, catName)));
        }

        // 3. 보관장소 처리 (입력한 이름이 있으면 찾고, 없으면 새로 생성)
        StorageLocation location = null;
        if (request.getLocationName() != null && !request.getLocationName().isBlank()) {
            String locName = request.getLocationName().trim();
            String defaultType = "OTHER"; // 기본 타입 설정 (필요시 로직 고도화 가능)
            location = locationRepository.findByGroup_GroupIdAndName(groupId, locName)
                    .orElseGet(() -> locationRepository.save(new StorageLocation(group, locName, defaultType)));
        }

        // 4. 물품 생성 및 저장
        Item item = new Item();
        item.setGroup(group);
        item.setName(request.getName());
        item.setQuantity(request.getQuantity());
        item.setUnit(request.getUnit());
        item.setCategory(category);
        item.setLocation(location);
        item.setExpiryDate(request.getExpiryDate());
        item.setMinThreshold(request.getMinThreshold());
        item.setBarcode(request.getBarcode());
        item.setPhotoUrl(request.getPhotoUrl());
        item.setCreatedBy(user);

        Item savedItem = itemRepository.save(item);

        return ItemResponse.fromEntity(savedItem);
    }

    /**
     * 그룹 내 물품 전체 조회
     */
    public List<ItemResponse> getGroupItems(UUID groupId) {
        return itemRepository.findByGroup_GroupIdOrderByCreatedAtDesc(groupId).stream()
                .map(ItemResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 물품 상세 조회
     */
    public ItemResponse getItemDetail(UUID itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 물품입니다."));
        return ItemResponse.fromEntity(item);
    }

    /**
     * 물품 삭제
     */
    @Transactional
    public void deleteItem(UUID itemId) {
        itemRepository.deleteById(itemId);
    }


    /**
     * 물품 수정
     */
    @Transactional
    public ItemResponse updateItem(UUID itemId, UUID userId, ItemUpdateRequest request) {
        // 1. 수정할 물품 조회
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 물품입니다."));

        // (선택) 권한 체크: 요청한 유저가 이 그룹의 멤버인지 확인하는 로직이 있으면 더 좋습니다.
        // 지금은 생략하고 진행합니다.

        // 2. 카테고리 변경 (입력된 경우만)
        if (request.getCategoryName() != null) {
            String catName = request.getCategoryName().trim();
            if (!catName.isEmpty()) {
                Category category = categoryRepository.findByGroup_GroupIdAndName(item.getGroup().getGroupId(), catName)
                        .orElseGet(() -> categoryRepository.save(new Category(item.getGroup(), catName)));
                item.setCategory(category);
            } else {
                item.setCategory(null); // 빈 문자열이면 카테고리 해제
            }
        }

        // 3. 보관장소 변경 (입력된 경우만)
        if (request.getLocationName() != null) {
            String locName = request.getLocationName().trim();
            if (!locName.isEmpty()) {
                StorageLocation location = locationRepository.findByGroup_GroupIdAndName(item.getGroup().getGroupId(), locName)
                        .orElseGet(() -> locationRepository.save(new StorageLocation(item.getGroup(), locName, "OTHER")));
                item.setLocation(location);
            } else {
                item.setLocation(null);
            }
        }

        // 4. 나머지 필드 업데이트 (null이 아닌 경우에만 업데이트하거나, 덮어쓰기)
        if (request.getName() != null) item.setName(request.getName());
        if (request.getQuantity() != null) item.setQuantity(request.getQuantity());
        if (request.getUnit() != null) item.setUnit(request.getUnit());
        if (request.getExpiryDate() != null) item.setExpiryDate(request.getExpiryDate());
        if (request.getMinThreshold() != null) item.setMinThreshold(request.getMinThreshold());
        if (request.getStatus() != null) item.setStatus(request.getStatus());
        if (request.getPhotoUrl() != null) item.setPhotoUrl(request.getPhotoUrl());
        if (request.getBarcode() != null) item.setBarcode(request.getBarcode());

        // Dirty Checking으로 인해 save() 호출 없이도 트랜잭션 종료 시 자동 업데이트됨
        return ItemResponse.fromEntity(item);
    }
}