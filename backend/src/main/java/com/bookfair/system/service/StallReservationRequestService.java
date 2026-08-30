package com.bookfair.system.service;

import com.bookfair.system.dto.request.StallReservationRequestDto;
import com.bookfair.system.dto.response.StallReservationRequestResponse;
import com.bookfair.system.entity.StallReservationRequest;
import com.bookfair.system.entity.User;
import com.bookfair.system.repository.StallReservationRequestRepository;
import com.bookfair.system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StallReservationRequestService {

    private final StallReservationRequestRepository stallReservationRequestRepository;
    private final UserRepository userRepository;

    public StallReservationRequestResponse submitRequest(Long userId, StallReservationRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        StallReservationRequest entity = StallReservationRequest.builder()
                .user(user)
                .username(dto.getUsername())
                .eventName(dto.getEventName())
                .reservationDate(dto.getReservationDate())
                .stallType(dto.getStallType())
                .stallSize(dto.getStallSize())
                .numberOfStalls(dto.getNumberOfStalls())
                .businessCategory(dto.getBusinessCategory())
                .specialRequirements(dto.getSpecialRequirements())
                .status("PENDING")
                .build();

        StallReservationRequest saved = stallReservationRequestRepository.save(entity);
        return toResponse(saved);
    }

    public List<StallReservationRequestResponse> getMyRequests(Long userId) {
        return stallReservationRequestRepository.findByUserIdOrderBySubmittedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<StallReservationRequestResponse> getAllRequests() {
        return stallReservationRequestRepository.findAllByOrderBySubmittedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public StallReservationRequestResponse updateRequestStatus(Long requestId, String newStatus) {
        StallReservationRequest entity = stallReservationRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Stall request not found with ID: " + requestId));

        String normalized = newStatus.toUpperCase().trim();
        if (!normalized.equals("PENDING") && !normalized.equals("APPROVED") && !normalized.equals("REJECTED")) {
            throw new IllegalArgumentException("Invalid status. Allowed: PENDING, APPROVED, REJECTED");
        }
        entity.setStatus(normalized);
        return toResponse(stallReservationRequestRepository.save(entity));
    }

    private StallReservationRequestResponse toResponse(StallReservationRequest entity) {
        return StallReservationRequestResponse.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .eventName(entity.getEventName())
                .reservationDate(entity.getReservationDate())
                .stallType(entity.getStallType())
                .stallSize(entity.getStallSize())
                .numberOfStalls(entity.getNumberOfStalls())
                .businessCategory(entity.getBusinessCategory())
                .specialRequirements(entity.getSpecialRequirements())
                .status(entity.getStatus())
                .submittedAt(entity.getSubmittedAt())
                .build();
    }
}
