package com.space316.be.domain.hall;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HallClosureRepository extends JpaRepository<HallClosure, Long> {

    List<HallClosure> findByClosureDateBetween(LocalDate from, LocalDate to);
}
