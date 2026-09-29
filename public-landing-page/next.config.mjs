/** @type {import('next').NextConfig} */
const nextConfig = {
    // Static export is only needed for GitHub Pages CI deployment.
    // In local dev (next dev) we never want static export mode because it breaks
    // dynamic [id] routes that are populated at runtime from Spring Boot.
    // GitHub Actions automatically sets CI=true, so this is safe.
    ...(process.env.CI === 'true' ? {
        output: 'export',
        distDir: 'out',
        trailingSlash: true,
    } : {}),
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
        ],
        unoptimized: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    poweredByHeader: false,
    compress: true,
};

export default nextConfig;
