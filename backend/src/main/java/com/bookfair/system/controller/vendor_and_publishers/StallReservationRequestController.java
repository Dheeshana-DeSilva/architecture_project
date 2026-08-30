package com.bookfair.system.controller.vendor_and_publishers;

import com.bookfair.system.dto.request.StallReservationRequestDto;
import com.bookfair.system.dto.response.StallReservationRequestResponse;
import com.bookfair.system.security.services.UserDetailsImpl;
import com.bookfair.system.service.StallReservationRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor-publishers/stall-requests")
@RequiredArgsConstructor
public class StallReservationRequestController {

    private final StallReservationRequestService stallReservationRequestService;

    /**
     * POST /api/vendor-publishers/stall-requests
     * Authenticated vendors submit a new stall reservation request.
     */
    @PostMapping
    public ResponseEntity<?> submitRequest(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody StallReservationRequestDto dto) {
        try {
            StallReservationRequestResponse response =
                    stallReservationRequestService.submitRequest(currentUser.getId(), dto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /api/vendor-publishers/stall-requests/my
     * Returns all stall reservation requests submitted by the authenticated user.
     */
    @GetMapping("/my")
    public ResponseEntity<List<StallReservationRequestResponse>> getMyRequests(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        List<StallReservationRequestResponse> requests =
                stallReservationRequestService.getMyRequests(currentUser.getId());
        return ResponseEntity.ok(requests);
    }
}
