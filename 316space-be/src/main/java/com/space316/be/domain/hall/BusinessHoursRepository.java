package com.space316.be.domain.hall;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessHoursRepository extends JpaRepository<BusinessHours, Long> {

    List<BusinessHours> findByHallIdOrderByDayOfWeek(String hallId);

    void deleteByHallId(String hallId);
}
