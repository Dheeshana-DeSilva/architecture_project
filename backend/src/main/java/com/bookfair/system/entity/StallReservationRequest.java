package com.bookfair.system.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stall_reservation_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StallReservationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Reference to the authenticated vendor user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Username sourced from IdP auth response (e.g., email used as username)
    @Column(nullable = false, length = 150)
    private String username;

    @Column(name = "event_name", nullable = false, length = 200)
    private String eventName;

    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;

    @Column(name = "stall_type", nullable = false, length = 50)
    private String stallType;

    @Column(name = "stall_size", nullable = false, length = 20)
    private String stallSize;

    @Column(name = "number_of_stalls", nullable = false)
    private Integer numberOfStalls;

    @Column(name = "business_category", nullable = false, length = 100)
    private String businessCategory;

    @Column(name = "special_requirements", columnDefinition = "TEXT")
    private String specialRequirements;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "PENDING";

    @CreationTimestamp
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;
}
