package com.lot86.practice_app_backend.inventory.repo;

import com.lot86.practice_app_backend.inventory.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;

public interface ItemRepository extends JpaRepository<Item, UUID> {
    //DEPLETED(삭제됨) 상태는 제외하고 가져옴.
    @Query("SELECT i FROM Item i WHERE i.group.groupId = :groupId AND i.status <> 'DEPLETED' ORDER BY i.createdAt DESC")
    List<Item> findByGroup_GroupIdOrderByCreatedAtDesc(UUID groupId);

    // (옵션) 유통기한 임박 상품 조회 로직 등을 나중에 추가할 수 있습니다.
    // [추가] "유통기한이 시작일(start)과 종료일(end) 사이에 있고, 아직 안 버린(ACTIVE) 물건 찾아줘!"
    List<Item> findByExpiryDateBetweenAndStatus(LocalDate start, LocalDate end, String status);

    // [추가] 특정 보관 장소(Location)에 있는 물품만 조회
    List<Item> findByLocation_LocationIdAndStatusNot(UUID locationId, String status);
}