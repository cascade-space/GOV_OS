import { MOCK_COMPLAINTS } from "@/lib/mockData";

export async function generateStaticParams() {
    return MOCK_COMPLAINTS.map((c) => ({
        id: c.id,
    }));
}
