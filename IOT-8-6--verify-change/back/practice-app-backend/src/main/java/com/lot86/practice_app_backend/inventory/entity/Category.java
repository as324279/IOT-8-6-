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
@Table(name = "category", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"group_id", "name"})
})
public class Category {

    @Id
    @Column(name = "category_id", columnDefinition = "uuid")
    private UUID categoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private AppGroup group;

    @Column(name = "name", nullable = false, length = 60)
    private String name;

    public Category(AppGroup group, String name) {
        this.group = group;
        this.name = name;
    }

    @PrePersist
    public void prePersist() {
        if (this.categoryId == null) {
            this.categoryId = UUID.randomUUID();
        }
    }
}