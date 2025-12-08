package com.lot86.practice_app_backend.inventory.service;

import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.group.entity.AppGroup;
import com.lot86.practice_app_backend.group.entity.GroupMember;
import com.lot86.practice_app_backend.group.repo.GroupMemberRepository;
import com.lot86.practice_app_backend.inventory.dto.ItemCreateRequest;
import com.lot86.practice_app_backend.inventory.dto.ItemResponse;
import com.lot86.practice_app_backend.inventory.dto.ItemUpdateRequest;
import com.lot86.practice_app_backend.inventory.entity.Category;
import com.lot86.practice_app_backend.inventory.entity.Item;
import com.lot86.practice_app_backend.inventory.entity.ItemEvent;
import com.lot86.practice_app_backend.inventory.entity.StorageLocation;
import com.lot86.practice_app_backend.inventory.repo.CategoryRepository;
import com.lot86.practice_app_backend.inventory.repo.ItemEventRepository;
import com.lot86.practice_app_backend.inventory.repo.ItemRepository;
import com.lot86.practice_app_backend.inventory.repo.StorageLocationRepository;
import com.lot86.practice_app_backend.notification.service.NotificationService;
import com.lot86.practice_app_backend.repo.AppGroupRepository;
import com.lot86.practice_app_backend.repo.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 물품(Item)과 관련된 모든 비즈니스 로직을 담당하는 서비스입니다.
 */
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

    private final NotificationService notificationService;
    private final GroupMemberRepository groupMemberRepository;

    /**
     * [물품 등록] (기본)
     * - locationId가 있으면 그 방에 넣고, 없으면(null) 전체(미지정)에 넣음.
     */
    @Transactional
    public ItemResponse createItem(UUID groupId, UUID userId, ItemCreateRequest request) {
        AppGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 그룹입니다."));
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 1. 카테고리 처리
        Category category = null;
        if (request.getCategoryName() != null && !request.getCategoryName().isBlank()) {
            String catName = request.getCategoryName().trim();
            category = categoryRepository.findByGroup_GroupIdAndName(groupId, catName)
                    .orElseGet(() -> categoryRepository.save(new Category(group, catName)));
        }

        // 2. 보관장소 처리 (ID로 조회)
        StorageLocation location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 보관 장소입니다."));

            // (보안) 다른 그룹의 방인지 체크
            if (!location.getGroup().getGroupId().equals(groupId)) {
                throw new IllegalArgumentException("해당 그룹의 보관 장소가 아닙니다.");
            }
        }

        // 3. 물품 생성 및 저장
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
        item.setPhotoUrl(request.getPhotoUrl()); // 사진 저장
        item.setCreatedBy(user);

        Item savedItem = itemRepository.save(item);

        // 4. 이력 기록
        itemEventRepository.save(new ItemEvent(savedItem, user, "CREATE", savedItem.getQuantity()));

        return ItemResponse.fromEntity(savedItem);
    }

    /**
     * [추가] 특정 방(Location)에 물품 등록
     * - Controller의 createItemInLocation 메서드에서 호출됩니다.
     * - 방 ID를 이용해 그룹 ID를 찾고, DTO에 방 ID를 채운 뒤 createItem을 재사용합니다.
     */
    @Transactional
    public ItemResponse createItemInLocation(UUID locationId, UUID userId, ItemCreateRequest request) {
        // 1. 방 정보 조회
        StorageLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 보관 장소입니다."));

        // 2. 요청 객체에 locationId 강제 설정
        request.setLocationId(locationId);

        // 3. 기존 createItem 호출 (그룹 ID는 방에서 가져옴)
        return createItem(location.getGroup().getGroupId(), userId, request);
    }

    /**
     * [그룹 물품 전체 조회]
     */
    public List<ItemResponse> getGroupItems(UUID groupId) {
        return itemRepository.findByGroup_GroupIdOrderByCreatedAtDesc(groupId).stream()
                .map(ItemResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * [특정 방(Location) 물품 조회]
     */
    public List<ItemResponse> getLocationItems(UUID locationId) {
        return itemRepository.findByLocation_LocationIdAndStatusNot(locationId, "DEPLETED").stream()
                .map(ItemResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * [물품 상세 조회]
     */
    public ItemResponse getItemDetail(UUID itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 물품입니다."));
        return ItemResponse.fromEntity(item);
    }

    /**
     * [물품 삭제 (Soft Delete)]
     */
    @Transactional
    public void deleteItemWithHistory(UUID itemId, UUID userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 물품입니다."));
        AppUser actor = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        item.setStatus("DEPLETED");
        itemEventRepository.save(new ItemEvent(item, actor, "DELETE", BigDecimal.ZERO));
    }

    /**
     * [물품 수정]
     */
    @Transactional
    public ItemResponse updateItem(UUID itemId, UUID userId, ItemUpdateRequest request) {
        System.out.println(">>> updateItem 호출됨. itemId: " + itemId);

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 물품입니다."));
        AppUser actor = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        BigDecimal oldQty = item.getQuantity();

        // 카테고리 변경
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

        // 보관장소 변경 (ID 기반)
        if (request.getLocationId() != null) {
            StorageLocation location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 보관 장소입니다."));
            item.setLocation(location);
        }

        // 필드 업데이트
        if (request.getName() != null) item.setName(request.getName());
        if (request.getUnit() != null) item.setUnit(request.getUnit());
        if (request.getExpiryDate() != null) item.setExpiryDate(request.getExpiryDate());
        if (request.getMinThreshold() != null) item.setMinThreshold(request.getMinThreshold());
        if (request.getStatus() != null) item.setStatus(request.getStatus());
        if (request.getPhotoUrl() != null) item.setPhotoUrl(request.getPhotoUrl());
        if (request.getBarcode() != null) item.setBarcode(request.getBarcode());

        // 수량 변경 및 알림
        if (request.getQuantity() != null) {
            System.out.println(">>> 수량 변경 요청 감지: " + request.getQuantity());
            item.setQuantity(request.getQuantity());
            checkLowStock(item);
        }

        // 소진됨 처리
        if (item.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            item.setStatus("DEPLETED");
        } else if ("DEPLETED".equals(item.getStatus()) && item.getQuantity().compareTo(BigDecimal.ZERO) > 0) {
            item.setStatus("ACTIVE");
        }

        // 이력 기록
        BigDecimal newQty = request.getQuantity() != null ? request.getQuantity() : oldQty;
        BigDecimal qtyChange = newQty.subtract(oldQty);
        itemEventRepository.save(new ItemEvent(item, actor, "UPDATE", qtyChange));

        return ItemResponse.fromEntity(item);
    }

    /**
     * [재고 부족 알림]
     */
    private void checkLowStock(Item item) {
        if (item.getMinThreshold() != null) {
            int compareResult = item.getQuantity().compareTo(item.getMinThreshold());
            if (compareResult <= 0 && item.getQuantity().compareTo(BigDecimal.ZERO) > 0) {
                try {
                    List<GroupMember> members = groupMemberRepository.findByGroupId(item.getGroup().getGroupId());
                    List<UUID> userIds = members.stream().map(GroupMember::getUserId).toList();
                    List<AppUser> targets = userRepository.findAllById(userIds);

                    String title = "재고 부족 알림";
                    String body = String.format("'%s'의 재고가 부족합니다! (남은 수량: %s %s)",
                            item.getName(), item.getQuantity(), item.getUnit());

                    for (AppUser target : targets) {
                        notificationService.createNotification(target, "LOW_STOCK", title, body);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }
}