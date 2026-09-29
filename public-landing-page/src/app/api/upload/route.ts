import { NextRequest, NextResponse } from 'next/server';

const SPRING_BOOT_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

/**
 * Next.js upload API route — proxies multipart uploads to the Spring Boot
 * storage service (POST /api/v1/storage/upload) so that the minio SDK
 * never needs to be bundled into the Next.js build.
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const response = await fetch(`${SPRING_BOOT_BASE}/api/v1/storage/upload`, {
            method: 'POST',
            body: formData,
            // Forward the authorization header if present
            headers: Object.fromEntries(
                [...request.headers.entries()].filter(([k]) =>
                    k.toLowerCase() === 'authorization'
                )
            ),
        });

        if (!response.ok) {
            const text = await response.text();
            return NextResponse.json(
                { success: false, error: text || 'Upload failed' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json({ success: true, ...data });
    } catch (error: any) {
        console.error('Upload proxy error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Upload proxy failed' },
            { status: 500 }
        );
    }
}
