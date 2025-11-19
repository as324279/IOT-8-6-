package com.lot86.practice_app_backend.inventory.entity;

import com.lot86.practice_app_backend.group.entity.AppGroup;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "storage_location", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"group_id", "name"})
})
public class StorageLocation {

    @Id
    @Column(name = "location_id", columnDefinition = "uuid")
    private UUID locationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private AppGroup group;

    @Column(name = "name", nullable = false, length = 60)
    private String name;

    // FRIDGE, FREEZER, ROOM_TEMP, PANTRY, OTHER
    @Column(name = "storage_type", nullable = false, length = 12)
    private String storageType;

    public StorageLocation(AppGroup group, String name, String storageType) {
        this.group = group;
        this.name = name;
        this.storageType = storageType;
    }

    @PrePersist
    public void prePersist() {
        if (this.locationId == null) {
            this.locationId = UUID.randomUUID();
        }
    }
}