package com.lot86.practice_app_backend.shopping.service;

import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.group.entity.AppGroup;
import com.lot86.practice_app_backend.group.entity.GroupMember;
import com.lot86.practice_app_backend.group.repo.GroupMemberRepository;
import com.lot86.practice_app_backend.inventory.entity.Item;
import com.lot86.practice_app_backend.inventory.repo.ItemRepository;
import com.lot86.practice_app_backend.notification.service.NotificationService;
import com.lot86.practice_app_backend.repo.AppGroupRepository;
import com.lot86.practice_app_backend.repo.AppUserRepository;
import com.lot86.practice_app_backend.shopping.dto.*;
import com.lot86.practice_app_backend.shopping.entity.ShoppingItem;
import com.lot86.practice_app_backend.shopping.entity.ShoppingList;
import com.lot86.practice_app_backend.shopping.repo.ShoppingItemRepository;
import com.lot86.practice_app_backend.shopping.repo.ShoppingListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShoppingService {

    private final ShoppingListRepository listRepository;
    private final ShoppingItemRepository itemRepository;
    private final AppGroupRepository groupRepository;
    private final AppUserRepository userRepository;
    private final ItemRepository inventoryRepository; // 재고 연결용

    private final NotificationService notificationService;
    private final GroupMemberRepository groupMemberRepository; // 멤버 조회용

    /** 1. 쇼핑 리스트 생성 */
    @Transactional
    public ShoppingListResponse createList(UUID groupId, UUID userId, ShoppingListCreateRequest request) {
        AppGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("그룹을 찾을 수 없습니다."));
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        ShoppingList newList = new ShoppingList();
        newList.setGroup(group);
        newList.setTitle(request.getTitle());
        newList.setCreatedBy(user);
        // status는 기본값 DRAFT

        listRepository.save(newList);

        return ShoppingListResponse.fromEntity(newList, List.of());
    }

    /** 2. 그룹의 쇼핑 리스트 목록 조회 */
    public List<ShoppingListResponse> getGroupLists(UUID groupId) {
        List<ShoppingList> lists = listRepository.findByGroup_GroupIdOrderByCreatedAtDesc(groupId);

        return lists.stream().map(list -> {
            List<ShoppingItem> items = itemRepository.findByShoppingList_ListId(list.getListId());
            List<ShoppingItemResponse> itemdtos = items.stream()
                    .map(ShoppingItemResponse::fromEntity)
                    .collect(Collectors.toList());
            return ShoppingListResponse.fromEntity(list, itemdtos);
        }).collect(Collectors.toList());
    }

    /** 3. 쇼핑 항목 추가 */
    @Transactional
    public ShoppingItemResponse addItem(UUID listId, UUID userId, ShoppingItemAddRequest request) {
        ShoppingList list = listRepository.findById(listId)
                .orElseThrow(() -> new IllegalArgumentException("리스트를 찾을 수 없습니다."));
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        ShoppingItem item = new ShoppingItem();
        item.setShoppingList(list);
        item.setItemName(request.getItemName());
        item.setDesiredQty(request.getDesiredQty());
        item.setUnit(request.getUnit());
        item.setNote(request.getNote()); // 메모 저장
        item.setAssignee(user);

        if (request.getLinkedItemId() != null) {
            Item inventoryItem = inventoryRepository.findById(request.getLinkedItemId())
                    .orElse(null);
            item.setLinkedItem(inventoryItem);
        }

        itemRepository.save(item);
        return ShoppingItemResponse.fromEntity(item);
    }

    /** 4. 쇼핑 항목 구매 완료 처리 (핵심) */
    @Transactional
    public void purchaseItem(UUID itemRowId, UUID userId) {
        ShoppingItem item = itemRepository.findById(itemRowId)
                .orElseThrow(() -> new IllegalArgumentException("항목을 찾을 수 없습니다."));
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if ("PURCHASED".equals(item.getStatus())) {
            throw new IllegalStateException("이미 구매 완료된 항목입니다.");
        }

        // 상태 업데이트 -> DB 트리거가 재고를 자동으로 채워줌
        item.setStatus("PURCHASED");
        item.setAssignee(user);
        item.setPurchasedQty(item.getDesiredQty());
        item.setPurchasedAt(OffsetDateTime.now(ZoneOffset.UTC));

        // [추가] 그룹 멤버들에게 알림 발송
        sendPurchaseNotification(item, user);
    }

    /** 5. 쇼핑 항목 삭제 */
    @Transactional
    public void deleteItem(UUID itemRowId) {
        itemRepository.deleteById(itemRowId);
    }

    /** 쇼핑리스트 상태 변경 (확정, 종료 등) */
    @Transactional
    public ShoppingListResponse updateListStatus(UUID listId, UUID userId, String newStatus) {
        ShoppingList list = listRepository.findById(listId)
                .orElseThrow(() -> new IllegalArgumentException("리스트를 찾을 수 없습니다."));

        // 상태 변경
        list.setStatus(newStatus);

        // 만약 '확정(CONFIRMED)' 상태로 바꾸는 거라면, 확정자(confirmedBy)와 시간도 기록
        if ("CONFIRMED".equals(newStatus)) {
            AppUser user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
            list.setConfirmedBy(user);
            list.setConfirmedAt(OffsetDateTime.now());
        }

        // DTO 변환해서 반환 (아이템 목록은 다시 조회해서 채워줌)
        List<ShoppingItem> items = itemRepository.findByShoppingList_ListId(listId);
        List<ShoppingItemResponse> itemDtos = items.stream()
                .map(ShoppingItemResponse::fromEntity)
                .collect(Collectors.toList());

        return ShoppingListResponse.fromEntity(list, itemDtos);
    }

    // 👇 [추가된 메서드] 알림 발송 헬퍼 메서드
    private void sendPurchaseNotification(ShoppingItem item, AppUser purchaser) {
        try {
            // 1. 그룹 ID 찾기
            UUID groupId = item.getShoppingList().getGroup().getGroupId();

            // 2. 그룹 멤버 조회
            List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);

            // 3. 나(구매자)를 제외한 멤버들의 User ID 추출
            List<UUID> targetUserIds = members.stream()
                    .map(GroupMember::getUserId)
                    .filter(id -> !id.equals(purchaser.getUserId()))
                    .toList();

            if (targetUserIds.isEmpty()) return; // 보낼 사람이 없으면 종료

            // 4. User 객체 조회
            List<AppUser> targets = userRepository.findAllById(targetUserIds);

            // 5. 알림 내용 생성
            String title = "구매 완료";
            String body = String.format("'%s'님이 '%s' 구매를 완료했습니다.", purchaser.getName(), item.getItemName());

            // 6. 전송 (DB 저장)
            for (AppUser target : targets) {
                notificationService.createNotification(target, "PURCHASE_DONE", title, body);
            }
        } catch (Exception e) {
            // 알림 실패가 비즈니스 로직(구매)을 막지 않도록 예외 처리
            System.err.println("구매 알림 발송 실패: " + e.getMessage());
        }
    }

}