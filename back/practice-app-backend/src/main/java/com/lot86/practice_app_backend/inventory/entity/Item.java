package com.lot86.practice_app_backend.inventory.entity;

import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.group.entity.AppGroup;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "item", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"group_id", "name", "unit"})
})
public class Item {

    @Id
    @Column(name = "item_id", columnDefinition = "uuid")
    private UUID itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private AppGroup group;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private StorageLocation location;

    // 수량 (소수점 가능, 예: 1.5 kg)
    @Column(name = "quantity", nullable = false, precision = 12, scale = 3)
    private BigDecimal quantity = BigDecimal.ZERO;

    // 단위 (ea, kg, g, l, ml ...)
    @Column(name = "unit", nullable = false, length = 16)
    private String unit = "ea";

    // 최소 수량 (알림용)
    @Column(name = "min_threshold", precision = 12, scale = 3)
    private BigDecimal minThreshold;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    // ACTIVE, EXPIRED, DEPLETED
    @Column(name = "status", nullable = false, length = 12)
    private String status = "ACTIVE";

    @Column(name = "barcode", length = 32)
    private String barcode;

    @Column(name = "photo_url")
    private String photoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private AppUser createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.itemId == null) this.itemId = UUID.randomUUID();
        if (this.quantity == null) this.quantity = BigDecimal.ZERO;
        if (this.unit == null) this.unit = "ea";
        if (this.status == null) this.status = "ACTIVE";
    }
}