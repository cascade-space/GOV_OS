package com.govos.core.infrastructure.storage;

import com.govos.core.infrastructure.config.GovOsProperties;
import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.SetBucketPolicyArgs;
import io.minio.http.Method;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioStorageService {

    private final GovOsProperties govOsProperties;
    private MinioClient minioClient;
    private String resolvedPublicEndpoint = "http://localhost:9000";

    private static final String DEFAULT_BUCKET = "govos-complaints";

    @PostConstruct
    public void init() {
        try {
            var minioProps = govOsProperties.minio();
            
            // Prefer docker container internal network name if present
            String endpoint = System.getenv("MINIO_ENDPOINT");
            if (endpoint == null || endpoint.isBlank()) {
                endpoint = (minioProps != null && minioProps.endpoint() != null && !minioProps.endpoint().contains("localhost"))
                        ? minioProps.endpoint()
                        : "http://minio:9000";
            }

            String accessKey = System.getenv("MINIO_ACCESS_KEY");
            if (accessKey == null || accessKey.isBlank()) {
                accessKey = "minioadmin";
            }

            String secretKey = System.getenv("MINIO_SECRET_KEY");
            if (secretKey == null || secretKey.isBlank()) {
                secretKey = "minioadmin";
            }

            String publicEndpoint = System.getenv("MINIO_PUBLIC_URL");
            if (publicEndpoint != null && !publicEndpoint.isBlank()) {
                this.resolvedPublicEndpoint = publicEndpoint;
            }

            this.minioClient = MinioClient.builder()
                    .endpoint(endpoint)
                    .credentials(accessKey, secretKey)
                    .build();

            ensureBucketExists(DEFAULT_BUCKET);
            log.info("MinIO Storage Service initialized at internal={}, public={}", endpoint, this.resolvedPublicEndpoint);
        } catch (Exception e) {
            log.warn("MinIO Storage Service startup check deferred: {}. Will retry on upload.", e.getMessage());
        }
    }

    public void ensureBucketExists(String bucketName) {
        try {
            if (minioClient == null) {
                init();
            }
            if (minioClient == null) {
                return;
            }
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                // Set public-read policy for complaint photos
                String policy = """
                    {
                      "Version": "2012-10-17",
                      "Statement": [
                        {
                          "Sid": "PublicRead",
                          "Effect": "Allow",
                          "Principal": "*",
                          "Action": ["s3:GetObject"],
                          "Resource": ["arn:aws:s3:::%s/*"]
                        }
                      ]
                    }
                    """.formatted(bucketName);
                minioClient.setBucketPolicy(
                        SetBucketPolicyArgs.builder().bucket(bucketName).config(policy).build()
                );
                log.info("Created MinIO bucket '{}' with public-read policy", bucketName);
            }
        } catch (Exception e) {
            log.error("Failed to ensure MinIO bucket '{}' exists: {}", bucketName, e.getMessage());
        }
    }

    /**
     * Generates a pre-signed PUT URL for direct client-side upload.
     */
    public PresignedUploadResponse generatePresignedUploadUrl(String originalFilename, String contentType) {
        ensureBucketExists(DEFAULT_BUCKET);

        String cleanName = originalFilename != null ? originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_") : "photo.jpg";
        String objectKey = "complaints/" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8) + "-" + cleanName;

        try {
            int expiryMinutes = 15;

            String presigned = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.PUT)
                            .bucket(DEFAULT_BUCKET)
                            .object(objectKey)
                            .expiry(expiryMinutes, TimeUnit.MINUTES)
                            .build()
            );

            // Replace internal docker host with browser-reachable public host
            String uploadUrl = presigned.replace("http://schoolmitra_minio:9000", this.resolvedPublicEndpoint)
                                        .replace("http://minio:9000", this.resolvedPublicEndpoint);

            // Public download URL
            String publicDownloadUrl = this.resolvedPublicEndpoint + "/" + DEFAULT_BUCKET + "/" + objectKey;

            return new PresignedUploadResponse(uploadUrl, publicDownloadUrl, objectKey, expiryMinutes * 60L);
        } catch (Exception e) {
            log.error("Failed to generate pre-signed upload URL for objectKey={}: {}", objectKey, e.getMessage());
            throw new RuntimeException("Could not generate pre-signed upload URL: " + e.getMessage(), e);
        }
    }

    public PresignedUploadResponse uploadDirect(org.springframework.web.multipart.MultipartFile file) {
        ensureBucketExists(DEFAULT_BUCKET);
        String cleanName = file.getOriginalFilename() != null 
                ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_") 
                : "photo.jpg";
        String objectKey = "complaints/" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8) + "-" + cleanName;

        try {
            minioClient.putObject(
                    io.minio.PutObjectArgs.builder()
                            .bucket(DEFAULT_BUCKET)
                            .object(objectKey)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                            .build()
            );

            String publicDownloadUrl = this.resolvedPublicEndpoint + "/" + DEFAULT_BUCKET + "/" + objectKey;
            return new PresignedUploadResponse(publicDownloadUrl, publicDownloadUrl, objectKey, 0);
        } catch (Exception e) {
            log.error("Failed to directly upload file objectKey={}: {}", objectKey, e.getMessage());
            throw new RuntimeException("Upload failed: " + e.getMessage(), e);
        }
    }

    public record PresignedUploadResponse(
            String uploadUrl,
            String publicDownloadUrl,
            String objectKey,
            long expiresInSeconds
    ) {}
}
