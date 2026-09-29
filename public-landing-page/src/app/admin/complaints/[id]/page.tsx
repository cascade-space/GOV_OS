// Server component: exports generateStaticParams for static export compatibility.
// The actual page logic lives in ComplaintDetailClient (client component).
import ComplaintDetailPage from './ComplaintDetailClient';

export async function generateStaticParams() {
    // Data is fetched client-side from Spring Boot; no static IDs to pre-render.
    return [];
}

export default function Page({ params }: { params?: Promise<{ id: string }> | { id: string } }) {
    return <ComplaintDetailPage params={params} />;
}
