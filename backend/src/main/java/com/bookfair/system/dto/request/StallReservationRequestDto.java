package com.bookfair.system.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StallReservationRequestDto {

    // Auto-populated from the authenticated user — sent from frontend for reference
    @NotBlank(message = "Username is required")
    private String username;

    // i. Exhibition/Event Name
    @NotBlank(message = "Exhibition/Event name is required")
    private String eventName;

    // ii. Reservation Date (on or after today)
    @NotNull(message = "Reservation date is required")
    @FutureOrPresent(message = "Reservation date must be today or a future date")
    private LocalDate reservationDate;

    // iii. Stall Type
    @NotBlank(message = "Stall type is required")
    private String stallType; // Standard | Premium | Corner Stall

    // iv. Preferred Stall Size
    @NotBlank(message = "Preferred stall size is required")
    private String stallSize; // Small | Medium | Large

    // v. Number of Stalls Required
    @NotNull(message = "Number of stalls is required")
    @Min(value = 1, message = "At least 1 stall is required")
    @Max(value = 50, message = "Cannot request more than 50 stalls at once")
    private Integer numberOfStalls;

    // vi. Business Category
    @NotBlank(message = "Business category is required")
    private String businessCategory; // Food & Beverage | Clothing | Electronics | Handicrafts | Services

    // vii. Special Requirements or Comments
    private String specialRequirements;
}
