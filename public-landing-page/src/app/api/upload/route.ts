import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'minio';

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'govos-complaints';

// Ensure bucket exists and has public read policy for complaint media
async function initBucket() {
    try {
        const exists = await minioClient.bucketExists(BUCKET_NAME);
        if (!exists) {
            await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
            
            // Set bucket policy to allow anonymous read for uploaded complaint media
            const policy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Sid: 'PublicRead',
                        Effect: 'Allow',
                        Principal: '*',
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
                    },
                ],
            };
            await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
        }
    } catch (err) {
        console.error('MinIO bucket initialization notice:', err);
    }
}

export async function POST(request: NextRequest) {
    try {
        await initBucket();

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const objectName = `complaints/${Date.now()}-${cleanName}`;

        await minioClient.putObject(BUCKET_NAME, objectName, buffer, buffer.length, {
            'Content-Type': file.type || 'application/octet-stream',
        });

        const publicBase = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL || 'http://localhost:9000';
        const fileUrl = `${publicBase}/${BUCKET_NAME}/${objectName}`;

        return NextResponse.json({
            success: true,
            url: fileUrl,
            name: file.name,
            size: file.size,
            type: file.type,
        });
    } catch (error: any) {
        console.error('MinIO Upload Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'File upload failed' },
            { status: 500 }
        );
    }
}
