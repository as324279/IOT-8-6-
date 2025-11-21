package com.lot86.practice_app_backend.shopping.entity;

import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.group.entity.AppGroup;
import com.lot86.practice_app_backend.inventory.entity.Item;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "purchase_history")
public class PurchaseHistory {

    @Id
    @Column(name = "purchase_id", columnDefinition = "uuid")
    private UUID purchaseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private AppGroup group;

    @Column(name = "item_name", nullable = false, length = 120)
    private String itemName;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal qty;

    @Column(nullable = false, length = 16)
    private String unit = "ea";

    @Column(name = "price_total", precision = 12, scale = 2)
    private BigDecimal priceTotal;

    @Column(length = 8)
    private String currency = "KRW";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchased_by")
    private AppUser purchasedBy;

    @CreationTimestamp
    @Column(name = "purchased_at", nullable = false)
    private OffsetDateTime purchasedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_item")
    private Item linkedItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_list")
    private ShoppingList sourceList;

    @PrePersist
    public void prePersist() {
        if (this.purchaseId == null) this.purchaseId = UUID.randomUUID();
    }
}