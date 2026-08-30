package com.bookfair.system.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StallReservationRequestResponse {
    private Long id;
    private String username;
    private String eventName;
    private LocalDate reservationDate;
    private String stallType;
    private String stallSize;
    private Integer numberOfStalls;
    private String businessCategory;
    private String specialRequirements;
    private String status;
    private LocalDateTime submittedAt;
}
