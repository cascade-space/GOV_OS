const isGhPages = process.env.DEPLOY_TARGET === 'gh-pages';
const basePath = isGhPages ? '/GOV_OS' : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: isGhPages ? 'export' : undefined,
    basePath: basePath,
    assetPrefix: basePath,
    env: {
        NEXT_PUBLIC_BASE_PATH: basePath,
    },
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
