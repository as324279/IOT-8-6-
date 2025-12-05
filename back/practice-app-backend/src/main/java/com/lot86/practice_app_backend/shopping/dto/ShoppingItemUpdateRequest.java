package com.lot86.practice_app_backend.shopping.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class ShoppingItemUpdateRequest {
    private BigDecimal desiredQty;
    private String unit;
    private String note;
}