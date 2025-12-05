package com.lot86.practice_app_backend.shopping.dto;

import com.lot86.practice_app_backend.shopping.entity.ShoppingComment;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class ShoppingCommentResponse {
    private UUID commentId;
    private UUID listId;
    private UUID authorId;
    private String authorName;
    private String body;
    private OffsetDateTime createdAt;

    public static ShoppingCommentResponse fromEntity(ShoppingComment comment) {
        return new ShoppingCommentResponse(
                comment.getCommentId(),
                comment.getShoppingList().getListId(),
                comment.getAuthor() != null ? comment.getAuthor().getUserId() : null,
                comment.getAuthor() != null ? comment.getAuthor().getName() : "(알수없음)",
                comment.getBody(),
                comment.getCreatedAt()
        );
    }
}