package com.space316.be.domain.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ActivityAuditLogRepository
        extends JpaRepository<ActivityAuditLog, Long>, JpaSpecificationExecutor<ActivityAuditLog> {}
