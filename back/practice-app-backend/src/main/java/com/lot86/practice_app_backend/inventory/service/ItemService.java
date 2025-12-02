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
import com.lot86.practice_app_backend.notification.service.NotificationService; // [추가]
import com.lot86.practice_app_backend.repo.AppGroupRepository;
import com.lot86.practice_app_backend.repo.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
    private final ItemEventRepository itemEventRepository;

    // [추가] 알림 발송을 위한 의존성 주입
    private final NotificationService notificationService;
    private final GroupMemberRepository groupMemberRepository;

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
        item.setMinThreshold(request.getMinThreshold()); // [중요] 임계치 저장
        item.setBarcode(request.getBarcode());
        item.setPhotoUrl(request.getPhotoUrl());
        item.setCreatedBy(user);

        Item savedItem = itemRepository.save(item);

        // CREATE 이력 저장
        itemEventRepository.save(new ItemEvent(savedItem, user, "CREATE", savedItem.getQuantity()));

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
     * [수정됨] 물품 삭제 (Soft Delete: 상태만 변경)
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
     * 물품 수정 (+ 디버깅 로그 & 알림 추가)
     */
    @Transactional
    public ItemResponse updateItem(UUID itemId, UUID userId, ItemUpdateRequest request) {
        System.out.println(">>> updateItem 호출됨. itemId: " + itemId);

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
        if (request.getUnit() != null) item.setUnit(request.getUnit());
        if (request.getExpiryDate() != null) item.setExpiryDate(request.getExpiryDate());
        if (request.getMinThreshold() != null) item.setMinThreshold(request.getMinThreshold());
        if (request.getStatus() != null) item.setStatus(request.getStatus());
        if (request.getPhotoUrl() != null) item.setPhotoUrl(request.getPhotoUrl());
        if (request.getBarcode() != null) item.setBarcode(request.getBarcode());

        // [중요] 수량 변경 및 알림 체크
        if (request.getQuantity() != null) {
            System.out.println(">>> 수량 변경 요청 감지: " + request.getQuantity());
            item.setQuantity(request.getQuantity());

            // 🔥 여기서 재고 부족 여부를 체크하고 알림을 보냅니다!
            System.out.println(">>> checkLowStock 호출 직전");
            checkLowStock(item);
        }

        // 소진됨 처리 (수량이 0 이하일 때)
        if (item.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            item.setStatus("DEPLETED");
        } else if ("DEPLETED".equals(item.getStatus()) && item.getQuantity().compareTo(BigDecimal.ZERO) > 0) {
            // 반대로, 수량을 다시 늘리면 자동으로 'ACTIVE'로 복구 (선택 사항)
            item.setStatus("ACTIVE");
        }

        // 6. [추가] 이력 기록 (UPDATE)
        BigDecimal newQty = request.getQuantity() != null ? request.getQuantity() : oldQty;
        BigDecimal qtyChange = newQty.subtract(oldQty);

        itemEventRepository.save(new ItemEvent(item, actor, "UPDATE", qtyChange));

        return ItemResponse.fromEntity(item);



    }

    /**
     * [핵심 기능] 재고 부족 알림 발송 헬퍼 (+ 디버깅 로그)
     */
    private void checkLowStock(Item item) {
        System.out.println("--- checkLowStock 진입 ---");
        System.out.println("현재 수량: " + item.getQuantity());
        System.out.println("임계치(MinThreshold): " + item.getMinThreshold());

        // 1. 임계치가 설정되어 있고
        // 2. 현재 수량이 임계치 이하로 떨어졌으며
        // 3. 아직 완전히 소진된 건 아닐 때 (0개면 소진됨 상태로 가니까 제외)
        if (item.getMinThreshold() != null) {
            int compareResult = item.getQuantity().compareTo(item.getMinThreshold());
            System.out.println("비교 결과 (수량 vs 임계치): " + compareResult); // 0 이나 음수여야 통과 (작거나 같음)

            if (compareResult <= 0 && item.getQuantity().compareTo(BigDecimal.ZERO) > 0) {
                System.out.println("!!! 알림 조건 만족 !!!");
                try {
                    // 그룹 멤버 전체에게 알림 발송
                    List<GroupMember> members = groupMemberRepository.findByGroupId(item.getGroup().getGroupId());
                    System.out.println("알림 보낼 멤버 수: " + members.size());

                    List<UUID> userIds = members.stream().map(GroupMember::getUserId).toList();
                    List<AppUser> targets = userRepository.findAllById(userIds);

                    String title = "재고 부족 알림";
                    String body = String.format("'%s'의 재고가 부족합니다! (남은 수량: %s %s)",
                            item.getName(), item.getQuantity(), item.getUnit());

                    for (AppUser target : targets) {
                        notificationService.createNotification(target, "LOW_STOCK", title, body);
                        System.out.println("알림 저장 완료 -> User: " + target.getEmail());
                    }
                } catch (Exception e) {
                    System.err.println("!!! 알림 발송 중 에러 발생: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("알림 조건 불만족 (수량이 임계치보다 많거나, 이미 0개임)");
            }
        } else {
            System.out.println("임계치가 설정되지 않음 (NULL)");
        }
    }

    /** [추가] 특정 방(Location)의 물품 목록 조회 */
    public List<ItemResponse> getLocationItems(UUID locationId) {
        // "삭제됨(DEPLETED)" 상태가 아닌 것만 가져옴
        return itemRepository.findByLocation_LocationIdAndStatusNot(locationId, "DEPLETED").stream()
                .map(ItemResponse::fromEntity)
                .collect(Collectors.toList());
    }
}