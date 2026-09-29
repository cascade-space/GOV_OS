package com.govos.core.presentation.storage;

import com.govos.core.infrastructure.storage.MinioStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/storage")
@RequiredArgsConstructor
@Slf4j
public class StorageController {

    private final MinioStorageService minioStorageService;

    /**
     * Generates a pre-signed URL for direct, non-blocking upload to MinIO/S3.
     * Accessible by public citizen reporting and authenticated staff.
     */
    @GetMapping("/upload-url")
    public ResponseEntity<MinioStorageService.PresignedUploadResponse> getPresignedUploadUrl(
            @RequestParam(defaultValue = "evidence.jpg") String filename,
            @RequestParam(defaultValue = "image/jpeg") String contentType
    ) {
        log.info("Requesting pre-signed upload URL for filename={}, contentType={}", filename, contentType);
        var response = minioStorageService.generatePresignedUploadUrl(filename, contentType);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<java.util.Map<String, Object>> uploadFile(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file
    ) {
        log.info("Directly uploading file name={}, size={}", file.getOriginalFilename(), file.getSize());
        try {
            var res = minioStorageService.uploadDirect(file);
            return ResponseEntity.ok(java.util.Map.of("success", true, "url", res.publicDownloadUrl()));
        } catch (Exception e) {
            log.error("Upload error: {}", e.getMessage());
            return ResponseEntity.status(500).body(java.util.Map.of("success", false, "error", e.getMessage()));
        }
    }
}
