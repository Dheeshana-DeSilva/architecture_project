package com.bookfair.system.repository;

import com.bookfair.system.entity.StallReservationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StallReservationRequestRepository extends JpaRepository<StallReservationRequest, Long> {

    List<StallReservationRequest> findByUserIdOrderBySubmittedAtDesc(Long userId);

    List<StallReservationRequest> findAllByOrderBySubmittedAtDesc();
}
