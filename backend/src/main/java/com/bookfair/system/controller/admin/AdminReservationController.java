package com.bookfair.system.controller.admin;

import com.bookfair.system.dto.response.AdminReservationResponse;
import com.bookfair.system.dto.response.StallReservationRequestResponse;
import com.bookfair.system.service.ReservationService;
import com.bookfair.system.service.StallReservationRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reservations")
@RequiredArgsConstructor
public class AdminReservationController {

    private final ReservationService reservationService;
    private final StallReservationRequestService stallReservationRequestService;

    // ── Existing stall booking reservations ──────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<AdminReservationResponse>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminReservationResponse> updateReservationStatus(@PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(reservationService.updateReservationStatus(id, status));
    }

    // ── Vendor stall reservation REQUESTS (new feature) ─────────────────────

    /**
     * GET /api/admin/reservations/stall-requests
     * Exhibition Organizer: view ALL stall reservation requests from all vendors.
     */
    @GetMapping("/stall-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StallReservationRequestResponse>> getAllStallRequests() {
        return ResponseEntity.ok(stallReservationRequestService.getAllRequests());
    }

    /**
     * PUT /api/admin/reservations/stall-requests/{id}/status?status=APPROVED
     * Exhibition Organizer: approve / reject / reset a vendor request.
     */
    @PutMapping("/stall-requests/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStallRequestStatus(@PathVariable Long id,
            @RequestParam String status) {
        try {
            StallReservationRequestResponse updated = stallReservationRequestService.updateRequestStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

