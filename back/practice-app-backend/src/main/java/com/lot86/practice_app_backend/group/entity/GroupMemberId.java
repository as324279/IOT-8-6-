package com.lot86.practice_app_backend.group.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
//import jakarta.persistence.Embeddable; // 필요하면 추가
import java.io.Serializable;
import java.util.UUID;
import java.util.Objects; // equals, hashCode 직접 구현 시 필요

@Getter
@Setter
@NoArgsConstructor
// @Embeddable // IdClass 대신 EmbeddedId를 사용할 경우 필요
public class GroupMemberId implements Serializable { // public 확인!
    private UUID groupId;
    private UUID userId;

    // Lombok @EqualsAndHashCode 를 사용하거나 아래처럼 직접 구현
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GroupMemberId that = (GroupMemberId) o;
        return Objects.equals(groupId, that.groupId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(groupId, userId);
    }
}