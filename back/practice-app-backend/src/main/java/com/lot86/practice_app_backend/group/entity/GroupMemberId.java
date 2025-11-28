package com.lot86.practice_app_backend.group.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

/**
 * GroupMember 의 복합키 (group_id, user_id)를 표현하는 ID 클래스.
 * - @IdClass 로 사용됨.
 */
@Getter
@Setter
@NoArgsConstructor
public class GroupMemberId implements Serializable {

    private UUID groupId;
    private UUID userId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GroupMemberId that = (GroupMemberId) o;
        return Objects.equals(groupId, that.groupId)
                && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(groupId, userId);
    }
}
