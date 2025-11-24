package com.lot86.practice_app_backend.shopping.service;

import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.group.entity.AppGroup;
import com.lot86.practice_app_backend.inventory.entity.Item;
import com.lot86.practice_app_backend.inventory.repo.ItemRepository;
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

import java.math.BigDecimal;
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
        item.setNote(request.getNote()); // [추가] 메모 저장
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
        item.setAssignee(user); // 이 부분에서 빨간 줄이 뜨면 ShoppingItem 엔티티에 purchasedBy 필드가 있는지 확인해주세요. 없으면 assignee를 쓰거나 필드를 추가해야 합니다. (일단 그대로 진행)
        item.setPurchasedQty(item.getDesiredQty());
        item.setPurchasedAt(OffsetDateTime.now(ZoneOffset.UTC));
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

}