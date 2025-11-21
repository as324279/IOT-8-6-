package com.lot86.practice_app_backend.shopping.entity;

import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.inventory.entity.Item;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "shopping_item")
public class ShoppingItem {

    @Id
    @Column(name = "item_row_id", columnDefinition = "uuid")
    private UUID itemRowId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    private ShoppingList shoppingList;

    @Column(name = "item_name", nullable = false, length = 120)
    private String itemName;

    @Column(name = "desired_qty", nullable = false, precision = 12, scale = 3)
    private BigDecimal desiredQty;

    @Column(nullable = false, length = 16)
    private String unit = "ea";

    // 기존 재고 아이템과 연동 (재고 채워넣기용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_item")
    private Item linkedItem;

    // 구매 담당자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private AppUser assignee;

    // PENDING(대기), PURCHASED(구매됨), REMOVED(제외됨)
    @Column(nullable = false, length = 16)
    private String status = "PENDING";

    @Column(name = "purchased_qty", precision = 12, scale = 3)
    private BigDecimal purchasedQty;

    @Column(name = "purchased_at")
    private OffsetDateTime purchasedAt;

    @PrePersist
    public void prePersist() {
        if (this.itemRowId == null) this.itemRowId = UUID.randomUUID();
        if (this.status == null) this.status = "PENDING";
        if (this.unit == null) this.unit = "ea";
    }
}