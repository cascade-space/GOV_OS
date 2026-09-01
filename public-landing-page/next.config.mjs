/** @type {import('next').NextConfig} */
const nextConfig = {
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
    serverExternalPackages: ['pg'],
    // Vercel optimizations
    output: 'standalone',
    poweredByHeader: false,
    compress: true,
};

export default nextConfig;
