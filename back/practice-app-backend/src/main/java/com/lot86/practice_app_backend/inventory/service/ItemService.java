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

import com.lot86.practice_app_backend.inventory.entity.ItemEvent;
import com.lot86.practice_app_backend.inventory.repo.ItemEventRepository;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final StorageLocationRepository locationRepository;
    private final AppGroupRepository groupRepository;
    private final AppUserRepository userRepository;

    private final ItemEventRepository itemEventRepository;

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

    /*물품 삭제

    @Transactional
    public void deleteItem(UUID itemId) {
        itemRepository.deleteById(itemId);
    }
    */

    /*
    [추가] 물품 삭제 (이력 포함) - 추후 Controller에서 userId를 받아 이 메서드를 사용하면 좋습니다.

    @Transactional
    public void deleteItemWithHistory(UUID itemId, UUID userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 물품입니다."));
        AppUser actor = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 삭제 전 기록 (수량만큼 마이너스 처리)
        itemEventRepository.save(new ItemEvent(item, actor, "DELETE", item.getQuantity().negate()));

        itemRepository.delete(item);
    }*/
    /**
     * [수정11.24 db에서 실제로 삭제는 안함. 안보이게 금만] 물품 삭제 (Soft Delete: 상태만 변경)
     * - 실제 DB 삭제(delete)는 하지 않고, 상태를 'DEPLETED'로 바꿉니다.
     * - 이렇게 해야 이력(ItemEvent)이 아이템을 계속 참조할 수 있어 에러가 안 납니다.
     */
    @Transactional
    public void deleteItemWithHistory(UUID itemId, UUID userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 물품입니다."));
        AppUser actor = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 1. 상태 변경 (삭제된 것처럼 처리)
        item.setStatus("DEPLETED");

        // 2. 삭제 이력 기록
        // (수량을 0으로 바꾸는 게 아니라 '삭제됨' 이벤트만 기록)
        itemEventRepository.save(new ItemEvent(item, actor, "DELETE", BigDecimal.ZERO));

        // 3. 진짜 삭제(delete) 코드는 제거함!
    }

    /**
     * 물품 수정
     */
    @Transactional
    public ItemResponse updateItem(UUID itemId, UUID userId, ItemUpdateRequest request) {
        // 1. 수정할 물품 조회
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 물품입니다."));

        // 2. 수정자(Actor) 조회
        AppUser actor = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // [기록용] 기존 수량 저장
        BigDecimal oldQty = item.getQuantity();

        // 3. 카테고리 변경
        if (request.getCategoryName() != null) {
            String catName = request.getCategoryName().trim();
            if (!catName.isEmpty()) {
                Category category = categoryRepository.findByGroup_GroupIdAndName(item.getGroup().getGroupId(), catName)
                        .orElseGet(() -> categoryRepository.save(new Category(item.getGroup(), catName)));
                item.setCategory(category);
            } else {
                item.setCategory(null);
            }
        }

        // 4. 보관장소 변경
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

        // 5. 나머지 필드 업데이트
        if (request.getName() != null) item.setName(request.getName());
        if (request.getQuantity() != null) item.setQuantity(request.getQuantity());
        if (request.getUnit() != null) item.setUnit(request.getUnit());
        if (request.getExpiryDate() != null) item.setExpiryDate(request.getExpiryDate());
        if (request.getMinThreshold() != null) item.setMinThreshold(request.getMinThreshold());
        if (request.getStatus() != null) item.setStatus(request.getStatus());
        if (request.getPhotoUrl() != null) item.setPhotoUrl(request.getPhotoUrl());
        if (request.getBarcode() != null) item.setBarcode(request.getBarcode());


        //수량이 0이하가 되면 자동으로 depleted상태로 변경
        if (item.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            item.setStatus("DEPLETED");
        } else if ("DEPLETED".equals(item.getStatus()) && item.getQuantity().compareTo(BigDecimal.ZERO) > 0) {
            // 반대로, 수량을 다시 늘리면 자동으로 'ACTIVE'로 복구 (선택 사항)
            item.setStatus("ACTIVE");
        }

        // 6. [추가] 이력 기록 (UPDATE)
        // 수량이 변경되었으면 변화량을, 아니면 0을 기록
        BigDecimal newQty = request.getQuantity() != null ? request.getQuantity() : oldQty;
        BigDecimal qtyChange = newQty.subtract(oldQty);

        itemEventRepository.save(new ItemEvent(item, actor, "UPDATE", qtyChange));

        return ItemResponse.fromEntity(item);
    }
}