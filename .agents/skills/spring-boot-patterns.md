# Skill: Spring Boot Patterns
# Reference for SpringArchitect agent — GovOS Core API

---

## Hexagonal Architecture in GovOS

### Port Definition (Interface in domain/)
```java
// domain/complaint/ComplaintRepository.java (Port)
public interface ComplaintRepository {
    Complaint save(Complaint complaint);
    Optional<Complaint> findByIdAndTenantId(UUID id, UUID tenantId);
    Page<Complaint> findAllByTenantId(UUID tenantId, Pageable pageable);
    void softDelete(UUID id, UUID tenantId, UUID deletedBy);
}
```

### Adapter (Implementation in infrastructure/)
```java
// infrastructure/persistence/complaint/JpaComplaintRepository.java (Adapter)
@Repository
@RequiredArgsConstructor
public class JpaComplaintRepository implements ComplaintRepository {
    private final JpaComplaintJpaRepository jpaRepo;
    private final ComplaintMapper mapper;
    
    @Override
    public Complaint save(Complaint complaint) {
        return mapper.toDomain(jpaRepo.save(mapper.toEntity(complaint)));
    }
}
```

---

## BaseEntity Pattern
```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    
    @CreatedBy
    @Column(name = "created_by")
    private UUID createdBy;
    
    @LastModifiedBy
    @Column(name = "updated_by")
    private UUID updatedBy;
    
    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;
    
    @Column(name = "deleted_at")
    private Instant deletedAt;
}
```

---

## JWT Principal Extraction
```java
@Component
public class JwtPrincipal implements UserDetails {
    private final UUID userId;
    private final UUID tenantId;
    private final UUID roleId;
    private final UUID wardId;  // nullable
    private final Collection<GrantedAuthority> authorities;
}

// In controller:
public ResponseEntity<T> someAction(
    @AuthenticationPrincipal JwtPrincipal principal
) {
    UUID tenantId = principal.getTenantId();
    UUID userId = principal.getUserId();
}
```

---

## Audit Service Pattern
```java
@Service
@RequiredArgsConstructor
public class AuditService {
    private final OpenSearchClient openSearchClient;
    
    public void log(AuditAction action, UUID entityId, String entityType, JwtPrincipal principal) {
        AuditEvent event = AuditEvent.builder()
            .action(action.name())
            .entityId(entityId)
            .entityType(entityType)
            .tenantId(principal.getTenantId())
            .performedBy(principal.getUserId())
            .timestamp(Instant.now())
            .build();
        
        // Async publish to OpenSearch govos-audit-{YYYY-MM} index
        openSearchClient.indexAsync("govos-audit-" + YearMonth.now(), event);
    }
}
```

---

## Tenant Context Filter
```java
@Component
@RequiredArgsConstructor
public class TenantContextInterceptor implements HandlerInterceptor {
    private final DataSource dataSource;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        JwtPrincipal principal = SecurityContextHolder.getContext()...;
        if (principal != null) {
            // Set at DB session level for RLS
            JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
            jdbcTemplate.execute("SET LOCAL app.tenant_id = '" + principal.getTenantId() + "'");
        }
        return true;
    }
}
```

---

## Complaint Number Generation
```java
// Auto-generate: CMP-{TENANT_CODE}-{YYYYMM}-{SEQ}
@Service
public class ComplaintNumberGenerator {
    public String generate(String tenantCode, UUID tenantId) {
        String period = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        long seq = getNextSequence(tenantId, period);  // PostgreSQL sequence per tenant+month
        return String.format("CMP-%s-%s-%06d", tenantCode, period, seq);
    }
}
```

---

## MinIO Presigned URL Pattern
```java
@Service
@RequiredArgsConstructor
public class FileStorageService {
    private final MinioClient minioClient;
    
    // Key format: {tenantId}/{entityType}/{entityId}/{filename}
    public String generateReadUrl(String objectKey) {
        return minioClient.getPresignedObjectUrl(
            GetPresignedObjectUrlArgs.builder()
                .bucket("govos-documents")
                .object(objectKey)
                .method(Method.GET)
                .expiry(15, TimeUnit.MINUTES)
                .build()
        );
    }
    
    public String generateUploadUrl(String objectKey, String contentType) {
        return minioClient.getPresignedObjectUrl(
            GetPresignedObjectUrlArgs.builder()
                .bucket("govos-documents")
                .object(objectKey)
                .method(Method.PUT)
                .expiry(5, TimeUnit.MINUTES)
                .build()
        );
    }
}
```
