package com.space316.be.domain.hall;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HallRepository extends JpaRepository<Hall, Long> {

    List<Hall> findByActiveTrueOrderBySortOrderAsc();

    List<Hall> findAllByOrderBySortOrderAscIdAsc();

    Optional<Hall> findByHallIdAndActiveTrue(String hallId);

    boolean existsByHallId(String hallId);

    Optional<Hall> findByHallId(String hallId);
}
