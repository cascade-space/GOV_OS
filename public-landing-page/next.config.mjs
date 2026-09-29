/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    distDir: 'out',
    trailingSlash: true,
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
